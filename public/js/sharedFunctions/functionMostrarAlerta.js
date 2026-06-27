function mostrarAlerta(mensagem, tipo = 'erro') {
    const toast = document.getElementById('toast');
    toast.textContent = tipo === 'erro' ? '⚠️ ' + mensagem : '✅ ' + mensagem;
    toast.className = `toast ${tipo} show`;
    setTimeout(() => { toast.className = `toast ${tipo}`; }, 3000);
}