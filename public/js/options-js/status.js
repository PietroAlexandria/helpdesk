// status.js — Tela "Status dos Serviços": lê /api/status e atualiza a cada 60s.
// Todo texto vem do servidor (inclusive de páginas de status de terceiros), então usa só textContent.

const ROTULOS = { ok: 'Operacional', instavel: 'Instável', fora: 'Possível queda', desconhecido: 'Sem dados' };
const ORDEM_GRUPOS = ['Comunicação', 'Vídeo', 'Google', 'Microsoft', 'Outros'];

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function desdeTexto(ts) {
  if (!ts) return '';
  const min = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (min < 1) return 'agora há pouco';
  if (min < 60) return `há ${min} min`;
  return `há ${Math.floor(min / 60)} h`;
}

function renderServico(s) {
  const li = el('div', 'servico');
  const linha = el('div', 'linha-principal');
  linha.append(el('span', `bolinha ${s.status}`), el('span', 'nome', s.nome));
  const rotulo = el('span', `rotulo ${s.status}`, ROTULOS[s.status] || s.status);
  if (s.status !== 'ok' && s.status !== 'desconhecido' && s.desde) rotulo.textContent += ` (${desdeTexto(s.desde)})`;
  linha.append(rotulo, el('span', 'lat', s.latenciaMs != null ? `${s.latenciaMs} ms` : '—'));
  li.append(linha);

  const detalhes = [];
  if (s.motivo) detalhes.push(s.motivo);
  for (const inc of s.incidentes || []) detalhes.push(`• ${inc}`);
  if (detalhes.length) {
    const ul = el('ul', 'detalhe');
    detalhes.forEach((d) => ul.append(el('li', '', d)));
    li.append(ul);
  }

  if (s.historico?.length > 1) {
    const h = el('div', 'hist');
    h.title = 'Últimas verificações (mais recente à direita)';
    s.historico.forEach((st) => h.append(el('span', st)));
    li.append(h);
  }
  return li;
}

function render(dados) {
  const resumo = document.getElementById('resumo');
  resumo.replaceChildren();
  const r = dados.resumo;
  if (!dados.atualizadoEm) {
    resumo.textContent = 'Primeira verificação em andamento… volte em instantes.';
  } else if (r.fora + r.instavel === 0 && r.desconhecido === 0) {
    resumo.textContent = '✅ Tudo operacional';
  } else {
    if (r.fora) resumo.append(el('span', 'pill', `🔴 ${r.fora} com possível queda`));
    if (r.instavel) resumo.append(el('span', 'pill', `🟠 ${r.instavel} instável(is)`));
    if (r.desconhecido) resumo.append(el('span', 'pill', `⚪ ${r.desconhecido} sem dados`));
    resumo.append(el('span', 'pill', `🟢 ${r.ok} ok`));
  }

  document.getElementById('aviso-conectividade').hidden = dados.conectividade !== 'suspeita';
  document.getElementById('atualizado').textContent = dados.atualizadoEm
    ? `Atualizado às ${new Date(dados.atualizadoEm).toLocaleTimeString('pt-BR')}`
    : '';

  const porGrupo = new Map();
  for (const s of dados.servicos) {
    if (!porGrupo.has(s.grupo)) porGrupo.set(s.grupo, []);
    porGrupo.get(s.grupo).push(s);
  }
  const nomes = [...porGrupo.keys()].sort((a, b) => {
    const ia = ORDEM_GRUPOS.indexOf(a), ib = ORDEM_GRUPOS.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  const raiz = document.getElementById('grupos');
  raiz.replaceChildren();
  for (const nome of nomes) {
    const bloco = el('section', 'grupo');
    bloco.append(el('h2', 'grupo-titulo', nome));
    const lista = el('div', 'lista');
    porGrupo.get(nome).forEach((s) => lista.append(renderServico(s)));
    bloco.append(lista);
    raiz.append(bloco);
  }
}

async function carregarStatus() {
  try {
    const res = await ixcFetch('/api/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    render(await res.json());
  } catch {
    document.getElementById('resumo').textContent = 'Não foi possível carregar o status agora.';
  }
}

carregarStatus();
setInterval(carregarStatus, 60 * 1000);
