/* global require, module, process, setTimeout, clearTimeout, Buffer */
// pppoeService.js — consulta a sessão PPPoE de um cliente direto no concentrador Huawei (SSH).
// O VRP só se comporta bem em shell interativo: desliga a paginação, roda o comando,
// responde o "[Y/N]" do final e sai quando o prompt <host> volta.
const { Client } = require('ssh2');
const { interpretarAccessUser } = require('./huaweiParser');

// Só aceita logins "normais" — impede injeção de comandos no CLI do concentrador
const LOGIN_VALIDO = /^[A-Za-z0-9._@-]{1,64}$/;

const PROMPT = /<[^<>\r\n]+>\s*$/;
const PERGUNTA_YN = /\[Y\/N\]:\s*$/i;
const MAIS = /-{2,}\s*More\s*-{2,}\s*$/;

function configurado() {
  return Boolean(process.env.PPPOE_SSH_HOST && process.env.PPPOE_SSH_USER && process.env.PPPOE_SSH_PASS);
}

function erroComCodigo(msg, code) {
  return Object.assign(new Error(msg), { code });
}

// Executa UM comando no shell interativo e devolve a saída dele (sem o banner de login)
function executarNoConcentrador(comando, { timeoutMs = Number(process.env.PPPOE_SSH_TIMEOUT_MS || 15000) } = {}) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let buffer = '';
    let fase = 'login'; // login -> paginacao -> comando
    let encerrado = false;

    const finalizar = (err, saida) => {
      if (encerrado) return;
      encerrado = true;
      clearTimeout(timer);
      conn.end();
      if (err) reject(err);
      else resolve(saida);
    };

    const timer = setTimeout(
      () => finalizar(erroComCodigo('Tempo limite esgotado ao consultar o concentrador.', 'ETIMEDOUT')),
      timeoutMs,
    );

    conn.on('ready', () => {
      conn.shell({ term: 'vt100', cols: 200, rows: 500 }, (err, stream) => {
        if (err) return finalizar(err);

        stream.on('data', (dados) => {
          buffer += dados.toString('utf8');

          if (MAIS.test(buffer)) return stream.write(' ');           // paginação que escapou
          if (PERGUNTA_YN.test(buffer)) {                           // "Are you sure to display some information?"
            buffer = buffer.replace(PERGUNTA_YN, '');
            return stream.write('N\n');
          }
          if (!PROMPT.test(buffer)) return;

          if (fase === 'login') {
            fase = 'paginacao';
            buffer = '';
            stream.write('screen-length 0 temporary\n');
          } else if (fase === 'paginacao') {
            fase = 'comando';
            buffer = '';
            stream.write(comando + '\n');
          } else if (fase === 'comando') {
            const saida = buffer;
            stream.write('quit\n');
            finalizar(null, saida);
          }
        });
        stream.on('close', () => finalizar(erroComCodigo('Concentrador encerrou a sessão SSH.', 'ECONNRESET')));
      });
    });

    conn.on('error', (err) => finalizar(err));

    conn.connect({
      host: process.env.PPPOE_SSH_HOST,
      port: Number(process.env.PPPOE_SSH_PORT || 22),
      username: process.env.PPPOE_SSH_USER,
      password: process.env.PPPOE_SSH_PASS,
      readyTimeout: 8000,
      // Opcional: fixa a chave do host contra MITM. Formato do `ssh-keygen -lf`: "SHA256:abc..."
      ...(process.env.PPPOE_SSH_HOST_FINGERPRINT && {
        hostHash: 'sha256',
        hostVerifier: (hashHex) => {
          const esperado = process.env.PPPOE_SSH_HOST_FINGERPRINT.replace(/^SHA256:/, '').replace(/=+$/, '');
          return Buffer.from(hashHex, 'hex').toString('base64').replace(/=+$/, '') === esperado;
        },
      }),
    });
  });
}

// `executar` é injetável para os testes não precisarem de um concentrador real
function criarServicoPPPoE({ executar = executarNoConcentrador } = {}) {
  async function consultar(loginBruto) {
    const login = String(loginBruto || '').trim();
    if (!LOGIN_VALIDO.test(login)) throw erroComCodigo('Login PPPoE inválido', 'LOGIN_INVALIDO');

    const bruto = await executar(`display access-user username ${login} verbose`);
    return interpretarAccessUser(bruto, login);
  }

  return { consultar, configurado };
}

module.exports = { criarServicoPPPoE, configurado, executarNoConcentrador, LOGIN_VALIDO };
