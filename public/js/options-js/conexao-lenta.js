function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.replace(/\D/g, '').length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    //REINCIDENCIA
    const reincidenciaSelec = document.querySelector('input[name="reincidencia"]:checked')?.value || '';
    let reincidencia = '';
    if (reincidenciaSelec === 'reincidenciaSim') { reincidencia = 'Reinciência'; }
    else if (reincidenciaSelec === 'reincidenciaNao') { reincidencia = 'Conexão Lenta'; }
    if(!reincidencia) { mostrarAlerta('Selecione se é reincidência ou não!'); return; }

    const texto = `Cliente entrou em contato via ${via} 
Nome: ${nome} 
Contato: ${contato} 
Motivo: ${reincidencia}`;

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

    //DIAGNOSTICO 
    const diagnostico = document.querySelector('textarea[name="descricao"]')?.value || '';

    //REINCIDENCIA
    const reincidenciaSelec = document.querySelector('input[name="reincidencia"]:checked')?.value || '';
    let reincidencia = '';
    if (reincidenciaSelec === 'reincidenciaSim') { reincidencia = 'Reinciência'; }
    else if (reincidenciaSelec === 'reincidenciaNao') { reincidencia = 'Conexão Lenta'; }
    if(!reincidencia) { mostrarAlerta('Selecione se é reincidência ou não!'); return; }
    
    // DISPONIBILIDADE
    const dispSelecionada = document.querySelector(`input[name="disponibilidade-agendamento"]:checked`)?.value || '';
    let disponibilidade = '';
    if (dispSelecionada === 'manha')             { disponibilidade = 'Manhã'; }
    else if (dispSelecionada === 'tarde')         { disponibilidade = 'Tarde'; }
    else if (dispSelecionada === 'qualquerHoraio') { disponibilidade = 'Qualquer Horário'; }
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('textarea[name="horarioEsp"]')?.value || ''; }

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
  
Diagnostico: ${reincidencia}

${diagnostico} 
  
Caixa: ON   
ONU: ON 
Router: ON 
  
OLT: ${olt}  
PON: ${pon} 
CAIXA: ${cxDesc} 
ONU MAC: ${mac} 
  
Favor verificar os equipamentos e cabeamento. 
  
Login PPPoE: ${loginPPPOE}  
Senha PPPoE: ${senhaPPPOE}

${tr069}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Agendamento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarResolucaoFibra(botao) {

    //DIAGNOSTICO 
    const diagnostico = document.querySelector('textarea[name="descricao"]')?.value || '';

    const texto = `Caixa: ON  
ONU: ON  
Router: ON  

Descrição da resolução: 

${diagnostico}

Problema Solucionado!`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Agendamento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
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

    //REINCIDENCIA
    const reincidenciaSelec = document.querySelector('input[name="reincidencia"]:checked')?.value || '';
    let reincidencia = '';
    if (reincidenciaSelec === 'reincidenciaSim') { reincidencia = 'Reinciência'; }
    else if (reincidenciaSelec === 'reincidenciaNao') { reincidencia = 'Conexão Lenta'; }
    if(!reincidencia) { mostrarAlerta('Selecione se é reincidência ou não!'); return; }

    const diagnostico = document.querySelector('textarea[name="descricao-radio"]')?.value || '';

    const dispSelecionada = document.querySelector('input[name="disponibilidade-agendamento-radio"]:checked')?.value || '';
    let disponibilidade = '';
    if (dispSelecionada === 'manha')                { disponibilidade = 'Manhã'; }
    else if (dispSelecionada === 'tarde')            { disponibilidade = 'Tarde'; }
    else if (dispSelecionada === 'qualquerHoraio')   { disponibilidade = 'Qualquer Horário'; }
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('textarea[name="horarioEsp-Radio"]')?.value || ''; }

    const loginPPPOE_Radio  = document.getElementById('loginpppoe-radio')?.value || '';
    const senhaPPPOE_Radio  = document.getElementById('senhapppoe-radio')?.value || '';
    const ipRadio           = document.getElementById('ipRadio')?.value || '';
    const ipBase            = document.getElementById('ipBase')?.value || '';
    const encryptBase       = document.getElementById('encryptBase')?.value || '';
    const loc               = document.getElementById('loc')?.value || '';

    const trSelecionado_Radio = document.querySelector('input[name="tr069-radio"]:checked')?.value || '';
    let tr069_Radio = '';
    if (trSelecionado_Radio === 'ativarTR-radio') {
        tr069_Radio = `Por gentileza, ATIVAR o TR-069 no roteador do cliente e VERIFICAR com o suporte técnico se está ativo corretamente. 
Caso não seja compatível, INFORMAR na finalização da O.S.`;
    }

    const texto = `Agendado por ${nomeAgRadio} 
Contato: ${contatosRadio} 
Disponibilidade: ${disponibilidade} 

Diagnostico: ${reincidencia} 

${diagnostico} 

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
}

function copiarResolucaoRadio(botao) {

    const diagnostico = document.querySelector('textarea[name="descricao-radio"]')?.value || '';

    const texto = `BASE: ON 
Rádio: ON 
PPPoE: ON 

Descrição da resolução: 

${diagnostico}

Problema Solucionado!`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Agendamento'))
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