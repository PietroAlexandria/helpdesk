function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 14) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    const texto = `Cliente entrou em contato via ${via} 
Nome: ${nome} 
Contato: ${contato} 
Motivo: Suporte de SVA's`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
    .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function feedbackBtn(botao, textoOriginal) {
    mostrarAlerta('Copiado com sucesso!', 'sucesso');
    botao.textContent = '✅ Copiado!';
    botao.disabled = true;
    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.disabled = false;
    }, 1000);
}