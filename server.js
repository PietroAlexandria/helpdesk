const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Serve para arquivos estáticos (css, js, images) da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Rotas - cada uma aponta para um HTML em views
//Rota inicial
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "views", "index.html")));

// Rota - Sem Conexão 
app.get("/sem-conexao", (_, res) => res.sendFile(path.join(__dirname, "views", "/options-html/sem-conexao.html")));

// Rota - Conexão Lenta
app.get("/conexao-lenta", (_, res) => res.sendFile(path.join(__dirname, "views", "/options-html/conexao-lenta.html")));

// Rota - Mudança de Endereço
app.get("/mudanca-endereco", (_, res) => res.sendFile(path.join(__dirname, "views", "/options-html/mudanca-endereco.html")));

// Rota - Suporte de SVA's
app.get("/sva", (_, res) => res.sendFile(path.join(__dirname, "views", "/options-html/sva.html")));

// ---------------------------------------- //
// Inicia o servidor na porta especificada
app.listen(port, () => console.log(`Rodando em http://localhost:${port}`));