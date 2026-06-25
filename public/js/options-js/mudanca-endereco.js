function copiarColetaDados() {
    const via     = document.querySelector('input[name="via"]:checked')?.value || 'Não Informado';
    const nome    = document.getElementById('nome').value || 'Não Informado';
    const contato = document.getElementById('contato').value || 'Não Informado';
    const area    = document.getElementById('area').value || null;

    if (!via){
        alert('Selecione uma VIA de contato!');
        return;
    }
    else if (!nome) {
        alert('Preencha os campos NOME!');
        return;
    } else if (!contato) {
        alert('Preencha o campo CONTATO!');
        return;
    } else if (!area) {
        alert('Selecione uam área (Rural ou Urbana)!');
        return;
    }

    const areaKey = area === 'Urbana' ? 'urbana' : 'rural';

    const texto = `Cliente entrou em contato via ${via} \n
    Nome: ${nome} \n
    Contato: ${contato} \n
    Motivo: Mudança de Endereço - ${area}`;

    navigator.clipboard.writeText(texto).then( () => {
        alert('Coleta de dados COPIADA!');
    }).catch( () => {
        alert('ERRO ao copiar, tente novamente!')
    })
}

function copiarForm() {
    const via     = document.querySelector('input[name="via"]:checked')?.value || 'Não Informado';
    const nome    = document.getElementById('nome').value || 'Não Informado';
    const contato = document.getElementById('contato').value || 'Não Informado';
    const area    = document.getElementById('area').value || null;

    if (!via){
        alert('Selecione uma VIA de contato!');
        return;
    }
    else if (!nome) {
        alert('Preencha os campos NOME!');
        return;
    } else if (!contato) {
        alert('Preencha o campo CONTATO!');
        return;
    } else if (!area) {
        alert('Selecione uam área (Rural ou Urbana)!');
        return;
    }

    const taxaVal = document.querySelector('input[name="taxa"]:checked')?.value || '';
    if (area === 'Urbana' && !taxaVal) {
        alert('Selecione a TAXA!');
        return;
    }

    const areaKey = area === 'Urbana' ? 'urbana' : 'rural';

    // Disponibilidade de horário 
    const dispSelecionada = document.querySelector('input[name="disponibilidade-${areaKey}"]:checked')?.value || ''; 
    let disponibilidade = '';
    if (dispSelecionada === "manha") { disponibilidade = "Manhã"; } 
    else if (dispSelecionada === "tarde") { disponibilidade = "Tarde"; }
    else if (dispSelecionada === "qualquerHorario") { disponibilidade = "Qualquer Horário"; }
    else if (dispSelecionada === "horarioEspecifico") { disponibilidade = document.querySelector('input[name="horario"]')?.value || '';} 

    // Tipo de telhado
    const telhadoKey = area === 'Urbana' ? 'urbano' : 'rural';
    const telhaSelecionada = document.querySelector('input[name="telhado-${telhadoKey}"]:checked')?.value || '';
    let telhado = '';
    if (telhaSelecionada === "zinco") { telhado = "Zinco"; }
    else if (telhaSelecionada === "eternit") { telhado = "Eternit"; }
    else if (telhaSelecionada === "ceramica") { telhado = "Cerâmica"; }
    else if (telhaSelecionada === "outro-telhado") { telhado = document.querySelector('input[name="outro-telhado"]')?.value || ''; }

    // Declarações
    const enderecoAntigo = document.querySelector('input[name="enderecoAntigo"]')?.value || '';
    const cep            = document.getElementById('cep')?.value || '';
    const uf             = document.getElementById('uf')?.value.toUpperCase() || '';
    const cidade         = cidadeSelect?.options[cidadeSelect.selectedIndex]?.text.trim() || '';
    const bairro         = document.getElementById('bairro')?.value || ''; 
    const logradouro     = document.getElementById('logradouro')?.value || '';
    const number         = document.getElementById('number')?.value || '';
    const loginPPPOE     = document.getElementById('loginpppoe')?.value || '';
    const senhaPPPOE     = document.getElementById('senhapppoe')?.value || '';
    const taxa = taxaVal === 'isento' ? 'Isento' : 'Não Isento';

    // Texto copiar
    const texto = `Agendado por ${nome}
    Contato: ${contato}
    Disponibilidade: ${disponibilidade}
    
    Cliente entrou em contato solicitando mudança de endereço.
    CPF confirmado com o titular do cadastro.
    Cliente ${taxa} da taxa. 
    Cliente ciente do custo de R$50,00 de mão de obra por cômodo + R$3,75 o metro do cabo de rede + R$2,50 por ponteira RJ45 caso for preciso realizar passagem de cabo de rede durante a mudança.
    Cliente ciente do prazo de 48 horas úteis para a mudança de endereço.`;

    navigator.clipboard.writeText(texto).then(() => {
        alert('Formulário COPIADO!');
    }).catch(() => {
        alert('ERRO ao copiar, tente novamente!');
    });
}