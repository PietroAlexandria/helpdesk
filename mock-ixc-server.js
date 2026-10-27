// mock-ixc-server.js — Simula as respostas do IXC Provedor na porta 4000
const express = require('express');
const app = express();
app.use(express.json());

// Rota genérica para todas as tabelas (POST /webservice/v1/{tabela})
app.post('/webservice/v1/:tabela', (req, res) => {
  const tabela = req.params.tabela;
  const ixcsoft = req.headers['ixcsoft'];
  const body = req.body || {};
  const queryId = body.query || '91188';

  console.log(`[Mock IXC] POST /webservice/v1/${tabela} (ixcsoft=${ixcsoft})`, body);

  // 1. Contrato (aceita qualquer ID digitado)
  if (tabela === 'cliente_contrato') {
    return res.json({
      total: '1',
      registros: [
        {
          id: String(queryId),
          id_cliente: '24353',
          status: 'A',
          endereco: 'Rua das Flores, 120',
          bairro: 'Jardim Primavera',
          cidade: 'Ourinhos',
        },
      ],
    });
  }

  // 2. Cliente titular
  if (tabela === 'cliente') {
    return res.json({
      total: '1',
      registros: [
        {
          id: '24353',
          razao: 'João da Silva Sauro',
          cnpj_cpf: '123.456.789-00',
          telefone_celular: '(14) 99876-5432',
          email: 'joao.silva@email.com',
        },
      ],
    });
  }

  // 3. Login PPPoE e status online
  if (tabela === 'radusuarios') {
    return res.json({
      total: '1',
      registros: [
        {
          id: '5012',
          id_contrato: String(queryId),
          login: 'joao.silva',
          senha: 'cednet@user2026',
          online: global.__mockDesconectado ? 'N' : 'S',
          ip: '100.64.12.45',
          mac: 'ZTEGD1FA0B65',
        },
      ],
    });
  }

  // 4. Dados técnicos de fibra, OLT, caixa e telemetria óptica
  if (tabela === 'radpop_radio_cliente_fibra') {
    return res.json({
      total: '1',
      registros: [
        {
          id: '789',
          id_contrato: String(queryId),
          id_transmissor: 'IPP-OLT1-DATACOM',
          ponno: '1/1/20',
          slotno: '1',
          id_caixa_ftth: 'IPP_CTO_10A1',
          porta_ftth: '4',
          mac: 'ZTEGD1FA0B65',
          sinal_rx: '-19.45',
          sinal_tx: '2.15',
          data_sinal: new Date().toLocaleString('pt-BR'),
          causa_ultima_queda: 'Dying Gasp (Falta de energia no cliente)',
        },
      ],
    });
  }

  // 5. Ação de Desconexão PPPoE
  if (tabela === 'desconectar_clientes') {
    console.log(`[Mock IXC] Desconectando sessão do login ID ${body.id}`);
    global.__mockDesconectado = true;
    return res.json({
      type: 'success',
      message: 'Comando de desconexão enviado ao concentrador com sucesso!',
    });
  }

  res.status(404).json({ erro: `Tabela mock ${tabela} não encontrada` });
});

app.listen(4000, () => {
  console.log('✅ Mock IXC rodando em http://localhost:4000');
  console.log('💡 Dica: Aceita qualquer número de contrato para teste!');
});
