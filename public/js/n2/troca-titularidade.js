function toggleIpFibra(val) {
    document.getElementById('campo-ip-fibra').style.display = val === 'FIXO' ? 'block' : 'none';
}

function toggleIpRadio(val) {
    document.getElementById('campo-ip-radio').style.display = val === 'FIXO' ? 'block' : 'none';
}

function toggleModoFibra(val) {
    document.getElementById('campos-bridge').style.display = val === 'Bridge' ? 'block' : 'none';
}

function v(name) {
    return document.querySelector(`[name="${name}"]`)?.value?.trim() || '';
}

function radio(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

function nomeOnu(caixa, usuarioNovo, nomeCliente) {
    const caixaLimpa    = caixa.replace(/^OUR_/i, '');
    const numerologin   = usuarioNovo.match(/^\d+/)?.[0] ?? usuarioNovo;
    const nomeFormatado = nomeCliente.trim().replace(/\s+/g, '_');
    return `${caixaLimpa}-${numerologin}-${nomeFormatado}`;
}

function loginAntigoRenomeado(usuarioAntigo) {
    return `PPPoE-trocatitularidade${usuarioAntigo}`;
}

// ── Fibra ─────────────────────────────────────────────────────────────────────

function coletarFibra() {
    const osAntiga       = v('os-antiga');
    const contratoAntigo = v('contrato-antigo');
    const osNova         = v('os-nova');
    const contratoNovo   = v('contrato-novo');
    const endereco       = v('endereco-fibra');
    const pppoeAntigo    = v('pppoe-antigo-fibra');
    const pppoeNovo      = v('pppoe-novo-fibra');
    const pppoeSenha     = v('pppoe-senha-fibra');
    const tipoIp         = radio('tipo-ip-fibra');
    const ip             = tipoIp === 'FIXO' ? v('ip-fibra') : 'NAT';
    const olt            = v('olt');
    const pon            = v('pon');
    const caixa          = v('caixa');
    const macOnu         = v('mac-onu');
    const serialOnu      = v('serial-onu');
    const modo           = radio('modo-fibra');
    const modeloOnu      = v('modelo-onu');
    const serialRoteador = v('serial-roteador');
    const nomeCliente    = v('nome-cliente-fibra');
    const macRoteador    = v('mac-roteador-fibra').toUpperCase();
    const modeloRoteador = v('modelo-roteador-fibra');

    if (!osAntiga)       { mostrarAlerta('Preencha a O.S. Antiga!'); return null; }
    if (!contratoAntigo) { mostrarAlerta('Preencha o Contrato Antigo!'); return null; }
    if (!osNova)         { mostrarAlerta('Preencha a O.S. Nova!'); return null; }
    if (!contratoNovo)   { mostrarAlerta('Preencha o Contrato Novo!'); return null; }
    if (!endereco)       { mostrarAlerta('Preencha o Endereço!'); return null; }
    if (!pppoeAntigo)    { mostrarAlerta('Preencha o Usuário PPPoE Antigo!'); return null; }
    if (!pppoeNovo)      { mostrarAlerta('Preencha o Usuário PPPoE Novo!'); return null; }
    if (!pppoeSenha)     { mostrarAlerta('Preencha a Senha PPPoE!'); return null; }
    if (!tipoIp)         { mostrarAlerta('Selecione o Tipo de IP!'); return null; }
    if (tipoIp === 'FIXO' && !v('ip-fibra')) { mostrarAlerta('Preencha o IP Fixo!'); return null; }
    if (!olt)            { mostrarAlerta('Preencha a OLT!'); return null; }
    if (!pon)            { mostrarAlerta('Preencha a PON!'); return null; }
    if (!caixa)          { mostrarAlerta('Preencha a CAIXA!'); return null; }
    if (!macOnu)         { mostrarAlerta('Preencha o MAC ONU!'); return null; }
    if (!serialOnu)      { mostrarAlerta('Preencha o Serial ONU!'); return null; }
    if (!modo)           { mostrarAlerta('Selecione o Modo de Operação (Bridge/Service)!'); return null; }
    if (!nomeCliente)    { mostrarAlerta('Preencha o Nome do Cliente Novo!'); return null; }

    const nomeOnuStr  = nomeOnu(caixa, pppoeNovo, nomeCliente);
    const loginAntigo = loginAntigoRenomeado(pppoeAntigo);

    const blocoImportados = modo === 'Bridge'
        ? `Dados importados.
MAC ONU/ONT: ${macOnu}
Serial Number ONU/ONT: ${serialOnu}
Modelo ONU/ONT: ${modeloOnu || '-'}
MAC Roteador: ${macRoteador || '-'}
Serial Number Roteador: ${serialRoteador || '-'}
Modelo Roteador: ${modeloRoteador || '-'}`
        : `Dados importados.
MAC ONU/ONT: ${macOnu}
Serial Number ONU/ONT: ${serialOnu}
MAC Roteador: ${macRoteador || '-'}
Modelo Roteador: ${modeloRoteador || '-'}`;

    const bloco1 = `De: ${osAntiga} - Contrato Nº ${contratoAntigo}.
Para: ${osNova} - Contrato Nº ${contratoNovo}.

Dados importados:
Endereço: ${endereco}
PPPoE Client
Usuário: ${pppoeAntigo}
User Novo: ${pppoeNovo}
Senha: ${pppoeSenha}
IP: ${ip}

Dados técnicos:
OLT: ${olt}
PON: ${pon}
CAIXA: ${caixa}
MAC ONU: ${macOnu}
ONU renomeada via IXC para:
${nomeOnuStr}`;

    const bloco2 = `ONU renomeada via IXC para:
${nomeOnuStr}
Login antigo renomeado para: ${loginAntigo}`;

    return { bloco1, bloco2, blocoImportados };
}

function copiarBloco1Fibra(botao) {
    const d = coletarFibra();
    if (!d) return;
    try { salvarHistorico(d.bloco1, 'Troca Titularidade - De/Para + Técnicos'); } catch(e) {}
    navigator.clipboard.writeText(d.bloco1)
        .then(() => feedbackTroca(botao, '📋 De/Para + Dados Técnicos'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarBloco2Fibra(botao) {
    const d = coletarFibra();
    if (!d) return;
    navigator.clipboard.writeText(d.bloco2)
        .then(() => feedbackTroca(botao, '📋 Renomeio ONU'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarBloco3Fibra(botao) {
    const d = coletarFibra();
    if (!d) return;
    try { salvarHistorico(d.blocoImportados, 'Troca Titularidade - Dados Importados'); } catch(e) {}
    navigator.clipboard.writeText(d.blocoImportados)
        .then(() => feedbackTroca(botao, '📋 Dados Importados'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function limparFibra() {
    document.querySelectorAll('#card-fibra input[type="text"]').forEach(el => el.value = '');
    document.querySelectorAll('#card-fibra input[type="radio"]').forEach(el => el.checked = false);
    document.getElementById('campo-ip-fibra').style.display = 'none';
    document.getElementById('campos-bridge').style.display = 'none';
}

// ── Rádio ─────────────────────────────────────────────────────────────────────

function copiarTrocaRadio(botao) {
    const osAntiga       = v('os-antiga-radio');
    const contratoAntigo = v('contrato-antigo-radio');
    const osNova         = v('os-nova-radio');
    const contratoNovo   = v('contrato-novo-radio');
    const endereco       = v('endereco-radio');
    const pppoeAntigo    = v('pppoe-antigo-radio');
    const pppoeNovo      = v('pppoe-novo-radio');
    const pppoeSenha     = v('pppoe-senha-radio');
    const tipoIp         = radio('tipo-ip-radio');
    const ip             = tipoIp === 'FIXO' ? v('ip-radio') : 'NAT';
    const ipBase         = v('ip-base');
    const ipRadioCliente = v('ip-radio-cliente');
    const modeloRadio    = v('modelo-radio');
    const macRadio       = v('mac-radio').toUpperCase();
    const nomeRadio      = v('nome-radio');
    const macRoteador    = v('mac-roteador-radio').toUpperCase();
    const modeloRoteador = v('modelo-roteador-radio');

    if (!osAntiga)       { mostrarAlerta('Preencha a O.S. Antiga!'); return; }
    if (!contratoAntigo) { mostrarAlerta('Preencha o Contrato Antigo!'); return; }
    if (!osNova)         { mostrarAlerta('Preencha a O.S. Nova!'); return; }
    if (!contratoNovo)   { mostrarAlerta('Preencha o Contrato Novo!'); return; }
    if (!endereco)       { mostrarAlerta('Preencha o Endereço!'); return; }
    if (!pppoeAntigo)    { mostrarAlerta('Preencha o Usuário PPPoE Antigo!'); return; }
    if (!pppoeNovo)      { mostrarAlerta('Preencha o Usuário PPPoE Novo!'); return; }
    if (!pppoeSenha)     { mostrarAlerta('Preencha a Senha PPPoE!'); return; }
    if (!tipoIp)         { mostrarAlerta('Selecione o Tipo de IP!'); return; }
    if (tipoIp === 'FIXO' && !v('ip-radio')) { mostrarAlerta('Preencha o IP Fixo!'); return; }
    if (!ipBase)         { mostrarAlerta('Preencha o IP BASE!'); return; }
    if (!ipRadioCliente) { mostrarAlerta('Preencha o IP Rádio Cliente!'); return; }
    if (!macRadio)       { mostrarAlerta('Preencha o MAC Rádio Cliente!'); return; }
    if (!nomeRadio)      { mostrarAlerta('Preencha o Nome do Rádio!'); return; }

    const loginAntigo = loginAntigoRenomeado(pppoeAntigo);

    const texto = `De: ${osAntiga} - Contrato Nº ${contratoAntigo}.
Para: ${osNova} - Contrato Nº ${contratoNovo}.

Dados importados:
Endereço: ${endereco}
PPPoE Client
Usuário: ${pppoeAntigo}
User Novo: ${pppoeNovo}
Senha: ${pppoeSenha}
IP: ${ip}

Dados técnicos:
IP BASE: ${ipBase}
IP Rádio Cliente: ${ipRadioCliente}
Modelo Rádio Cliente: ${modeloRadio || '-'}
MAC Rádio Cliente: ${macRadio}
MAC Roteador (WAN): ${macRoteador || '-'}
Modelo Roteador: ${modeloRoteador || '-'}
Nome do Rádio: ${nomeRadio}
Rádio renomeada via Air Control

Login antigo renomeado para: ${loginAntigo}`;

    try { salvarHistorico(texto, 'Troca de Titularidade - Rádio'); } catch(e) {}
    navigator.clipboard.writeText(texto)
        .then(() => feedbackTroca(botao, '📋 Copiar Texto OS'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function limparRadio() {
    document.querySelectorAll('#card-radio input[type="text"]').forEach(el => el.value = '');
    document.querySelectorAll('#card-radio input[type="radio"]').forEach(el => el.checked = false);
    document.getElementById('campo-ip-radio').style.display = 'none';
}

// ── Feedback ──────────────────────────────────────────────────────────────────

function feedbackTroca(botao, textoOriginal) {
    mostrarAlerta('Copiado com sucesso!', 'sucesso');
    botao.textContent = '✅ Copiado!';
    botao.disabled = true;
    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.disabled = false;
    }, 1000);
}
