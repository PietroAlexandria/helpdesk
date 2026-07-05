function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const type    = document.querySelector('input[name="type"]:checked')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 14) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
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
        const contatosAgInvalido = contatosAg.some(c => c.replace(/\D/g, '').length < 10);
        if (contatosAg.length === 0 || contatosAgInvalido) { mostrarAlerta('Preencha o campo CONTATO com pelo menos 10 dígitos!'); return; }
    const contato = contatosAg.join(' / ');
    if (!contato) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

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
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('textarea[name="horarioEsp"]')?.value || ''; }

    // EQUIPAMENTOS 
    const loginPPPOE     = document.getElementById('loginpppoe')?.value || '';
    if (!loginPPPOE) { mostrarAlerta('Preencha o campo LOGIN PPPoE!'); return; }
    const senhaPPPOE     = document.getElementById('senhapppoe')?.value || '';
    if (!senhaPPPOE) { mostrarAlerta('Preencha o campo SENHA PPPoE!'); return; }
    const olt            = document.getElementById('olt')?.value || '';
    if (!olt) { mostrarAlerta('Preencha o campo OLT!'); return; }
    const cxDesc         = document.getElementById('cxDesc')?.value || '';
    if (!cxDesc) { mostrarAlerta('Preencha o campo CAIXA!'); return; }
    const pon            = document.getElementById('pon')?.value || '';
    if (!pon) { mostrarAlerta('Preencha o campo PON!'); return; }
    const mac            = document.getElementById('mac')?.value || '';
    if (!mac) { mostrarAlerta('Preencha o campo MAC!'); return; }

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
        .then(() => feedbackBtn(botao, '📋 Copiar Agendamento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    salvarHistorico(texto);
}

function copiarResolucaoFibra(botao) {
    //ON/OFF
    const caixaSelec = document.querySelector('input[name="cx"]:checked')?.value || '';
    let caixa = '';
    if (caixaSelec === 'cxOn') { caixa = 'ON'; } else if (caixaSelec === 'cxOff') { caixa = 'Estava OFFLINE'; }

    const onuSelec = document.querySelector('input[name="onu"]:checked')?.value || '';
    let onu = '';
    if (onuSelec === 'onuOn') { onu = 'ON'; } else if (onuSelec === 'onuOff') { onu = 'Estava OFFLINE'; }

    const routerSelec = document.querySelector('input[name="router"]:checked')?.value || '';
    let router = '';
    if (routerSelec === 'routerOn') { router = 'ON'; } else if (routerSelec === 'routerOff') { router = 'Estava OFFLINE'; }

    if (!caixa || !onu || !router) { mostrarAlerta('Selecione as opções de Caixa, ONU e Router!'); return; }

    //LOS
    const losSelecionada = document.querySelector('input[name="los"]:checked')?.value || '';
    let los = '';
    if (losSelecionada === 'losSim')    { los = 'ONU alarmava LOS'; }
    else if (losSelecionada === 'losNao')   { los = 'ONU não alarmava LOS'; }

    //DIAGNOSTICO 
    const diagnostico = document.querySelector('textarea[name="descricao"]')?.value || '';

    const texto = `Caixa: ${caixa} 
ONU: ${onu} 
Router: ${router} 

${los} 

Descrição da resolução: ${diagnostico}

Problema Solucionado!`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Agendamento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    salvarHistorico(texto);
}

// AGENDAMENTO RÁDIO
function copiarAgendamentoRadio(botao) {
    const nomeAgRadio = document.querySelector('input[name="nomeAg-radio"]')?.value || '';
    if (!nomeAgRadio) { mostrarAlerta('Preencha o campo NOME!'); return; }

    const contatosAgRadio = [...document.querySelectorAll('#lista-contatos-radio input[name="contatoAg-radio"]')]
        .map(el => el.value.trim())
        .filter(v => v);
        const contatosAgInvalidoRadio = contatosAgRadio.some(c => c.replace(/\D/g, '').length < 10);
        if (contatosAgRadio.length === 0 || contatosAgInvalidoRadio) { mostrarAlerta('Preencha o campo CONTATO com pelo menos 10 dígitos!'); return; }
    const contatosRadio = contatosAgRadio.join(' / ');
    if (!contatosRadio) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    const baseSelec = document.querySelector('input[name="base"]:checked')?.value || '';
    let base = '';
    if (baseSelec === 'baseOn') { base = 'ON'; } else if (baseSelec === 'baseOff') { base = 'OFF'; }

    const radioSelec = document.querySelector('input[name="radio"]:checked')?.value || '';
    let radio = '';
    if (radioSelec === 'radioOn') { radio = 'ON'; } else if (radioSelec === 'radioOff') { radio = 'OFF'; }

    const pppoeSelec_Radio = document.querySelector('input[name="pppoe-radio"]:checked')?.value || '';
    let pppoe_Radio = '';
    if (pppoeSelec_Radio === 'pppoeOn-radio') { pppoe_Radio = 'ON'; } else if (pppoeSelec_Radio === 'pppoeOff-radio') { pppoe_Radio = 'OFF'; }

    if (!base || !radio || !pppoe_Radio) { mostrarAlerta('Selecione as opções de Base, Rádio e PPPoE!'); return; }

    const diagnostico = document.querySelector('textarea[name="descricao-radio"]')?.value || '';

    const dispSelecionada = document.querySelector('input[name="disponibilidade-agendamento-radio"]:checked')?.value || '';
    let disponibilidade = '';
    if (dispSelecionada === 'manha')                { disponibilidade = 'Manhã'; }
    else if (dispSelecionada === 'tarde')            { disponibilidade = 'Tarde'; }
    else if (dispSelecionada === 'qualquerHoraio')   { disponibilidade = 'Qualquer Horário'; }
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('textarea[name="horarioEsp-Radio"]')?.value || ''; }

    const loginPPPOE_Radio  = document.getElementById('loginpppoe-radio')?.value || '';
    if (!loginPPPOE_Radio) { mostrarAlerta('Preencha o campo LOGIN PPPoE!'); return; }
    const senhaPPPOE_Radio  = document.getElementById('senhapppoe-radio')?.value || '';
    if (!senhaPPPOE_Radio) { mostrarAlerta('Preencha o campo SENHA PPPoE!'); return; }
    const ipRadio           = document.getElementById('ipRadio')?.value || '';
    if (!ipRadio) { mostrarAlerta('Preencha o campo IP Rádio!'); return; }
    const ipBase            = document.getElementById('ipBase')?.value || '';
    if (!ipBase) { mostrarAlerta('Preencha o campo IP Base!'); return; }
    const encryptBase       = document.getElementById('encryptBase')?.value || '';
    if (!encryptBase) { mostrarAlerta('Preencha o campo Encrypt BASE!'); return; }
    const loc               = document.getElementById('loc')?.value || '';
    if (!loc) { mostrarAlerta('Preencha o campo LOCALIZAÇÃO!'); return; }

    const trSelecionado_Radio = document.querySelector('input[name="tr069-radio"]:checked')?.value || '';
    let tr069_Radio = '';
    if (trSelecionado_Radio === 'ativarTR-radio') {
        tr069_Radio = `Por gentileza, ATIVAR o TR-069 no roteador do cliente e VERIFICAR com o suporte técnico se está ativo corretamente. 
Caso não seja compatível, INFORMAR na finalização da O.S.`;
    }

    const texto = `Agendado por ${nomeAgRadio} 
Contato: ${contatosRadio} 
Disponibilidade: ${disponibilidade} 

Diagnostico: ${diagnostico} 

BASE: ${base} 
Rádio: ${radio} 
PPPoE: ${pppoe_Radio} 

IP Rádio: ${ipRadio} 
IP Base: ${ipBase} 
Encrypt BASE: ${encryptBase} 

Login PPPoE: ${loginPPPOE_Radio} 
Senha PPPoE: ${senhaPPPOE_Radio} 

Localização: ${loc} 

${tr069_Radio}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Agendamento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    salvarHistorico(texto);
}

function copiarResolucaoRadio(botao) {
    const baseSelec = document.querySelector('input[name="base"]:checked')?.value || '';
    let base = '';
    if (baseSelec === 'baseOn') { base = 'ON'; } else if (baseSelec === 'baseOff') { base = 'Estava OFFLINE'; }

    const radioSelec = document.querySelector('input[name="radio"]:checked')?.value || '';
    let radio = '';
    if (radioSelec === 'radioOn') { radio = 'ON'; } else if (radioSelec === 'radioOff') { radio = 'Estava OFFLINE'; }

    const pppoeSelec_Radio = document.querySelector('input[name="pppoe-radio"]:checked')?.value || '';
    let pppoe_Radio = '';
    if (pppoeSelec_Radio === 'pppoeOn-radio') { pppoe_Radio = 'ON'; } else if (pppoeSelec_Radio === 'pppoeOff-radio') { pppoe_Radio = 'Estava OFFLINE'; }

    if (!base || !radio || !pppoe_Radio) { mostrarAlerta('Selecione as opções de Base, Rádio e PPPoE!'); return; }

    const diagnostico = document.querySelector('textarea[name="descricao-radio"]')?.value || '';

    const texto = `BASE: ${base}
Rádio: ${radio}
PPPoE: ${pppoe_Radio}

Descrição da resolução: ${diagnostico}

Problema Solucionado!`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Agendamento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    salvarHistorico(texto);
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
    salvarHistorico(texto);
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
    salvarHistorico(texto);
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
    salvarHistorico(texto);
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
    salvarHistorico(texto); // Salva o texto no histórico
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