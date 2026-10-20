require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const { buscarContratoPorId } = require('./ixcModules/ixcClient'); // IXC

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ---------------------------------------- //
// Auth N2
function authN2(req, res, next) {
    const token = req.headers['x-n2-token'];
    if (!token) return res.status(401).json({ erro: 'Token ausente' });
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ erro: 'Token inválido' });
    }
}

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

// Rota temporária de teste IXC
app.get('/teste-ixc', (_, res) => res.sendFile(path.join(__dirname, 'views', 'teste-ixc.html')));

// ---------------------------------------- //
// Rotas Nível 2
app.get('/login-n2', (_, res) => res.sendFile(path.join(__dirname, 'views', 'login-n2.html')));
app.get('/nivel2',   (_, res) => res.sendFile(path.join(__dirname, 'views', 'nivel2.html')));

app.post('/api/auth/n2', (req, res) => {
    const { senha } = req.body;
    if (senha !== process.env.SENHA_N2) return res.status(401).json({ erro: 'Senha incorreta' });
    const token = jwt.sign({ nivel: 2 }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
    res.json({ token });
});

app.post('/api/auth/n2/verify', authN2, (_, res) => res.json({ ok: true }));

// Rota - Troca de Titularidade (N2)
app.get('/troca-titularidade', (_, res) => res.sendFile(path.join(__dirname, 'views', 'options-html', 'n2', 'troca-titularidade.html')));

// ---------------------------------------- //
// Rota para buscar contrato no IXC
app.get('/api/contrato/:id', async (req, res) => {
    try {
        const dados = await buscarContratoPorId(req.params.id);
        res.json(dados);
    } catch (err) {
        console.error('ERRO IXC:', err.response?.data || err.message, err.code);
        res.status(500).json({ erro: 'Falha ao consultar contrato no IXC', detalhe: err.message });
    }
});

// ---------------------------------------- //
// Inicia o servidor na porta especificada
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));
