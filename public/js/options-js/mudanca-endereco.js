function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const area    = document.querySelector('input[name="area"]:checked')?.value || '';

    if (!via)                        { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)                       { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
    if (!area)                       { mostrarAlerta('Selecione uma área (Rural ou Urbana)!'); return; }

    const texto = `Cliente entrou em contato via ${via}
Nome: ${nome}
Contato: ${contato}
Motivo: Mudança de Endereço - ${area}`;

    try { salvarHistorico(texto, 'Coleta - Mudança de Endereço'); } catch(e) {}
    navigator.clipboard.writeText(texto)
    .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
    .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarForm(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const area    = document.querySelector('input[name="area"]:checked')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 10) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
    if (!area)    { mostrarAlerta('Selecione uma área (Rural ou Urbana)!'); return; }

    const taxaVal = document.querySelector('input[name="taxa"]:checked')?.value || '';
    if (area === 'Urbana' && !taxaVal) { mostrarAlerta('Selecione a TAXA!'); return; }

    const equipamentosVal = document.querySelector('input[name="equipamentos"]:checked')?.value || '';
    if (area === 'Urbana' && !equipamentosVal) { mostrarAlerta('Selecione referente a equipamentos!'); return; }

    const areaKey    = area === 'Urbana' ? 'urbana' : 'rural';
    const telhadoKey = area === 'Urbana' ? 'urbano' : 'rural';

    // Disponibilidade
    const dispSelecionada = document.querySelector(`input[name="disponibilidade-${areaKey}"]:checked`)?.value || '';
    let disponibilidade = '';
    if (dispSelecionada === 'manha')             { disponibilidade = 'Manhã'; }
    else if (dispSelecionada === 'tarde')         { disponibilidade = 'Tarde'; }
    else if (dispSelecionada === 'qualquerHoraio') { disponibilidade = 'Qualquer Horário'; }
    else if (dispSelecionada === 'horario-especifico') { disponibilidade = document.querySelector('input[name="horario"]')?.value || ''; }

    // Telhado
    const telhaSelecionada = document.querySelector(`input[name="tipo-telhado-${telhadoKey}"]:checked`)?.value || '';
    let telhado = '';
    if (telhaSelecionada === 'zinco')             { telhado = 'Zinco'; }
    else if (telhaSelecionada === 'eternit')       { telhado = 'Eternit'; }
    else if (telhaSelecionada === 'ceramica')      { telhado = 'Cerâmica'; }
    else if (telhaSelecionada === 'outro-telhado') { telhado = document.querySelector('input[name="telha"]')?.value || ''; }

    // Poste
    const posteSelecionado = document.querySelector('input[name="poste"]:checked')?.value || '';
    let poste = '';
    if (posteSelecionado === 'sim')             { poste = 'Há mais de um poste de energia no local'; }
    else if (posteSelecionado === 'nao')        { poste = 'Há apenas um poste de energia no local'; }

    // Campos de endereço
    const enderecoAntigo = document.querySelector('input[name="enderecoAntigo"]')?.value || '';
    const cep            = document.getElementById('cep')?.value || '';
    const uf             = document.getElementById('uf')?.value.toUpperCase() || '';
    const cidadeSelect   = document.getElementById('cidade');
    const cidade         = cidadeSelect?.options[cidadeSelect.selectedIndex]?.text.trim() || '';
    const bairro         = document.getElementById('bairro')?.value || '';
    const logradouro     = document.getElementById('logradouro')?.value || '';
    const number         = document.getElementById('number')?.value || '';
    const loginPPPOE     = document.getElementById('loginpppoe')?.value || '';
    const senhaPPPOE     = document.getElementById('senhapppoe')?.value || '';
    const obs            = document.querySelector('textarea[name="observacoes"]')?.value || '';

    const taxa         = taxaVal === 'isento' ? 'Isento' : 'Não Isento';
    const equipamentos = equipamentosVal === 'levar' ? 'irá levar' : 'não irá levar';
    const mudarVal     = document.querySelector('input[name="dataMudanca"]:checked')?.value || '';
    const mudar        = mudarVal === 'naoMudou' ? 'irá se mudar' : 'já se mudou';
    const data         = mudarVal === 'naoMudou' ? document.querySelector('input[name="data"]')?.value || '' : '';
    const dataFormatada = data ? data.split('-').reverse().join('/') : null;

    const texto = `Agendado por ${nome} 
Contato: ${contato} 
Disponibilidade: ${disponibilidade} 

Cliente entrou em contato solicitando mudança de endereço. 
CPF confirmado com o titular do cadastro. 
Cliente ${taxa} da taxa. 
Cliente ciente do custo de R$50,00 de mão de obra por cômodo + R$3,75 o metro do cabo de rede + R$2,50 por ponteira RJ45 caso for preciso realizar passagem de cabo de rede durante a mudança. 
Cliente ciente do prazo de 48 horas úteis para a mudança de endereço. 
Cliente ${mudar}${dataFormatada ? ` em ${dataFormatada}` : ''} e ${equipamentos} os equipamentos. 

Poste: ${poste}. 

Telhado: ${telhado}. 

Antigo endereço: 
${enderecoAntigo} 

Novo endereço: 
${uf} ${cidade} ${cep} ${bairro} - ${logradouro}, ${number} 

Login PPPoE: ${loginPPPOE} 
Senha PPPoE: ${senhaPPPOE} ${obs ? `
    
Observações: ${obs}` : ''}`;

    try { salvarHistorico(texto, 'Mudança de Endereço'); } catch(e) {}
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Formulário'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function limparColeta() {
    document.querySelectorAll('input[name="via"], input[name="area"]').forEach(el => el.checked = false);
    document.querySelector('input[name="nome"]').value = '';
    document.querySelector('input[name="contato"]').value = '';
    ['card-urbana', 'card-rural'].forEach(id => document.getElementById(id).style.display = 'none');
}

function limparMudancaUrbana() {
    document.querySelectorAll('input[name="taxa"], input[name="dataMudanca"], input[name="equipamentos"], input[name="disponibilidade-urbana"], input[name="tipo-telhado-urbano"], input[name="poste"]').forEach(el => el.checked = false);
    document.getElementById('dataMudancaEsp').style.display = 'none';
    document.getElementById('horario-especifico-urbana').style.display = 'none';
    document.getElementById('outro-telhado-urbano').style.display = 'none';
    document.querySelector('input[name="horario"]').value = '';
    document.querySelector('input[name="telha"]').value = '';
    document.querySelector('input[name="enderecoAntigo"]').value = '';
    ['cep','uf','bairro','logradouro','number','loginpppoe','senhapppoe'].forEach(id => {
        const el = document.getElementById(id);
        if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
    });
    document.getElementById('cidade').selectedIndex = 0;
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