function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const type    = document.querySelector('input[name="type"]:checked')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 14) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
    if (!type)    { mostrarAlerta('Selecione o tipo de dúvida!'); return; }

    const tipoLabel = { Suporte: 'Dúvidas - Suporte', Financeiro: 'Dúvidas Financeiras', Comercial: 'Dúvidas Comercial' }[type];

    const texto = `Cliente entrou em contato via ${via}
Nome: ${nome}
Contato: ${contato}
Motivo: ${tipoLabel}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'Coleta - Dúvidas'); } catch(e) {}
}

function copiarDuvida(tipo, botao) {
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const desc    = document.querySelector(`textarea[name="desc-${tipo}"]`)?.value || '';

    if (!desc)  { mostrarAlerta('Preencha a DESCRIÇÃO DO OCORRIDO!'); return; }

    const tipoLabel = { suporte: 'Dúvidas - Suporte', financeiro: 'Dúvidas Financeiras', comercial: 'Dúvidas Comercial' }[tipo];

    const texto = `Motivo: ${tipoLabel} \n\nDescrição: ${desc}`;

    const tituloHistorico = { suporte: 'Suporte', financeiro: 'Financeiro', comercial: 'Comercial' }[tipo];

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, `Dúvida ${tituloHistorico}`); } catch(e) {}
}

function limparColeta() {
    document.querySelectorAll('input[name="via"], input[name="type"]').forEach(el => el.checked = false);
    document.querySelector('input[name="nome"]').value = '';
    document.querySelector('input[name="contato"]').value = '';
    ['card-suporte', 'card-financeiro', 'card-comercial'].forEach(id => document.getElementById(id).style.display = 'none');
}

function limparCard(tipo) {
    document.querySelector(`textarea[name="desc-${tipo}"]`).value = '';
    document.querySelectorAll(`input[name="soluc-${tipo}"]`).forEach(el => el.checked = false);
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
