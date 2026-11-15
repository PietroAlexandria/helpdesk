// auth.js — Autenticação (JWT), comparação segura de senha e rate limit de login
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Compara senhas em tempo constante (evita timing attack)
function senhaConfere(informada, esperada) {
  if (typeof informada !== 'string' || typeof esperada !== 'string' || !esperada) return false;
  const a = crypto.createHash('sha256').update(informada).digest();
  const b = crypto.createHash('sha256').update(esperada).digest();
  return crypto.timingSafeEqual(a, b);
}

function lerPayload(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Exige token N2 (header x-n2-token, nivel 2)
function authN2(req, res, next) {
  const token = req.headers['x-n2-token'];
  if (!token) return res.status(401).json({ erro: 'Token ausente' });
  const payload = lerPayload(token);
  if (!tokenDeNivel(payload, 2)) return res.status(401).json({ erro: 'Token inválido' });
  next();
}

// Token "de nível" (operador/N2): tem `nivel` e NÃO tem escopo restrito.
// Tokens com `escopo` (ex.: o da consulta PPPoE) nunca valem como operador/N2.
function tokenDeNivel(payload, nivelMinimo) {
  return Boolean(payload && !payload.escopo && Number.isInteger(payload.nivel) && payload.nivel >= nivelMinimo);
}

// Exige operador logado: token de operador (x-op-token, nivel >= 1) OU token N2 válido
function authOperador(req, res, next) {
  const op = lerPayload(req.headers['x-op-token']);
  const n2 = lerPayload(req.headers['x-n2-token']);
  const ehN2 = tokenDeNivel(n2, 2);
  if (tokenDeNivel(op, 1) || ehN2) {
    req.nivel = ehN2 ? 2 : 1; // para auditoria
    return next();
  }
  return res.status(401).json({ erro: 'Não autenticado. Faça login de operador.' });
}

// --- Consulta PPPoE: token de ESCOPO próprio, emitido com SENHA_PPPOE.
// Não carrega `nivel`, então não abre nenhuma outra rota (IXC, status, N2).
// Leva uma "versão" derivada da SENHA_PPPOE: trocar a senha invalida na hora todos os tokens já emitidos.
function versaoSenhaPPPoE() {
  return crypto.createHmac('sha256', process.env.JWT_SECRET || '')
    .update(`pppoe:${process.env.SENHA_PPPOE || ''}`)
    .digest('hex')
    .slice(0, 16);
}

function assinarTokenPPPoE() {
  const sessao = crypto.randomUUID(); // identifica a sessão na auditoria (a senha é compartilhada)
  const token = jwt.sign(
    { escopo: 'pppoe', v: versaoSenhaPPPoE() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.PPPOE_TOKEN_EXPIRES_IN || '8h', jwtid: sessao },
  );
  return { token, sessao };
}

// Exige acesso à consulta PPPoE: token de escopo pppoe (x-pppoe-token) OU token N2.
// O token de operador comum NÃO basta — cada consulta abre uma sessão SSH no concentrador.
function authPPPoE(req, res, next) {
  const n2 = lerPayload(req.headers['x-n2-token']);
  if (tokenDeNivel(n2, 2)) {
    req.nivel = 2;
    return next();
  }
  const pppoe = lerPayload(req.headers['x-pppoe-token']);
  if (pppoe && pppoe.escopo === 'pppoe' && process.env.SENHA_PPPOE && pppoe.v === versaoSenhaPPPoE()) {
    req.nivel = 1;
    req.sessao = pppoe.jti;
    return next();
  }
  return res.status(401).json({ erro: 'Acesso à consulta PPPoE necessário.' });
}

// Limita por chave arbitrária (ex.: login consultado): no máximo 1 requisição a cada `intervaloMs`
function criarLimitadorPorChave({ intervaloMs = 15 * 1000, chave }) {
  const ultimo = new Map();
  setInterval(() => {
    const agora = Date.now();
    for (const [k, t] of ultimo) if (agora - t >= intervaloMs) ultimo.delete(k);
  }, Math.max(intervaloMs, 1000)).unref();

  return (req, res, next) => {
    const k = chave(req);
    const agora = Date.now();
    const t = ultimo.get(k);
    if (t !== undefined && agora - t < intervaloMs) {
      const espera = Math.ceil((t + intervaloMs - agora) / 1000);
      res.set('Retry-After', String(espera));
      return res.status(429).json({ erro: `Este login foi consultado agora há pouco. Aguarde ${espera}s.` });
    }
    ultimo.set(k, agora);
    next();
  };
}

// --- Páginas N2: o navegador não envia headers customizados em navegação,
// então a sessão N2 também é guardada em cookie httpOnly (além do localStorage da API).
const COOKIE_N2 = 'n2';

function lerCookie(req, nome) {
  const bruto = req.headers.cookie;
  if (!bruto) return null;
  for (const parte of bruto.split(';')) {
    const i = parte.indexOf('=');
    if (i > 0 && parte.slice(0, i).trim() === nome) {
      try {
        return decodeURIComponent(parte.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

function definirCookieN2(req, res, token) {
  res.cookie(COOKIE_N2, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: req.secure, // true atrás do proxy HTTPS (trust proxy)
    path: '/',
  });
}

function limparCookieN2(res) {
  res.clearCookie(COOKIE_N2, { path: '/' });
}

// Protege páginas HTML do N2: sem cookie válido, redireciona para o login
function exigirN2Pagina(req, res, next) {
  const payload = lerPayload(lerCookie(req, COOKIE_N2));
  if (tokenDeNivel(payload, 2)) return next();
  res.redirect('/login-n2');
}

function assinarToken(nivel) {
  return jwt.sign({ nivel }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
}

// Rate limit em memória: conta apenas tentativas FALHAS por IP
function criarLimitadorLogin({ max = 10, janelaMs = 15 * 60 * 1000 } = {}) {
  const tentativas = new Map();
  const ip = (req) => req.ip || req.socket.remoteAddress || 'unknown';

  // Limpeza periódica para o Map não crescer indefinidamente
  setInterval(() => {
    const agora = Date.now();
    for (const [chave, r] of tentativas) {
      if (agora - r.inicio >= janelaMs) tentativas.delete(chave);
    }
  }, janelaMs).unref();

  return {
    verificar(req, res, next) {
      const r = tentativas.get(ip(req));
      if (r && Date.now() - r.inicio < janelaMs && r.count >= max) {
        return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
      }
      next();
    },
    falha(req) {
      const chave = ip(req);
      const agora = Date.now();
      const r = tentativas.get(chave);
      if (r && agora - r.inicio < janelaMs) r.count += 1;
      else tentativas.set(chave, { count: 1, inicio: agora });
    },
    sucesso(req) {
      tentativas.delete(ip(req));
    },
  };
}

// Rate limit geral em memória: conta TODAS as requisições por IP numa janela fixa
function criarLimitadorGeral({ max = 60, janelaMs = 60 * 1000 } = {}) {
  const contagem = new Map();

  setInterval(() => {
    const agora = Date.now();
    for (const [chave, r] of contagem) {
      if (agora - r.inicio >= janelaMs) contagem.delete(chave);
    }
  }, janelaMs).unref();

  return (req, res, next) => {
    const chave = req.ip || req.socket.remoteAddress || 'unknown';
    const agora = Date.now();
    let r = contagem.get(chave);
    if (!r || agora - r.inicio >= janelaMs) {
      r = { count: 0, inicio: agora };
      contagem.set(chave, r);
    }
    r.count += 1;
    if (r.count > max) {
      res.set('Retry-After', String(Math.ceil((r.inicio + janelaMs - agora) / 1000)));
      return res.status(429).json({ erro: 'Muitas requisições. Tente novamente em instantes.' });
    }
    next();
  };
}

module.exports = {
  senhaConfere, authN2, authOperador, assinarToken, criarLimitadorLogin, criarLimitadorGeral,
  definirCookieN2, limparCookieN2, exigirN2Pagina,
  authPPPoE, assinarTokenPPPoE, criarLimitadorPorChave,
};
