// ixcCache.js — Cache simples em memória com TTL (Time-To-Live)
const cache = new Map();
const TTL_PADRAO_MS = 3 * 60 * 1000; // 3 minutos

const ixcCache = {
  get(chave) {
    const item = cache.get(String(chave));
    if (!item) return null;

    if (Date.now() > item.expiraEm) {
      cache.delete(String(chave));
      return null;
    }
    return item.dados;
  },

  set(chave, dados, ttlMs = TTL_PADRAO_MS) {
    cache.set(String(chave), {
      dados,
      expiraEm: Date.now() + ttlMs,
    });
  },

  delete(chave) {
    cache.delete(String(chave));
  },

  clear() {
    cache.clear();
  },
};

module.exports = ixcCache;
