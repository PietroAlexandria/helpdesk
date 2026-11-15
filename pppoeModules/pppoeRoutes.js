/* global require, module, console, process */
// pppoeRoutes.js — GET /api/pppoe/:login (exige acesso PPPoE ou N2; cada consulta é auditada)
const express = require('express');
const { authPPPoE, criarLimitadorGeral, criarLimitadorPorChave } = require('../auth');
const { auditar } = require('../audit');
const { LOGIN_VALIDO } = require('./pppoeService');

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

function criarRotasPPPoE(servico, { maxSimultaneas = Number(process.env.PPPOE_MAX_SIMULTANEAS || 2) } = {}) {
  const router = express.Router();
  router.use(authPPPoE);

  // Cada consulta abre uma sessão SSH no BRAS: limite mais baixo que o geral (por IP)...
  const limiteConsulta = criarLimitadorGeral({ max: 10, janelaMs: 60 * 1000 });
  // ...e o mesmo login só pode ser consultado uma vez a cada 15s (evita cliques repetidos)
  const limitePorLogin = criarLimitadorPorChave({
    intervaloMs: 15 * 1000,
    chave: (req) => String(req.params.login || '').trim().toLowerCase(),
  });

  // Login fora do formato é recusado antes de qualquer limite/SSH (e nunca chega ao CLI do Huawei)
  function validarLogin(req, res, next) {
    res.setHeader('Cache-Control', 'no-store');
    if (!LOGIN_VALIDO.test(String(req.params.login || '').trim())) {
      return res.status(400).json({ erro: 'Login PPPoE inválido' });
    }
    next();
  }

  // Teto de sessões SSH simultâneas (somando todos os usuários): o VRP tem poucas linhas VTY e
  // esgotá-las trancaria o acesso dos administradores de rede ao concentrador.
  let emAndamento = 0;

  router.get('/:login', validarLogin, limiteConsulta, limitePorLogin, async (req, res) => {
    if (!servico.configurado()) {
      return res.status(503).json({ erro: 'Consulta PPPoE não configurada no servidor.' });
    }
    if (emAndamento >= maxSimultaneas) {
      res.set('Retry-After', '5');
      return res.status(503).json({ erro: 'Concentrador ocupado com outras consultas. Tente em alguns segundos.' });
    }

    const login = String(req.params.login || '').trim();
    const contexto = { ip: req.ip, nivel: req.nivel, sessao: req.sessao, login };
    emAndamento += 1;
    try {
      const resultado = await servico.consultar(login);
      auditar('pppoe.consulta', { ok: true, ...contexto, online: resultado.online });
      res.json(resultado);
    } catch (err) {
      console.error('[PPPoE Error]', err.code || err.level || '', err.message);
      auditar('pppoe.consulta', { ok: false, ...contexto, erro: err.code || err.level || 'erro' });
      const { status, erro } = traduzirErro(err);
      res.status(status).json({ erro });
    } finally {
      emAndamento -= 1;
    }
  });

  return router;
}

module.exports = { criarRotasPPPoE };
