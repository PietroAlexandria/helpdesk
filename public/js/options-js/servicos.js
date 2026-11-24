// ── Helpers ──────────────────────────────────────────────────────────────────
function getDisp(name) {
    const val = document.querySelector(`input[name="${name}"]:checked`)?.value || '';
    if (val === 'manha')             return 'Manhã';
    if (val === 'tarde')             return 'Tarde';
    if (val === 'qualquerHoraio')    return 'Qualquer Horário';
    if (val === 'horario-especifico') return document.querySelector(`textarea[name="horarioEsp-${name.replace('disp-', '')}"]`)?.value || '';
    return '';
}

function feedbackBtn(botao, textoOriginal) {
    mostrarAlerta('Copiado com sucesso!', 'sucesso');
    botao.textContent = '✅ Copiado!';
    botao.disabled = true;
    setTimeout(() => { botao.textContent = textoOriginal; botao.disabled = false; }, 1000);
}

// ── Coleta de Dados ───────────────────────────────────────────────────────────
function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const servico = document.querySelector('input[name="tipoServico"]:checked')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.replace(/\D/g, '').length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
    if (!servico) { mostrarAlerta('Selecione o tipo de serviço!'); return; }

    const nomes = { comodo: 'Mudança de Cômodo', passagem: 'Passagem de Cabo', verificacao: 'Verificação de Rede Interna', config: 'Configuração de Roteador' };
    const texto = `Cliente entrou em contato via ${via}\nNome: ${nome}\nContato: ${contato}\nMotivo: ${nomes[servico]}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'Coleta - Serviços'); } catch(e) {}
}

function limparColeta() {
    document.querySelectorAll('input[name="via"], input[name="tipoServico"]').forEach(el => el.checked = false);
    document.querySelector('input[name="nome"]').value = '';
    document.querySelector('input[name="contato"]').value = '';
    ['card-mudanca-comodo', 'card-passagem-cabo', 'card-verificacao-rede', 'card-config'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// ── Mudança de Cômodo ─────────────────────────────────────────────────────────
function copiarMudancaComodo(botao) {
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const disp    = getDisp('disp-comodo');
    if (!disp) { mostrarAlerta('Selecione a disponibilidade!'); return; }

    const obs      = document.querySelector('textarea[name="obs-comodo"]')?.value || '';
    const login    = document.getElementById('loginpppoe-comodo')?.value || '';
    const senha    = document.getElementById('senhapppoe-comodo')?.value || '';

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disp}

Serviço: Mudança de Cômodo
Prazo: 48 horas úteis
Mão de obra: R$ 150,00
Metragem de cabo (se necessário): R$ 4,20/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 75,00
Taxa antecipada: R$ 150,00
Metragem cobrada na próxima mensalidade
Cliente ciente dos valores, taxas e prazos${obs ? `\n\nObservações: ${obs}` : ''}

Login PPPoE: ${login}
Senha PPPoE: ${senha}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Atendimento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Mudança de Cômodo'); } catch(e) {}
}

// ── Passagem de Cabo ──────────────────────────────────────────────────────────
function copiarPassagemCabo(botao) {
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const disp    = getDisp('disp-passagem');
    if (!disp) { mostrarAlerta('Selecione a disponibilidade!'); return; }

    const obs   = document.querySelector('textarea[name="obs-passagem"]')?.value || '';
    const login = document.getElementById('loginpppoe-passagem')?.value || '';
    const senha = document.getElementById('senhapppoe-passagem')?.value || '';

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disp}

Serviço: Passagem de Cabo
Prazo: 48 horas úteis
Mão de obra: R$ 150,00
Metragem de cabo: R$ 4,20/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 75,00
Taxa antecipada: R$ 150,00
Metragem cobrada na próxima mensalidade
Cliente ciente dos valores, taxas e prazos${obs ? `\n\nObservações: ${obs}` : ''}

Login PPPoE: ${login}
Senha PPPoE: ${senha}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Atendimento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Passagem de Cabo'); } catch(e) {}
}

// ── Verificação de Rede Interna ───────────────────────────────────────────────
function selecionarArea(valor) {
    toggleCards(valor, { v_urbana: 'verificacao-urbana', v_rural: 'verificacao-rural' });
}

function copiarVerificacao(botao) {
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const disp    = getDisp('disp-verificacao');
    if (!disp) { mostrarAlerta('Selecione a disponibilidade!'); return; }

    const areaSel = document.querySelector('input[name="area-verificacao"]:checked')?.value || '';
    const area    = areaSel === 'v_rural' ? 'Rural' : areaSel === 'v_urbana' ? 'Urbana' : '';
    const mdo     = area === 'Rural' ? 'R$ 160,00' : 'R$ 150,00';

    const obs   = document.querySelector('textarea[name="obs-verificacao"]')?.value || '';
    const login = document.getElementById('loginpppoe-verificacao')?.value || '';
    const senha = document.getElementById('senhapppoe-verificacao')?.value || '';

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disp}

Serviço: Verificação de Rede Interna${area ? ` - ${area}` : ''}
Prazo: 48 horas úteis
Mão de obra: ${mdo}
Metragem de cabo (se necessário): R$ 4,20/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 75,00
Taxa antecipada: ${mdo}
Metragem cobrada na próxima mensalidade

Cliente ciente dos valores, taxas e prazos${obs ? `\n\nObservações: ${obs}` : ''}

Login PPPoE: ${login}
Senha PPPoE: ${senha}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Atendimento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Verificação de Rede Interna'); } catch(e) {}
}

// ── Configuração de Roteador ──────────────────────────────────────────────────
function selecionarAreaConfig(valor) {
    toggleCards(valor, { c_urbana: 'config-urbana', c_rural: 'config-rural' });
}

function copiarConfig(botao) {
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const disp    = getDisp('disp-config');
    if (!disp) { mostrarAlerta('Selecione a disponibilidade!'); return; }

    const areaSel = document.querySelector('input[name="area-config"]:checked')?.value || '';
    const area    = areaSel === 'c_rural' ? 'Rural' : areaSel === 'c_urbana' ? 'Urbana' : '';
    const mdo     = area === 'Rural' ? 'R$ 150,00' : 'R$ 80,00';

    const obs   = document.querySelector('textarea[name="obs-config"]')?.value || '';
    const login = document.getElementById('loginpppoe-config')?.value || '';
    const senha = document.getElementById('senhapppoe-config')?.value || '';

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disp}

Serviço: Configuração de Roteador${area ? ` - ${area}` : ''}
Prazo: 48 horas úteis
Mão de obra: ${mdo}
Taxa antecipada: ${mdo}
Metragem de cabo (se necessário): R$ 4,20/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 75,00
Metragem cobrada na próxima mensalidade
Cliente ciente dos valores, taxas e prazos${obs ? `\n\nObservações: ${obs}` : ''}

Login PPPoE: ${login}
Senha PPPoE: ${senha}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Atendimento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Configuração de Roteador'); } catch(e) {}
}
