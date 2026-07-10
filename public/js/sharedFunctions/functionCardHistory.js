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
                    <span class="history-title">${item.titulo}</span>
                    <span class="history-time">🕐 ${item.hora} - ${item.nome}</span>
                </div>
                <div class="history-card-actions">
                    <span class="history-arrow">▼</span>
                    <button class="history-copy" onclick="event.stopPropagation(); navigator.clipboard.writeText(\`${item.texto}\`).then(() => mostrarAlerta('Copiado!','sucesso')).catch(() => mostrarAlerta('Erro ao copiar!'))">📋</button>
                    <button class="history-copy" id="history-edit-btn-${item.id}" onclick="event.stopPropagation(); editarHistorico(${item.id})">✏️</button>
                    <button class="history-remove" onclick="event.stopPropagation(); removerHistorico(${item.id})">✕</button>
                </div>
            </div>
            <div class="history-body" style="display:none">
                <textarea class="history-text" id="history-text-${item.id}" readonly>${escapeHtml(item.texto)}</textarea>
                <div class="history-edit-actions" id="history-edit-actions-${item.id}">
                    <button class="history-copy" onclick="event.stopPropagation(); salvarEdicaoHistorico(${item.id})">💾</button>
                    <button class="history-remove" onclick="event.stopPropagation(); cancelarEdicaoHistorico(${item.id})">✕</button>
                </div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function editarHistorico(id) {
    const textarea = document.getElementById(`history-text-${id}`);
    const actions = document.getElementById(`history-edit-actions-${id}`);
    const editBtn = document.getElementById(`history-edit-btn-${id}`);

    textarea.readOnly = false;
    textarea.classList.add('editing');
    textarea.focus();
    actions.style.display = 'flex';
    editBtn.style.display = 'none';
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
    const actions = document.getElementById(`history-edit-actions-${id}`);
    const editBtn = document.getElementById(`history-edit-btn-${id}`);

    textarea.value = texto;
    textarea.readOnly = true;
    textarea.classList.remove('editing');
    actions.style.display = 'none';
    editBtn.style.display = 'inline-block';
}

document.getElementById('history-panel').addEventListener('input', (e) => {
    if (e.target.classList.contains('history-text')) {
        redimensionarTextarea(e.target);
    }
});

renderizarHistorico();
