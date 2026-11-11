const { ixcRequest, ixcDesconectar } = require('./ixcClient');
const ixcCache = require('./ixcCache');

/**
 * Busca os dados consolidados do contrato:
 * 1. cliente_contrato
 * 2. cliente (titular)
 * 3. radusuarios (login, senha, status online, id_login)
 * 4. radpop_radio_cliente_fibra (OLT, PON, Slot, Caixa FTTH, MAC, Sinal RX/TX, Causa da queda)
 */
async function buscarDadosContrato(idContrato) {
  const cacheKey = `contrato_${idContrato}`;
  const dadosEmCache = ixcCache.get(cacheKey);
  if (dadosEmCache) {
    return { ...dadosEmCache, _cached: true };
  }

  // 1. Contrato
  const contratoRes = await ixcRequest('cliente_contrato', {
    qtype: 'cliente_contrato.id',
    query: idContrato,
    rp: '1',
  });

  const regContrato = contratoRes.registros?.[0];
  if (!regContrato) {
    throw new Error(`Contrato ${idContrato} não encontrado no IXC`);
  }

  const idCliente = regContrato.id_cliente;

  // 2. Chamadas em paralelo
  const [clienteRes, radiusRes, fibraRes] = await Promise.all([
    // Titular
    ixcRequest('cliente', {
      qtype: 'cliente.id',
      query: idCliente,
      rp: '1',
    }).catch(() => ({ registros: [] })),

    // Login PPPoE & Status Online
    ixcRequest('radusuarios', {
      qtype: 'radusuarios.id_contrato',
      query: idContrato,
      rp: '1',
    }).catch(() => ({ registros: [] })),

    // Dados técnicos de fibra, potências ópticas e causa de queda
    ixcRequest('radpop_radio_cliente_fibra', {
      qtype: 'radpop_radio_cliente_fibra.id_contrato',
      query: idContrato,
      rp: '1',
    }).catch(() => ({ registros: [] })),
  ]);

  const cli = clienteRes.registros?.[0] || {};
  const rad = radiusRes.registros?.[0] || {};
  const fib = fibraRes.registros?.[0] || {};

  const resultado = {
    contrato: {
      id: regContrato.id,
      status: regContrato.status || '',
      endereco: regContrato.endereco || '',
      bairro: regContrato.bairro || '',
      cidade: regContrato.cidade || '',
    },
    cliente: {
      nome: cli.razao || '',
      cpf_cnpj: cli.cnpj_cpf || '',
      telefone: cli.telefone_celular || cli.telefone_comercial || cli.telefone || '',
      email: cli.email || '',
    },
    pppoe: {
      id_login: rad.id || '',
      login: rad.login || '',
      senha: rad.senha || '',
      online: rad.online === 'S', // true se online, false se offline
      ip: rad.ip || '',
    },
    fibra: {
      olt: fib.id_transmissor || '',
      pon: fib.ponno || fib.ponid || '',
      slot: fib.slotno || '',
      caixa: fib.id_caixa_ftth || '',
      porta_caixa: fib.porta_ftth || '',
      mac: rad.mac || fib.mac || '',
      sinal_rx: fib.sinal_rx || '',
      sinal_tx: fib.sinal_tx || '',
      data_sinal: fib.data_sinal || '',
      causa_queda: fib.causa_ultima_queda || '',
    },
  };

  // Salva no cache por 3 minutos
  ixcCache.set(cacheKey, resultado);

  return resultado;
}

/**
 * Desconecta a sessão PPPoE e limpa o cache para forçar atualização no próximo refresh.
 */
async function desconectarSessaoPPPoE(idLogin, idContrato) {
  const retorno = await ixcDesconectar(idLogin);

  if (idContrato) {
    ixcCache.delete(`contrato_${idContrato}`);
  }

  return retorno;
}

module.exports = { buscarDadosContrato, desconectarSessaoPPPoE };
