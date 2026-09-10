function irPara(rota) {
    const via      = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome     = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();

    if (!via)                              { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)                             { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!telefone || telefone.length < 14) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    sessionStorage.setItem('coleta', JSON.stringify({ via, nome, telefone }));
    window.location.href = rota;
}
