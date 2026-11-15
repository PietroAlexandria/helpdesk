/* global require, process, console, __dirname */
// Teste manual da consulta PPPoE contra o concentrador real (lê PPPOE_SSH_* do .env).
// Uso:  npm run pppoe:testar -- <login>            -> JSON interpretado
//       npm run pppoe:testar -- <login> --bruto    -> saída crua do Huawei
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { criarServicoPPPoE, executarNoConcentrador, configurado } = require('../pppoeModules/pppoeService');

const login = process.argv[2];
const bruto = process.argv.includes('--bruto');

(async () => {
  if (!login || login.startsWith('--')) {
    console.error('Uso: npm run pppoe:testar -- <login> [--bruto]');
    process.exit(2);
  }
  if (!configurado()) {
    console.error('Faltam PPPOE_SSH_HOST, PPPOE_SSH_USER ou PPPOE_SSH_PASS no .env');
    process.exit(2);
  }
  const inicio = Date.now();
  try {
    if (bruto) console.log(await executarNoConcentrador(`display access-user username ${login} verbose`));
    else console.log(JSON.stringify(await criarServicoPPPoE().consultar(login), null, 2));
    console.error(`OK em ${Date.now() - inicio} ms`);
  } catch (e) {
    console.error('FALHOU:', e.code || e.level || '', e.message);
    process.exit(1);
  }
})();
