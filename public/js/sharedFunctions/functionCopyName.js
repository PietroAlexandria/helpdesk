function pullName(idPrimary, idSecondary) {
    const origem = document.getElementById(idPrimary);
    const destino = document.getElementById(idSecondary);

    if (!origem || !destino) {
        console.warn('Element not found: ', idPrimary, idSecondary);
        return;
    }

    if ('value' in destino) {
        destino.value = origem.value;
    } else {
        destino.textContent = origem.textContent;
    }
}

function linkName(idPrimary, idSecondary) {
    const origem = document.getElementById(idPrimary);
    if (!origem) {return;}

    origem.addEventListener('input', () => pullName(idPrimary, idSecondary));
}