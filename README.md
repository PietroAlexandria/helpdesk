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
| 🔗 **Guia de Ativações** | Redireciona para o portal de SVAs do Grupo CedNet |
| 📡 **Sem Conexão** | Diagnóstico de Fibra (CX, ONU, PPPoE) e Rádio (BASE, RÁDIO, PPPoE) com agendamento e integração JIRA |
| 🐢 **Conexão Lenta** | Fluxo de atendimento para instabilidade e lentidão, com suporte a Fibra e Rádio |
| 📦 **Mudança de Endereço** | Coleta completa (endereço, CEP auto-fill, telhado, disponibilidade, equipamentos) |
| 🛠️ **Suporte de SVA's** | Acessos (CedNet Play, CedNet Plus), GloboPlay, Setup BOX, CedNet Play, Premiere e Outro SVA |

---

## 🛠️ Stack Técnica

```
backend      Node.js + Express 5
frontend     HTML5 + CSS3 + JavaScript Vanilla
fonte        Inter (Google Fonts)
api externa  ViaCEP (autocomplete de endereço)
deploy       Render (porta dinâmica via process.env.PORT)
dev tool     Nodemon (hot-reload)
```

---

## 📁 Estrutura do Projeto

```
helpdesk/
├── server.js                          # Entrada principal — configura Express e rotas
├── package.json
│
├── views/
│   ├── index.html                     # Menu principal
│   └── options-html/
│       ├── sem-conexao.html           # Módulo sem conexão
│       ├── conexao-lenta.html         # Módulo conexão lenta
│       ├── mudanca-endereco.html      # Módulo mudança de endereço
│       └── sva.html                   # Módulo SVA
│
└── public/
    ├── css/
    │   ├── style.css                  # Estilos do menu principal
    │   ├── sem-conexao.css            # Estilos do módulo sem conexão
    │   ├── conexao-lenta.css          # Estilos do módulo conexão lenta
    │   ├── mudanca-endereco.css       # Estilos do módulo mudança de endereço
    │   └── sva.css                    # Estilos do módulo SVA
    ├── images/
    │   └── LogoCedNet.ico
    └── js/
        ├── sharedFunctions/           # Funções reutilizadas entre módulos
        │   ├── functionCep.js         # Máscara de CEP + auto-fill via ViaCEP
        │   ├── functionContact.js     # Máscara de telefone (fixo e celular)
        │   ├── functionToggleCards.js # Exibição/ocultação de cards por mapa de valores
        │   ├── functionMostrarAlerta.js # Toast notifications (erro e sucesso)
        │   ├── functionAddContact.js  # Adição dinâmica de múltiplos contatos
        │   └── functionCopyName.js    # Sincronização de nome entre campos (linkName)
        └── options-js/                # Lógica específica de cada módulo
            ├── sem-conexao.js
            ├── conexao-lenta.js
            ├── mudanca-endereco.js
            └── sva.js
```

---

## 🚀 Rodando Localmente

**Pré-requisitos:** Node.js 18+

```bash
# 1. Clone o repositório
git clone https://github.com/PietroAlexandria/ai-on.git
cd ai-on

# 2. Instale as dependências
npm install

# 3. Inicie em modo desenvolvimento (com hot-reload)
npm run dev

# ou em modo produção
npm start
```

A aplicação sobe em [http://localhost:3000](http://localhost:3000).

---

## 🔌 Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Menu principal |
| `GET` | `/sem-conexao` | Módulo sem conexão |
| `GET` | `/conexao-lenta` | Módulo conexão lenta |
| `GET` | `/mudanca-endereco` | Módulo mudança de endereço |
| `GET` | `/sva` | Módulo suporte de SVA's |

---

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor (configurada automaticamente no Render) |

---

## 💡 Destaques Técnicos

- **Auto-fill de CEP** — integração com a API pública [ViaCEP](https://viacep.com.br), preenchendo rua, bairro, UF e cidade automaticamente ao digitar o CEP no módulo de mudança de endereço.
- **Máscara de telefone inteligente** — identifica fixo (10 dígitos) e celular (11 dígitos), inclusive ao colar números com DDI +55.
- **Toggle de cards genérico** — `toggleCards(valor, mapa)` controla a visibilidade de seções por um mapa de valores sem duplicar lógica entre módulos.
- **Toast notifications** — `mostrarAlerta(mensagem, tipo)` substitui `alert()` com notificações visuais não-bloqueantes de erro e sucesso.
- **Múltiplos contatos dinâmicos** — `adicionarContato()` permite incluir e remover contatos em tempo real nos formulários de agendamento.
- **Sincronização de nome** — `linkName(origem, destino)` espelha o nome da coleta de dados automaticamente nos cards de agendamento.
- **Deploy com porta dinâmica** — usa `process.env.PORT || 3000`, compatível com Render e qualquer PaaS.

---

## 👤 Autor

Desenvolvido por **Pietro de Alexandria Picoli**

[![GitHub](https://img.shields.io/badge/GitHub-PietroAlexandria-181717?style=flat-square&logo=github)](https://github.com/PietroAlexandria)
