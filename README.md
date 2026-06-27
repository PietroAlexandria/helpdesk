# 🌐 CedNet Helpdesk

> Ferramenta interna de suporte para operadores de ISP — agilize atendimentos e elimine o bloco de notas.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render)](https://helpdesk-izcw.onrender.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

---

## ✨ O que é isso?

O **CedNet Helpdesk** é um web service interno desenvolvido para operadores de suporte técnico de ISP. Em vez de digitar tudo num bloco de notas, o atendente preenche formulários guiados, e o sistema monta automaticamente o registro estruturado — deixando o cliente esperando menos e o atendimento mais preciso.

**Acesse agora:** [https://helpdesk-izcw.onrender.com](https://helpdesk-izcw.onrender.com)

---

## 🗺️ Fluxos de Atendimento

| Módulo | Descrição |
|---|---|
| 🔗 **Guia de Ativações** | Redireciona para o portal de SVAs do Grupo CedNet |
| 📡 **Sem Conexão** | Diagnóstico de Fibra (CX, ONU, PPPoE) e Rádio (BASE, RÁDIO, PPPoE) |
| 🐢 **Conexão Lenta** | Fluxo de atendimento para instabilidade e lentidão |
| 📦 **Mudança de Endereço** | Coleta completa (endereço, CEP auto-fill, telhado, disponibilidade, equipamentos) |
| 🛠️ **Suporte de SVA's** | Fluxo de suporte para serviços de valor agregado |

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
AI ON/
├── server.js                        # Entrada principal — configura Express e rotas
├── index.js                         # Hello World (placeholder)
├── package.json
│
├── views/
│   ├── index.html                   # Menu principal
│   └── options-html/
│       ├── sem-conexao.html         # Módulo sem conexão
│       ├── conexao-lenta.html       # Módulo conexão lenta
│       ├── mudanca-endereco.html    # Módulo mudança de endereço
│       └── sva.html                 # Módulo SVA
│
└── public/
    ├── css/
    │   ├── style.css                # Estilos do menu
    │   ├── sem-conexao.css
    │   └── mudanca-endereco.css
    ├── images/
    │   └── LogoCedNet.ico
    └── js/
        ├── sharedFunctions/
        │   ├── functionCep.js       # Máscara + auto-fill via ViaCEP
        │   ├── functionContact.js   # Máscara de telefone (fixo e celular)
        │   └── functionToggleCards.js
        └── options-js/
            └── mudanca-endereco.js  # Lógica de cópia do formulário
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
- **Toggle de cards** — função genérica `toggleCards()` controla a visibilidade de seções sem duplicar lógica entre módulos.
- **Deploy com porta dinâmica** — usa `process.env.PORT || 3000`, compatível com Render e qualquer PaaS.

---

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues e pull requests! O projeto está em desenvolvimento ativo.

```bash
# Crie uma branch para sua feature
git checkout -b feature/minha-feature

# Commit com mensagem descritiva
git commit -m "feat: adiciona módulo de conexão lenta"

# Push e abra um PR
git push origin feature/minha-feature
```

---

## 👤 Autor

Desenvolvido por **Pietro de Alexandria Picoli**

[![GitHub](https://img.shields.io/badge/GitHub-PietroAlexandria-181717?style=flat-square&logo=github)](https://github.com/PietroAlexandria)