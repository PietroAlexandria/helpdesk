function togglePainelHistorico() {
    const container = document.querySelector('.history-container');
    const minimizado = container.classList.toggle('minimized');
    localStorage.setItem('historico-minimizado', minimizado ? '1' : '0');
}

function salvarHistorico(texto, titulo = 'Registro') {
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    const nome = (document.getElementById('nome') || document.querySelector('input[name="nome"]'))?.value.trim() || 'Cliente';
    historico.push({
        id: Date.now(),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
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
                    <span class="history-time">🕐 ${escapeHtml(item.hora)} - ${escapeHtml(item.nome)}</span>
                </div>
                <div class="history-card-actions">
                    <span class="history-arrow">▼</span>
                    <div id="history-view-actions-${item.id}" style="display:flex;align-items:center;gap:6px">
                        <button class="history-copy" onclick="event.stopPropagation(); copiarDoHistorico(${item.id})">📋</button>
                        <button class="history-copy" onclick="event.stopPropagation(); editarHistorico(${item.id})">✏️</button>
                        <button class="history-remove" onclick="event.stopPropagation(); removerHistorico(${item.id})">✕</button>
                    </div>
                    <div id="history-edit-actions-${item.id}" style="display:none;align-items:center;gap:6px">
                        <button class="history-copy" onclick="event.stopPropagation(); salvarEdicaoHistorico(${item.id})">💾</button>
                        <button class="history-remove" onclick="event.stopPropagation(); cancelarEdicaoHistorico(${item.id})">✕</button>
                    </div>
                </div>
            </div>
            <div class="history-body" style="display:none">
                <textarea class="history-text" id="history-text-${item.id}" readonly>${escapeHtml(item.texto)}</textarea>
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

document.getElementById('history-panel').addEventListener('input', (e) => {
    if (e.target.classList.contains('history-text')) {
        redimensionarTextarea(e.target);
    }
});

(function () {
    if (localStorage.getItem('historico-minimizado') === '1') {
        document.querySelector('.history-container').classList.add('minimized');
    }
})();

renderizarHistorico();
