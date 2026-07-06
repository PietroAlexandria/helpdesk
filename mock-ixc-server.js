// mock-ixc-server.js — roda numa porta separada, só pra teste
const express = require('express');
const app = express();
app.use(express.json());

app.get('/webservice/v1/cliente_contrato', (req, res) => {
  res.json({
    type: 'success',
    total: 1,
    registros: [
      {
        id: req.body.query,
        id_cliente: '123',
        contrato: 'Fibra 300MB',
        status: 'A',
      },
    ],
  });
});

app.listen(4000, () => console.log('Mock IXC rodando na porta 4000'));
