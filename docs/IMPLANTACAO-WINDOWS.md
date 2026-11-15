# Implantação na rede interna (Windows + HTTPS)

Roda o helpdesk num servidor/PC Windows **dentro da rede da CedNet**, acessado por
`https://helpdesk.grupocednet.com.br`. Assim a consulta PPPoE alcança o concentrador (Ultron),
cuja porta SSH só responde de dentro da rede.

```
Atendente ──HTTPS:443──▶ Caddy (mesmo Windows) ──HTTP──▶ helpdesk em 127.0.0.1:3000 ──SSH:22──▶ Ultron
```

- **Caddy** cuida do HTTPS e é a única porta aberta para a rede (443). Ele recusa (403) qualquer
  acesso que não venha de um IP interno ou da VPN. Se alguém um dia expuser a porta para a
  internet por engano, o helpdesk continua fechado.
- O **helpdesk** escuta só em `127.0.0.1`: ninguém consegue pular o HTTPS acessando a porta 3000.
- **Duas camadas:** estar na rede é a primeira barreira. A segunda são as senhas do próprio app,
  e futuramente o login por e-mail `@grupocednet.com.br`. Não tire o login só porque o acesso é interno.

> Confirme com a equipe de rede a faixa de IP que a **VPN** entrega aos usuários. Se não for
> privada (10.x, 172.16–31.x, 192.168.x), acrescente-a no `Caddyfile`.

> Nenhuma senha ou token vai neste arquivo nem no GitHub: tudo fica no `.env` **do servidor**.

---

## 0. Antes de começar (com a equipe de rede)

- [ ] Uma máquina Windows ligada 24h, na rede interna, que **alcance o Ultron na porta 22**.
- [ ] Um IP fixo para ela.
- [ ] Um nome no **DNS interno**: `helpdesk.grupocednet.com.br` → IP dessa máquina.
- [ ] Um certificado para esse nome. O melhor é o da empresa, por exemplo um wildcard
  `*.grupocednet.com.br` em `.crt` e `.key`. Se não houver, use a CA interna do Caddy (passo 4, opção B).

## 1. Instalar o Node e baixar o projeto

1. Instale o **Node.js 22 LTS ou superior** (nodejs.org) e o **Git** (git-scm.com).
2. Em um PowerShell **como administrador**:

```powershell
New-Item -ItemType Directory -Force C:\helpdesk | Out-Null
git clone https://github.com/PietroAlexandria/helpdesk.git C:\helpdesk\app
cd C:\helpdesk\app
npm ci --omit=dev
```

> Se o repositório estiver privado, o `git clone` pede login no GitHub. Use um token de acesso
> **somente leitura** (fine-grained, só este repositório), não a sua senha.

## 2. Criar o `.env` do servidor

Crie `C:\helpdesk\app\.env` (copie do `.env.example`) com **valores novos**, diferentes dos do
seu PC e do Render:

```
PORT=3000
HOST=127.0.0.1
TRUST_PROXY=loopback
JWT_SECRET=<gerado abaixo>
SENHA_OPERADOR=<nova>
SENHA_N2=<nova>
SENHA_PPPOE=<nova, 12+ caracteres, diferente das outras>
PPPOE_SSH_HOST=<host do Ultron>
PPPOE_SSH_PORT=22
PPPOE_SSH_USER=<usuário somente leitura>
PPPOE_SSH_PASS=<senha>
PPPOE_SSH_HOST_FINGERPRINT=<recomendado, ver abaixo>
AUDIT_LOG_FILE=C:\helpdesk\dados\audit.log
IXC_HOST=...
IXC_USER_ID=...
IXC_TOKEN=...
```

Para gerar um `JWT_SECRET` e senhas aleatórias:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

- **`HOST=127.0.0.1`:** o helpdesk só aceita conexões vindas do Caddy.
- **`TRUST_PROXY=loopback`:** o servidor confia no IP do cliente que o Caddy repassa, e só nele.
  Assim o limite de tentativas por IP não pode ser burlado.
- **`AUDIT_LOG_FILE`:** aqui o disco é permanente, então a auditoria também fica em arquivo.
- **`PPPOE_SSH_HOST_FINGERPRINT`:** fixa a chave do Ultron e impede que outra máquina se passe
  por ele. Peça o `SHA256:...` à equipe de rede ou pegue com `ssh-keyscan <host> | ssh-keygen -lf -`.

**Proteja o arquivo.** Só administradores e a conta do serviço devem ler o `.env`:

```powershell
icacls C:\helpdesk\app\.env /inheritance:r /grant:r "Administradores:F" "SYSTEM:R"
```

## 3. Testar antes de virar serviço

```powershell
cd C:\helpdesk\app
npm run pppoe:testar -- loginquenaoexiste
```

Deve responder `"online": false` com `Info: No online user!`. Se der `FALHOU`, veja a tabela em
[TESTE-PPPOE.md](TESTE-PPPOE.md) antes de seguir.

## 4. Caddy (HTTPS)

1. Baixe o `caddy.exe` para Windows em caddyserver.com/download e salve em `C:\caddy\`.
2. Copie [deploy/Caddyfile.exemplo](../deploy/Caddyfile.exemplo) para `C:\caddy\Caddyfile`.
3. Escolha o certificado:
   - **Opção A, certificado da empresa:** coloque o `.crt` e o `.key` em `C:\caddy\certs\` e mantenha
     a linha `tls C:\caddy\certs\...`. Restrinja o acesso ao `.key` com `icacls`, como no `.env`.
   - **Opção B, CA interna:** troque pela linha `tls internal`. Depois, distribua a raiz da CA
     (`%AppData%\Caddy\pki\authorities\local\root.crt` na máquina do Caddy) para os PCs dos
     atendentes, via GPO, em *Autoridades de Certificação Raiz Confiáveis*. Sem isso, o navegador
     mostra um alerta de segurança.
4. Valide e instale como serviço:

```powershell
C:\caddy\caddy.exe validate --config C:\caddy\Caddyfile
sc.exe create caddy start= auto binPath= "C:\caddy\caddy.exe run --config C:\caddy\Caddyfile"
sc.exe start caddy
```

## 5. Helpdesk como serviço do Windows (NSSM)

O Node não vira serviço sozinho. O **NSSM** (nssm.cc) faz isso e reinicia o helpdesk se ele cair.

```powershell
# ajuste o caminho do nssm.exe e do node.exe ((Get-Command node).Source)
nssm install helpdesk "C:\Program Files\nodejs\node.exe" "server.js"
nssm set helpdesk AppDirectory C:\helpdesk\app
nssm set helpdesk Start SERVICE_AUTO_START
nssm set helpdesk AppStdout C:\helpdesk\dados\saida.log
nssm set helpdesk AppStderr C:\helpdesk\dados\erros.log
nssm set helpdesk AppRotateFiles 1
nssm set helpdesk AppRotateBytes 10485760
nssm start helpdesk
```

O NSSM roda o serviço como `SYSTEM` por padrão. O ideal é criar uma conta local sem privilégios
(ex.: `svc-helpdesk`), dar a ela leitura em `C:\helpdesk\app` e escrita em `C:\helpdesk\dados`, e
usá-la com `nssm set helpdesk ObjectName .\svc-helpdesk <senha>`. Se fizer isso, troque `SYSTEM`
por `svc-helpdesk` no `icacls` do `.env`.

## 6. Firewall

```powershell
New-NetFirewallRule -DisplayName "Helpdesk HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Domain,Private
New-NetFirewallRule -DisplayName "Helpdesk HTTP (redireciona p/ HTTPS)" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Domain,Private
```

Não abra a porta 3000. Mesmo que alguém a abra, o helpdesk só escuta em `127.0.0.1`.

## 7. Conferir

- De outro PC da rede, abra `https://helpdesk.grupocednet.com.br`. O cadeado deve aparecer sem alerta.
- Faça uma consulta em `/consulta-pppoe`.
- `http://<ip-do-servidor>:3000` **não** deve abrir de outro PC.
- Com a VPN ligada, de casa, deve abrir. Com a VPN desligada, não deve nem resolver o nome.
- `C:\helpdesk\dados\audit.log` deve registrar `login.pppoe` e `pppoe.consulta`.

## Atualizar para uma versão nova

```powershell
cd C:\helpdesk\app
git pull
npm ci --omit=dev
nssm restart helpdesk
```

## E o Render?

Depois que a versão interna estiver no ar, o Render pode ser **desligado**, ou ficar sem as
variáveis `PPPOE_SSH_*` (a consulta PPPoE responde "não configurada"). Não deixe os dois com as
mesmas senhas: cada ambiente tem o seu `.env`.
