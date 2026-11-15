# Teste da consulta PPPoE no concentrador real

Roteiro para validar `GET /api/pppoe/:login` contra o BRAS Huawei, a partir de uma máquina
que tenha acesso SSH ao concentrador (rede interna). De fora não dá: a porta 22 só responde de dentro.

## 1. Pegar a branch

```bash
git fetch origin
git switch feat/consulta-pppoe
npm install
```

> Precisa do Node 20.19+. O `npm install` pode avisar que bloqueou o build do `cpu-features` —
> é opcional (só acelera criptografia); o `ssh2` funciona sem ele.

## 2. Configurar o `.env` (nunca commitar — já está no `.gitignore`)

Copie as variáveis `PPPOE_SSH_*` do `.env.example` e preencha com **os mesmos dados da sessão
do concentrador no MobaXterm** (Remote host, Port e o usuário):

```
PPPOE_SSH_HOST=<host da sessão no MobaXterm>
PPPOE_SSH_PORT=22
PPPOE_SSH_USER=<usuário>
PPPOE_SSH_PASS=<senha>
SENHA_PPPOE=<senha que libera a consulta nas telas>
```

- No MobaXterm, um usuário entre colchetes (ex.: `[nome]`) é o **nome da credencial salva**, não
  necessariamente o login. Confira em *Settings → MobaXterm password management / User credentials*.
- Na dúvida entre duas senhas, entre primeiro pelo MobaXterm com cada uma e deixe no `.env` **só a
  que funcionou**. Não fique tentando várias vezes seguidas: o Huawei pode bloquear após falhas.

## 3. Rodar o teste

```bash
npm run pppoe:testar -- <login-pppoe-online>
npm run pppoe:testar -- loginquenaoexiste
npm run pppoe:testar -- <login-pppoe-online> --bruto
```

| Resultado | Significado |
|---|---|
| JSON com `"online": true`, `ip`, `mac`, `plano`... | Funcionou de ponta a ponta |
| `"online": false` + `mensagem` | Login não está online — anote a mensagem exata do Huawei |
| `FALHOU: client-authentication` | Usuário ou senha errados |
| `FALHOU: ETIMEDOUT` | Rede bloqueada **ou** prompt diferente do esperado — rode com `--bruto` |
| `FALHOU: client-socket` / `ECONNREFUSED` | Host/porta inacessíveis desta máquina |

## 4. Testar pelas telas ou pela API (opcional)

```bash
npm start
```

A consulta exige a senha própria `SENHA_PPPOE` do `.env` (a de operador não serve).

**Pelas telas:** a consulta só roda ao clicar em **🔍 Consultar** (Enter e colar não consultam).
Na primeira consulta a tela pede a senha.

- `/consulta-pppoe` — tela só de consulta (botão "Consulta PPPoE" no menu inicial).
- `/sem-conexao` e `/conexao-lenta` — escolha Fibra (Caixa ONLINE) ou Rádio (Base ONLINE) e use o bloco
  **Consulta PPPoE**. O login digitado vai para o campo "Login PPPoE" do agendamento.

**Pela API**, em outro terminal, no PowerShell (troque `<senha-pppoe>` pela `SENHA_PPPOE` do `.env`):

```powershell
$t = (Invoke-RestMethod -Method Post localhost:3000/api/auth/pppoe -ContentType 'application/json' -Body '{"senha":"<senha-pppoe>"}').token
Invoke-RestMethod localhost:3000/api/pppoe/<login> -Headers @{ 'x-pppoe-token' = $t }
```

No bash/Git Bash:

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/auth/pppoe -H 'Content-Type: application/json' -d '{"senha":"<senha-pppoe>"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -s localhost:3000/api/pppoe/<login> -H "x-pppoe-token: $TOKEN"
```

Limites: 10 consultas/min por IP e o mesmo login só uma vez a cada 15s (responde 429).

## 5. O que mandar de volta

- O JSON de um login online e a resposta de um login inexistente (**mascare IP e MAC**).
- Se algo falhar: a linha `FALHOU: ...` e, se possível, a saída do `--bruto`.
