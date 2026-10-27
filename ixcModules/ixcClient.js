const axios = require('axios');

function getAuthHeader() {
  const userId = process.env.IXC_USER_ID;
  const token = process.env.IXC_TOKEN;
  if (!userId || !token) {
    throw new Error('Variáveis IXC_USER_ID ou IXC_TOKEN não configuradas no .env');
  }
  return 'Basic ' + Buffer.from(`${userId}:${token}`).toString('base64');
}

function getHost() {
  const host = process.env.IXC_HOST;
  if (!host) {
    throw new Error('Variável IXC_HOST não configurada no .env');
  }
  return host.replace(/\/+$/, '');
}

/**
 * Executa uma requisição genérica na API do IXC (listar).
 */
async function ixcRequest(tabela, { qtype, query, oper = '=', page = '1', rp = '20' }) {
  const host = getHost();
  const auth = getAuthHeader();

  const response = await axios({
    method: 'post',
    url: `${host}/webservice/v1/${tabela}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
      ixcsoft: 'listar',
    },
    data: { qtype, query: String(query), oper, page, rp },
  });

  return response.data;
}

/**
 * Envia o comando de desconexão (Kick / CoA) para a sessão PPPoE do cliente.
 */
async function ixcDesconectar(idLogin) {
  const host = getHost();
  const auth = getAuthHeader();

  const response = await axios({
    method: 'post',
    url: `${host}/webservice/v1/desconectar_clientes`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
      ixcsoft: 'listar',
    },
    data: { id: String(idLogin) },
  });

  return response.data;
}

module.exports = { ixcRequest, ixcDesconectar };
