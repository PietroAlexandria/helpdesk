// Testes do monitor de status (DownDetector) — sem rede: sondas e fontes oficiais são falsas.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';

const { criarMonitor, normalizarStatuspage, filtrarGoogle } = require('../statusModules/statusMonitor');
const { criarRotasStatus } = require('../statusModules/statusRoutes');
const { assinarToken } = require('../auth');

const SERVICOS = [
  { id: 'a', nome: 'A', grupo: 'G', sonda: 'https://a.test/' },
  { id: 'b', nome: 'B', grupo: 'G', sonda: 'https://b.test/' },
  { id: 'c', nome: 'C', grupo: 'G', sonda: 'https://c.test/' },
  { id: 'd', nome: 'D', grupo: 'G', sonda: 'https://d.test/' },
  { id: 'e', nome: 'E', grupo: 'G', sonda: 'https://e.test/' },
];
const OK = { ok: true, httpStatus: 200, latenciaMs: 100 };
const FALHA = { ok: false, erro: 'ETIMEDOUT', latenciaMs: 8000 };

// Monta um monitor cuja sonda devolve o que o mapa disser (padrão: OK)
function monitorCom(respostas, extra = {}) {
  return criarMonitor({ servicos: SERVICOS, sondar: async (url) => respostas[url] || OK, ...extra });
}
const por = (estado, id) => estado.servicos.find((s) => s.id === id);

describe('monitor: sondas', () => {
  test('antes da primeira coleta tudo é "desconhecido"', () => {
    const e = monitorCom({}).obterEstado();
    assert.equal(e.atualizadoEm, null);
    assert.equal(e.resumo.desconhecido, 5);
  });

  test('todos respondendo => ok', async () => {
    const m = monitorCom({});
    await m.verificarTudo();
    const e = m.obterEstado();
    assert.equal(e.resumo.ok, 5);
    assert.equal(e.conectividade, 'ok');
  });

  test('1 falha => instável; 2 seguidas => fora; recuperou => ok', async () => {
    const r = { 'https://a.test/': FALHA };
    const m = monitorCom(r);
    await m.verificarTudo();
    assert.equal(por(m.obterEstado(), 'a').status, 'instavel');
    await m.verificarTudo();
    assert.equal(por(m.obterEstado(), 'a').status, 'fora');
    delete r['https://a.test/'];
    await m.verificarTudo();
    const a = por(m.obterEstado(), 'a');
    assert.equal(a.status, 'ok');
    assert.deepEqual(a.historico, ['instavel', 'fora', 'ok']);
  });

  test('HTTP 5xx conta como falha; 403 conta como no ar', async () => {
    const m = monitorCom({
      'https://a.test/': { ok: false, httpStatus: 503, latenciaMs: 50 },
      'https://b.test/': { ok: true, httpStatus: 403, latenciaMs: 50 },
    });
    await m.verificarTudo();
    const e = m.obterEstado();
    assert.equal(por(e, 'a').status, 'instavel');
    assert.match(por(e, 'a').motivo, /HTTP 503/);
    assert.equal(por(e, 'b').status, 'ok');
  });

  test('resposta lenta => instável', async () => {
    const m = monitorCom({ 'https://a.test/': { ok: true, httpStatus: 200, latenciaMs: 9000 } });
    await m.verificarTudo();
    assert.equal(por(m.obterEstado(), 'a').status, 'instavel');
  });

  test('quase tudo falhando => conectividade suspeita e nada é marcado como fora', async () => {
    const r = {};
    SERVICOS.forEach((s) => { r[s.sonda] = FALHA; });
    const m = monitorCom(r);
    await m.verificarTudo();
    await m.verificarTudo();
    const e = m.obterEstado();
    assert.equal(e.conectividade, 'suspeita');
    assert.equal(e.resumo.fora, 0);
    assert.equal(e.resumo.desconhecido, 5);
  });

  test('rodadas simultâneas compartilham a mesma coleta', async () => {
    let chamadas = 0;
    const m = criarMonitor({ servicos: SERVICOS, sondar: async () => { chamadas += 1; return OK; } });
    await Promise.all([m.verificarTudo(), m.verificarTudo()]);
    assert.equal(chamadas, SERVICOS.length);
  });
});

describe('monitor: fontes oficiais', () => {
  const com = (extra) => [{ id: 'x', nome: 'X', grupo: 'G', sonda: 'https://x.test/', statuspage: { tipo: 'statuspage', url: 'https://x.test/s.json' }, ...extra }];

  test('incidente na página oficial vira alerta mesmo com a sonda ok', async () => {
    const m = criarMonitor({
      servicos: com({}),
      sondar: async () => OK,
      lerOficial: async () => ({ status: 'fora', motivo: 'Major Outage', incidentes: ['API fora'] }),
    });
    await m.verificarTudo();
    const x = por(m.obterEstado(), 'x');
    assert.equal(x.status, 'fora');
    assert.deepEqual(x.incidentes, ['API fora']);
    assert.match(x.motivo, /Major Outage/);
  });

  test('fonte oficial indisponível não derruba a sonda', async () => {
    const m = criarMonitor({
      servicos: com({}),
      sondar: async () => OK,
      lerOficial: async () => { throw new Error('timeout'); },
    });
    await m.verificarTudo();
    assert.equal(por(m.obterEstado(), 'x').status, 'ok');
  });

  test('normalizarStatuspage: sem incidente ativo não alerta', () => {
    assert.equal(normalizarStatuspage({ status: { indicator: 'minor', description: 'x' }, incidents: [] }).status, 'ok');
    assert.equal(normalizarStatuspage({ status: { indicator: 'none' }, incidents: [] }).status, 'ok');
    const r = normalizarStatuspage({ status: { indicator: 'major', description: 'Major' }, incidents: [{ name: 'Falha' }] });
    assert.equal(r.status, 'fora');
  });

  test('filtrarGoogle: só incidentes em andamento do produto pedido', () => {
    const oficial = { incidentes: [
      { service_name: 'Gmail', status_impact: 'SERVICE_DISRUPTION', external_desc: 'Atraso no Gmail' },
      { service_name: 'Google Drive', status_impact: 'SERVICE_OUTAGE', external_desc: 'Drive fora' },
    ] };
    assert.equal(filtrarGoogle(oficial, /gmail/i).status, 'instavel');
    assert.equal(filtrarGoogle(oficial, /drive/i).status, 'fora');
    assert.equal(filtrarGoogle(oficial, /meet/i).status, 'ok');
  });
});

describe('GET /api/status', () => {
  const monitor = monitorCom({});
  const app = express();
  app.use('/api/status', criarRotasStatus(monitor));

  test('sem login => 401', async () => {
    await request(app).get('/api/status').expect(401);
  });

  test('operador logado => 200 com resumo e serviços', async () => {
    await monitor.verificarTudo();
    const res = await request(app).get('/api/status').set('x-op-token', assinarToken(1)).expect(200);
    assert.equal(res.body.servicos.length, 5);
    assert.equal(res.body.resumo.ok, 5);
    assert.equal(res.headers['cache-control'], 'no-store');
  });
});
