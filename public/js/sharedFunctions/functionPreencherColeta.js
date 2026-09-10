function preencherColetaDoAtendimento() {
    const raw = sessionStorage.getItem('coleta');
    if (!raw) return;

    const { via, nome, telefone } = JSON.parse(raw);

    const radioVia = document.querySelector(`input[name="via"][value="${via}"]`);
    if (radioVia) radioVia.checked = true;

    const campoNome = document.querySelector('input[name="nome"]') || document.getElementById('nome');
    if (campoNome) {
        campoNome.value = nome;
        campoNome.dispatchEvent(new Event('input'));
    }

    const campoContato = document.querySelector('input[name="contato"]') || document.getElementById('telefone');
    if (campoContato) campoContato.value = telefone;
}

document.addEventListener('DOMContentLoaded', preencherColetaDoAtendimento);
