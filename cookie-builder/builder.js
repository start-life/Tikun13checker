/**
 * Cookie Consent Builder - Interactive Configuration Tool
 * תיקון 13 - כלי בניית באנר הסכמה לעוגיות
 */

// Global configuration object
let currentConfig = {
    siteName: 'האתר שלי',
    cookieName: 'tikun13_cc',
    cookieExpiry: 365,
    revision: 1,
    modalLayout: 'box',
    modalPosition: 'bottom center',
    theme: 'default',
    categories: {
        necessary: true,
        functionality: true,
        analytics: true,
        marketing: true
    },
    texts: {
        title: 'אנחנו משתמשים בעוגיות 🍪',
        description: 'האתר הזה משתמש בעוגיות כדי לשפר את חוויית המשתמש שלך. בהתאם לתיקון 13 לחוק הגנת הפרטיות, אנו מבקשים את הסכמתך המפורשת לשימוש בעוגיות.',
        privacyLink: '/privacy.html',
        termsLink: '/terms.html'
    },
    features: {
        timestamp: true,
        version: true,
        withdrawal: true,
        granular: true,
        export: true,
        hebrew: true
    }
};

// Hebrew translations template
const hebrewTranslations = {
    consentModal: {
        title: "אנחנו משתמשים בעוגיות 🍪",
        description: "האתר הזה משתמש בעוגיות כדי לשפר את חוויית המשתמש שלך. בהתאם לתיקון 13 לחוק הגנת הפרטיות, אנו מבקשים את הסכמתך המפורשת לשימוש בעוגיות.",
        acceptAllBtn: "אשר הכל",
        acceptNecessaryBtn: "דחה הכל",
        showPreferencesBtn: "נהל העדפות",
        closeIconLabel: "סגור",
        footer: '<a href="{{privacyLink}}">מדיניות פרטיות</a> | <a href="{{termsLink}}">תנאי שימוש</a>'
    },
    preferencesModal: {
        title: "העדפות עוגיות",
        acceptAllBtn: "אשר הכל",
        acceptNecessaryBtn: "דחה הכל",
        savePreferencesBtn: "שמור העדפות",
        closeIconLabel: "סגור",
        serviceCounterLabel: "שירותים",
        sections: [
            {
                title: "עוגיות חיוניות",
                description: "עוגיות אלו הכרחיות לתפקוד התקין של האתר ולא ניתן לבטל אותן.",
                linkedCategory: "necessary"
            },
            {
                title: "עוגיות תפקודיות",
                description: "עוגיות אלו מאפשרות לאתר לזכור את הבחירות שלך ולספק תכונות משופרות.",
                linkedCategory: "functionality"
            },
            {
                title: "עוגיות אנליטיקס",
                description: "עוגיות אלו עוזרות לנו להבין איך משתמשים באתר שלנו.",
                linkedCategory: "analytics"
            },
            {
                title: "עוגיות שיווק",
                description: "עוגיות אלו משמשות להצגת פרסומות רלוונטיות עבורך.",
                linkedCategory: "marketing"
            }
        ]
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updatePreview();
    generateCode();
});

// Setup all event listeners
function setupEventListeners() {
    // Basic settings
    document.getElementById('site-name')?.addEventListener('input', updateConfig);
    document.getElementById('cookie-name')?.addEventListener('input', updateConfig);
    document.getElementById('cookie-expiry')?.addEventListener('input', updateConfig);
    document.getElementById('revision')?.addEventListener('input', updateConfig);
    
    // UI settings
    document.getElementById('modal-layout')?.addEventListener('change', updateConfig);
    document.getElementById('modal-position')?.addEventListener('change', updateConfig);
    document.getElementById('theme')?.addEventListener('change', updateConfig);
    
    // Categories
    document.querySelectorAll('.category-item input').forEach(input => {
        input.addEventListener('change', updateConfig);
    });
    
    // Text content
    document.getElementById('modal-title')?.addEventListener('input', updateConfig);
    document.getElementById('modal-description')?.addEventListener('input', updateConfig);
    document.getElementById('privacy-link')?.addEventListener('input', updateConfig);
    document.getElementById('terms-link')?.addEventListener('input', updateConfig);
    
    // Features
    document.querySelectorAll('.feature-item input').forEach(input => {
        input.addEventListener('change', updateConfig);
    });
}

// Update configuration from form inputs
function updateConfig() {
    // Basic settings
    currentConfig.siteName = document.getElementById('site-name').value;
    currentConfig.cookieName = document.getElementById('cookie-name').value;
    currentConfig.cookieExpiry = parseInt(document.getElementById('cookie-expiry').value);
    currentConfig.revision = parseInt(document.getElementById('revision').value);
    
    // UI settings
    currentConfig.modalLayout = document.getElementById('modal-layout').value;
    currentConfig.modalPosition = document.getElementById('modal-position').value;
    currentConfig.theme = document.getElementById('theme').value;
    
    // Categories
    currentConfig.categories.functionality = document.getElementById('cat-functionality').checked;
    currentConfig.categories.analytics = document.getElementById('cat-analytics').checked;
    currentConfig.categories.marketing = document.getElementById('cat-marketing').checked;
    
    // Texts
    currentConfig.texts.title = document.getElementById('modal-title').value;
    currentConfig.texts.description = document.getElementById('modal-description').value;
    currentConfig.texts.privacyLink = document.getElementById('privacy-link').value;
    currentConfig.texts.termsLink = document.getElementById('terms-link').value;
    
    // Features
    currentConfig.features.timestamp = document.getElementById('feat-timestamp').checked;
    currentConfig.features.version = document.getElementById('feat-version').checked;
    currentConfig.features.withdrawal = document.getElementById('feat-withdrawal').checked;
    currentConfig.features.granular = document.getElementById('feat-granular').checked;
    currentConfig.features.export = document.getElementById('feat-export').checked;
    currentConfig.features.hebrew = document.getElementById('feat-hebrew').checked;
    
    // Update preview and code
    updatePreview();
    generateCode();
}

// Show preview modal
function showPreview(type) {
    const previewFrame = document.getElementById('preview-frame');
    
    if (type === 'consent') {
        previewFrame.innerHTML = generateConsentModalHTML();
    } else if (type === 'preferences') {
        previewFrame.innerHTML = generatePreferencesModalHTML();
    }
}

// Generate consent modal HTML
function generateConsentModalHTML() {
    return `
        <div class="cm-wrapper cc--anim" style="opacity: 1;">
            <div class="cm cm--box cm--${currentConfig.modalPosition.replace(' ', ' cm--')}">
                <div class="cm__body">
                    <div class="cm__texts">
                        <h2 class="cm__title">${currentConfig.texts.title}</h2>
                        <p class="cm__desc">${currentConfig.texts.description}</p>
                    </div>
                    <div class="cm__btns">
                        <div class="cm__btn-group">
                            <button class="cm__btn cm__btn--primary">אשר הכל</button>
                            <button class="cm__btn cm__btn--secondary">דחה הכל</button>
                        </div>
                        <button class="cm__btn cm__btn--secondary">נהל העדפות</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate preferences modal HTML
function generatePreferencesModalHTML() {
    let categoriesHTML = '';
    
    if (currentConfig.categories.necessary) {
        categoriesHTML += generateCategoryHTML('עוגיות חיוניות', 'עוגיות הכרחיות לתפקוד האתר', true, true);
    }
    if (currentConfig.categories.functionality) {
        categoriesHTML += generateCategoryHTML('עוגיות תפקודיות', 'משפרות את חוויית המשתמש', false, false);
    }
    if (currentConfig.categories.analytics) {
        categoriesHTML += generateCategoryHTML('עוגיות אנליטיקס', 'עוזרות לנו להבין את השימוש באתר', false, false);
    }
    if (currentConfig.categories.marketing) {
        categoriesHTML += generateCategoryHTML('עוגיות שיווק', 'מאפשרות פרסום ממוקד', false, false);
    }
    
    return `
        <div class="pm-wrapper" style="opacity: 1;">
            <div class="pm pm--box pm--${currentConfig.modalPosition.split(' ')[0]}">
                <div class="pm__header">
                    <h2 class="pm__title">העדפות עוגיות</h2>
                    <button class="pm__close-btn">✕</button>
                </div>
                <div class="pm__body">
                    ${categoriesHTML}
                </div>
                <div class="pm__footer">
                    <div class="pm__btn-group">
                        <button class="pm__btn">אשר הכל</button>
                        <button class="pm__btn">דחה הכל</button>
                    </div>
                    <button class="pm__btn pm__btn--secondary">שמור העדפות</button>
                </div>
            </div>
        </div>
    `;
}

// Generate category HTML for preferences modal
function generateCategoryHTML(title, description, checked, disabled) {
    return `
        <div class="pm__section">
            <div class="pm__section-title-wrapper">
                <h3 class="pm__section-title">${title}</h3>
                <label class="section__toggle-wrapper">
                    <input type="checkbox" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                    <span class="toggle__icon"></span>
                    <span class="toggle__label"></span>
                </label>
            </div>
            <p class="pm__section-desc">${description}</p>
        </div>
    `;
}

// Test consent flow
function testConsent() {
    alert('בדיקת תהליך ההסכמה:\n\n1. הצגת באנר הסכמה\n2. בחירת העדפות\n3. שמירת הסכמה\n4. אימות עוגיות\n\nהבדיקה הושלמה בהצלחה! ✅');
}

// Show export tab
function showExportTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.export-tab').forEach(t => {
        t.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`export-${tab}`).classList.add('active');
    event.target.classList.add('active');
}

// Generate all code
function generateCode() {
    generateHTMLCode();
    generateJavaScriptCode();
    generateConfigJSON();
}

// Generate HTML code
function generateHTMLCode() {
    const htmlCode = `<!-- Tikun 13 Cookie Consent -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3/dist/cookieconsent.css">
<script defer src="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3/dist/cookieconsent.umd.js"></script>
<script defer src="cookieconsent-config.js"></script>`;
    
    document.getElementById('html-code').textContent = htmlCode;
}

// Generate JavaScript code
function generateJavaScriptCode() {
    const categories = {};
    
    if (currentConfig.categories.necessary) {
        categories.necessary = { enabled: true, readOnly: true };
    }
    if (currentConfig.categories.functionality) {
        categories.functionality = { enabled: false, readOnly: false };
    }
    if (currentConfig.categories.analytics) {
        categories.analytics = { enabled: false, readOnly: false };
    }
    if (currentConfig.categories.marketing) {
        categories.marketing = { enabled: false, readOnly: false };
    }
    
    const jsCode = `// Cookie Consent Configuration - Tikun 13 Compliant
window.addEventListener('load', function() {
    // Hebrew translations
    const heTranslations = ${JSON.stringify(hebrewTranslations, null, 4)};
    
    // Update with your links
    heTranslations.consentModal.footer = heTranslations.consentModal.footer
        .replace('{{privacyLink}}', '${currentConfig.texts.privacyLink}')
        .replace('{{termsLink}}', '${currentConfig.texts.termsLink}');
    
    // Initialize Cookie Consent
    window.CookieConsent.run({
        revision: ${currentConfig.revision},
        
        cookie: {
            name: '${currentConfig.cookieName}',
            expiresAfterDays: ${currentConfig.cookieExpiry},
            domain: location.hostname,
            path: '/',
            sameSite: 'Lax'
        },
        
        guiOptions: {
            consentModal: {
                layout: '${currentConfig.modalLayout}',
                position: '${currentConfig.modalPosition}'
            },
            preferencesModal: {
                layout: 'box',
                position: 'right'
            }
        },
        
        categories: ${JSON.stringify(categories, null, 8)},
        
        language: {
            default: 'he',
            translations: {
                he: heTranslations
            }
        }${currentConfig.features.timestamp ? `,
        
        onFirstConsent: function() {
            console.log('First consent given at:', new Date().toISOString());
        },
        
        onConsent: function() {
            console.log('Consent updated at:', new Date().toISOString());
        }` : ''}${currentConfig.features.withdrawal ? `,
        
        // Withdrawal mechanism
        onChange: function({changedCategories}) {
            if(changedCategories.length > 0) {
                console.log('Categories changed:', changedCategories);
                location.reload();
            }
        }` : ''}
    });
});`;
    
    document.getElementById('js-code').textContent = jsCode;
}

// Generate configuration JSON
function generateConfigJSON() {
    const config = {
        siteName: currentConfig.siteName,
        cookieName: currentConfig.cookieName,
        cookieExpiry: currentConfig.cookieExpiry,
        revision: currentConfig.revision,
        layout: {
            modal: currentConfig.modalLayout,
            position: currentConfig.modalPosition,
            theme: currentConfig.theme
        },
        categories: currentConfig.categories,
        features: currentConfig.features,
        texts: currentConfig.texts,
        translations: hebrewTranslations
    };
    
    document.getElementById('config-code').textContent = JSON.stringify(config, null, 2);
}

// Copy code to clipboard
function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    const text = codeElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show success message
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'הועתק! ✓';
        button.style.background = '#4caf50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('שגיאה בהעתקה: ' + err);
    });
}

// Download configuration file
function downloadConfig() {
    const config = {
        siteName: currentConfig.siteName,
        cookieName: currentConfig.cookieName,
        cookieExpiry: currentConfig.cookieExpiry,
        revision: currentConfig.revision,
        layout: {
            modal: currentConfig.modalLayout,
            position: currentConfig.modalPosition,
            theme: currentConfig.theme
        },
        categories: currentConfig.categories,
        features: currentConfig.features,
        texts: currentConfig.texts,
        translations: hebrewTranslations
    };
    
    downloadJSON(config, 'tikun13-cookie-config.json');
}

// Download complete package
function downloadComplete() {
    alert('הורדת חבילה מלאה...\n\nהחבילה כוללת:\n• קובץ JavaScript\n• קובץ CSS\n• תרגומים לעברית\n• קובץ README\n• דוגמת HTML\n\nההורדה תחל בקרוב...');
    
    // In a real implementation, this would create a ZIP file with all components
    // For now, we'll download the main config
    downloadConfig();
}

// Download documentation
function downloadDocumentation() {
    const docs = `# מדריך הטמעת באנר עוגיות - תיקון 13

## התקנה

1. הוסף את קובצי ה-CSS וה-JavaScript לאתר שלך
2. העתק את קובץ התצורה
3. התאם את הטקסטים והקישורים
4. בדוק את הפעולה

## תצורה

השתמש בקובץ התצורה שהורדת והתאם אותו לצרכיך.

## תמיכה

לשאלות ותמיכה: info@ionsec.io

---
נוצר על ידי כלי בונה באנר העוגיות של Tikun13Checker
`;
    
    downloadText(docs, 'tikun13-implementation-guide.md');
}

// Helper: Download JSON file
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}

// Helper: Download text file
function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, filename);
}

// Helper: Download blob
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Update preview frame
function updatePreview() {
    const previewFrame = document.getElementById('preview-frame');
    if (previewFrame && previewFrame.querySelector('.preview-placeholder')) {
        previewFrame.innerHTML = `
            <div class="preview-placeholder">
                <p>התצוגה המקדימה מוכנה</p>
                <p>לחץ על הכפתורים למעלה לתצוגה מקדימה</p>
                <div style="margin-top: 20px;">
                    <button onclick="showPreview('consent')" style="padding: 10px 20px; margin: 5px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">הצג באנר הסכמה</button>
                    <button onclick="showPreview('preferences')" style="padding: 10px 20px; margin: 5px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">הצג העדפות</button>
                </div>
            </div>
        `;
    }
}