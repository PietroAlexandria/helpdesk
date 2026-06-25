// Mascara do CEP, colocando '-' quando necessário
function mascaraCep(el) {
    let valor = el.value.replace(/\D/g, '');
    valor = valor.replace(/(\d{5})(\d)/, '$1-$2'); //Utilizando padrão CEP
    el.value = valor; //Valor recebe texto atual dentro do input 
}

// Busca o CEP na API
async function buscarCep(cep) {
    const apenasNumeros = cep.replace(/\D/g, '');

    // Verifica se o CEP possui 8 dígitos
    if (apenasNumeros.length !== 8) return;

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
        const dados = await resposta.json();

        // Se o CEP não existir a API retorna ERRO
        if (dados.erro) {
            alert('CEP não encontrado!'); 
            return;
        }

        // Preenche os campos do formulário com os dados do CEP
        document.getElementById('logradouro').value = dados.logradouro;
        document.getElementById('bairro').value = dados.bairro;
        document.getElementById('uf').value = dados.uf.toLowerCase();

        // Const para cidades serem procuradas mesmo que não correspondam com tamanho e espaço ideal das letras anteriores
        const options = document.getElementById('cidade').options;
        for (let op of options) {
            if (op.text.trim().toLowerCase() === dados.localidade.toLowerCase()) {
                op.selected = true;
                break;
            }
        }
    }
    catch (erro) {
        alert('Erro ao buscar CEP: ' + erro);
    }
    
}