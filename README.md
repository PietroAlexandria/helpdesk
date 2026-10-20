# 🌐 CedNet Helpdesk

> Ferramenta interna de suporte para operadores de ISP — agilize atendimentos e elimine o bloco de notas.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render)](https://helpdesk-izcw.onrender.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

---

## ✨ O que é isso?

O **CedNet Helpdesk** é um web service interno desenvolvido para operadores de suporte técnico de ISP. Em vez de digitar tudo num bloco de notas, o atendente preenche formulários guiados e o sistema monta automaticamente o registro estruturado — deixando o cliente esperando menos e o atendimento mais preciso.

**Acesse agora:** [https://helpdesk-izcw.onrender.com](https://helpdesk-izcw.onrender.com)

---

## 🗺️ Fluxos de Atendimento

| Módulo | Descrição |
|---|---|
| 📖 **Tutorial** | Guia interativo de uso da ferramenta para novos operadores |
| 🎧 **Coleta de Dados** | Triagem rápida (Via de Contato, Nome e Telefone) com encaminhamento automático para o módulo desejado |
| 🔗 **Guia de Ativações** | Redireciona para o portal de SVAs do Grupo CedNet |
| 📡 **Sem Conexão** | Diagnóstico de Fibra (CX, ONU, PPPoE) e Rádio (BASE, RÁDIO, PPPoE) com agendamento e integração JIRA/Zabbix |
| 🐢 **Conexão Lenta** | Fluxo de atendimento para instabilidade e lentidão, com suporte a Fibra e Rádio |
| 📦 **Mudança de Endereço** | Coleta completa (endereço, CEP auto-fill, telhado, disponibilidade, equipamentos) |
| 🧰 **Serviços** | Mudança de Cômodo, Passagem de Cabo, Verificação de Rede Interna e Configuração de Roteador |
| 🛠️ **Suporte de SVA's** | Acessos (CedNet Play, CedNet Plus), GloboPlay, Setup BOX, CedNet Play, Premiere e Outro SVA |
| 💲 **Financeiro** | Fluxos de pagamento, negociação, desbloqueio e segunda via |
| ❓ **Dúvidas** | Registro estruturado de dúvidas gerais e informações comerciais/técnicas |
| 🔐 **Nível 2 (Restrito)** | Área autenticada via JWT com ferramentas avançadas (ex.: **Troca de Titularidade** Fibra/Rádio) |

---

## 🛠️ Stack Técnica

```text
backend      Node.js + Express 5 + JWT (Autenticação N2)
frontend     HTML5 + CSS3 + JavaScript Vanilla
fonte        Inter (Google Fonts)
api externa  ViaCEP (autocomplete de endereço)
api interna  IXC Provedor (consulta de contratos via Webservice)
deploy       Render (porta dinâmica via process.env.PORT)
dev tool     Nodemon (hot-reload)
```

---

## 📁 Estrutura do Projeto

```text
helpdesk/
├── server.js                          # Entrada principal — configura Express, autenticação N2 e rotas
├── mock-ixc-server.js                 # Servidor mock do IXC para testes locais
├── package.json
├── .env.example                       # Exemplo de variáveis de ambiente
│
├── ixcModules/
│   └── ixcClient.js                   # Cliente HTTP para a API do IXC Provedor
│
├── views/
│   ├── index.html                     # Menu principal (N1)
│   ├── atendimento.html               # Coleta inicial de dados do atendimento
│   ├── tutorial.html                  # Tutorial de uso do sistema
│   ├── login-n2.html                  # Tela de login restrito do Nível 2
│   ├── nivel2.html                    # Painel principal do Nível 2
│   ├── teste-ixc.html                 # Página de teste da integração IXC
│   └── options-html/
│       ├── sem-conexao.html           # Módulo sem conexão
│       ├── conexao-lenta.html         # Módulo conexão lenta
│       ├── mudanca-endereco.html      # Módulo mudança de endereço
│       ├── servicos.html              # Módulo serviços (cômodo/cabo/rede/roteador)
│       ├── sva.html                   # Módulo SVA
│       ├── pagamento.html             # Módulo financeiro
│       ├── duvidas.html               # Módulo dúvidas
│       └── n2/
│           └── troca-titularidade.html # Módulo N2: Troca de Titularidade (Fibra e Rádio)
│
└── public/
    ├── css/
    │   ├── style.css                  # Estilos globais e do menu principal
    │   ├── atendimento.css            # Estilos da tela de coleta inicial
    │   ├── sem-conexao.css            # Estilos base de formulários e módulo sem conexão
    │   ├── conexao-lenta.css          # Estilos do módulo conexão lenta
    │   ├── mudanca-endereco.css       # Estilos do módulo mudança de endereço
    │   ├── servicos.css               # Estilos do módulo serviços
    │   ├── sva.css                    # Estilos do módulo SVA
    │   ├── pagamento.css              # Estilos do módulo financeiro
    │   ├── duvidas.css                # Estilos do módulo dúvidas
    │   ├── tutorial.css               # Estilos do tutorial
    │   ├── login-n2.css               # Estilos do login Nível 2
    │   ├── nivel2.css                 # Estilos do menu Nível 2
    │   └── sharedCss/
    │       ├── darkMode.css           # Tema escuro compartilhado
    │       ├── historicoCard.css      # Painel lateral (Histórico, Notepad e Templates)
    │       └── btnCopyAx.css          # Botões auxiliares de cópia rápida
    ├── images/
    │   └── LogoCedNet.ico
    └── js/
        ├── sharedFunctions/           # Funções reutilizadas entre módulos
        │   ├── functionCep.js         # Máscara de CEP + auto-fill via ViaCEP
        │   ├── functionContact.js     # Máscara de telefone (fixo e celular)
        │   ├── functionToggleCards.js # Exibição/ocultação de cards por mapa de valores
        │   ├── functionMostrarAlerta.js # Toast notifications (erro e sucesso)
        │   ├── functionAddContact.js  # Adição dinâmica de múltiplos contatos
        │   ├── functionCopyName.js    # Sincronização de nome entre campos (linkName)
        │   ├── functionCardHistory.js # Histórico, Notepad e Templates no localStorage
        │   ├── functionButtonsCopy.js # Textos prontos de cópia rápida e templates
        │   ├── functionDarkMode.js    # Alternância e persistência de Dark Mode
        │   └── functionPreencherColeta.js # Preenchimento automático vindo de /atendimento
        ├── options-js/                # Lógica específica de cada módulo N1
        └── n2/
            └── troca-titularidade.js  # Lógica de Troca de Titularidade (N2)
```

---

## 🚀 Rodando Localmente

**Pré-requisitos:** Node.js 18+

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/PietroAlexandria/ai-on.git
cd ai-on
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Edite o `.env` com os valores corretos.

4. Inicie em modo desenvolvimento (com hot-reload)
```bash
npm run dev
```
ou em modo produção:
```bash
npm start
```

A aplicação sobe em [http://localhost:3000](http://localhost:3000).

---

## 🔌 Rotas da Aplicação

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Menu principal |
| `GET` | `/atendimento` | Coleta rápida de dados iniciais |
| `GET` | `/tutorial` | Guia de uso da ferramenta |
| `GET` | `/sem-conexao` | Módulo sem conexão |
| `GET` | `/conexao-lenta` | Módulo conexão lenta |
| `GET` | `/mudanca-endereco` | Módulo mudança de endereço |
| `GET` | `/servicos` | Módulo serviços (cômodo, cabo, verificação de rede, roteador) |
| `GET` | `/sva` | Módulo suporte de SVA's |
| `GET` | `/pagamento` | Módulo financeiro |
| `GET` | `/duvidas` | Módulo dúvidas |
| `GET` | `/login-n2` | Página de login do Nível 2 |
| `GET` | `/nivel2` | Menu exclusivo do Nível 2 (protegido por JWT) |
| `GET` | `/troca-titularidade` | Módulo N2: Troca de Titularidade (protegido por JWT) |
| `POST` | `/api/auth/n2` | Autentica senha do N2, emite JWT e define cookie `HttpOnly` |
| `POST` | `/api/auth/n2/verify` | Verifica validade do token JWT do Nível 2 |
| `POST` | `/api/auth/n2/logout` | Encerra sessão do Nível 2 limpando cookie `HttpOnly` |
| `GET` | `/api/contrato/:id` | Consulta contrato no IXC Provedor por ID numérico |

---

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor (configurada automaticamente no Render) |
| `IXC_HOST` | — | URL base do servidor IXC (ex: `https://ixc.suaempresa.com.br`) |
| `IXC_USER_ID` | — | ID do usuário para autenticação na API do IXC |
| `IXC_TOKEN` | — | Token de acesso à API do IXC |
| `SENHA_N2` | — | Senha de acesso aos módulos restritos do Nível 2 |
| `JWT_SECRET` | — | Segredo para assinatura e verificação dos tokens JWT |
| `JWT_EXPIRES_IN` | `30d` | Tempo de expiração do token JWT do Nível 2 |

---

## 👤 Autor

Desenvolvido por **Pietro de Alexandria Picoli**

[![GitHub](https://img.shields.io/badge/GitHub-PietroAlexandria-181717?style=flat-square&logo=github)](https://github.com/PietroAlexandria)
