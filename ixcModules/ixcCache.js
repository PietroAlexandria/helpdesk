// ixcCache.js — Cache simples em memória com TTL (Time-To-Live) e tamanho máximo
const cache = new Map();
const TTL_PADRAO_MS = 3 * 60 * 1000; // 3 minutos
const MAX_ITENS = 500;

function removerExpirados() {
  const agora = Date.now();
  for (const [chave, item] of cache) {
    if (agora > item.expiraEm) cache.delete(chave);
  }
}

// Varredura periódica: itens vencidos que ninguém consulta mais também saem
setInterval(removerExpirados, 60 * 1000).unref();

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
    const k = String(chave);
    cache.delete(k); // reinsere no fim (mais recente)
    if (cache.size >= MAX_ITENS) {
      removerExpirados();
      // Ainda cheio: descarta o mais antigo (primeira chave do Map)
      if (cache.size >= MAX_ITENS) cache.delete(cache.keys().next().value);
    }
    cache.set(k, { dados, expiraEm: Date.now() + ttlMs });
  },

  delete(chave) {
    cache.delete(String(chave));
  },

  clear() {
    cache.clear();
  },

  size() {
    return cache.size;
  },
};

module.exports = ixcCache;
