/* global module */
// huaweiParser.js — interpreta a saída de `display access-user username <login> verbose`
// de um BRAS Huawei (VRP). Função pura: recebe o texto bruto, devolve um objeto resumido.

// Remove escapes ANSI/VT100 e os marcadores de paginação "---- More ----"
function limparSaida(bruto) {
  return String(bruto || '')
    // eslint-disable-next-line no-control-regex
    .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
    .replace(/\s*-{2,}\s*More\s*-{2,}\s*/g, '\n')
    .replace(/\r/g, '');
}

// "203.0.113.10(Radius)" -> "203.0.113.10"; "-" -> null
function valor(v) {
  if (v === undefined) return null;
  const limpo = String(v).replace(/\s*\((Radius|Local)\)\s*$/i, '').trim();
  return limpo === '' || limpo === '-' ? null : limpo;
}

// Lê todas as linhas "Chave : valor" (primeira ocorrência de cada chave vence)
function lerCampos(texto) {
  const campos = {};
  for (const linha of texto.split('\n')) {
    // A chave pode ter ":" dentro de parênteses, ex.: "Online time (h:min:sec)"
    const m = linha.match(/^\s+((?:[^:(]|\([^)]*\))+?)\s*:\s*(.*?)\s*$/);
    if (m && !(m[1] in campos)) campos[m[1]] = m[2];
  }
  return campos;
}

// "431:18:40" -> 1552720 segundos
function hmsParaSegundos(hms) {
  const m = String(hms || '').match(/^(\d+):(\d{1,2}):(\d{1,2})$/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}

// Contadores do Huawei vêm como (high,low) de 32 bits: total = high * 2^32 + low
function contador64(par) {
  const m = String(par || '').match(/\((\d+),(\d+)\)/);
  return m ? Number(m[1]) * 2 ** 32 + Number(m[2]) : null;
}

const GB = 1024 ** 3;

// "6600 kbyte/min" -> kbps
function kbyteMinParaKbps(v) {
  const m = String(v || '').match(/^(\d+)\s*kbyte\/min/i);
  return m ? Math.round((Number(m[1]) * 8) / 60) : null;
}

// "716800(kbps)" -> 700 (Mbps)
function kbpsParaMbps(v) {
  const m = String(v || '').match(/^(\d+)/);
  return m ? Math.round(Number(m[1]) / 1024) : null;
}

// "02aa-bbcc-ddee" -> "02:AA:BB:CC:DD:EE"
function formatarMac(v) {
  const hex = String(v || '').replace(/[^0-9a-f]/gi, '');
  return hex.length === 12 ? hex.match(/../g).join(':').toUpperCase() : valor(v);
}

// Mensagem do VRP quando o usuário não está online (ignora banner de login e "Unrecognized command")
function mensagemDoEquipamento(texto) {
  const linhas = texto.split('\n')
    .map((l) => l.trim())
    .filter((l) => /^(Error|Info):/i.test(l) && !/Unrecognized command|VTY users|login time/i.test(l));
  return linhas[0] || null;
}

function interpretarAccessUser(bruto, login) {
  const texto = limparSaida(bruto);
  const c = lerCampos(texto);

  if (!c['User name']) {
    return { login, online: false, mensagem: mensagemDoEquipamento(texto) };
  }

  const tempoOnline = valor(c['Online time (h:min:sec)']);
  const upBytes = contador64(c['Up bytes number(high,low)']);
  const downBytes = contador64(c['Down bytes number(high,low)']);
  const gb = (b) => (b === null ? null : Number((b / GB).toFixed(2)));

  return {
    login: valor(c['User name']),
    online: true,
    estado: valor(c['State']),
    dominio: valor(c['Domain name']),
    ip: valor(c['User IP address']),
    mac: formatarMac(c['User MAC']),
    gateway: valor(c['User gateway address']),
    dns: [valor(c['User Primary-DNS']), valor(c['User Secondary-DNS'])].filter(Boolean),
    ipv6: {
      prefixoPD: valor(c['User IPv6 PD Prefix']),
      prefixoNDRA: valor(c['User IPv6 NDRA Prefix']),
    },
    interface: valor(c['User access interface']),
    interfaceFisica: valor(c['User access physical interface']),
    vlan: valor(c['User access PeVlan/CeVlan']),
    inicio: valor(c['Access start time']),
    tempoOnline,
    tempoOnlineSeg: hmsParaSegundos(tempoOnline),
    autenticacao: valor(c['Authen result']),
    // Perfil de QoS entregue pelo RADIUS (ex.: "700M") e a velocidade efetiva configurada
    plano: valor(c['Outbound QOS-profile-name']) || valor(c['Inbound QOS-profile-name']),
    velocidadeMbps: {
      download: kbpsParaMbps(c['Outbound cir']),
      upload: kbpsParaMbps(c['Inbound cir']),
    },
    // No BRAS, "outbound" é o que sai para o cliente (download) e "inbound" o que chega dele (upload)
    consumoAgoraKbps: {
      download: kbyteMinParaKbps(c['Realtime speed outbound']),
      upload: kbyteMinParaKbps(c['Realtime speed inbound']),
    },
    trafegoSessaoGB: { download: gb(downBytes), upload: gb(upBytes) },
    mtu: c['MTU'] ? Number(c['MTU']) : null,
  };
}

module.exports = { interpretarAccessUser, limparSaida, hmsParaSegundos, contador64 };
