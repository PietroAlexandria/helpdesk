// audit.js — Log de auditoria (JSON por linha): logins e ações sensíveis no IXC
//
// Destino padrão: stdout (o Render guarda os logs do serviço; o disco dele é efêmero e
// um arquivo local some a cada deploy/reinício).
// Opcional: AUDIT_LOG_FILE=/caminho/audit.log também grava em arquivo (útil em servidor próprio).
// AUDIT_STDOUT=0 desliga a saída no stdout (usado nos testes).
const fs = require('fs');
const path = require('path');

/**
 * Registra um evento. Ex.: auditar('ixc.desconectar', { ip, nivel, idLogin, ok: true })
 * Nunca lança erro: falha de log não pode derrubar a requisição.
 */
function auditar(evento, dados = {}) {
  const linha = JSON.stringify({ ts: new Date().toISOString(), evento, ...dados });

  if (process.env.AUDIT_STDOUT !== '0') {
    console.log(`[audit] ${linha}`);
  }

  const arquivo = process.env.AUDIT_LOG_FILE;
  if (!arquivo) return;
  try {
    fs.mkdirSync(path.dirname(arquivo), { recursive: true });
    fs.appendFile(arquivo, linha + '\n', (err) => {
      if (err) console.error('[audit] falha ao gravar arquivo:', err.message);
    });
  } catch (err) {
    console.error('[audit] falha ao gravar arquivo:', err.message);
  }
}

module.exports = { auditar };
