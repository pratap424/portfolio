// ========================================
// THEME.JS - Dark/Light Theme Toggle
// ========================================

export function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    html.setAttribute('data-theme', initialTheme);

    // Toggle theme on button click
    themeToggle?.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Add transition class for smooth change
        html.classList.add('theme-transitioning');
        setTimeout(() => {
            html.classList.remove('theme-transitioning');
        }, 300);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// Add transition styles
const transitionStyles = document.createElement('style');
transitionStyles.textContent = `
  html.theme-transitioning,
  html.theme-transitioning *,
  html.theme-transitioning *::before,
  html.theme-transitioning *::after {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
  }
`;
document.head.appendChild(transitionStyles);
