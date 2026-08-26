function copiarColetaDados(botao) {
    const via     = document.querySelector('input[name="via"]:checked')?.value || '';
    const nome    = document.querySelector('input[name="nome"]')?.value || '';
    const contato = document.querySelector('input[name="contato"]')?.value || '';
    const type    = document.querySelector('input[name="type"]:checked')?.value || '';

    if (!via)     { mostrarAlerta('Selecione uma VIA de contato!'); return; }
    if (!nome)    { mostrarAlerta('Preencha o campo NOME!'); return; }
    if (!contato || contato.length < 14) { mostrarAlerta('Preencha o campo CONTATO!'); return; }
    if (!type)    { mostrarAlerta('Selecione o tipo de atendimento!'); return; }

    const tipoLabel = type === 'Comprovante' ? 'Comprovante de Pagamento' : '2ª Via de Boleto';

    const texto = `Cliente entrou em contato via ${via}
Nome: ${nome}
Contato: ${contato}
Motivo: ${tipoLabel}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Coleta'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'Coleta - Pagamentos'); } catch(e) {}
}

function copiarComprovante(botao) {

    const formaPagamento = document.querySelector('input[name="formaPag"]:checked')?.value || '';
    let formaPg = '';
    if (formaPagamento === 'boleto') { formaPg = 'BOLETO'; } else if (formaPagamento === 'pix') { formaPg = 'PIX'; }
    if (!formaPagamento)     { mostrarAlerta('Selecione uma FORMA DE PAGAMENTO!'); return; }

    const constaPag = document.querySelector('input[name="constar"]:checked')?.value || '';
    let constaPagamento = '';
    if (constaPag === 'consta') { constaPagamento = 'consta'; } else if (constaPag === 'constaNao') { constaPagamento = 'não consta'; }
    if (!constaPag)     { mostrarAlerta('Selecione se o pagamento CONSTA ou NÃO!'); return; }

    const anexoComp = document.querySelector('input[name="anexar"]:checked')?.value || '';
    let anexo = '';
    if (anexoComp === 'anexadoSim') { anexo = 'Comprovante anexado'; } else if (anexoComp === 'anexadoNao') { anexo = 'Comprovante não anexado'; }
    if (!anexoComp)     { mostrarAlerta('Selecione se o comprovante ESTÁ ou NÃO anexado!'); return; }

    const obs = document.querySelector('textarea[name="obs-comp"]')?.value || '';

    const texto = `Cliente solicitou 2ª Via ${formaPg}
Enviado 2ª Via ${formaPg}
Pagamento ${constaPagamento} no sistema
${anexo} na O.S.${obs ? `\n\nObservação: ${obs}` : ''}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar Comprovante'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, 'Comprovante'); } catch(e) {}
}

function copiar2Via(botao) {

    const formaPagamento = document.querySelector('input[name="formaPag-2via"]:checked')?.value || '';
    let formaPg = '';
    if (formaPagamento === 'boleto') { formaPg = 'BOLETO'; } else if (formaPagamento === 'pix') { formaPg = 'PIX'; }
    if (!formaPagamento)     { mostrarAlerta('Selecione uma FORMA DE PAGAMENTO!'); return; }

    const obs = document.querySelector('textarea[name="obs-2via"]')?.value || '';

    const texto = `Cliente solicitou 2ª Via ${formaPg}
Enviado 2ª Via ${formaPg}${obs ? `\n\nObservação: ${obs}` : ''}`;

    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋 Copiar 2ª Via'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
    try { salvarHistorico(texto, '2ª Via - Pagamentos'); } catch(e) {}
}

function limparColeta() {
    document.querySelectorAll('input[name="via"], input[name="type"]').forEach(el => el.checked = false);
    document.querySelector('input[name="nome"]').value = '';
    document.querySelector('input[name="contato"]').value = '';
    ['card-comprovante', 'card-2via'].forEach(id => document.getElementById(id).style.display = 'none');
}

function limparComprovante() {
    document.querySelectorAll('input[name="formaPag"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="constar"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="anexar"]').forEach(el => el.checked = false);
    document.querySelector('textarea[name="obs-comp"]').value = '';
}

function limpar2Via() {

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
