require('dotenv').config();
const express = require('express');
const path = require('path');
const ixcRoutes = require('./ixcModules/ixcRoutes'); // IXC
const { senhaConfere, authN2, assinarToken, criarLimitadorLogin } = require('./auth');

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não configurado no .env — abortando.');
    process.exit(1);
}

const app = express();
app.disable('x-powered-by');
// Atrás do proxy do Render: usa o IP real do cliente (necessário para o rate limit)
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limit (só tentativas falhas) para proteger os logins contra força bruta
const limiteN2 = criarLimitadorLogin();
const limiteOperador = criarLimitadorLogin();

// Porta dinâmica para funcionar no Render (e localmente também)
const PORT = process.env.PORT || 3000;

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
        return res.status(401).json({ erro: 'Senha incorreta' });
    }
    limiteOperador.sucesso(req);
    res.json({ token: assinarToken(1) });
});

// ---------------------------------------- //
// Rotas Nível 2
app.get('/login-n2', (_, res) => res.sendFile(path.join(__dirname, 'views', 'login-n2.html')));
app.get('/nivel2', (_, res) => res.sendFile(path.join(__dirname, 'views', 'nivel2.html')));

app.post('/api/auth/n2', limiteN2.verificar, (req, res) => {
    const senha = req.body?.senha;
    if (!senhaConfere(senha, process.env.SENHA_N2)) {
        limiteN2.falha(req);
        return res.status(401).json({ erro: 'Senha incorreta' });
    }
    limiteN2.sucesso(req);
    res.json({ token: assinarToken(2) });
});

app.post('/api/auth/n2/verify', authN2, (_, res) => res.json({ ok: true }));

// Rota - Troca de Titularidade (N2)
app.get('/troca-titularidade', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'n2', 'troca-titularidade.html')));

// ---------------------------------------- //
// Rotas da integração IXC (exigem login de operador)
app.use('/api/ixc', ixcRoutes);

// ---------------------------------------- //
// Inicia o servidor na porta especificada
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));
