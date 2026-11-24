function toggleMotivoOutro(valor) {
    document.getElementById('campo-motivo-outro').style.display = valor === 'Outro' ? 'block' : 'none';
}

function coletarHospedagem() {
    const canal     = document.querySelector('input[name="canal-hospedagem"]:checked')?.value || '';
    const nome      = document.getElementById('nome-hospedagem').value.trim();
    const motivoSel = document.querySelector('input[name="motivo-hospedagem"]:checked')?.value || '';
    const outro     = document.getElementById('motivo-outro-hospedagem').value.trim();
    const descricao = document.getElementById('descricao-hospedagem').value.trim();

    if (!canal)     { mostrarAlerta('Selecione o canal de contato (Uzera/ChatWoot)!'); return null; }
    if (!nome)      { mostrarAlerta('Preencha o Nome!'); return null; }
    if (!motivoSel) { mostrarAlerta('Selecione o Motivo!'); return null; }
    if (motivoSel === 'Outro' && !outro) { mostrarAlerta('Informe qual é o motivo!'); return null; }
    if (!descricao) { mostrarAlerta('Preencha a Descrição!'); return null; }

    const motivo = motivoSel === 'Outro' ? `Outro - ${outro}` : motivoSel;

    return `Cliente entrou em contato via ${canal}
Nome: ${nome}
Motivo: ${motivo}

Descrição:
${descricao}`;
}

function copiarHospedagem(botao) {
    const texto = coletarHospedagem();
    if (!texto) return;
    try { salvarHistorico(texto, 'Suporte Hospedagem'); } catch(e) {}
    navigator.clipboard.writeText(texto)
        .then(() => {
            mostrarAlerta('Copiado com sucesso!', 'sucesso');
            botao.textContent = '✅ Copiado!';
            botao.disabled = true;
            setTimeout(() => {
                botao.textContent = '📋 Copiar Anotação';
                botao.disabled = false;
            }, 1000);
        })
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function limparHospedagem() {
    document.querySelectorAll('#card-hospedagem input[type="text"], #card-hospedagem textarea').forEach(el => el.value = '');
    document.querySelectorAll('#card-hospedagem input[type="radio"]').forEach(el => el.checked = false);
    toggleMotivoOutro('');
}
