// audit.js — Log de auditoria em arquivo (JSON por linha): logins e ações sensíveis no IXC
const fs = require('fs');
const path = require('path');

const DIR = process.env.AUDIT_LOG_DIR || path.join(__dirname, 'logs');
const ARQUIVO = path.join(DIR, 'audit.log');
let dirOk = false;

/**
 * Registra um evento. Ex.: auditar('ixc.desconectar', { ip, nivel, idLogin, ok: true })
 * Nunca lança erro: falha de log não pode derrubar a requisição.
 */
function auditar(evento, dados = {}) {
  const linha = JSON.stringify({ ts: new Date().toISOString(), evento, ...dados }) + '\n';
  try {
    if (!dirOk) {
      fs.mkdirSync(DIR, { recursive: true });
      dirOk = true;
    }
    fs.appendFile(ARQUIVO, linha, (err) => {
      if (err) console.error('[audit] falha ao gravar:', err.message);
    });
  } catch (err) {
    console.error('[audit] falha ao gravar:', err.message);
  }
}

module.exports = { auditar, ARQUIVO };
