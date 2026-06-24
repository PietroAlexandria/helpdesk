function toggleCards(valor, mapa) {
    Object.entries(mapa).forEach(([chave, id]) => {
        document.getElementById(id).style.display = chave === valor ? 'block' : 'none';
    });
}
