// Mobile Navigation System

class MobileNavigation {
    constructor() {
        this.hamburger = document.getElementById('hamburger-menu');
        this.mobileMenu = document.getElementById('mobile-nav-menu');
        this.overlay = document.getElementById('mobile-nav-overlay');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.hamburger || !this.mobileMenu || !this.overlay) return;
        
        // Hamburger click handler
        this.hamburger.addEventListener('click', () => this.toggle());
        
        // Overlay click handler
        this.overlay.addEventListener('click', () => this.close());
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
        
        // Smooth scroll for anchor links
        this.initSmoothScroll();
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.hamburger.classList.add('active');
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.mobileMenu.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        this.mobileMenu.focus();
        
        // Trap focus in mobile menu
        this.trapFocus();
    }
    
    close() {
        this.isOpen = false;
        this.hamburger.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.mobileMenu.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to hamburger
        this.hamburger.focus();
    }
    
    trapFocus() {
        const focusableElements = this.mobileMenu.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        this.mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    initSmoothScroll() {
        const links = this.mobileMenu.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        this.close();
                        setTimeout(() => {
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }, 300);
                    }
                }
            });
        });
    }
}

// Global functions for onclick handlers
function closeMobileMenu() {
    const nav = window.mobileNav;
    if (nav && nav.isOpen) {
        nav.close();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileNav = new MobileNavigation();
});