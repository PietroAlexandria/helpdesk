// Testes da consulta PPPoE (parser Huawei + serviço + rota). Rodar com: npm test
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';
process.env.AUDIT_LOG_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pppoe-audit-')), 'audit.log');
process.env.AUDIT_STDOUT = '0';

const { interpretarAccessUser, hmsParaSegundos, contador64 } = require('../pppoeModules/huaweiParser');
const { criarServicoPPPoE } = require('../pppoeModules/pppoeService');
const { criarRotasPPPoE } = require('../pppoeModules/pppoeRoutes');
const { assinarToken } = require('../auth');

const SAIDA_ONLINE = fs.readFileSync(path.join(__dirname, 'fixtures', 'huawei-access-user-online.txt'), 'utf8');

describe('parser Huawei (display access-user verbose)', () => {
  test('cliente online: extrai IP, MAC, plano, tempo e tráfego', () => {
    const r = interpretarAccessUser(SAIDA_ONLINE, '12345fulano');
    assert.equal(r.online, true);
    assert.equal(r.login, '12345fulano');
    assert.equal(r.estado, 'Used');
    assert.equal(r.dominio, 'cednet_ixc');
    assert.equal(r.ip, '203.0.113.10');               // sem o sufixo "(Radius)"
    assert.equal(r.mac, '02:AA:BB:CC:DD:EE');
    assert.equal(r.gateway, '203.0.113.1');
    assert.deepEqual(r.dns, ['198.51.100.53', '8.8.8.8']);
    assert.equal(r.ipv6.prefixoPD, '2001:DB8:C1A7::/48');
    assert.equal(r.interface, 'Eth-Trunk1.560');
    assert.equal(r.interfaceFisica, '100GE0/3/1');
    assert.equal(r.vlan, '560/-');
    assert.equal(r.inicio, '2026-10-28 14:56:52');
    assert.equal(r.tempoOnline, '431:18:40');
    assert.equal(r.tempoOnlineSeg, 431 * 3600 + 18 * 60 + 40);
    assert.equal(r.autenticacao, 'Success');
    assert.equal(r.plano, '700M');
    assert.deepEqual(r.velocidadeMbps, { download: 700, upload: 700 });
    assert.deepEqual(r.consumoAgoraKbps, { download: 880, upload: 40 });
    assert.equal(r.trafegoSessaoGB.download, 686.37);
    assert.equal(r.trafegoSessaoGB.upload, 36.41);
    assert.equal(r.mtu, 1492);
  });

  test('ignora paginação/escapes ANSI e o "Unrecognized command" antes do comando', () => {
    const r = interpretarAccessUser(SAIDA_ONLINE, '12345fulano');
    assert.ok(!JSON.stringify(r).includes('\x1b'));
    assert.ok(!JSON.stringify(r).includes('Unrecognized'));
  });

  test('cliente offline: online=false com a mensagem do equipamento', () => {
    const saida = '<bras>display access-user username ninguem verbose\r\n  Info: No online user!\r\n<bras>';
    assert.deepEqual(interpretarAccessUser(saida, 'ninguem'), { login: 'ninguem', online: false, mensagem: 'Info: No online user!' });
  });

  test('saída vazia: online=false sem mensagem', () => {
    assert.deepEqual(interpretarAccessUser('', 'x'), { login: 'x', online: false, mensagem: null });
  });

  test('helpers: hms e contador (high,low) de 64 bits', () => {
    assert.equal(hmsParaSegundos('0:00:05'), 5);
    assert.equal(hmsParaSegundos('-'), null);
    assert.equal(contador64('(1,0)'), 2 ** 32);
    assert.equal(contador64('lixo'), null);
  });
});

describe('serviço PPPoE', () => {
  test('monta o comando certo para o login', async () => {
    let comando;
    const servico = criarServicoPPPoE({ executar: async (c) => { comando = c; return SAIDA_ONLINE; } });
    const r = await servico.consultar('  12345fulano ');
    assert.equal(comando, 'display access-user username 12345fulano verbose');
    assert.equal(r.online, true);
  });

  test('rejeita logins que poderiam injetar comandos no CLI', async () => {
    const servico = criarServicoPPPoE({ executar: async () => assert.fail('não deveria executar') });
    for (const login of ['a b', 'x;quit', 'x\nsystem-view', '', 'a'.repeat(65), 'x|include']) {
      await assert.rejects(servico.consultar(login), { code: 'LOGIN_INVALIDO' });
    }
  });
});

describe('SSH interativo contra um VRP simulado', () => {
  const { Server, utils } = require('ssh2');
  const { executarNoConcentrador } = require('../pppoeModules/pppoeService');

  // Imita o Huawei: banner + prompt; só mostra a saída sem paginação depois do screen-length;
  // termina com a pergunta [Y/N] e volta ao prompt.
  function iniciarVrpFalso({ recebidos }) {
    const chave = utils.generateKeyPairSync('ed25519').private;
    const servidor = new Server({ hostKeys: [chave] }, (cliente) => {
      cliente.on('authentication', (ctx) => (ctx.method === 'password' && ctx.username === 'consulta' && ctx.password === 'pw' ? ctx.accept() : ctx.reject()));
      cliente.on('session', (aceitar) => {
        const sessao = aceitar();
        sessao.on('pty', (ok) => ok && ok());
        sessao.on('shell', (ok) => {
          const s = ok();
          let linha = '';
          let paginacaoDesligada = false;
          s.write('Info: The max number of VTY users is 21.\r\n<bras.teste>');
          s.on('data', (d) => {
            linha += d.toString();
            if (!linha.includes('\n')) return;
            const cmd = linha.trim();
            linha = '';
            recebidos.push(cmd);
            if (cmd === 'screen-length 0 temporary') { paginacaoDesligada = true; s.write('Info: The configuration takes effect on the current user terminal interface only.\r\n<bras.teste>'); }
            else if (cmd.startsWith('display access-user')) {
              const corpo = SAIDA_ONLINE.split('\n').slice(4).join('\r\n');
              s.write(cmd + '\r\n' + (paginacaoDesligada ? corpo : corpo.slice(0, 200) + '\r\n  ---- More ----'));
              s.write('\r\nAre you sure to display some information? [Y/N]:');
            } else if (cmd === 'N' || cmd === 'Y') s.write(cmd + '\r\n<bras.teste>');
            else if (cmd === 'quit') s.close();
          });
        });
      });
    });
    return new Promise((resolve) => servidor.listen(0, '127.0.0.1', () => resolve(servidor)));
  }

  test('desliga paginação, responde [Y/N] e devolve a saída completa', async () => {
    const recebidos = [];
    const servidor = await iniciarVrpFalso({ recebidos });
    const antes = { ...process.env };
    Object.assign(process.env, { PPPOE_SSH_HOST: '127.0.0.1', PPPOE_SSH_PORT: String(servidor.address().port), PPPOE_SSH_USER: 'consulta', PPPOE_SSH_PASS: 'pw' });
    try {
      const servico = criarServicoPPPoE({ executar: (c) => executarNoConcentrador(c, { timeoutMs: 5000 }) });
      const r = await servico.consultar('12345fulano');
      assert.equal(r.online, true);
      assert.equal(r.ip, '203.0.113.10');
      assert.equal(r.tempoOnline, '431:18:40');
      assert.deepEqual(recebidos.slice(0, 3), ['screen-length 0 temporary', 'display access-user username 12345fulano verbose', 'N']);
    } finally {
      for (const k of ['PPPOE_SSH_HOST', 'PPPOE_SSH_PORT', 'PPPOE_SSH_USER', 'PPPOE_SSH_PASS']) {
        if (antes[k] === undefined) delete process.env[k]; else process.env[k] = antes[k];
      }
      servidor.close();
    }
  });

  test('senha errada vira erro de autenticação (502 na rota)', async () => {
    const servidor = await iniciarVrpFalso({ recebidos: [] });
    const antes = { ...process.env };
    Object.assign(process.env, { PPPOE_SSH_HOST: '127.0.0.1', PPPOE_SSH_PORT: String(servidor.address().port), PPPOE_SSH_USER: 'consulta', PPPOE_SSH_PASS: 'errada' });
    try {
      await assert.rejects(executarNoConcentrador('x', { timeoutMs: 5000 }), (e) => e.level === 'client-authentication');
    } finally {
      for (const k of ['PPPOE_SSH_HOST', 'PPPOE_SSH_PORT', 'PPPOE_SSH_USER', 'PPPOE_SSH_PASS']) {
        if (antes[k] === undefined) delete process.env[k]; else process.env[k] = antes[k];
      }
      servidor.close();
    }
  });
});

describe('rota GET /api/pppoe/:login', () => {
  function montarApp(servico) {
    const app = express();
    app.use('/api/pppoe', criarRotasPPPoE(servico));
    return app;
  }
  const servicoFalso = (consultar, configurado = true) => ({ consultar, configurado: () => configurado });
  const token = () => assinarToken(1);

  test('sem token: 401', async () => {
    const res = await request(montarApp(servicoFalso(async () => ({})))).get('/api/pppoe/fulano');
    assert.equal(res.status, 401);
  });

  test('não configurado: 503', async () => {
    const res = await request(montarApp(servicoFalso(async () => ({}), false)))
      .get('/api/pppoe/fulano').set('x-op-token', token());
    assert.equal(res.status, 503);
  });

  test('consulta ok devolve JSON, sem cache e grava auditoria', async () => {
    const servico = criarServicoPPPoE({ executar: async () => SAIDA_ONLINE });
    servico.configurado = () => true;
    const res = await request(montarApp(servico)).get('/api/pppoe/12345fulano').set('x-op-token', token());
    assert.equal(res.status, 200);
    assert.equal(res.body.ip, '203.0.113.10');
    assert.equal(res.headers['cache-control'], 'no-store');
    const linhas = fs.readFileSync(process.env.AUDIT_LOG_FILE, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.ok(linhas.some((l) => l.evento === 'pppoe.consulta' && l.login === '12345fulano' && l.ok === true));
  });

  test('login inválido: 400; timeout: 504; falha de autenticação SSH: 502', async () => {
    const erro = (props) => async () => { throw Object.assign(new Error('x'), props); };
    const t = token();
    assert.equal((await request(montarApp(servicoFalso(erro({ code: 'LOGIN_INVALIDO' })))).get('/api/pppoe/a').set('x-op-token', t)).status, 400);
    assert.equal((await request(montarApp(servicoFalso(erro({ code: 'ETIMEDOUT' })))).get('/api/pppoe/a').set('x-op-token', t)).status, 504);
    const r = await request(montarApp(servicoFalso(erro({ level: 'client-authentication' })))).get('/api/pppoe/a').set('x-op-token', t);
    assert.equal(r.status, 502);
    assert.match(r.body.erro, /credenciais SSH/);
  });
});
