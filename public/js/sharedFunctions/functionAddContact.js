let contadorContatos = 1;

function adicionarContato() {
    contadorContatos++;
    const listaContatos = document.getElementById('lista-contatos');

    const div = document.createElement('div');
    div.classList.add('campo-contato');
    div.id = 'contato-' + contadorContatos;

    div.innerHTML = `
        <input type="text" name="contatoAg" maxlength="15" placeholder="(XX) XXXXX-XXXX" oninput="mascaraContato(this)">
        <button class="btn-remove" onclick="removerContato(${contadorContatos})">X</button>
    `;

    listaContatos.appendChild(div);
}

function removerContato(id) {
    const el = document.getElementById('contato-' + id);
    if (el) {el.remove();}
}
