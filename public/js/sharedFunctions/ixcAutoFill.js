/**
 * ixcAutoFill.js — Integração do IXC no Frontend do Helpdesk
 * Gerencia busca de contrato, diagnóstico óptico, preenchimento e desconexão PPPoE.
 */

// Calibração de sinal óptico RX solicitada
function classificarSinalRx(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return { texto: 'Sem Leitura', classe: 'sinal-indisp', icon: '⚪', detalhe: 'Não medido' };
  }

  let num = parseFloat(String(valor).replace(',', '.'));
  if (isNaN(num)) {
    return { texto: 'Inválido', classe: 'sinal-indisp', icon: '⚪', detalhe: valor };
  }

  // Garante sinal negativo caso venha sem o sinal de menos
  if (num > 0) num = -num;

  if (num >= -10) {
    return {
      num: num.toFixed(2),
      texto: 'Crítico (Saturado)',
      classe: 'sinal-critico',
      cor: '#ff4d4f',
      icon: '🔴',
      detalhe: 'Sinal muito forte / saturado',
    };
  } else if (num >= -22.99) {
    return {
      num: num.toFixed(2),
      texto: 'Sinal Bom',
      classe: 'sinal-bom',
      cor: '#52c41a',
      icon: '🟢',
      detalhe: 'Faixa ideal (-11 a -22 dBm)',
    };
  } else if (num >= -29.99) {
    return {
      num: num.toFixed(2),
      texto: 'Sinal Regular',
      classe: 'sinal-regular',
      cor: '#faad14',
      icon: '🟡',
      detalhe: 'Aceitável (-23 a -29 dBm)',
    };
  } else {
    return {
      num: num.toFixed(2),
      texto: 'Crítico (Atenuado)',
      classe: 'sinal-critico',
      cor: '#ff4d4f',
      icon: '🔴',
      detalhe: 'Atenuação crítica (<= -30 dBm)',
    };
  }
}

// Preenche um input com destaque visual de atualização
function preencherCampo(idOuNome, valor) {
  if (valor === undefined || valor === null || valor === '') return;
  const input = document.getElementById(idOuNome) || document.querySelector(`input[name="${idOuNome}"]`);
  if (input) {
    input.value = valor;
    input.classList.add('campo-ixc-preenchido');
    setTimeout(() => input.classList.remove('campo-ixc-preenchido'), 1500);
  }
}

/**
 * Busca dados do contrato no backend e preenche a interface
 */
async function buscarContrato(origem = 'padrao') {
  const inputId = document.getElementById('id_contrato') || document.querySelector('input[name="id_contrato"]');
  const id = inputId?.value?.trim();

  if (!id) {
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta('Informe o ID do contrato para buscar.', 'erro');
    } else {
      alert('Informe o ID do contrato.');
    }
    return;
  }

  const containerTelemetria = document.getElementById('ixc-telemetria');
  const feedbackEl = document.getElementById('ixc-feedback');

  if (feedbackEl) {
    feedbackEl.innerHTML = '<span style="color:#7eb8f7">⏳ Consultando dados no IXC...</span>';
  }

  try {
    const res = await fetch(`/api/ixc/contrato/${id}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Falha ao buscar contrato.');
    }

    if (feedbackEl) {
      feedbackEl.innerHTML = `<span style="color:#4caf50">✅ <strong>${data.cliente.nome || 'Cliente'}</strong> (Contrato #${data.contrato.id})</span>`;
    }

    // 1. Preenchimento de campos conforme a tela
    if (origem === 'mudanca-endereco') {
      preencherCampo('nome', data.cliente.nome);
      preencherCampo('contato', data.cliente.telefone);
      const endCompleto = [data.contrato.endereco, data.contrato.bairro, data.contrato.cidade].filter(Boolean).join(' - ');
      preencherCampo('enderecoAntigo', endCompleto);
    } else {
      // Sem Conexão e Conexão Lenta
      preencherCampo('loginpppoe', data.pppoe.login);
      preencherCampo('senhapppoe', data.pppoe.senha);
      preencherCampo('olt', data.fibra.olt);
      preencherCampo('pon', data.fibra.pon);
      const caixaTxt = data.fibra.caixa + (data.fibra.porta_caixa ? ` (Porta ${data.fibra.porta_caixa})` : '');
      preencherCampo('cxDesc', caixaTxt);
      preencherCampo('mac', data.fibra.mac);
    }

    // 2. Renderiza Card de Telemetria (Diagnóstico Óptico e Ação PPPoE)
    if (containerTelemetria) {
      const isOnline = data.pppoe.online;
      const statusHtml = isOnline
        ? '<span class="badge-tel badge-online">🟢 Conectado</span>'
        : '<span class="badge-tel badge-offline">🔴 Desconectado</span>';

      const sinal = classificarSinalRx(data.fibra.sinal_rx);
      const sinalHtml = sinal.num
        ? `<span class="badge-tel ${sinal.classe}" title="${sinal.detalhe}">${sinal.icon} Sinal RX: ${sinal.num} dBm (${sinal.texto})</span>`
        : `<span class="badge-tel sinal-indisp">⚪ Sinal RX Indisponível</span>`;

      const quedaHtml = data.fibra.causa_queda
        ? `<div class="tel-queda-linha">⚡ <strong>Última queda:</strong> ${data.fibra.causa_queda}</div>`
        : '';

      const btnKickHtml = data.pppoe.id_login
        ? `<button type="button" class="btn-kick-pppoe" onclick="executarDesconexaoPPPoE('${data.pppoe.id_login}', '${data.contrato.id}')" title="Força a desconexão da sessão no concentrador">⚡ Derrubar Conexão PPPoE</button>`
        : '';

      containerTelemetria.innerHTML = `
        <div class="ixc-telemetria-box">
          <div class="tel-top-row">
            <span class="tel-titulo">📡 Telemetria do Cliente</span>
            <div class="tel-badges">
              ${statusHtml}
              ${sinalHtml}
            </div>
          </div>
          ${quedaHtml}
          <div class="tel-actions-row">
            ${btnKickHtml}
          </div>
        </div>
      `;
      containerTelemetria.style.display = 'block';
    }

    // 3. Salva no Histórico de Contratos Recentes
    if (typeof salvarContratoRecente === 'function') {
      salvarContratoRecente({
        id: data.contrato.id,
        nome: data.cliente.nome,
        online: data.pppoe.online,
        sinal_rx: data.fibra.sinal_rx,
        caixa: data.fibra.caixa,
      });
    }

    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta('Dados do contrato carregados com sucesso!', 'sucesso');
    }
  } catch (err) {
    if (feedbackEl) {
      feedbackEl.innerHTML = `<span style="color:#ff5f5f">❌ ${err.message}</span>`;
    }
    if (containerTelemetria) {
      containerTelemetria.style.display = 'none';
    }
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta(err.message, 'erro');
    }
  }
}

/**
 * Dispara o comando de desconexão da sessão PPPoE
 */
async function executarDesconexaoPPPoE(idLogin, idContrato) {
  if (!confirm(`Deseja realmente derrubar a sessão PPPoE do contrato #${idContrato}?\nO roteador do cliente será forçado a rediscar.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/ixc/desconectar/${idLogin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idContrato }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Falha ao desconectar.');
    }

    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta('Sessão PPPoE derrubada com sucesso!', 'sucesso');
    } else {
      alert('Sessão PPPoE derrubada com sucesso!');
    }

    // Atualiza status visual para desconectado
    const badgeOnline = document.querySelector('.badge-tel.badge-online');
    if (badgeOnline) {
      badgeOnline.className = 'badge-tel badge-offline';
      badgeOnline.textContent = '🔴 Desconectado (Sessão reiniciada)';
    }
  } catch (err) {
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta(err.message, 'erro');
    } else {
      alert('Erro: ' + err.message);
    }
  }
}

// Injeção de estilos para os cards de telemetria
(function injetarEstilosTelemetria() {
  if (document.getElementById('ixc-telemetria-style')) return;
  const style = document.createElement('style');
  style.id = 'ixc-telemetria-style';
  style.textContent = `
    .ixc-telemetria-box {
      background: var(--bg-card, #1e222d);
      border: 1px solid var(--border-color, #2d3446);
      border-left: 4px solid #00b4d8;
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 10px;
      margin-bottom: 12px;
      animation: fadeIn .3s ease;
    }
    .tel-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tel-titulo {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tel-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .badge-tel {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .badge-online { background: rgba(82, 196, 26, 0.15); color: #52c41a; border: 1px solid #52c41a; }
    .badge-offline { background: rgba(255, 77, 79, 0.15); color: #ff4d4f; border: 1px solid #ff4d4f; }
    .sinal-bom { background: rgba(82, 196, 26, 0.15); color: #52c41a; border: 1px solid #52c41a; }
    .sinal-regular { background: rgba(250, 173, 20, 0.15); color: #faad14; border: 1px solid #faad14; }
    .sinal-critico { background: rgba(255, 77, 79, 0.15); color: #ff4d4f; border: 1px solid #ff4d4f; }
    .sinal-indisp { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid #94a3b8; }
    .tel-queda-linha {
      margin-top: 8px;
      font-size: 13px;
      color: #cbd5e1;
      background: rgba(0,0,0,0.2);
      padding: 6px 10px;
      border-radius: 4px;
      border-left: 3px solid #faad14;
    }
    .tel-actions-row {
      margin-top: 10px;
      display: flex;
      gap: 8px;
    }
    .btn-kick-pppoe {
      background: #dc2626;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s, transform .1s;
    }
    .btn-kick-pppoe:hover { background: #b91c1c; transform: translateY(-1px); }
    .campo-ixc-preenchido {
      background-color: rgba(82, 196, 26, 0.12) !important;
      border-color: #52c41a !important;
      transition: background-color 1s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();
