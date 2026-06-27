function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const type    = document.querySelector('input[name="type"]:checked')?.value || '';

    if (!via)     { alert('Selecione uma VIA de contato!'); return; }
    if (!nome)    { alert('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 10) { alert('Preencha o campo CONTATO!'); return; }
    if (!type)    { alert('Selecione um tipo de conexão (Fibra ou Rádio)!'); return; }

    const texto = `Cliente entrou em contato via ${via}
Nome: ${nome}
Contato: ${contato}
Motivo: Sem Conexão - ${type}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
    .catch(() => alert('Erro ao copiar!'));
}

function copiarChamadoDisponivel(botao) {
    const linkChamadoDisp = document.querySelector('input[name="link-jira-disp"]')?.value || '';

    if (!linkChamadoDisp) { alert('Preencha o campo LINK DO CHAMADO!'); return; }

    const texto = `Verificado e CAIXA está sem conexão
Verificado e chamado aberto no JIRA que afeta o cliente

Cliente afetado pelo chamado: 
${linkChamadoDisp}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Chamado'))
    .catch(() => alert('Erro ao copiar!'));
}

function copiarChamadoCriado(botao) {
    const linkChamadoCriado = document.querySelector('input[name="link-jira-criado"]')?.value || '';

    if (!linkChamadoCriado) { alert('Preencha o campo LINK DO CHAMADO!'); return; }

    const texto = `Verificado e CAIXA está sem conexão
Verificado e não há chamado aberto no JIRA, mas o mesmo foi criado e afeta o cliente

Cliente afetado pelo chamado: 
${linkChamadoCriado}`;

    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Chamado'))
    .catch(() => alert('Erro ao copiar!'));
}

function feedbackBtn(botao, textoOriginal) {
    botao.textContent = '✅ Copiado!';
    botao.disabled = true;

    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.disabled = false;
    }, 1000);
}