/* global require, module */
// statusRoutes.js — GET /api/status (exige operador autenticado)
const express = require('express');
const { authOperador } = require('../auth');

function criarRotasStatus(monitor) {
  const router = express.Router();
  router.use(authOperador);

  router.get('/', (_, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(monitor.obterEstado());
  });

  return router;
}

module.exports = { criarRotasStatus };
