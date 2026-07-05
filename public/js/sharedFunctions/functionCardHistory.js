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
                    <button class="history-remove" onclick="event.stopPropagation(); removerHistorico(${item.id})">✕</button>
                </div>
            </div>
            <div class="history-body" style="display:none">
                <pre class="history-text">${item.texto}</pre>
            </div>
        </div>
    `).join('');
}

renderizarHistorico();
