function mostrarAlerta(mensagem, tipo = 'erro') {
    const toast = document.getElementById('toast');
    toast.textContent = tipo === 'erro' ? '⚠️ ' + mensagem : '✅ ' + mensagem;
    toast.className = `toast ${tipo} show`;
    setTimeout(() => { toast.className = `toast ${tipo}`; }, 3000);
}

function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const type    = document.querySelector('input[name="type"]:checked')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
    if (!type)    { mostrarAlerta('Selecione um tipo de conexão (Fibra ou Rádio)!'); return; }

    const texto = `Cliente entrou em contato via ${via}
Nome: ${nome}
Contato: ${contato}
Motivo: Sem Conexão - ${type}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
    .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarChamadoDisponivelFibra(botao) {
    const linkChamadoDispFibra = document.querySelector('input[name="link-jira-disp-fibra"]')?.value || '';
    if (!linkChamadoDispFibra) { mostrarAlerta('Preencha o campo LINK DO CHAMADO!'); return; }

    const texto = `Verificado e CAIXA está sem conexão
Verificado e chamado aberto no JIRA que afeta o cliente

Cliente afetado pelo chamado: 
${linkChamadoDispFibra}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Chamado'))
    .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarChamadoCriadoFibra(botao) {
    const linkChamadoCriadoFibra = document.querySelector('input[name="link-jira-criado-fibra"]')?.value || '';
    if (!linkChamadoCriadoFibra) { mostrarAlerta('Preencha o campo LINK DO CHAMADO!'); return; }

    const texto = `Verificado e CAIXA está sem conexão
Verificado e não há chamado aberto no JIRA, mas o mesmo foi criado e afeta o cliente

Cliente afetado pelo chamado: 
${linkChamadoCriadoFibra}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Chamado'))
    .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarChamadoDisponivelRadio(botao) {
    const linkChamadoDispRadio = document.querySelector('input[name="link-jira-disp-radio"]')?.value || '';
    if (!linkChamadoDispRadio) { mostrarAlerta('Preencha o campo LINK DO CHAMADO!'); return; }

    const texto = `Verificado e BASE está sem conexão
Verificado e chamado aberto no JIRA que afeta o cliente

Cliente afetado pelo chamado: 
${linkChamadoDispRadio}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Chamado'))
    .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarChamadoCriadoRadio(botao) {
    const linkChamadoCriadoRadio = document.querySelector('input[name="link-jira-criado-radio"]')?.value || '';
    if (!linkChamadoCriadoRadio) { mostrarAlerta('Preencha o campo LINK DO CHAMADO!'); return; }

    const texto = `Verificado e BASE está sem conexão
Verificado e não há chamado aberto no JIRA, mas o mesmo foi criado e afeta o cliente

Cliente afetado pelo chamado: 
${linkChamadoCriadoRadio}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Chamado'))
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