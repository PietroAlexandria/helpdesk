function copiarMudancaComodo(tipo, botao) {
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    const dispSelecionada = document.querySelector('input[name="disponibilidade-mudanca"]:checked')?.value || '';
    let disponibilidade = '';
    if (dispSelecionada === 'manha')                  { disponibilidade = 'Manhã'; }
    else if (dispSelecionada === 'tarde')              { disponibilidade = 'Tarde'; }
    else if (dispSelecionada === 'qualquerHoraio')     { disponibilidade = 'Qualquer Horário'; }
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('textarea[name="horarioEsp-mudanca"]')?.value || ''; }
    if (!disponibilidade) { mostrarAlerta('Selecione a disponibilidade!'); return; }

    const obs          = document.querySelector('textarea[name="descricao"]')?.value || '';
    const loginPPPOE   = document.getElementById('loginpppoe-comodo')?.value || '';
    const senhaPPPOE   = document.getElementById('senhapppoe-comodo')?.value || '';

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disponibilidade}

Serviço: Mudança de Cômodo
Prazo: 48 horas úteis
Mão de obra: R$ 100,00
Metragem de cabo (se necessário): R$ 3,75/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 50,00
Taxa antecipada: R$ 100,00
Metragem cobrada na próxima mensalidade${obs ? `

Observações: ${obs}` : ''}

Login PPPoE: ${loginPPPOE}
Senha PPPoE: ${senhaPPPOE}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Mudança de Cômodo'); } catch(e) {}
}

function copiarPassagem(tipo, botao) {
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    const dispSelecionada = document.querySelector('input[name="disponibilidade-passagem"]:checked')?.value || '';
    let disponibilidade = '';
    if (dispSelecionada === 'manha')                  { disponibilidade = 'Manhã'; }
    else if (dispSelecionada === 'tarde')              { disponibilidade = 'Tarde'; }
    else if (dispSelecionada === 'qualquerHoraio')     { disponibilidade = 'Qualquer Horário'; }
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('textarea[name="horarioEsp-passagem"]')?.value || ''; }
    if (!disponibilidade) { mostrarAlerta('Selecione a disponibilidade!'); return; }

    const obs          = document.querySelector('textarea[name="descricao"]')?.value || '';
    const loginPPPOE   = document.getElementById('loginpppoe-passagem')?.value || '';
    const senhaPPPOE   = document.getElementById('senhapppoe-passagem')?.value || '';

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disponibilidade}

Serviço: Passagem de Cabo
Prazo: 48 horas úteis
Mão de obra: R$ 100,00
Metragem de cabo: R$ 3,75/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 50,00
Taxa antecipada: R$ 100,00
Metragem cobrada na próxima mensalidade
Cliente ciente dos valores, taxas e prazos${obs ? `

Observações: ${obs}` : ''}

Login PPPoE: ${loginPPPOE}
Senha PPPoE: ${senhaPPPOE}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Passagem de Cabo'); } catch(e) {}
}

function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.replace(/\D/g, '').length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    const servico = document.querySelector('input[name="tipoServico"]:checked')?.value || '';
    let nomeServico = '';
    if (servico === 'mudanca') { nomeServico = 'Mudança de Cômodo'; }
    else if (servico === 'passagem') { nomeServico = 'Passagem de Cabo'; }
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

function feedbackBtn(botao, textoOriginal) {
    mostrarAlerta('Copiado com sucesso!', 'sucesso');
    botao.textContent = '✅ Copiado!';
    botao.disabled = true;
    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.disabled = false;
    }, 1000);
}
