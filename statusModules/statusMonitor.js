/* global require, module, console, setInterval, clearInterval */
// statusMonitor.js — "DownDetector" interno: sondas HTTP + páginas de status oficiais.
// Estado só em memória (some no restart); a coleta roda em segundo plano e a rota apenas lê.
const axios = require('axios');
const { SERVICOS } = require('./statusConfig');

// Status possíveis: ok | instavel | fora | desconhecido
const GRAVIDADE = { ok: 0, desconhecido: 1, instavel: 2, fora: 3 };
const PIOR = (a, b) => (GRAVIDADE[b] > GRAVIDADE[a] ? b : a);

const TIMEOUT_MS = 8000;
const UA = 'Mozilla/5.0 (compatible; HelpdeskStatus/1.0)';

// --- Coletores reais (substituíveis nos testes) ---

// Sonda: qualquer resposta HTTP < 500 conta como "no ar" (muitos sites devolvem 403/302 para robôs).
async function sondarHttp(url) {
  const inicio = Date.now();
  try {
    const res = await axios.get(url, {
      timeout: TIMEOUT_MS,
      maxRedirects: 0, // um 3xx já prova que o servidor responde (e evita loops de login)
      validateStatus: () => true,
      responseType: 'stream', // só os headers importam; o corpo é descartado
      headers: { 'User-Agent': UA },
    });
    res.data.destroy();
    return { ok: res.status < 500, httpStatus: res.status, latenciaMs: Date.now() - inicio };
  } catch (err) {
    return { ok: false, erro: err.code || 'ERRO_REDE', latenciaMs: Date.now() - inicio };
  }
}

// Lê uma fonte oficial e devolve { status, motivo, incidentes[] } já normalizado.
async function lerFonteOficial(fonte) {
  const { data } = await axios.get(fonte.url, {
    timeout: TIMEOUT_MS,
    maxContentLength: 5 * 1024 * 1024,
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  return fonte.tipo === 'google' ? normalizarGoogle(data) : normalizarStatuspage(data);
}

function normalizarStatuspage(data) {
  const incidentes = (data?.incidents || []).map((i) => String(i.name)).slice(0, 3);
  const indicador = data?.status?.indicator;
  // Indicador sem incidente ativo = manutenção/componente isolado: não vira alerta
  if (!indicador || indicador === 'none' || incidentes.length === 0) return { status: 'ok', incidentes: [] };
  return {
    status: indicador === 'minor' ? 'instavel' : 'fora',
    motivo: String(data.status.description || 'Incidente em andamento'),
    incidentes,
  };
}

// Google Workspace: incidentes sem "end" estão em andamento (todos os produtos numa lista só).
function normalizarGoogle(data) {
  return { incidentes: Array.isArray(data) ? data.filter((i) => !i.end) : [] };
}

function filtrarGoogle(oficial, filtro) {
  const ativos = (oficial.incidentes || []).filter((i) => {
    const nomes = [i.service_name, ...(i.affected_products || []).map((p) => p.title)].join(' ');
    return filtro.test(nomes) || /multiple products/i.test(i.service_name || '');
  });
  if (ativos.length === 0) return { status: 'ok', incidentes: [] };
  const grave = ativos.some((i) => i.status_impact === 'SERVICE_OUTAGE');
  return {
    status: grave ? 'fora' : 'instavel',
    motivo: 'Incidente em andamento no Google Workspace',
    incidentes: ativos.map((i) => String(i.external_desc || i.service_name).split('\n').find((l) => l && !l.startsWith('**')) || i.service_name).slice(0, 3),
  };
}

// --- Monitor ---

function criarMonitor({
  servicos = SERVICOS,
  sondar = sondarHttp,
  lerOficial = lerFonteOficial,
  intervaloMs = 60 * 1000,
  limiarFora = 2, // falhas seguidas da sonda para considerar "fora" (1 falha = "instável")
  latenciaLentaMs = 4000,
  tamanhoHistorico = 30,
  agora = () => Date.now(),
} = {}) {
  const estado = new Map(servicos.map((s) => [s.id, {
    status: 'desconhecido', desde: null, falhasSeguidas: 0, historico: [],
    latenciaMs: null, motivo: null, incidentes: [],
  }]));
  let atualizadoEm = null;
  let conectividade = 'ok'; // 'suspeita' = o próprio servidor parece sem internet
  let emAndamento = null;
  let timer = null;

  async function coletar() {
    // Fontes oficiais: cada URL é buscada uma única vez por rodada
    const fontes = new Map();
    for (const s of servicos) if (s.statuspage) fontes.set(s.statuspage.url, s.statuspage);
    const oficiais = new Map();
    await Promise.all([...fontes].map(async ([url, fonte]) => {
      try { oficiais.set(url, await lerOficial(fonte)); } catch { /* fonte fora do ar: ignora, a sonda continua valendo */ }
    }));

    const sondas = await Promise.all(servicos.map(async (s) => [s.id, await sondar(s.sonda)]));
    const falhas = sondas.filter(([, r]) => !r.ok).length;
    // Quase tudo falhando ao mesmo tempo = problema do nosso lado, não de 20 serviços
    const semInternet = servicos.length >= 5 && falhas >= Math.ceil(servicos.length * 0.7);
    conectividade = semInternet ? 'suspeita' : 'ok';

    const resultadoSonda = new Map(sondas);
    for (const s of servicos) {
      const e = estado.get(s.id);
      const r = resultadoSonda.get(s.id);
      let status = 'ok';
      const motivos = [];
      e.latenciaMs = r.latenciaMs ?? null;

      if (semInternet) {
        status = 'desconhecido';
        motivos.push('Servidor sem conectividade — não foi possível verificar');
      } else if (!r.ok) {
        e.falhasSeguidas += 1;
        status = e.falhasSeguidas >= limiarFora ? 'fora' : 'instavel';
        motivos.push(r.httpStatus ? `Respondeu HTTP ${r.httpStatus}` : `Sem resposta (${r.erro})`);
      } else {
        e.falhasSeguidas = 0;
        if (r.latenciaMs > latenciaLentaMs) {
          status = 'instavel';
          motivos.push(`Resposta lenta (${r.latenciaMs} ms)`);
        }
      }

      let incidentes = [];
      if (s.statuspage && oficiais.has(s.statuspage.url)) {
        const of = oficiais.get(s.statuspage.url);
        const norm = s.filtroGoogle ? filtrarGoogle(of, s.filtroGoogle) : of;
        if (norm.status !== 'ok') {
          status = PIOR(status, norm.status);
          if (norm.motivo) motivos.push(`Página oficial: ${norm.motivo}`);
          incidentes = norm.incidentes;
        }
      }

      if (status !== e.status) e.desde = agora();
      e.status = status;
      e.motivo = motivos.join(' · ') || null;
      e.incidentes = incidentes;
      e.historico.push(status);
      if (e.historico.length > tamanhoHistorico) e.historico.shift();
    }
    atualizadoEm = agora();
  }

  // Evita rodadas sobrepostas
  function verificarTudo() {
    if (!emAndamento) emAndamento = coletar().finally(() => { emAndamento = null; });
    return emAndamento;
  }

  function obterEstado() {
    const lista = servicos.map((s) => {
      const e = estado.get(s.id);
      return {
        id: s.id, nome: s.nome, grupo: s.grupo, status: e.status, desde: e.desde,
        latenciaMs: e.latenciaMs, motivo: e.motivo, incidentes: e.incidentes,
        oficial: Boolean(s.statuspage), historico: [...e.historico],
      };
    });
    const resumo = { ok: 0, instavel: 0, fora: 0, desconhecido: 0 };
    for (const s of lista) resumo[s.status] += 1;
    return { atualizadoEm, conectividade, resumo, servicos: lista };
  }

  function iniciar() {
    if (timer) return;
    verificarTudo().catch((err) => console.error(JSON.stringify({ nivel: 'erro', evento: 'status.coleta', msg: err.message })));
    timer = setInterval(() => {
      verificarTudo().catch((err) => console.error(JSON.stringify({ nivel: 'erro', evento: 'status.coleta', msg: err.message })));
    }, intervaloMs);
    timer.unref();
  }

  function parar() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return { verificarTudo, obterEstado, iniciar, parar };
}

module.exports = { criarMonitor, normalizarStatuspage, normalizarGoogle, filtrarGoogle };
