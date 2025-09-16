const toggleBtn = document.getElementById('themeToggle');
const body = document.body;

function updateIcon() {
    toggleBtn.textContent = body.classList.contains('theme-blueprint-dark') ? '🌙' : '☀️';
}

toggleBtn.addEventListener('click', () => {
    if (body.classList.contains('theme-blueprint-dark')) {
        body.classList.replace('theme-blueprint-dark', 'theme-blueprint-light');
    } else {
        body.classList.replace('theme-blueprint-light', 'theme-blueprint-dark');
    }
    updateIcon();
});

updateIcon();