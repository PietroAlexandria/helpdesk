/**
 * consultaPPPoE.js — Consulta da sessão PPPoE no concentrador (GET /api/pppoe/:login)
 *
 * Uso no HTML:
 *   <div class="pppoe-consulta" data-destino="loginpppoe"
 *        data-status-radio="pppoe-radio" data-valor-on="pppoeOn-radio" data-valor-off="pppoeOff-radio"></div>
 *
 * - data-destino: id do campo "Login PPPoE" lá embaixo; o login digitado aqui é copiado para ele.
 * - data-status-radio / data-valor-on / data-valor-off (opcionais): marca ONLINE/OFFLINE conforme o resultado.
 *
 * Acesso: exige a senha da consulta PPPoE (SENHA_PPPOE) ou sessão N2. O token fica no localStorage.
 */
(function () {
  const CHAVE_TOKEN = 'pppoe-token';
  const LOGIN_VALIDO = /^[A-Za-z0-9._@-]{1,64}$/;

  function lerStorage(chave) {
    try { return localStorage.getItem(chave); } catch { return null; }
  }
  function gravarStorage(chave, valor) {
    try {
      if (valor) localStorage.setItem(chave, valor);
      else localStorage.removeItem(chave);
    } catch { /* localStorage indisponível */ }
  }

  function headersAuth() {
    const h = {};
    const t = lerStorage(CHAVE_TOKEN);
    const n2 = lerStorage('n2-token');
    if (t) h['x-pppoe-token'] = t;
    if (n2) h['x-n2-token'] = n2;
    return h;
  }

  // Cria elemento com classe e texto (sempre textContent: nada vindo da API vira HTML)
  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined && texto !== null) e.textContent = texto;
    return e;
  }

  // "432:23:47" (h:m:s) -> "18d 0h 23m"
  function formatarTempo(seg) {
    if (!Number.isFinite(seg)) return null;
    const d = Math.floor(seg / 86400);
    const h = Math.floor((seg % 86400) / 3600);
    const m = Math.floor((seg % 3600) / 60);
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
  }

  function kbpsParaTexto(kbps) {
    if (!Number.isFinite(kbps)) return '—';
    return kbps >= 1000 ? `${(kbps / 1000).toFixed(1).replace('.', ',')} Mbps` : `${kbps} Kbps`;
  }

  function gbParaTexto(gb) {
    if (!Number.isFinite(gb)) return '—';
    return `${gb.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} GB`;
  }

  // Resumo em texto para colar na OS
  function resumoTexto(r) {
    if (!r.online) return `PPPoE ${r.login}: OFFLINE no concentrador${r.mensagem ? ` (${r.mensagem})` : ''}.`;
    const partes = [`PPPoE ${r.login}: ONLINE`];
    const tempo = formatarTempo(r.tempoOnlineSeg);
    if (tempo) partes.push(`há ${tempo}${r.inicio ? ` (desde ${r.inicio})` : ''}`);
    if (r.ip) partes.push(`IP ${r.ip}`);
    if (r.mac) partes.push(`MAC ${r.mac}`);
    if (r.plano) partes.push(`Plano ${r.plano}`);
    if (r.consumoAgoraKbps) {
      partes.push(`Consumo agora ↓${kbpsParaTexto(r.consumoAgoraKbps.download)} ↑${kbpsParaTexto(r.consumoAgoraKbps.upload)}`);
    }
    return partes.join(' | ');
  }

  function marcarRadio(box, online) {
    const nome = box.dataset.statusRadio;
    if (!nome) return;
    const valor = online ? box.dataset.valorOn : box.dataset.valorOff;
    const input = document.querySelector(`input[name="${CSS.escape(nome)}"][value="${CSS.escape(valor || '')}"]`);
    if (input && !input.checked) {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function linha(grid, rotulo, valor, destaque) {
    if (valor === undefined || valor === null || valor === '') return;
    grid.appendChild(el('span', 'pppoe-k', rotulo));
    grid.appendChild(el('span', destaque ? 'pppoe-v pppoe-v-destaque' : 'pppoe-v', valor));
  }

  function renderResultado(box, r) {
    const area = box.querySelector('.pppoe-resultado');
    area.replaceChildren();

    const topo = el('div', 'pppoe-topo');
    topo.appendChild(el('span', r.online ? 'pppoe-badge pppoe-on' : 'pppoe-badge pppoe-off', r.online ? '● ONLINE' : '● OFFLINE'));
    topo.appendChild(el('span', 'pppoe-login', r.login));
    const btnCopiar = el('button', 'pppoe-btn-mini', '📋 Copiar resumo');
    btnCopiar.type = 'button';
    btnCopiar.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(resumoTexto(r));
        btnCopiar.textContent = '✅ Copiado';
      } catch {
        btnCopiar.textContent = 'Falhou ao copiar';
      }
      setTimeout(() => { btnCopiar.textContent = '📋 Copiar resumo'; }, 1500);
    });
    topo.appendChild(btnCopiar);
    area.appendChild(topo);

    if (!r.online) {
      area.appendChild(el('p', 'pppoe-msg', r.mensagem
        ? `Concentrador: ${r.mensagem}`
        : 'Login sem sessão ativa no concentrador.'));
      return;
    }

    const grid = el('div', 'pppoe-grid');
    const tempo = formatarTempo(r.tempoOnlineSeg);
    linha(grid, 'Online há', tempo ? `${tempo}${r.inicio ? ` (desde ${r.inicio})` : ''}` : r.tempoOnline, true);
    linha(grid, 'IP', r.ip, true);
    linha(grid, 'MAC', r.mac);
    if (r.velocidadeMbps) {
      linha(grid, 'Plano', `${r.plano || ''} (↓${r.velocidadeMbps.download} / ↑${r.velocidadeMbps.upload} Mbps)`.trim(), true);
    } else {
      linha(grid, 'Plano', r.plano, true);
    }
    if (r.consumoAgoraKbps) {
      linha(grid, 'Consumo agora', `↓ ${kbpsParaTexto(r.consumoAgoraKbps.download)}   ↑ ${kbpsParaTexto(r.consumoAgoraKbps.upload)}`);
    }
    if (r.trafegoSessaoGB) {
      linha(grid, 'Tráfego na sessão', `↓ ${gbParaTexto(r.trafegoSessaoGB.download)}   ↑ ${gbParaTexto(r.trafegoSessaoGB.upload)}`);
    }
    linha(grid, 'Gateway', r.gateway);
    if (Array.isArray(r.dns) && r.dns.length) linha(grid, 'DNS', r.dns.join(', '));
    if (r.ipv6 && (r.ipv6.prefixoPD || r.ipv6.prefixoNDRA)) {
      linha(grid, 'IPv6', [r.ipv6.prefixoPD, r.ipv6.prefixoNDRA].filter(Boolean).join('  ·  '));
    }
    const iface = [r.interface, r.interfaceFisica && `(${r.interfaceFisica})`].filter(Boolean).join(' ');
    linha(grid, 'Interface', iface);
    linha(grid, 'VLAN', r.vlan);
    linha(grid, 'MTU', r.mtu);
    linha(grid, 'Domínio', r.dominio);
    area.appendChild(grid);
  }

  function feedback(box, texto, tipo) {
    const f = box.querySelector('.pppoe-feedback');
    f.textContent = texto || '';
    f.className = `pppoe-feedback${tipo ? ` pppoe-feedback-${tipo}` : ''}`;
  }

  // Mostra o campo de senha da consulta (só aparece quando o servidor pede autenticação)
  function pedirAcesso(box, aoLiberar) {
    const area = box.querySelector('.pppoe-resultado');
    area.replaceChildren();
    const wrap = el('div', 'pppoe-acesso');
    wrap.appendChild(el('p', 'pppoe-msg', '🔒 A consulta PPPoE é restrita. Informe a senha de acesso:'));
    const linhaAcesso = el('div', 'pppoe-linha');
    const senha = el('input');
    senha.type = 'password';
    senha.placeholder = 'Senha da consulta PPPoE';
    senha.autocomplete = 'off';
    const btn = el('button', 'btn-copy', 'Liberar');
    btn.type = 'button';
    linhaAcesso.append(senha, btn);
    wrap.appendChild(linhaAcesso);
    area.appendChild(wrap);
    senha.focus();

    async function enviar() {
      if (!senha.value) return;
      btn.disabled = true;
      try {
        const r = await fetch('/api/auth/pppoe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senha: senha.value }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          feedback(box, data.erro || 'Falha ao liberar o acesso.', 'erro');
          senha.select();
          return;
        }
        gravarStorage(CHAVE_TOKEN, data.token);
        area.replaceChildren();
        feedback(box, '');
        aoLiberar();
      } catch {
        feedback(box, 'Sem resposta do servidor.', 'erro');
      } finally {
        btn.disabled = false;
      }
    }
    btn.addEventListener('click', enviar);
    senha.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); enviar(); } });
  }

  async function consultar(box) {
    const input = box.querySelector('.pppoe-input');
    const botao = box.querySelector('.pppoe-btn');
    const login = input.value.trim();
    if (!login) {
      feedback(box, 'Digite o login PPPoE.', 'erro');
      input.focus();
      return;
    }
    if (!LOGIN_VALIDO.test(login)) {
      feedback(box, 'Login inválido: use só letras, números e . _ @ -', 'erro');
      return;
    }
    if (box.dataset.consultando === '1') return;

    box.dataset.consultando = '1';
    botao.disabled = true;
    botao.textContent = '⏳ Consultando...';
    feedback(box, 'Consultando o concentrador...', 'info');

    try {
      const res = await fetch(`/api/pppoe/${encodeURIComponent(login)}`, { headers: headersAuth() });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        gravarStorage(CHAVE_TOKEN, null);
        feedback(box, '');
        pedirAcesso(box, () => consultar(box));
        return;
      }
      if (!res.ok) {
        feedback(box, data.erro || `Erro ${res.status} na consulta.`, 'erro');
        return;
      }
      feedback(box, `Consultado às ${new Date().toLocaleTimeString('pt-BR')}`, 'ok');
      renderResultado(box, data);
      marcarRadio(box, data.online);
    } catch {
      feedback(box, 'Sem resposta do servidor.', 'erro');
    } finally {
      box.dataset.consultando = '';
      botao.disabled = false;
      botao.textContent = '🔍 Consultar';
    }
  }

  function montar(box) {
    const destino = box.dataset.destino ? document.getElementById(box.dataset.destino) : null;

    box.appendChild(el('label', null, 'Consulta PPPoE (concentrador)'));
    const linhaBusca = el('div', 'pppoe-linha');
    const input = el('input', 'pppoe-input');
    input.type = 'text';
    input.placeholder = 'Login PPPoE — Ex: 123Pietro';
    input.autocomplete = 'off';
    input.spellcheck = false;
    const botao = el('button', 'btn-copy pppoe-btn', '🔍 Consultar');
    botao.type = 'button';
    linhaBusca.append(input, botao);
    box.appendChild(linhaBusca);
    box.appendChild(el('div', 'pppoe-feedback'));
    box.appendChild(el('div', 'pppoe-resultado'));

    // Login digitado aqui vai para o campo "Login PPPoE" do agendamento
    input.addEventListener('input', () => {
      if (!destino) return;
      destino.value = input.value.trim();
      destino.dispatchEvent(new Event('input', { bubbles: true }));
    });
    // Se o campo de baixo já estiver preenchido, traz para cá
    input.addEventListener('focus', () => {
      if (destino && !input.value && destino.value) input.value = destino.value;
    });

    // Só consulta ao clicar no botão (Enter e colar não disparam a consulta)
    botao.addEventListener('click', () => consultar(box));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });
  }

  function iniciar() {
    document.querySelectorAll('.pppoe-consulta').forEach(montar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
