function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.replace(/\D/g, '').length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    const servico = document.querySelector('input[name="tipoServico"]:checked')?.value || '';
    if (!servico) { mostrarAlerta('Selecione o tipo de serviço!'); return; }

    const texto = `Cliente entrou em contato via ${via}\nNome: ${nome}\nContato: ${contato}\nMotivo: ${servico}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'Coleta - Mudança de Cômodo'); } catch(e) {}
}

function limparColeta() {
    document.querySelectorAll('input[name="via"], input[name="type"]').forEach(el => el.checked = false);
    document.querySelector('input[name="nome"]').value = '';
    document.querySelector('input[name="contato"]').value = '';
    document.querySelectorAll('input[name="tipoServico"], input[name="type"]').forEach(el => el.checked = false);
}

function copiarMudancaComodo(tipo, botao) {
    const textos = {
        mudanca: `A mudança de cômodo terá um prazo de 48 horas úteis, caso não ocorra nenhum imprevisto. \nEste serviço possui os seguintes valores: 
        \nMão de obra: R$ 100,00 \nMetragem de cabo de rede (caso necessário): R$ 3,75 \nConector RJ45 (cada): R$ 2,50 
        \nCaso seja necessário passar cabos em outros cômodos, será acrescentado um valor de R$50,00 por passagem adicional. 
        \nA taxa de R$ 100,00 deverá ser paga antecipadamente para que possamos efetuar o agendamento, enquanto o valor referente à metragem de cabo utilizado será cobrado na próxima mensalidade.`
    };
    navigator.clipboard.writeText(textos[tipo])
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'Tutorial Serviços - Mudança de Cômodo'); } catch(e) {}
}

function copiarPassagem(tipo, botao) {
    const textos = {
        passagem: `A passagem de cabo terá um prazo de 48 horas úteis, caso não ocorra nenhum imprevisto. \nEste serviço possui os seguintes valores: 
        \nMão de obra: R$ 100,00 \nMetragem de cabo de rede: R$ 3,75 \nConector RJ45 (cada): R$ 2,50 
        \nCaso seja necessário passar cabos em outros cômodos, será acrescentado um valor de R$50,00 por passagem adicional. 
        \nA taxa de R$ 100,00 deverá ser paga antecipadamente para que possamos efetuar o agendamento, enquanto o valor referente à metragem de cabo utilizado será cobrado na próxima mensalidade.`
    };
    navigator.clipboard.writeText(textos[tipo])
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'Tutorial Serviços - Passagem de Cabo'); } catch(e) {}
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
