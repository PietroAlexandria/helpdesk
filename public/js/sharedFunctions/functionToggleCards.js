function toggleCards(valor, mapa) {
    Object.entries(mapa).forEach(([chave, id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = chave === valor ? 'block' : 'none';
    });
}
