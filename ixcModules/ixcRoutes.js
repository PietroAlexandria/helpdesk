const express = require('express');
const router = express.Router();
const { buscarDadosContrato, desconectarSessaoPPPoE } = require('./ixcService');
const { authOperador } = require('../auth');
const { auditar } = require('../audit');

// Todas as rotas do IXC exigem operador autenticado
router.use(authOperador);

// Traduz erros de rede/IXC em mensagem amigável + status HTTP (sem vazar detalhes internos)
function traduzirErro(err) {
  const code = err.code || err.cause?.code || '';
  const msg = err.message || '';

  if (msg.includes('não encontrado')) return { status: 404, erro: msg };
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ECONNRESET') {
    return { status: 502, erro: 'Não foi possível conectar ao servidor do IXC.' };
  }
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || /timeout/i.test(msg)) {
    return { status: 504, erro: 'Tempo limite esgotado ao tentar comunicar com o IXC.' };
  }
  if (err.response?.status === 401 || err.response?.status === 403) {
    return { status: 502, erro: 'IXC recusou as credenciais configuradas no servidor.' };
  }
  return { status: 500, erro: 'Erro inesperado ao consultar o IXC.' };
}

// GET /api/ixc/contrato/:id
router.get('/contrato/:id', async (req, res) => {
  const id = String(req.params.id || '').trim();
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ erro: 'ID de contrato deve conter apenas números' });
  }

  try {
    res.json(await buscarDadosContrato(id));
  } catch (err) {
    console.error('[IXC Error]', err.code || '', err.message);
    const { status, erro } = traduzirErro(err);
    res.status(status).json({ erro });
  }
});

// POST /api/ixc/desconectar/:idLogin
router.post('/desconectar/:idLogin', async (req, res) => {
  const idLogin = String(req.params.idLogin || '').trim();
  const idContrato = String(req.body?.idContrato ?? '').trim();

  if (!/^\d+$/.test(idLogin)) {
    return res.status(400).json({ erro: 'ID de login inválido' });
  }
  if (idContrato && !/^\d+$/.test(idContrato)) {
    return res.status(400).json({ erro: 'ID de contrato inválido' });
  }

  try {
    const resultado = await desconectarSessaoPPPoE(idLogin, idContrato || undefined);
    auditar('ixc.desconectar', { ok: true, ip: req.ip, nivel: req.nivel, idLogin, idContrato: idContrato || null });
    res.json({ sucesso: true, mensagem: 'Comando de desconexão enviado com sucesso', resultado });
  } catch (err) {
    console.error('[IXC Desconectar Error]', err.code || '', err.message);
    auditar('ixc.desconectar', { ok: false, ip: req.ip, nivel: req.nivel, idLogin, idContrato: idContrato || null, erro: err.code || err.message });
    const { status, erro } = traduzirErro(err);
    res.status(status).json({ erro: 'Falha ao desconectar cliente no IXC: ' + erro });
  }
});

module.exports = router;
