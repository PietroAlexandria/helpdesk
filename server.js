require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const ixcRoutes = require('./ixcModules/ixcRoutes'); // IXC
const {
    senhaConfere, authN2, assinarToken, criarLimitadorLogin,
    definirCookieN2, limparCookieN2, exigirN2Pagina,
} = require('./auth');
const { auditar } = require('./audit');

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não configurado no .env — abortando.');
    process.exit(1);
}

const app = express();
app.disable('x-powered-by');
// Headers de segurança (CSP, anti-clickjacking, nosniff, HSTS em HTTPS...)
// 'unsafe-inline' é necessário porque as telas usam onclick/<style> inline.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'", 'https://viacep.com.br'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: null, // não força https em localhost
        },
    },
}));
// Atrás do proxy do Render: usa o IP real do cliente (necessário para o rate limit)
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limit (só tentativas falhas) para proteger os logins contra força bruta
const limiteN2 = criarLimitadorLogin();
const limiteOperador = criarLimitadorLogin();

// Porta dinâmica para funcionar no Render (e localmente também)
const PORT = process.env.PORT || 3000;

// Healthcheck (Render/monitoramento): não consulta o IXC nem exige login
app.get('/health', (_, res) => res.json({ status: 'ok', uptime: Math.round(process.uptime()) }));

// Serve para arquivos estáticos (css, js, images) da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rotas - cada uma aponta para um HTML em views
// Rota inicial
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

// Rota - Novo Atendimento
app.get('/atendimento', (_, res) => res.sendFile(path.join(__dirname, 'views', 'atendimento.html')));

// Rota - Sem Conexão
app.get('/sem-conexao', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'sem-conexao.html')));

// Rota - Conexão Lenta
app.get('/conexao-lenta', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'conexao-lenta.html')));

// Rota - Mudança de Endereço
app.get('/mudanca-endereco', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'mudanca-endereco.html')));

// Rota - Suporte de SVA's
app.get('/sva', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'sva.html')));

// Rota - Serviços (Mudança de Cômodo, Passagem de Cabo, Verificação de Rede, Config. Roteador)
app.get('/servicos', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'servicos.html')));

// Rota - Verificação de Rede (redireciona para /servicos)
app.get('/verificacao-rede', (_, res) => res.redirect('/servicos'));

// Rota - Pagamento
app.get('/pagamento', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'pagamento.html')));

// Rota - Dúvidas
app.get('/duvidas', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'duvidas.html')));

// Rota - Tutorial
app.get('/tutorial', (_, res) => res.sendFile(path.join(__dirname, 'views', 'tutorial.html')));

// ---------------------------------------- //
// Login de operador (N1 e N2) — protege as rotas /api/ixc/*
app.post('/api/auth/operador', limiteOperador.verificar, (req, res) => {
    if (!process.env.SENHA_OPERADOR) {
        return res.status(503).json({ erro: 'SENHA_OPERADOR não configurada no servidor' });
    }
    const senha = req.body?.senha;
    if (!senhaConfere(senha, process.env.SENHA_OPERADOR)) {
        limiteOperador.falha(req);
        auditar('login.operador', { ok: false, ip: req.ip });
        return res.status(401).json({ erro: 'Senha incorreta' });
    }
    limiteOperador.sucesso(req);
    auditar('login.operador', { ok: true, ip: req.ip });
    res.json({ token: assinarToken(1) });
});

// ---------------------------------------- //
// Rotas Nível 2
app.get('/login-n2', (_, res) => res.sendFile(path.join(__dirname, 'views', 'login-n2.html')));
app.get('/nivel2', exigirN2Pagina, (_, res) => res.sendFile(path.join(__dirname, 'views', 'nivel2.html')));

app.post('/api/auth/n2', limiteN2.verificar, (req, res) => {
    const senha = req.body?.senha;
    if (!senhaConfere(senha, process.env.SENHA_N2)) {
        limiteN2.falha(req);
        auditar('login.n2', { ok: false, ip: req.ip });
        return res.status(401).json({ erro: 'Senha incorreta' });
    }
    limiteN2.sucesso(req);
    auditar('login.n2', { ok: true, ip: req.ip });
    const token = assinarToken(2);
    definirCookieN2(req, res, token);
    res.json({ token });
});

// Valida o token e renova o cookie das páginas (sessões antigas só tinham localStorage)
app.post('/api/auth/n2/verify', authN2, (req, res) => {
    definirCookieN2(req, res, req.headers['x-n2-token']);
    res.json({ ok: true });
});

app.post('/api/auth/n2/logout', (req, res) => {
    limparCookieN2(res);
    res.json({ ok: true });
});

// Rota - Troca de Titularidade (N2)
app.get('/troca-titularidade', exigirN2Pagina, (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'n2', 'troca-titularidade.html')));

// ---------------------------------------- //
// Rotas da integração IXC (exigem login de operador)
app.use('/api/ixc', ixcRoutes);

// ---------------------------------------- //
// Inicia o servidor só quando executado diretamente (os testes importam o app)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));
}

module.exports = app;
