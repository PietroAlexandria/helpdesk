let painelAtivo = null;

function openPanel(modulo) {
    const container = document.getElementById('sidebar-panel');
    if (!container) return;

    if (painelAtivo === modulo && !container.classList.contains('minimized')) {
        closePanel();
        return;
    }

    painelAtivo = modulo;
    container.classList.remove('minimized');
    localStorage.setItem('painel-ativo', modulo);

    const historyModule = document.getElementById('history-module');
    const notepadModule = document.getElementById('notepad-module');
    const templatesModule = document.getElementById('templates-module');
    const contratosModule = document.getElementById('contratos-module');
    if (contratosModule) contratosModule.style.display = modulo === 'contratos' ? 'block' : 'none';
    if (historyModule)   historyModule.style.display   = modulo === 'historico' ? 'block' : 'none';
    if (notepadModule)   notepadModule.style.display   = modulo === 'notepad'   ? 'block' : 'none';
    if (templatesModule) templatesModule.style.display = modulo === 'templates' ? 'flex'  : 'none';

    const titulos = { historico: '📋 Histórico', notepad: '📝 Notepad', templates: '💬 Templates', contratos: '🔍 Contratos' };
    const panelTitle = document.getElementById('panel-title');
    if (panelTitle) panelTitle.textContent = titulos[modulo] || modulo;

    const btnLimpar = document.getElementById('btn-limpar-historico');
    if (btnLimpar) btnLimpar.style.display = modulo === 'historico' ? 'inline-block' : 'none';
    const btnLimparContratos = document.getElementById('btn-limpar-contratos');
    if (btnLimparContratos) btnLimparContratos.style.display = modulo === 'contratos' ? 'inline-block' : 'none';

    const btnCopiarNotepad = document.getElementById('btn-copiar-notepad');
    const btnLimparNotepad = document.getElementById('btn-limpar-notepad');
    if (btnCopiarNotepad) btnCopiarNotepad.style.display = modulo === 'notepad' ? 'inline-block' : 'none';
    if (btnLimparNotepad) btnLimparNotepad.style.display = modulo === 'notepad' ? 'inline-block' : 'none';

    if (modulo === 'historico') renderizarHistorico();
    if (modulo === 'contratos') renderizarContratosRecentes();
    if (modulo === 'templates' && typeof renderizarTemplatesSidebar === 'function') {
        renderizarTemplatesSidebar();
    }
}

function closePanel() {
    const container = document.getElementById('sidebar-panel') || document.querySelector('.history-container');
    if (!container) return;
    container.classList.add('minimized');
    localStorage.setItem('painel-ativo', '0');
    painelAtivo = null;
}

function togglePainelHistorico() {
    const container = document.querySelector('.history-container');
    if (!container) return;
    const minimizado = container.classList.toggle('minimized');
    localStorage.setItem('historico-minimizado', minimizado ? '1' : '0');
}

function salvarHistorico(texto, titulo = 'Registro') {
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    const nome = (document.getElementById('nome') || document.querySelector('input[name="nome"]'))?.value.trim() || 'Cliente';
    historico.push({
        id: Date.now(),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('pt-BR'),
        nome,
        titulo,
        texto
    });
    localStorage.setItem('historico', JSON.stringify(historico));
    renderizarHistorico();
}

function removerHistorico(id) {
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    localStorage.setItem('historico', JSON.stringify(historico.filter(item => item.id !== id)));
    renderizarHistorico();
}

function limparHistorico() {
    if (!confirm('Limpar todo o histórico?')) return;
    localStorage.removeItem('historico');
    renderizarHistorico();
}

function copiarNotepad() {
    const texto = document.getElementById('notepad-textarea')?.value || '';
    navigator.clipboard.writeText(texto)
        .then(() => mostrarAlerta('Anotações copiadas!', 'sucesso'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function limparNotepad() {
    if (!confirm('Limpar todas as anotações?')) return;
    const el = document.getElementById('notepad-textarea');
    if (el) el.value = '';
    localStorage.removeItem('notepad-conteudo');
}

function toggleHistoricoCard(header) {
    const body = header.nextElementSibling;
    const arrow = header.querySelector('.history-arrow');
    const aberto = body.style.display !== 'none';
    body.style.display = aberto ? 'none' : 'block';
    arrow.style.transform = aberto ? '' : 'rotate(180deg)';

    if (!aberto) {
        redimensionarTextarea(body.querySelector('.history-text'));
    }
}

function redimensionarTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function renderizarHistorico() {
    const painel = document.getElementById('history-panel');
    if (!painel) return;
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');

    if (historico.length === 0) {
        painel.innerHTML = '<div class="history-empty">📭 Nenhum registro ainda</div>';
        return;
    }

    painel.innerHTML = historico.map(item => `
        <div class="history-card">
            <div class="history-card-header" onclick="toggleHistoricoCard(this)">
                <div class="history-card-title">
                    <span class="history-title">${escapeHtml(item.titulo)}</span>
                    <span class="history-time">📅 ${escapeHtml(item.date || '')} | 🕐 ${escapeHtml(item.hora)}</span>
                    <hr class="history-sep">
                    <span class="history-time">${escapeHtml(item.nome)}</span>
                </div>
                <div class="history-card-actions">
                    <span class="history-arrow" aria-hidden="true">▼</span>
                    <div id="history-view-actions-${item.id}" style="display:flex;align-items:center;gap:6px">
                        <button class="history-copy" title="Copiar registro" aria-label="Copiar registro" onclick="event.stopPropagation(); copiarDoHistorico(${item.id})">📋</button>
                        <button class="history-copy" title="Editar registro" aria-label="Editar registro" onclick="event.stopPropagation(); editarHistorico(${item.id})">✏️</button>
                        <button class="history-remove" title="Remover registro" aria-label="Remover registro" onclick="event.stopPropagation(); removerHistorico(${item.id})">✕</button>
                    </div>
                    <div id="history-edit-actions-${item.id}" style="display:none;align-items:center;gap:6px">
                        <button class="history-copy" title="Salvar alterações" aria-label="Salvar alterações" onclick="event.stopPropagation(); salvarEdicaoHistorico(${item.id})">💾</button>
                        <button class="history-remove" title="Cancelar edição" aria-label="Cancelar edição" onclick="event.stopPropagation(); cancelarEdicaoHistorico(${item.id})">✕</button>
                    </div>
                </div>
            </div>
            <div class="history-body" style="display:none">
                <textarea class="history-text" id="history-text-${item.id}" aria-label="Texto do registro" readonly>${escapeHtml(item.texto)}</textarea>
            </div>
        </div>
    `).join('');
}

function copiarDoHistorico(id) {
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    const item = historico.find(h => h.id === id);
    if (!item) return;
    navigator.clipboard.writeText(item.texto)
        .then(() => mostrarAlerta('Copiado!', 'sucesso'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function editarHistorico(id) {
    const textarea = document.getElementById(`history-text-${id}`);
    const viewActions = document.getElementById(`history-view-actions-${id}`);
    const editActions = document.getElementById(`history-edit-actions-${id}`);

    textarea.readOnly = false;
    textarea.classList.add('editing');
    redimensionarTextarea(textarea);
    textarea.focus();
    viewActions.style.display = 'none';
    editActions.style.display = 'flex';
}

function salvarEdicaoHistorico(id) {
    const textarea = document.getElementById(`history-text-${id}`);
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    const item = historico.find(h => h.id === id);

    if (item) {
        item.texto = textarea.value;
        localStorage.setItem('historico', JSON.stringify(historico));
        mostrarAlerta('Alterações salvas!', 'sucesso');
    }

    finalizarEdicaoHistorico(id, textarea.value);
}

function cancelarEdicaoHistorico(id) {
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    const item = historico.find(h => h.id === id);
    finalizarEdicaoHistorico(id, item ? item.texto : '');
}

function finalizarEdicaoHistorico(id, texto) {
    const textarea = document.getElementById(`history-text-${id}`);
    const viewActions = document.getElementById(`history-view-actions-${id}`);
    const editActions = document.getElementById(`history-edit-actions-${id}`);

    textarea.value = texto;
    textarea.readOnly = true;
    textarea.classList.remove('editing');
    textarea.style.height = 'auto';
    redimensionarTextarea(textarea);
    editActions.style.display = 'none';
    viewActions.style.display = 'flex';
}

const historyPanel = document.getElementById('history-panel');
if (historyPanel) {
    historyPanel.addEventListener('input', (e) => {
        if (e.target.classList.contains('history-text')) {
            redimensionarTextarea(e.target);
        }
    });
}


function salvarContratoRecente(dados) {
    if (!dados || !dados.id) return;
    let lista = JSON.parse(localStorage.getItem('ixc_contratos_recentes') || '[]');
    lista = lista.filter(c => String(c.id) !== String(dados.id));
    lista.unshift({
        id: dados.id,
        nome: dados.nome || 'Cliente',
        online: dados.online,
        sinal_rx: dados.sinal_rx,
        caixa: dados.caixa || '',
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        data: new Date().toLocaleDateString('pt-BR')
    });
    if (lista.length > 10) lista = lista.slice(0, 10);
    localStorage.setItem('ixc_contratos_recentes', JSON.stringify(lista));
    if (typeof painelAtivo !== 'undefined' && painelAtivo === 'contratos') {
        renderizarContratosRecentes();
    }
}

function limparContratosRecentes() {
    if (!confirm('Deseja limpar o histórico de contratos recentes?')) return;
    localStorage.removeItem('ixc_contratos_recentes');
    renderizarContratosRecentes();
}

function carregarContratoDoHistorico(id) {
    const inputId = document.getElementById('id_contrato') || document.querySelector('input[name="id_contrato"]');
    if (inputId) {
        inputId.value = id;
        if (typeof buscarContrato === 'function') {
            buscarContrato();
        }
    }
}

function renderizarContratosRecentes() {
    const container = document.getElementById('contratos-panel');
    if (!container) return;
    const lista = JSON.parse(localStorage.getItem('ixc_contratos_recentes') || '[]');
    if (lista.length === 0) {
        container.innerHTML = '<p class="history-empty">Nenhum contrato consultado ainda.</p>';
        return;
    }
    container.innerHTML = lista.map(c => `
        <div class="history-item" onclick="carregarContratoDoHistorico('${c.id}')" style="cursor:pointer" title="Clique para carregar este contrato">
            <div class="history-item-header">
                <strong>Contrato #${c.id}</strong>
                <span class="history-time">${c.hora || ''}</span>
            </div>
            <div style="font-size: 13px; margin: 4px 0; color: #cbd5e1; font-weight: 500;">${c.nome}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-top:6px;">
                <span style="font-weight:600; color:${c.online ? '#52c41a' : '#ff4d4f'}">${c.online ? '🟢 Conectado' : '🔴 Desconectado'}</span>
                ${c.sinal_rx ? `<span style="color:#7eb8f7; background:rgba(126,184,247,0.1); padding:2px 6px; border-radius:4px;">📶 ${c.sinal_rx} dBm</span>` : ''}
            </div>
        </div>
    `).join('');
}

(function () {
    // Garante que todas as páginas com #sidebar-panel tenham a aba de Templates caso functionButtonsCopy esteja carregado
    const sidebarPanel = document.getElementById('sidebar-panel');
    if (sidebarPanel && typeof copyMudancaEnderecoCompleta === 'function') {
        const panelTabs = sidebarPanel.querySelector('.panel-tabs');
        const historyContent = sidebarPanel.querySelector('.history-content');

        if (panelTabs && !panelTabs.querySelector('[onclick*="templates"]')) {
            const btn = document.createElement('button');
            btn.className = 'panel-tab-btn';
            btn.title = 'Templates';
            btn.setAttribute('aria-label', 'Abrir Templates');
            btn.setAttribute('onclick', "openPanel('templates')");
            btn.textContent = '💬';
            panelTabs.appendChild(btn);
        }

        if (historyContent && !document.getElementById('templates-module')) {
            const tplDiv = document.createElement('div');
            tplDiv.id = 'templates-module';
            tplDiv.style.display = 'none';
            historyContent.appendChild(tplDiv);
        }

        if (typeof renderizarTemplatesSidebar === 'function') {
            renderizarTemplatesSidebar();
        }
    }

    // Notepad: restaura conteúdo salvo
    const notepadEl = document.getElementById('notepad-textarea');
    if (notepadEl) {
        notepadEl.value = localStorage.getItem('notepad-conteudo') || '';
        notepadEl.addEventListener('input', (e) => {
            localStorage.setItem('notepad-conteudo', e.target.value);
        });
    }

    
        // Injeta aba de Contratos Recentes se existir sidebar-panel
        const panelTabs = sidebarPanel.querySelector('.panel-tabs');
        const historyContent = sidebarPanel.querySelector('.history-content');
        if (panelTabs && !panelTabs.querySelector('[onclick*="contratos"]')) {
            const btn = document.createElement('button');
            btn.className = 'panel-tab-btn';
            btn.title = 'Contratos Recentes';
            btn.setAttribute('aria-label', 'Abrir Contratos Recentes');
            btn.setAttribute('onclick', "openPanel('contratos')");
            btn.textContent = '🔍';
            panelTabs.appendChild(btn);
        }

        if (historyContent && !document.getElementById('contratos-module')) {
            const cDiv = document.createElement('div');
            cDiv.id = 'contratos-module';
            cDiv.style.display = 'none';
            cDiv.innerHTML = '<div id="contratos-panel"></div>';
            historyContent.appendChild(cDiv);
        }

        const historyHeaderRight = sidebarPanel.querySelector('.history-header > div');
        if (historyHeaderRight && !document.getElementById('btn-limpar-contratos')) {
            const btnL = document.createElement('button');
            btnL.id = 'btn-limpar-contratos';
            btnL.style.display = 'none';
            btnL.textContent = 'Limpar contratos';
            btnL.setAttribute('onclick', 'limparContratosRecentes()');
            historyHeaderRight.appendChild(btnL);
        }

    if (sidebarPanel) return;

    // Painel simples (outros módulos legados)
    if (localStorage.getItem('historico-minimizado') === '1') {
        const container = document.querySelector('.history-container');
        if (container) container.classList.add('minimized');
    }

    renderizarHistorico();
})();
