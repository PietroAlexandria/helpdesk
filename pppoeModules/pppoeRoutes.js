/* global require, module, console */
// pppoeRoutes.js — GET /api/pppoe/:login (exige operador autenticado; cada consulta é auditada)
const express = require('express');
const { authOperador, criarLimitadorGeral } = require('../auth');
const { auditar } = require('../audit');

function traduzirErro(err) {
  const code = err.code || '';
  if (code === 'LOGIN_INVALIDO') return { status: 400, erro: err.message };
  if (code === 'ETIMEDOUT') return { status: 504, erro: 'Tempo limite esgotado ao consultar o concentrador.' };
  if (err.level === 'client-authentication') {
    return { status: 502, erro: 'Concentrador recusou as credenciais SSH configuradas no servidor.' };
  }
  if (['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'EHOSTUNREACH'].includes(code) || err.level === 'client-socket') {
    return { status: 502, erro: 'Não foi possível conectar ao concentrador.' };
  }
  return { status: 500, erro: 'Erro inesperado ao consultar o concentrador.' };
}

function criarRotasPPPoE(servico) {
  const router = express.Router();
  router.use(authOperador);

  // Cada consulta abre uma sessão SSH no BRAS: limite mais baixo que o geral
  const limiteConsulta = criarLimitadorGeral({ max: 20, janelaMs: 60 * 1000 });

  router.get('/:login', limiteConsulta, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!servico.configurado()) {
      return res.status(503).json({ erro: 'Consulta PPPoE não configurada no servidor.' });
    }

    const login = String(req.params.login || '').trim();
    try {
      const resultado = await servico.consultar(login);
      auditar('pppoe.consulta', { ok: true, ip: req.ip, nivel: req.nivel, login, online: resultado.online });
      res.json(resultado);
    } catch (err) {
      console.error('[PPPoE Error]', err.code || err.level || '', err.message);
      auditar('pppoe.consulta', { ok: false, ip: req.ip, nivel: req.nivel, login, erro: err.code || err.level || 'erro' });
      const { status, erro } = traduzirErro(err);
      res.status(status).json({ erro });
    }
  });

  return router;
}

module.exports = { criarRotasPPPoE };
