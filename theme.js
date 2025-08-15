// Theme Management System
class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getPreferredTheme();
        this.init();
    }

    init() {
        // Apply initial theme
        this.applyTheme(this.theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
        
        // Create theme toggle button
        this.createThemeToggle();
    }

    getPreferredTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('tikun13-theme');
    }

    storeTheme(theme) {
        localStorage.setItem('tikun13-theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        this.updateToggleButton();
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.storeTheme(newTheme);
    }

    createThemeToggle() {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'theme-toggle-container';
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'theme-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle theme');
        toggleButton.setAttribute('title', 'Switch between light and dark theme');
        
        // Add icons (we'll use SVG icons)
        toggleButton.innerHTML = `
            <span class="theme-icon theme-icon-light">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
            </span>
            <span class="theme-icon theme-icon-dark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            </span>
        `;
        
        toggleButton.addEventListener('click', () => this.toggleTheme());
        
        toggleContainer.appendChild(toggleButton);
        
        // Insert into navigation
        const navContainer = document.querySelector('.nav-gradient .container');
        if (navContainer) {
            navContainer.appendChild(toggleContainer);
        }
    }

    updateToggleButton() {
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            toggleButton.setAttribute('data-theme', this.theme);
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});