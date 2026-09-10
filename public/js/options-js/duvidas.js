function copiarDuvida(tipo, botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const type    = document.querySelector('input[name="type"]:checked')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 14) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
    if (!type)    { mostrarAlerta('Selecione o tipo de dúvida!'); return; }

    const desc    = document.querySelector(`textarea[name="desc-${tipo}"]`)?.value || '';
    if (!desc)  { mostrarAlerta('Preencha a DESCRIÇÃO DO OCORRIDO!'); return; }

    const tipoLabel = { suporte: 'Dúvidas - Suporte', financeiro: 'Dúvidas Financeiras', comercial: 'Dúvidas Comercial', previsao: 'Dúvidas - Previsão' }[tipo];

    const texto = `Cliente entrou em contato via ${via} \nNome: ${nome} \nContato: ${contato} \nMotivo: ${tipoLabel} \n\nDescrição: ${desc}`;

    const tituloHistorico = { suporte: 'Suporte', financeiro: 'Financeiro', comercial: 'Comercial', previsao: 'Previsão' }[tipo];

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, `Dúvida ${tituloHistorico}`); } catch(e) {}
}

function copiarRetornoContato(tipo, botao) {
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const type    = document.querySelector('input[name="type"]:checked')?.value || '';

    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 14) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
    if (!type)    { mostrarAlerta('Selecione o tipo de dúvida!'); return; }

    const desc    = document.querySelector(`textarea[name="desc-${tipo}"]`)?.value || '';
    if (!desc)  { mostrarAlerta('Preencha a DESCRIÇÃO DO OCORRIDO!'); return; }

    const prot = document.querySelector('input[name="protocolo"]')?.value || '';
    if (!prot) { mostrarAlerta('Insira o PROTOCOLO!'); return; }

    const dispSelecionada = document.querySelector(`input[name="disponibilidade-agendamento"]:checked`)?.value || '';
    let disponibilidade = '';
    if (dispSelecionada === 'manha')             { disponibilidade = 'Período da Manhã'; }
    else if (dispSelecionada === 'tarde')         { disponibilidade = 'Período da Tarde'; }
    else if (dispSelecionada === 'qualquerHoraio') { disponibilidade = 'Qualquer Horário'; }
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('textarea[name="horarioEsp"]')?.value || ''; }

    const texto = `Olá pessoal! \nProtocolo: ${prot} \nNome: ${nome} \nContato: ${contato} \nDisponibilidade: ${disponibilidade} \n\nMotivo: ${desc} \n\nPoderiam prosseguir com o atendimento? \nObrigado!`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, `Dúvidas - Retorno`); } catch(e) {}
}

function limparCard(tipo) {
    document.querySelectorAll('input[name="via"], input[name="type"]').forEach(el => el.checked = false);
    document.querySelector('input[name="nome"]').value = '';
    document.querySelector('input[name="contato"]').value = '';
    ['card-suporte', 'card-financeiro', 'card-comercial', 'card-previsao'].forEach(id => document.getElementById(id).style.display = 'none');
    document.querySelector(`textarea[name="desc-${tipo}"]`).value = '';
    document.querySelectorAll(`input[name="soluc-${tipo}"]`).forEach(el => el.checked = false);
    document.querySelector('input[name="retornar"]').value = '';
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
