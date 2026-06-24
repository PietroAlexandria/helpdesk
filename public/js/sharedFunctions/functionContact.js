function mascaraContato(el) {
    let valor = el.value.replace(/\D/g, ''); 

    //Remove o +55 caso estiver quando colado
    if (valor.length === 12) valor = valor.slice(-10); //Telefone Fixo 
    if (valor.length === 13) valor = valor.slice(-11); //Telefone Celular

    if (valor.length <= 10) {
        valor = valor
        .replace(/^(\d{2})(\d)/g, '($1) $2') //Remove tudo que não for número antes de formatar, começando sempre do início (^) e terminando no final (d$)
        .replace(/(\d{4})(\d)/, '$1-$2');
    } 
    else {
        valor = valor
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }

    el.value = valor; //Valor recebe texto atual dentro do input 
}