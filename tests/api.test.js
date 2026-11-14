// Testes de API (node:test + supertest). Rodar com: npm test
const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const request = require('supertest');

// Ambiente de teste (definido ANTES de carregar o app)
const AUDIT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'helpdesk-audit-'));
process.env.JWT_SECRET = 'segredo-de-teste';
process.env.SENHA_N2 = 'senha-n2';
process.env.SENHA_OPERADOR = 'senha-op';
process.env.IXC_USER_ID = '1';
process.env.IXC_TOKEN = 'token-teste';
process.env.AUDIT_LOG_FILE = path.join(AUDIT_DIR, 'audit.log');
process.env.AUDIT_STDOUT = '0'; // não poluir a saída dos testes

const app = require('../server');
const ixcCache = require('../ixcModules/ixcCache');
const { senhaConfere } = require('../auth');

// IXC falso: responde as 4 tabelas consultadas + desconectar
let ixcFalso;
function iniciarIxcFalso() {
  return new Promise((resolve) => {
    ixcFalso = http.createServer((req, res) => {
      let corpo = '';
      req.on('data', (c) => (corpo += c));
      req.on('end', () => {
        const tabela = req.url.split('/').pop();
        const q = JSON.parse(corpo || '{}');
        const json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
        if (tabela === 'cliente_contrato') {
          return json({ registros: q.query === '404' ? [] : [{ id: q.query, id_cliente: '9', status: 'A', endereco: 'Rua A', bairro: 'B', cidade: 'C' }] });
        }
        if (tabela === 'cliente') return json({ registros: [{ razao: 'Fulano Teste', cnpj_cpf: '000', telefone_celular: '1', email: 'a@b.c' }] });
        if (tabela === 'radusuarios') return json({ registros: [{ id: '77', login: 'fulano', senha: 'x', online: 'S', ip: '10.0.0.1' }] });
        if (tabela === 'radpop_radio_cliente_fibra') return json({ registros: [{ id_transmissor: 'OLT1', ponno: '1/1/1', sinal_rx: '-20.1' }] });
        if (tabela === 'desconectar_clientes') return json({ type: 'success' });
        res.statusCode = 404; json({});
      });
    }).listen(0, '127.0.0.1', () => resolve(ixcFalso.address().port));
  });
}

let tokenOp;
let tokenN2;

before(async () => {
  const porta = await iniciarIxcFalso();
  process.env.IXC_HOST = `http://127.0.0.1:${porta}`;
  tokenOp = (await request(app).post('/api/auth/operador').send({ senha: 'senha-op' })).body.token;
  tokenN2 = (await request(app).post('/api/auth/n2').send({ senha: 'senha-n2' })).body.token;
});

after(() => {
  ixcFalso.close();
  fs.rmSync(AUDIT_DIR, { recursive: true, force: true });
});

describe('infraestrutura', () => {
  test('/health responde ok', async () => {
    const r = await request(app).get('/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'ok');
  });

  test('headers de segurança presentes e x-powered-by ausente', async () => {
    const r = await request(app).get('/');
    assert.equal(r.status, 200);
    assert.ok(r.headers['content-security-policy']);
    assert.equal(r.headers['x-content-type-options'], 'nosniff');
    assert.equal(r.headers['x-powered-by'], undefined);
  });

  test('rota inexistente retorna 404', async () => {
    assert.equal((await request(app).get('/naoexiste')).status, 404);
  });

  test('rotas removidas (teste-ixc e legado) retornam 404', async () => {
    assert.equal((await request(app).get('/teste-ixc')).status, 404);
    assert.equal((await request(app).get('/api/contrato/1')).status, 404);
  });
});

describe('autenticação de operador', () => {
  test('senha errada retorna 401', async () => {
    const r = await request(app).post('/api/auth/operador').set('X-Forwarded-For', '10.1.1.1').send({ senha: 'errada' });
    assert.equal(r.status, 401);
  });

  test('senha certa retorna token', async () => {
    assert.ok(tokenOp && tokenOp.split('.').length === 3);
  });

  test('rate limit: 10 falhas bloqueiam a 11ª tentativa (inclusive a senha certa)', async () => {
    const ip = '10.9.9.9';
    for (let i = 0; i < 10; i++) {
      const r = await request(app).post('/api/auth/operador').set('X-Forwarded-For', ip).send({ senha: 'x' });
      assert.equal(r.status, 401);
    }
    const bloqueada = await request(app).post('/api/auth/operador').set('X-Forwarded-For', ip).send({ senha: 'x' });
    assert.equal(bloqueada.status, 429);
    const certa = await request(app).post('/api/auth/operador').set('X-Forwarded-For', ip).send({ senha: 'senha-op' });
    assert.equal(certa.status, 429);
  });

  test('o bloqueio de um IP não afeta outro IP', async () => {
    const r = await request(app).post('/api/auth/operador').set('X-Forwarded-For', '10.8.8.8').send({ senha: 'senha-op' });
    assert.equal(r.status, 200);
  });

  test('senhaConfere: compara em tempo constante e rejeita tipos inválidos', () => {
    assert.equal(senhaConfere('abc', 'abc'), true);
    assert.equal(senhaConfere('abc', 'abd'), false);
    assert.equal(senhaConfere(undefined, 'abc'), false);
    assert.equal(senhaConfere('abc', ''), false);
    assert.equal(senhaConfere({ $ne: 1 }, 'abc'), false);
  });
});

describe('rotas /api/ixc', () => {
  test('sem token: 401 em contrato e desconectar', async () => {
    assert.equal((await request(app).get('/api/ixc/contrato/1')).status, 401);
    assert.equal((await request(app).post('/api/ixc/desconectar/77').send({})).status, 401);
  });

  test('token forjado: 401', async () => {
    const r = await request(app).get('/api/ixc/contrato/1').set('x-op-token', 'abc.def.ghi');
    assert.equal(r.status, 401);
  });

  test('token de operador consulta contrato', async () => {
    const r = await request(app).get('/api/ixc/contrato/101').set('x-op-token', tokenOp);
    assert.equal(r.status, 200);
    assert.equal(r.body.contrato.id, '101');
    assert.equal(r.body.cliente.nome, 'Fulano Teste');
    assert.equal(r.body.pppoe.online, true);
    assert.equal(r.body.fibra.sinal_rx, '-20.1');
  });

  test('token N2 também consulta contrato', async () => {
    const r = await request(app).get('/api/ixc/contrato/102').set('x-n2-token', tokenN2);
    assert.equal(r.status, 200);
  });

  test('segunda consulta vem do cache', async () => {
    await request(app).get('/api/ixc/contrato/103').set('x-op-token', tokenOp);
    const r = await request(app).get('/api/ixc/contrato/103').set('x-op-token', tokenOp);
    assert.equal(r.body._cached, true);
  });

  test('ID não numérico: 400', async () => {
    const r = await request(app).get('/api/ixc/contrato/abc').set('x-op-token', tokenOp);
    assert.equal(r.status, 400);
  });

  test('contrato inexistente: 404', async () => {
    const r = await request(app).get('/api/ixc/contrato/404').set('x-op-token', tokenOp);
    assert.equal(r.status, 404);
  });

  test('desconectar: valida ids e funciona com token', async () => {
    const h = { 'x-op-token': tokenOp };
    assert.equal((await request(app).post('/api/ixc/desconectar/abc').set(h).send({})).status, 400);
    assert.equal((await request(app).post('/api/ixc/desconectar/77').set(h).send({ idContrato: '1;x' })).status, 400);
    const ok = await request(app).post('/api/ixc/desconectar/77').set(h).send({ idContrato: '105' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.sucesso, true);
  });

  test('desconectar grava log de auditoria', async () => {
    await request(app).post('/api/ixc/desconectar/78').set('x-op-token', tokenOp).send({ idContrato: '106' });
    await new Promise((r) => setTimeout(r, 100));
    const linhas = fs.readFileSync(path.join(AUDIT_DIR, 'audit.log'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const ev = linhas.find((l) => l.evento === 'ixc.desconectar' && l.idLogin === '78');
    assert.ok(ev, 'evento de desconexão não encontrado');
    assert.equal(ev.ok, true);
    assert.equal(ev.idContrato, '106');
    assert.equal(ev.nivel, 1);
  });

  test('IXC fora do ar: 502 com mensagem amigável (sem vazar erro interno)', async () => {
    const original = process.env.IXC_HOST;
    process.env.IXC_HOST = 'http://127.0.0.1:1'; // porta fechada
    try {
      const r = await request(app).get('/api/ixc/contrato/999').set('x-op-token', tokenOp);
      assert.equal(r.status, 502);
      assert.match(r.body.erro, /conectar/i);
      const d = await request(app).post('/api/ixc/desconectar/77').set('x-op-token', tokenOp).send({});
      assert.equal(d.status, 502);
      assert.match(d.body.erro, /Falha ao desconectar.*conectar/i);
    } finally {
      process.env.IXC_HOST = original;
    }
  });
});

describe('área N2', () => {
  test('token de operador não vale como N2', async () => {
    const r = await request(app).post('/api/auth/n2/verify').set('x-n2-token', tokenOp);
    assert.equal(r.status, 401);
  });

  test('páginas N2 sem cookie redirecionam para o login', async () => {
    for (const rota of ['/nivel2', '/troca-titularidade']) {
      const r = await request(app).get(rota);
      assert.equal(r.status, 302);
      assert.equal(r.headers.location, '/login-n2');
    }
  });

  test('cookie forjado ou de operador não abre a página N2', async () => {
    assert.equal((await request(app).get('/nivel2').set('Cookie', 'n2=abc.def.ghi')).status, 302);
    assert.equal((await request(app).get('/nivel2').set('Cookie', `n2=${tokenOp}`)).status, 302);
  });

  test('login N2 define cookie httpOnly e libera as páginas', async () => {
    const login = await request(app).post('/api/auth/n2').set('X-Forwarded-For', '10.7.7.7').send({ senha: 'senha-n2' });
    assert.equal(login.status, 200);
    const cookie = login.headers['set-cookie'][0];
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Strict/i);
    const pares = cookie.split(';')[0];
    assert.equal((await request(app).get('/nivel2').set('Cookie', pares)).status, 200);
    assert.equal((await request(app).get('/troca-titularidade').set('Cookie', pares)).status, 200);
  });

  test('verify renova o cookie e logout o remove', async () => {
    const v = await request(app).post('/api/auth/n2/verify').set('x-n2-token', tokenN2);
    assert.equal(v.status, 200);
    assert.ok(v.headers['set-cookie']);
    const out = await request(app).post('/api/auth/n2/logout');
    assert.match(out.headers['set-cookie'][0], /^n2=;/);
  });
});

describe('robustez da API', () => {
  test('responde com X-Request-Id único por requisição', async () => {
    const a = await request(app).get('/health');
    const b = await request(app).get('/health');
    assert.ok(a.headers['x-request-id']);
    assert.notEqual(a.headers['x-request-id'], b.headers['x-request-id']);
  });

  test('JSON malformado: 400 em JSON, sem stack trace', async () => {
    const r = await request(app)
      .post('/api/auth/operador')
      .set('X-Forwarded-For', '10.6.0.1')
      .set('Content-Type', 'application/json')
      .send('{"senha": ');
    assert.equal(r.status, 400);
    assert.equal(r.body.erro, 'JSON inválido');
    assert.ok(!JSON.stringify(r.body).includes('at '));
  });

  test('rota /api inexistente: 404 em JSON', async () => {
    const r = await request(app).get('/api/nao-existe');
    assert.equal(r.status, 404);
    assert.equal(r.body.erro, 'Rota não encontrada');
  });

  test('rate limit geral: 61ª requisição em /api/ixc retorna 429 com Retry-After', async () => {
    const ip = '10.5.0.1';
    for (let i = 0; i < 60; i++) {
      const r = await request(app).get('/api/ixc/contrato/abc').set('X-Forwarded-For', ip).set('x-op-token', tokenOp);
      assert.equal(r.status, 400);
    }
    const r = await request(app).get('/api/ixc/contrato/abc').set('X-Forwarded-For', ip).set('x-op-token', tokenOp);
    assert.equal(r.status, 429);
    assert.ok(Number(r.headers['retry-after']) > 0);
    // outro IP não é afetado
    const outro = await request(app).get('/api/ixc/contrato/abc').set('X-Forwarded-For', '10.5.0.2').set('x-op-token', tokenOp);
    assert.equal(outro.status, 400);
  });

  test('rate limit de desconectar: 11ª chamada no minuto retorna 429', async () => {
    const ip = '10.4.0.1';
    for (let i = 0; i < 10; i++) {
      const r = await request(app).post('/api/ixc/desconectar/abc').set('X-Forwarded-For', ip).set('x-op-token', tokenOp).send({});
      assert.equal(r.status, 400);
    }
    const r = await request(app).post('/api/ixc/desconectar/abc').set('X-Forwarded-For', ip).set('x-op-token', tokenOp).send({});
    assert.equal(r.status, 429);
  });
});

describe('ixcCache', () => {
  test('expira por TTL', async () => {
    ixcCache.set('ttl', { a: 1 }, 20);
    assert.deepEqual(ixcCache.get('ttl'), { a: 1 });
    await new Promise((r) => setTimeout(r, 40));
    assert.equal(ixcCache.get('ttl'), null);
  });

  test('respeita o tamanho máximo descartando o mais antigo', () => {
    ixcCache.clear();
    for (let i = 0; i < 600; i++) ixcCache.set(`k${i}`, i);
    assert.ok(ixcCache.size() <= 500);
    assert.equal(ixcCache.get('k0'), null);
    assert.equal(ixcCache.get('k599'), 599);
    ixcCache.clear();
  });
});
