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
  if (!payload || payload.nivel !== 2) return res.status(401).json({ erro: 'Token inválido' });
  next();
}

// Exige operador logado: token de operador (x-op-token, nivel >= 1) OU token N2 válido
function authOperador(req, res, next) {
  const op = lerPayload(req.headers['x-op-token']);
  const n2 = lerPayload(req.headers['x-n2-token']);
  if ((op && op.nivel >= 1) || (n2 && n2.nivel === 2)) {
    req.nivel = n2 && n2.nivel === 2 ? 2 : 1; // para auditoria
    return next();
  }
  return res.status(401).json({ erro: 'Não autenticado. Faça login de operador.' });
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
  if (payload && payload.nivel === 2) return next();
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

module.exports = {
  senhaConfere, authN2, authOperador, assinarToken, criarLimitadorLogin,
  definirCookieN2, limparCookieN2, exigirN2Pagina,
};
