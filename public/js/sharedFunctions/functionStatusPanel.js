/**
 * functionStatusPanel.js — Aba "Status" na sidebar + notificações do navegador.
 * Consulta /api/status a cada 60s (em qualquer página que tenha #sidebar-panel) e avisa
 * quando um serviço piora (instável/queda) ou volta ao normal.
 * Carregar DEPOIS de functionCardHistory.js (envolve o openPanel dele).
 */
(function () {
  const sidebar = document.getElementById('sidebar-panel');
  if (!sidebar || typeof openPanel !== 'function') return;

  const INTERVALO_MS = 60 * 1000;
  const CHAVE_SNAPSHOT = 'status-snapshot'; // compartilhado entre abas: evita notificar em duplicidade
  const ROTULOS = { ok: 'Operacional', instavel: 'Instável', fora: 'Possível queda', desconhecido: 'Sem dados' };
  const ICONES = { ok: '🟢', instavel: '🟠', fora: '🔴', desconhecido: '⚪' };
  const PESO = { ok: 0, desconhecido: 0, instavel: 1, fora: 2 };

  let dados = null;
  let semLogin = false;
  let falhou = false;

  // ---------- Estilo (injetado aqui para não exigir <link> em todas as páginas) ----------
  const estilo = document.createElement('style');
  estilo.textContent = `
    .panel-tab-btn.status-tab { position: relative; }
    .status-badge { position: absolute; top: -6px; right: -6px; min-width: 15px; height: 15px; padding: 0 3px;
      border-radius: 8px; background: #dc2626; color: #fff; font-size: 0.6rem; font-weight: 700;
      display: none; align-items: center; justify-content: center; }
    .status-badge.show { display: flex; }
    .status-badge.instavel { background: #d97706; }
    .st-notif { font-size: 0.72rem; color: #94a3b8; margin-bottom: 10px; }
    .st-btn { background: rgba(74,158,255,0.15); border: 1px solid #4a9eff; color: #93c5fd; border-radius: 6px;
      padding: 5px 10px; font-size: 0.75rem; cursor: pointer; font-family: inherit; }
    .st-btn:hover { background: rgba(74,158,255,0.3); }
    .st-linha { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #1e2a3a;
      font-size: 0.78rem; color: #c8d8f0; }
    .st-linha .st-nome { flex: 1; }
    .st-linha .st-rot { font-size: 0.7rem; color: #94a3b8; }
    .st-linha.problema .st-nome { font-weight: 700; }
    .st-motivo { font-size: 0.7rem; color: #94a3b8; padding: 0 0 6px 24px; }
    .st-rodape { margin-top: 10px; font-size: 0.7rem; color: #64748b; }
    .st-rodape a { color: #4a9eff; }
    .st-vazio { font-size: 0.78rem; color: #94a3b8; }
  `;
  document.head.appendChild(estilo);

  // ---------- Aba + módulo ----------
  const panelTabs = sidebar.querySelector('.panel-tabs');
  const historyContent = sidebar.querySelector('.history-content');
  if (!panelTabs || !historyContent) return;

  const btn = document.createElement('button');
  btn.className = 'panel-tab-btn status-tab';
  btn.title = 'Status dos serviços';
  btn.setAttribute('aria-label', 'Abrir Status dos serviços');
  btn.setAttribute('onclick', "openPanel('status')");
  btn.textContent = '📶';
  const badge = document.createElement('span');
  badge.className = 'status-badge';
  btn.appendChild(badge);
  panelTabs.appendChild(btn);

  const modulo = document.createElement('div');
  modulo.id = 'status-module';
  modulo.style.display = 'none';
  historyContent.appendChild(modulo);

  // Envolve o openPanel: o original esconde os módulos que conhece; aqui mostramos o nosso
  const abrirOriginal = openPanel;
  window.openPanel = function (nome) {
    abrirOriginal(nome);
    const aberto = nome === 'status' && !sidebar.classList.contains('minimized');
    modulo.style.display = aberto ? 'block' : 'none';
    if (nome === 'status') {
      const titulo = document.getElementById('panel-title');
      if (titulo) titulo.textContent = '📶 Status';
      render();
    }
  };

  // ---------- Dados ----------
  function headersAuth() {
    const h = {};
    try {
      const op = localStorage.getItem('op-token');
      const n2 = localStorage.getItem('n2-token');
      if (op) h['x-op-token'] = op;
      if (n2) h['x-n2-token'] = n2;
    } catch { /* localStorage indisponível */ }
    return h;
  }

  async function buscar() {
    const h = headersAuth();
    if (!h['x-op-token'] && !h['x-n2-token']) { semLogin = true; render(); return; }
    try {
      const res = await fetch('/api/status', { headers: h });
      if (res.status === 401) {
        semLogin = true;
        try { localStorage.removeItem('op-token'); } catch { /* ignora */ }
      } else if (res.ok) {
        semLogin = false;
        falhou = false;
        dados = await res.json();
        notificarMudancas(detectarMudancas(dados));
      } else {
        falhou = true;
      }
    } catch {
      falhou = true;
    }
    render();
  }

  async function entrar() {
    const senha = window.prompt('Senha de operador:');
    if (!senha) return;
    try {
      const r = await fetch('/api/auth/operador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.erro || 'Falha no login.');
      localStorage.setItem('op-token', d.token);
      buscar();
    } catch (err) {
      window.alert(err.message || 'Falha no login.');
    }
  }

  // ---------- Detecção de mudanças e notificação ----------
  // Compara com o último snapshot (guardado em localStorage, logo vale para todas as abas abertas)
  function detectarMudancas(d) {
    if (!d.atualizadoEm || d.conectividade === 'suspeita') return []; // sem dados confiáveis: não mexe no snapshot
    let anterior = null;
    try { anterior = JSON.parse(localStorage.getItem(CHAVE_SNAPSHOT) || 'null'); } catch { /* ignora */ }
    const atual = {};
    d.servicos.forEach((s) => { atual[s.id] = s.status; });
    try { localStorage.setItem(CHAVE_SNAPSHOT, JSON.stringify(atual)); } catch { /* ignora */ }
    if (!anterior) return []; // primeira leitura: só registra a linha de base

    const mudancas = [];
    for (const s of d.servicos) {
      const antes = anterior[s.id] === 'desconhecido' ? 'ok' : anterior[s.id];
      if (!antes || antes === s.status || s.status === 'desconhecido') continue;
      if (PESO[s.status] > PESO[antes]) mudancas.push({ tipo: 'piorou', s });
      else if (s.status === 'ok') mudancas.push({ tipo: 'voltou', s });
    }
    return mudancas;
  }

  function notificarMudancas(mudancas) {
    if (!mudancas.length) return;
    const piorou = mudancas.filter((m) => m.tipo === 'piorou');
    const voltou = mudancas.filter((m) => m.tipo === 'voltou');
    const linhas = [
      ...piorou.map((m) => `${ICONES[m.s.status]} ${m.s.nome}: ${ROTULOS[m.s.status]}`),
      ...voltou.map((m) => `🟢 ${m.s.nome} voltou ao normal`),
    ];
    let titulo;
    if (piorou.length === 1 && !voltou.length) titulo = `${piorou[0].s.nome}: ${ROTULOS[piorou[0].s.status]}`;
    else if (piorou.length) titulo = `${piorou.length} serviço(s) com problema`;
    else titulo = voltou.length === 1 ? `${voltou[0].s.nome} voltou ao normal` : `${voltou.length} serviços normalizados`;

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`${piorou.length ? '⚠️' : '✅'} ${titulo}`, {
          body: linhas.join('\n'),
          tag: 'helpdesk-status', // várias mudanças substituem a anterior em vez de empilhar
          icon: '/images/LogoCedNet.ico',
        });
      } catch { /* alguns navegadores móveis só permitem via service worker */ }
    } else if (piorou.length && document.getElementById('toast') && typeof mostrarAlerta === 'function') {
      mostrarAlerta(`${titulo} — veja a aba 📶 Status`);
    }
  }

  // ---------- Render ----------
  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function renderBadge() {
    const r = dados?.resumo;
    const total = r ? r.fora + r.instavel : 0;
    badge.textContent = String(total);
    badge.classList.toggle('show', total > 0);
    badge.classList.toggle('instavel', total > 0 && r.fora === 0);
  }

  function renderNotificacoes() {
    const bloco = el('div', 'st-notif');
    if (!('Notification' in window)) {
      bloco.textContent = 'Este navegador não suporta notificações.';
    } else if (Notification.permission === 'granted') {
      bloco.textContent = '🔔 Notificações ativas';
    } else if (Notification.permission === 'denied') {
      bloco.textContent = '🔕 Notificações bloqueadas — libere nas configurações do site.';
    } else {
      const b = el('button', 'st-btn', '🔔 Ativar notificações');
      b.addEventListener('click', async () => { await Notification.requestPermission(); render(); });
      bloco.append(b);
    }
    return bloco;
  }

  function render() {
    renderBadge();
    if (modulo.style.display === 'none') return; // só desenha com o painel aberto

    modulo.replaceChildren(renderNotificacoes());
    if (semLogin) {
      modulo.append(el('p', 'st-vazio', 'Faça login de operador para ver o status.'));
      const b = el('button', 'st-btn', 'Entrar');
      b.addEventListener('click', entrar);
      modulo.append(b);
      return;
    }
    if (!dados) {
      modulo.append(el('p', 'st-vazio', falhou ? 'Não foi possível carregar o status.' : 'Carregando…'));
      return;
    }
    if (!dados.atualizadoEm) {
      modulo.append(el('p', 'st-vazio', 'Primeira verificação em andamento…'));
      return;
    }
    if (dados.conectividade === 'suspeita') {
      modulo.append(el('p', 'st-vazio', '⚠️ Servidor sem conectividade externa — resultados não confiáveis.'));
    }

    const ordenados = [...dados.servicos].sort((a, b) => (PESO[b.status] - PESO[a.status]) || a.nome.localeCompare(b.nome, 'pt-BR'));
    for (const s of ordenados) {
      const problema = PESO[s.status] > 0;
      const linha = el('div', `st-linha${problema ? ' problema' : ''}`);
      linha.append(el('span', '', ICONES[s.status]), el('span', 'st-nome', s.nome), el('span', 'st-rot', ROTULOS[s.status]));
      modulo.append(linha);
      if (problema && (s.motivo || s.incidentes?.length)) {
        modulo.append(el('div', 'st-motivo', [s.motivo, ...(s.incidentes || [])].filter(Boolean).join(' · ')));
      }
    }
    const rodape = el('div', 'st-rodape', `Atualizado às ${new Date(dados.atualizadoEm).toLocaleTimeString('pt-BR')} · `);
    const link = el('a', '', 'ver detalhes');
    link.href = '/status';
    rodape.append(link);
    modulo.append(rodape);
  }

  buscar();
  setInterval(buscar, INTERVALO_MS);
})();
