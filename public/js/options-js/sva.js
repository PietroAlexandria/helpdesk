function copiarAcesso(tipo, botao) {
    const textos = {
        cednetPlay: `*Acesso ao CedNet Play:*\nLogin: E-mail cadastral\nSenha: CPF do/a titular (Sem os pontos e traços, apenas números)`,
        cednetPlus: `*Acesso ao CedNet Plus:*\nLogin: CPF do/a titular (Sem os pontos e traços, apenas números)\nSenha: CPF do/a titular (Sem os pontos e traços)`
    };
    navigator.clipboard.writeText(textos[tipo])
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.replace(/\D/g, '').length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    const sva = document.querySelector('input[name="sva"]:checked')?.value || '';
    if (!sva) { mostrarAlerta('Selecione o tipo de SVA!'); return; }

    const nomeSva = {
        acessos: 'Acessos (CedPlay / CedPlus)', globoPlay: 'GloboPlay',
        setupBox: 'Setup BOX', cednetPlay: 'CedNet Play',
        premiere: 'Premiere', outroSva: 'Outro SVA'
    }[sva];

    const texto = `Cliente entrou em contato via ${via}\nNome: ${nome}\nContato: ${contato}\nMotivo: Suporte de SVA — ${nomeSva}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
    .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarSva(botao) {
    const sva = document.querySelector('input[name="sva"]:checked')?.value || '';
    if (!sva) { mostrarAlerta('Selecione o tipo de SVA!'); return; }

    const nomeSva = {
        acessos: 'Acessos (CedPlay / CedPlus)', globoPlay: 'GloboPlay',
        setupBox: 'Setup BOX', cednetPlay: 'CedNet Play',
        premiere: 'Premiere', outroSva: 'Outro SVA'
    }[sva];

    let problema = '';
    let obs = '';

    if (sva === 'outroSva') {
        const nomeOutro = document.querySelector('input[name="nome-outroSva"]')?.value || '';
        if (!nomeOutro) { mostrarAlerta('Preencha o nome do SVA!'); return; }
        obs = document.querySelector('textarea[name="obs-outroSva"]')?.value || '';
        problema = nomeOutro;
    } else {
        problema = document.querySelector(`input[name="problema-${sva}"]:checked`)?.value || '';
        if (!problema) { mostrarAlerta('Selecione o problema!'); return; }
        obs = document.querySelector(`textarea[name="obs-${sva}"]`)?.value || '';
    }

    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    const texto = `SVA: ${nomeSva}
Problema: ${problema}${obs ? `\nObservação: ${obs}` : ''}

Nome: ${nome}
Contato: ${contato}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Atendimento'))
    .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function limparColeta() {
    document.querySelectorAll('input[name="via"], input[name="type"]').forEach(el => el.checked = false);
    document.querySelector('input[name="nome"]').value = '';
    document.querySelector('input[name="contato"]').value = '';
    ['card-acessos', 'card-globoPlay', 'card-setupBox', 'card-cednetPlay', 'card-premiere', 'card-outroSva'].forEach(id => document.getElementById(id).style.display = 'none');
    document.querySelectorAll('input[name="sva"], input[name="radio"]').forEach(el => el.checked = false);
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
