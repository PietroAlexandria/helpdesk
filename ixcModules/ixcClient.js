const axios = require('axios');

async function buscarContratoPorId(idContrato) {
  const authHeader = 'Basic ' + Buffer
    .from(`${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN}`)
    .toString('base64');

  const response = await axios({
    method: 'get',
    url: `${process.env.IXC_HOST}/webservice/v1/cliente_contrato`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
      ixcsoft: 'listar',
    },
    data: {
      qtype: 'cliente_contrato.id',
      query: idContrato,
      oper: '=',
      page: '1',
      rp: '1',
    },
  });
  return response.data;
}

module.exports = { buscarContratoPorId };
