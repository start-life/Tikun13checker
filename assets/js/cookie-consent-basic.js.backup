// Cookie Consent Management System - Tikun 13 Compliant
class CookieConsent {
    constructor() {
        this.consentKey = 'tikun13_cookie_consent';
        this.consentData = this.loadConsent();
        this.init();
    }

    init() {
        // Check if consent has been given
        if (!this.hasConsent()) {
            this.showConsentBanner();
        }
    }

    loadConsent() {
        const saved = localStorage.getItem(this.consentKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    hasConsent() {
        return this.consentData !== null;
    }

    showConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-header">
                    <h3>🍪 הודעה על שימוש בעוגיות</h3>
                    <button class="cookie-close-btn" onclick="cookieConsent.hideBanner()">×</button>
                </div>
                
                <div class="cookie-consent-text">
                    <p>אתר זה משתמש ב-LocalStorage (אחסון מקומי) לשיפור חוויית המשתמש. המידע נשמר מקומית בדפדפן שלך בלבד.</p>
                    <p>בהתאם לתיקון 13, אנו מבקשים את הסכמתך לשימוש באחסון מקומי למטרות הבאות:</p>
                </div>

                <div class="cookie-consent-options">
                    <div class="cookie-option">
                        <input type="checkbox" id="essential-cookies" checked disabled>
                        <label for="essential-cookies">
                            <strong>עוגיות חיוניות</strong> - נדרשות לתפקוד בסיסי של האתר
                        </label>
                    </div>
                    
                    <div class="cookie-option">
                        <input type="checkbox" id="analytics-cookies" checked>
                        <label for="analytics-cookies">
                            <strong>עוגיות אנליטיקס</strong> - עוזרות לנו להבין כיצד משתמשים באתר (מקומי בלבד)
                        </label>
                    </div>
                    
                    <div class="cookie-option">
                        <input type="checkbox" id="marketing-cookies">
                        <label for="marketing-cookies">
                            <strong>עוגיות שיווק</strong> - לא בשימוש באתר זה
                        </label>
                    </div>
                </div>

                <div class="cookie-consent-actions">
                    <button class="cookie-btn cookie-accept-all" onclick="cookieConsent.acceptAll()">
                        קבל הכל
                    </button>
                    <button class="cookie-btn cookie-accept-selected" onclick="cookieConsent.acceptSelected()">
                        קבל נבחרים
                    </button>
                    <button class="cookie-btn cookie-reject" onclick="cookieConsent.rejectAll()">
                        דחה הכל
                    </button>
                    <button class="cookie-btn cookie-preferences" onclick="cookieConsent.showPreferences()">
                        העדפות
                    </button>
                </div>

                <div class="cookie-consent-footer">
                    <p>למידע נוסף, עיין ב<a href="privacy.html" target="_blank">מדיניות הפרטיות</a> שלנו</p>
                    <p>ניתן לשנות את ההעדפות בכל עת דרך כפתור "ניהול עוגיות" בתחתית האתר</p>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        
        // Add styles
        if (!document.getElementById('cookie-consent-styles')) {
            const styles = document.createElement('style');
            styles.id = 'cookie-consent-styles';
            styles.innerHTML = `
                .cookie-consent-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
                    z-index: 10000;
                    padding: 20px;
                    border-top: 3px solid #667eea;
                    animation: slideUp 0.3s ease;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }

                .cookie-consent-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .cookie-consent-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .cookie-consent-header h3 {
                    color: #333;
                    margin: 0;
                }

                .cookie-close-btn {
                    background: none;
                    border: none;
                    font-size: 30px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                }

                .cookie-consent-text {
                    margin-bottom: 20px;
                    color: #555;
                    line-height: 1.6;
                }

                .cookie-consent-options {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .cookie-option {
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                }

                .cookie-option input {
                    margin-left: 10px;
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .cookie-option label {
                    cursor: pointer;
                    color: #444;
                    flex: 1;
                }

                .cookie-consent-actions {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-bottom: 15px;
                }

                .cookie-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .cookie-accept-all {
                    background: #4caf50;
                    color: white;
                }

                .cookie-accept-all:hover {
                    background: #45a049;
                }

                .cookie-accept-selected {
                    background: #667eea;
                    color: white;
                }

                .cookie-accept-selected:hover {
                    background: #5a6fd8;
                }

                .cookie-reject {
                    background: #f44336;
                    color: white;
                }

                .cookie-reject:hover {
                    background: #da190b;
                }

                .cookie-preferences {
                    background: #e0e0e0;
                    color: #333;
                }

                .cookie-preferences:hover {
                    background: #d0d0d0;
                }

                .cookie-consent-footer {
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #e0e0e0;
                    padding-top: 10px;
                }

                .cookie-consent-footer a {
                    color: #667eea;
                    text-decoration: none;
                }

                .cookie-consent-footer a:hover {
                    text-decoration: underline;
                }

                .cookie-manage-btn {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 14px;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                }

                .cookie-manage-btn:hover {
                    background: #5a6fd8;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                }

                @media (max-width: 768px) {
                    .cookie-consent-actions {
                        flex-direction: column;
                    }
                    
                    .cookie-btn {
                        width: 100%;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    acceptAll() {
        this.saveConsent({
            essential: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        });
        this.hideBanner();
        this.showManageButton();
        this.showNotification('הסכמה התקבלה', 'כל העוגיות אושרו');
    }

    acceptSelected() {
        const analytics = document.getElementById('analytics-cookies')?.checked || false;
        const marketing = document.getElementById('marketing-cookies')?.checked || false;
        
        this.saveConsent({
            essential: true,
            analytics: analytics,
            marketing: marketing,
            timestamp: new Date().toISOString(),
            version: '1.0'
        });
        this.hideBanner();
        this.showManageButton();
        this.showNotification('הסכמה התקבלה', 'העדפותיך נשמרו');
    }

    rejectAll() {
        this.saveConsent({
            essential: true, // Essential always enabled
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString(),
            version: '1.0'
        });
        this.hideBanner();
        this.showManageButton();
        this.showNotification('עוגיות נדחו', 'רק עוגיות חיוניות פעילות');
    }

    saveConsent(data) {
        localStorage.setItem(this.consentKey, JSON.stringify(data));
        this.consentData = data;
    }

    withdrawConsent() {
        localStorage.removeItem(this.consentKey);
        this.consentData = null;
        location.reload();
    }

    showPreferences() {
        // Open preferences modal
        alert('פתיחת העדפות עוגיות מפורטות - ניתן לעדכן בכל עת');
        // In production, this would open a detailed preferences modal
    }

    showManageButton() {
        if (!document.getElementById('cookie-manage-button')) {
            const button = document.createElement('button');
            button.id = 'cookie-manage-button';
            button.className = 'cookie-manage-btn';
            button.innerHTML = '🍪 ניהול עוגיות';
            button.onclick = () => this.showConsentBanner();
            document.body.appendChild(button);
        }
    }

    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <strong>${title}</strong><br>
            <small>${message}</small>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getConsentStatus() {
        return this.consentData || {
            essential: true,
            analytics: false,
            marketing: false
        };
    }

    canUseAnalytics() {
        return this.consentData?.analytics === true;
    }

    canUseMarketing() {
        return this.consentData?.marketing === true;
    }
}

// Initialize cookie consent when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.cookieConsent = new CookieConsent();
    });
} else {
    window.cookieConsent = new CookieConsent();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsent;
}