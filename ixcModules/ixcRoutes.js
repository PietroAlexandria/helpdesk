const express = require('express');
const router = express.Router();
const { buscarDadosContrato, desconectarSessaoPPPoE } = require('./ixcService');

// GET /api/ixc/contrato/:id
router.get('/contrato/:id', async (req, res) => {
  const id = String(req.params.id || '').trim();
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ erro: 'ID de contrato deve conter apenas números' });
  }

  try {
    const dados = await buscarDadosContrato(id);
    res.json(dados);
  } catch (err) {
    console.error('[IXC Error]', err.message);

    let mensagemAmigavel = err.message;
    let status = 500;

    if (err.message.includes('não encontrado')) {
      status = 404;
    } else if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
      mensagemAmigavel = 'Não foi possível conectar ao servidor do IXC (porta indisponível ou mock desligado).';
    } else if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
      mensagemAmigavel = 'Tempo limite esgotado ao tentar comunicar com o IXC.';
    }

    res.status(status).json({ erro: mensagemAmigavel });
  }
});

// POST /api/ixc/desconectar/:idLogin
router.post('/desconectar/:idLogin', async (req, res) => {
  const idLogin = String(req.params.idLogin || '').trim();
  const idContrato = req.body?.idContrato;

  if (!/^\d+$/.test(idLogin)) {
    return res.status(400).json({ erro: 'ID de login inválido' });
  }

  try {
    const resultado = await desconectarSessaoPPPoE(idLogin, idContrato);
    res.json({ sucesso: true, mensagem: 'Comando de desconexão enviado com sucesso', resultado });
  } catch (err) {
    console.error('[IXC Desconectar Error]', err.message);
    res.status(500).json({ erro: 'Falha ao desconectar cliente no IXC: ' + err.message });
  }
});

module.exports = router;
