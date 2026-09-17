// ── Área do Serviço ──────────────────────────────────────────────────────────
function selecionarArea(valor) {
    toggleCards(valor, { v_urbana: 'verificacao-urbana', v_rural: 'verificacao-rural' });

    // Mostra campo de roteadores ao selecionar uma área
    document.getElementById('campo-roteadores').style.display = 'block';

    // Recalcula caso já tenha valor digitado
    calcularValorRoteadores();
}

// ── Cálculo de Roteadores ────────────────────────────────────────────────────
function calcularValorRoteadores() {
    const input = document.getElementById('qtd-roteadores');
    const resultado = document.getElementById('resultado-roteadores');
    const textoEl = document.getElementById('texto-resultado-roteadores');
    const qtd = parseInt(input.value);

    if (!qtd || qtd < 1) {
        resultado.style.display = 'none';
        return;
    }

    const areaSelecionada = document.querySelector('input[name="area-verificacao"]:checked')?.value || '';

    let valor = 0;
    let descricao = '';

    if (qtd === 1) {
        // Apenas 1 roteador — sem cobrança adicional de roteador
        descricao = '✅ Apenas 1 roteador — sem cobrança adicional por roteador.';
    } else if (qtd === 2) {
        // Roteador secundário
        if (areaSelecionada === 'v_urbana') {
            valor = 50;
            descricao = `📌 Roteador secundário (Urbana): <strong>R$ 50,00</strong>`;
        } else if (areaSelecionada === 'v_rural') {
            valor = 100;
            descricao = `📌 Roteador secundário (Rural): <strong>R$ 100,00</strong>`;
        } else {
            valor = 50;
            descricao = `📌 Roteador secundário: <strong>R$ 50,00</strong> (selecione a área para valor exato)`;
        }
    } else if (qtd === 3) {
        // Três roteadores
        valor = 100;
        descricao = `📌 3 roteadores: <strong>R$ 100,00</strong>`;
    } else {
        // 4 ou mais roteadores
        const adicionais = qtd - 3;
        const valorAdicional = adicionais * 50;
        valor = 100 + valorAdicional;
        descricao = `📌 3 roteadores: R$ 100,00 + ${adicionais} roteador(es) adicional(is) × R$ 50,00 = <strong>R$ ${valor.toFixed(2).replace('.', ',')}</strong>`;
    }

    textoEl.innerHTML = descricao;
    resultado.style.display = 'block';
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

    const maoDeObra = area === 'Rural' ? 'R$ 100,00' : 'R$ 50,00';

    // Monta informação de roteadores
    const qtdRoteadores = parseInt(document.getElementById('qtd-roteadores')?.value) || 0;
    let textoRoteadores = '';
    if (qtdRoteadores === 2) {
        const valorRot = area === 'Rural' ? 'R$ 100,00' : 'R$ 50,00';
        textoRoteadores = `\nRoteador secundário (${area || 'Urbana'}): ${valorRot}`;
    } else if (qtdRoteadores === 3) {
        textoRoteadores = '\n3 roteadores no local: R$ 100,00';
    } else if (qtdRoteadores > 3) {
        const adicionais = qtdRoteadores - 3;
        const valorTotal = 100 + (adicionais * 50);
        textoRoteadores = `\n3 roteadores: R$ 100,00 + ${adicionais} adicional(is) × R$ 50,00 = R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    }

    const texto = `Agendado por ${nome}
Contato: ${contato}
Disponibilidade: ${disponibilidade}

Serviço: Verificação de Rede Interna${area ? ` - ${area}` : ''}
Prazo: 48 horas úteis
Mão de obra: ${maoDeObra}
Metragem de cabo (se necessário): R$ 3,75/m
Conector RJ45 (cada): R$ 2,50
Cômodo adicional: R$ 50,00
Taxa antecipada: R$ 100,00
Metragem cobrada na próxima mensalidade${textoRoteadores}

Cliente ciente dos valores, taxas e prazos${obs ? `

Observações: ${obs}` : ''}

Login PPPoE: ${loginPPPOE}
Senha PPPoE: ${senhaPPPOE}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'O.S. Verificação de Rede Interna'); } catch(e) {}
}

// ── Copiar Passagem de Cabo ──────────────────────────────────────────────────
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

    const obs          = document.querySelector('#card-config textarea[name="descricao"]')?.value || '';
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
