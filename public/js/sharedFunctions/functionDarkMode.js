(function () {
    const STORAGE_KEY = 'cednet-theme';

    function applyTheme(dark) {
        document.documentElement.classList.toggle('dark', dark);
        const btn = document.getElementById('btn-dark-mode');
        if (btn) btn.textContent = dark ? '☀️' : '🌙';
    }

    function toggleTheme() {
        const isDark = !document.documentElement.classList.contains('dark');
        localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
        applyTheme(isDark);
    }

    // Aplica o tema salvo antes do paint
    applyTheme(localStorage.getItem(STORAGE_KEY) === 'dark');

    window.toggleDarkMode = toggleTheme;
})();
