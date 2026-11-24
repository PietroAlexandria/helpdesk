// ── Área do Serviço ──────────────────────────────────────────────────────────
function selecionarArea(valor) {
    toggleCards(valor, { v_urbana: 'verificacao-urbana', v_rural: 'verificacao-rural' });
}

// ── Copiar Verificação de Rede ───────────────────────────────────────────────
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

    const areaSelecionada = document.querySelector('input[name="area-verificacao"]:checked')?.value || '';
    let area = '';
    if (areaSelecionada === 'v_urbana') { area = 'Urbana'; }
    else if (areaSelecionada === 'v_rural') { area = 'Rural'; }

    const obs          = document.querySelector('#card-verificacao-rede textarea[name="descricao"]')?.value || '';
    const loginPPPOE   = document.getElementById('loginpppoe-comodo')?.value || '';
    const senhaPPPOE   = document.getElementById('senhapppoe-comodo')?.value || '';

    const maoDeObra = area === 'Rural' ? 'R$ 160,00' : 'R$ 150,00';

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disponibilidade}

Serviço: Verificação de Rede Interna${area ? ` - ${area}` : ''}
Prazo: 48 horas úteis
Mão de obra: ${maoDeObra}
Metragem de cabo (se necessário): R$ 4,20/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 75,00
Taxa antecipada: ${maoDeObra}
Metragem cobrada na próxima mensalidade

Cliente ciente dos valores, taxas e prazos${obs ? `

Observações: ${obs}` : ''}

Login PPPoE: ${loginPPPOE}
Senha PPPoE: ${senhaPPPOE}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Atendimento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Verificação de Rede Interna'); } catch(e) {}
}

// ── Selecionar Área Config ───────────────────────────────────────────────────
function selecionarAreaConfig(valor) {
    toggleCards(valor, { c_urbana: 'config-urbana', c_rural: 'config-rural' });
}

// ── Copiar Configuração de Roteador ──────────────────────────────────────────
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

    const areaSelecionada = document.querySelector('input[name="area-config"]:checked')?.value || '';
    let area = '';
    if (areaSelecionada === 'c_urbana')      { area = 'Urbana'; }
    else if (areaSelecionada === 'c_rural')  { area = 'Rural'; }

    const maoDeObra = area === 'Rural' ? 'R$ 150,00' : 'R$ 80,00';

    const obs        = document.querySelector('#card-config textarea[name="descricao"]')?.value || '';
    const loginPPPOE = document.getElementById('loginpppoe-passagem')?.value || '';
    const senhaPPPOE = document.getElementById('senhapppoe-passagem')?.value || '';

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disponibilidade}

Serviço: Configuração de Roteador${area ? ` - ${area}` : ''}
Prazo: 48 horas úteis
Mão de obra: ${maoDeObra}
Taxa antecipada: ${maoDeObra}
Metragem de cabo (se necessário): R$ 4,20/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 75,00
Metragem cobrada na próxima mensalidade
Cliente ciente dos valores, taxas e prazos${obs ? `

Observações: ${obs}` : ''}

Login PPPoE: ${loginPPPOE}
Senha PPPoE: ${senhaPPPOE}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Atendimento'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Passagem de Cabo'); } catch(e) {}
}

// ── Copiar Coleta de Dados ───────────────────────────────────────────────────
function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.replace(/\D/g, '').length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }

    const servico = document.querySelector('input[name="tipo-servico"]:checked')?.value || '';

    let nomeServico = '';
    if (servico === 'verificacao') { nomeServico = 'Verificação de Rede Interna'; }
    else if (servico === 'config') { nomeServico = 'Configuração de Roteador'; }
    if (!servico) { mostrarAlerta('Selecione o tipo de serviço!'); return; }

    const texto = `Cliente entrou em contato via ${via}\nNome: ${nome}\nContato: ${contato}\nMotivo: ${nomeServico}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'Coleta - Verificação de Rede'); } catch(e) {}
}

// ── Limpar Coleta ────────────────────────────────────────────────────────────
function limparColeta() {
    document.querySelectorAll('input[name="via"]').forEach(el => el.checked = false);
    document.querySelector('input[name="nome"]').value = '';
    document.querySelector('input[name="contato"]').value = '';
    document.querySelectorAll('input[name="tipo-servico"]').forEach(el => el.checked = false);
    ['card-verificacao-rede', 'card-config'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// ── Feedback de Botão ────────────────────────────────────────────────────────
function feedbackBtn(botao, textoOriginal) {
    mostrarAlerta('Copiado com sucesso!', 'sucesso');
    botao.textContent = '✅ Copiado!';
    botao.disabled = true;
    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.disabled = false;
    }, 1000);
}
