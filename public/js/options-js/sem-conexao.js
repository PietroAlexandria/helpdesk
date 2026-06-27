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

// AGENDAMENTO FIBRA
function copiarAgendamentoFibra(botao) {
    const nomeAg = document.querySelector('input[name="nomeAg"]')?.value || '';
    if (!nomeAg)    { mostrarAlerta('Preencha o campo NOME!'); return; }

    const contatosAg = [...document.querySelectorAll('#lista-contatos input[name="contatoAg"]')]
        .map(el => el.value.trim())
        .filter(v => v);
    const contato = contatosAg.join(' / ');
    if (!contato || contato.length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    //ON/OFF
    const caixaSelec = document.querySelector('input[name="cx"]:checked')?.value || '';
    let caixa = '';
    if (caixaSelec === 'cxOn') { caixa = 'ON'; } else if (caixaSelec === 'cxOff') { caixa = 'OFF'; }

    const onuSelec = document.querySelector('input[name="onu"]:checked')?.value || '';
    let onu = '';
    if (onuSelec === 'onuOn') { onu = 'ON'; } else if (onuSelec === 'onuOff') { onu = 'OFF'; }

    const routerSelec = document.querySelector('input[name="router"]:checked')?.value || '';
    let router = '';
    if (routerSelec === 'routerOn') { router = 'ON'; } else if (routerSelec === 'routerOff') { router = 'OFF'; }

    if (!caixa || !onu || !router) { mostrarAlerta('Selecione as opções de Caixa, ONU e Router!'); return; }

    //LOS
    const losSelecionada = document.querySelector('input[name="los"]:checked')?.value || '';
    let los = '';
    if (losSelecionada === 'losSim')    { los = 'ONU alarma LOS'; }
    else if (losSelecionada === 'losNao')   { los = 'ONU NÃO alarma LOS'; }

    //DIAGNOSTICO 
    const diagnostico = document.querySelector('textarea[name="descricao"]')?.value || '';
    
    // DISPONIBILIDADE
    const dispSelecionada = document.querySelector(`input[name="disponibilidade-agendamento"]:checked`)?.value || '';
    let disponibilidade = '';
    if (dispSelecionada === 'manha')             { disponibilidade = 'Manhã'; }
    else if (dispSelecionada === 'tarde')         { disponibilidade = 'Tarde'; }
    else if (dispSelecionada === 'qualquerHoraio') { disponibilidade = 'Qualquer Horário'; }
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('input[name="horarioEsp"]')?.value || ''; }

    // EQUIPAMENTOS 
    const loginPPPOE     = document.getElementById('loginpppoe')?.value || '';
    const senhaPPPOE     = document.getElementById('senhapppoe')?.value || '';
    const olt            = document.getElementById('olt')?.value || '';
    const cxDesc         = document.getElementById('cxDesc')?.value || '';
    const pon            = document.getElementById('pon')?.value || '';
    const mac            = document.getElementById('mac')?.value || '';

    // TR069
    const trSelecionado = document.querySelector(`input[name="tr069"]:checked`)?.value || '';
    let tr069 = '';
    if (trSelecionado === 'TRativado')      { tr069 = ''; }
    else if (trSelecionado === 'ativarTR') { tr069 = `Por gentileza, ATIVAR o TR-069 no roteador do cliente e VERIFICAR com o suporte técnico se está ativo corretamente. 
Caso não seja compatível, INFORMAR na finalização da O.S.`; }

    // OS FINAL
    const texto = `Agendado por ${nomeAg}
Contato: ${contato}
Disponibilidade: ${disponibilidade} 
  
Diagnostico: ${diagnostico} 
  
Caixa: ${caixa}  
ONU: ${onu}
Router: ${router} 
  
OLT: ${olt}  
PON: ${pon} 
CAIXA: ${cxDesc} 
ONU MAC: ${mac} 

${los} 
  
Favor verificar os equipamentos e cabeamento. 
  
Login PPPoE: ${loginPPPOE}  
Senha PPPoE: ${senhaPPPOE}

${tr069} `;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Chamado'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

// FIBRA --------------------------------------------------------------------------------------------------------------------------------
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

// RÁDIO --------------------------------------------------------------------------------------------------------------------------------
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