function salvarHistorico(texto) {
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    historico.push({
        id: Date.now(),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        texto: texto
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

function renderizarHistorico() {
    const painel = document.getElementById('history-panel');
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');

    if (historico.length === 0) {
        painel.innerHTML = '<div class="history-empty">📭 Nenhum registro ainda</div>';
        return;
    }

    painel.innerHTML = historico.slice().reverse().map(item => `
        <div class="history-card">
            <div class="history-card-header">
                <span class="history-time">🕐 ${item.hora}</span>
                <button class="history-remove" onclick="removerHistorico(${item.id})">✕</button>
            </div>
            <pre class="history-text">${item.texto}</pre>
        </div>
    `).join('');
}