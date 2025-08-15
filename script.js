// Global variables to store scan state
let latestScanResults = null;
let lastScannedUrl = null;
let currentScan = null;

// Progress Tracker Class
class ProgressTracker {
    constructor() {
        this.steps = [
            { id: 'connect', label: 'חיבור לאתר', icon: '🌐' },
            { id: 'protocol', label: 'בדיקת פרוטוקול', icon: '🔐' },
            { id: 'fetch', label: 'טעינת תוכן', icon: '📄' },
            { id: 'parse', label: 'ניתוח HTML', icon: '🔍' },
            { id: 'extract', label: 'חילוץ נתונים', icon: '📊' },
            { id: 'ssl', label: 'בדיקת SSL', icon: '🔒' },
            { id: 'cookies', label: 'ניתוח עוגיות', icon: '🍪' },
            { id: 'privacy', label: 'מדיניות פרטיות', icon: '📋' },
            { id: 'hebrew', label: 'תוכן בעברית', icon: '🇮🇱' },
            { id: 'security', label: 'אבטחת מידע', icon: '🛡️' },
            { id: 'score', label: 'חישוב ציון', icon: '📈' },
            { id: 'complete', label: 'סיום', icon: '✅' }
        ];
        this.currentStep = 0;
        this.startTime = Date.now();
        this.stepTimes = {};
        this.elapsedInterval = null;
        this.totalSteps = this.steps.length;
        this.cancelled = false;
    }

    start(url) {
        this.startTime = Date.now();
        this.cancelled = false;
        
        // Update URL display
        const urlDisplay = document.querySelector('.progress-url');
        if (urlDisplay) {
            urlDisplay.textContent = new URL(url).hostname;
        }
        
        // Start elapsed time counter
        this.startElapsedTimer();
        
        // Reset all steps
        this.resetSteps();
        
        // Update initial status
        this.updateStatus('פעיל');
    }

    startElapsedTimer() {
        this.elapsedInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timeDisplay = document.getElementById('elapsed-time');
            if (timeDisplay) {
                timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    resetSteps() {
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('active', 'completed', 'error', 'warning');
            item.querySelector('.step-status').textContent = '⏳';
            item.querySelector('.step-time').textContent = '';
        });
    }

    updateStep(stepId, status = 'active', details = '') {
        if (this.cancelled) return;
        
        const stepIndex = this.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return;
        
        const step = this.steps[stepIndex];
        const stepElement = document.querySelector(`[data-step="${stepId}"]`);
        
        if (!stepElement) return;
        
        // Update previous steps to completed if needed
        for (let i = 0; i < stepIndex; i++) {
            const prevStep = document.querySelector(`[data-step="${this.steps[i].id}"]`);
            if (prevStep && !prevStep.classList.contains('completed')) {
                this.completeStep(this.steps[i].id);
            }
        }
        
        // Update current step
        stepElement.classList.remove('active', 'completed', 'error', 'warning');
        stepElement.classList.add(status);
        
        const statusIcon = stepElement.querySelector('.step-status');
        switch(status) {
            case 'active':
                statusIcon.textContent = '⚡';
                statusIcon.style.animation = 'spin 1s linear infinite';
                this.updateCurrentStepDisplay(step.icon, step.label, details);
                break;
            case 'completed':
                statusIcon.textContent = '✅';
                statusIcon.style.animation = 'none';
                this.stepTimes[stepId] = Date.now();
                const elapsed = ((this.stepTimes[stepId] - this.startTime) / 1000).toFixed(1);
                stepElement.querySelector('.step-time').textContent = `${elapsed}s`;
                break;
            case 'warning':
                statusIcon.textContent = '⚠️';
                statusIcon.style.animation = 'none';
                break;
            case 'error':
                statusIcon.textContent = '❌';
                statusIcon.style.animation = 'none';
                break;
        }
        
        // Update progress percentage
        this.updateProgress((stepIndex + 1) / this.totalSteps * 100);
    }

    completeStep(stepId) {
        this.updateStep(stepId, 'completed');
    }

    updateCurrentStepDisplay(icon, label, details) {
        const currentStepEl = document.querySelector('.progress-current-step');
        if (currentStepEl) {
            currentStepEl.querySelector('.step-icon').textContent = icon;
            currentStepEl.querySelector('.step-text').textContent = details || label;
        }
    }

    updateProgress(percentage) {
        const fill = document.querySelector('.progress-fill');
        const percentageDisplay = document.querySelector('.progress-percentage');
        
        if (fill) {
            fill.style.width = `${percentage}%`;
        }
        
        if (percentageDisplay) {
            percentageDisplay.textContent = `${Math.round(percentage)}%`;
        }
    }

    updateStatus(status) {
        const statusEl = document.getElementById('scan-status');
        if (statusEl) {
            statusEl.textContent = status;
            statusEl.className = status === 'שגיאה' ? 'error' : 
                              status === 'הושלם' ? 'success' : '';
        }
    }

    complete() {
        this.updateStep('complete', 'completed');
        this.updateProgress(100);
        this.updateStatus('הושלם');
        this.stop();
    }

    error(message) {
        this.updateStatus('שגיאה');
        this.updateCurrentStepDisplay('❌', 'שגיאה', message);
        this.stop();
    }

    cancel() {
        this.cancelled = true;
        this.updateStatus('בוטל');
        this.stop();
    }

    stop() {
        if (this.elapsedInterval) {
            clearInterval(this.elapsedInterval);
            this.elapsedInterval = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initConsent();
    initCountdown();
    initFormHandlers();
    initResourceDownloads();
});

// Consent Management
function initConsent() {
    const consentModal = document.getElementById('consent-modal');
    const consentCheckbox = document.getElementById('consent-agree');
    const acceptButton = document.getElementById('accept-consent');
    
    // Check if user has already consented
    if (!localStorage.getItem('tikun13_consent')) {
        // Show consent modal
        consentModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Enable/disable accept button based on checkbox
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', function() {
            acceptButton.disabled = !this.checked;
        });
    }
}

window.acceptConsent = function() {
    // Store consent
    localStorage.setItem('tikun13_consent', 'true');
    localStorage.setItem('tikun13_consent_date', new Date().toISOString());
    
    // Hide modal
    const consentModal = document.getElementById('consent-modal');
    consentModal.classList.remove('show');
    document.body.style.overflow = ''; // Re-enable scrolling
    
    // Focus on URL input
    document.getElementById('website-url')?.focus();
};

window.declineConsent = function() {
    // Redirect to IONSEC website or show goodbye message
    if (confirm('אנו מצטערים שבחרת לא להשתמש בכלי. האם ברצונך לבקר באתר IONSEC.IO למידע נוסף?')) {
        window.location.href = 'https://ionsec.io';
    } else {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
                <div>
                    <h1>תודה על ביקורך</h1>
                    <p>לשימוש בכלי יש לקבל את תנאי השימוש.</p>
                    <p>למידע נוסף: <a href="https://ionsec.io">IONSEC.IO</a></p>
                </div>
            </div>
        `;
    }
};

function initCountdown() {
    const deadlineDate = new Date('2025-08-14T00:00:00');
    const countdownElement = document.getElementById('countdown');
    
    function updateCountdown() {
        const now = new Date();
        const timeRemaining = deadlineDate - now;
        
        if (timeRemaining <= 0) {
            countdownElement.textContent = 'התיקון נכנס לתוקף!';
            return;
        }
        
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        countdownElement.textContent = `${days} ימים, ${hours} שעות ו-${minutes} דקות`;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

function initFormHandlers() {
    const checkerForm = document.getElementById('checker-form');
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (checkerForm) {
        checkerForm.addEventListener('submit', handleWebsiteCheck);
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }
}

async function handleWebsiteCheck(e) {
    e.preventDefault();
    
    // Check consent first
    if (!localStorage.getItem('tikun13_consent')) {
        alert('יש לקבל את תנאי השימוש לפני השימוש בכלי');
        initConsent();
        return;
    }
    
    const urlInput = document.getElementById('website-url');
    let url = urlInput.value.trim();
    
    // Normalize and validate URL
    url = normalizeAndValidateUrl(url);
    
    if (!url) {
        alert('אנא הכנס כתובת אתר תקינה (לדוגמה: example.co.il או https://example.com)');
        return;
    }
    
    // Update input with normalized URL
    urlInput.value = url;
    
    // Create progress tracker
    const progressTracker = new ProgressTracker();
    currentScan = progressTracker;
    
    showLoadingOverlay(true);
    progressTracker.start(url);
    
    try {
        // Pass progress callback to compliance check
        const results = await checkWebsiteCompliance(url, (step, details) => {
            progressTracker.updateStep(step, 'active', details);
        });
        
        console.log('Scan results:', results); // Debug log
        
        if (!results) {
            throw new Error('No results returned from scan');
        }
        
        // Check if scan had errors
        if (results.error) {
            console.error('Scan completed with error:', results.error);
            progressTracker.error('הסריקה הושלמה עם שגיאות');
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Display error UI
            displayError({ message: results.error }, url);
            
            // Store URL for retry
            lastScannedUrl = url;
        } else {
            // Complete the progress successfully
            progressTracker.complete();
            
            // Store results and URL globally
            latestScanResults = results;
            lastScannedUrl = url;
            
            // Wait a moment to show completion
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Display results
            displayResults(results);
            
            // Update checker title for success
            document.getElementById('checker-title').textContent = `תוצאות עבור: ${new URL(url).hostname}`;
            
            // Smooth scroll to results
            document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // ALWAYS show scan controls (success or error)
        document.getElementById('scan-controls').style.display = 'flex';
        
    } catch (error) {
        console.error('Error checking website:', error);
        progressTracker.error(error.message || 'אירעה שגיאה בבדיקת האתר');
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Display error UI
        displayError(error, url);
        
        // Store URL for retry
        lastScannedUrl = url;
        
        // Show scan controls for retry
        document.getElementById('scan-controls').style.display = 'flex';
    } finally {
        showLoadingOverlay(false);
        currentScan = null;
    }
}

function normalizeAndValidateUrl(input) {
    if (!input) return null;
    
    let url = input.trim();
    
    // Remove any whitespace
    url = url.replace(/\s+/g, '');
    
    // Add protocol if missing
    if (!url.match(/^https?:\/\//i)) {
        // Default to https://
        url = 'https://' + url;
    }
    
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        // Israeli TLDs
        const israeliTLDs = [
            '.co.il', '.org.il', '.net.il', '.gov.il',
            '.muni.il', '.ac.il', '.k12.il', '.idf.il',
            '.ישראל', '.israel'
        ];
        
        // Common international TLDs
        const internationalTLDs = [
            '.com', '.org', '.net', '.edu', '.info',
            '.io', '.dev', '.app', '.tech', '.online',
            '.biz', '.me', '.tv', '.cc', '.xyz'
        ];
        
        // Check if it has a valid TLD
        const hasIsraeliTLD = israeliTLDs.some(tld => hostname.endsWith(tld));
        const hasInternationalTLD = internationalTLDs.some(tld => hostname.endsWith(tld));
        
        // Basic domain validation (allows subdomains)
        const domainPattern = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
        const hebrewDomainPattern = /^([א-ת0-9]([א-ת0-9-]{0,61}[א-ת0-9])?\.)+ישראל$/;
        
        // Validate domain structure
        if (!hasIsraeliTLD && !hasInternationalTLD) {
            // Check if it's a valid domain structure anyway
            if (!domainPattern.test(hostname) && !hebrewDomainPattern.test(hostname)) {
                console.warn('Invalid domain structure:', hostname);
                return null;
            }
        }
        
        // Additional validation for localhost and IP addresses (for testing)
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
        
        if (!hasIsraeliTLD && !hasInternationalTLD && !isLocalhost && !isIPAddress) {
            // If no recognized TLD, but valid structure, warn but allow
            console.warn('Unrecognized TLD, but allowing:', hostname);
        }
        
        return url;
    } catch (error) {
        console.error('URL validation error:', error);
        return null;
    }
}

// Keep old function for backward compatibility
function isValidUrl(string) {
    return normalizeAndValidateUrl(string) !== null;
}

function showLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

async function checkWebsiteCompliance(url, progressCallback) {
    try {
        // Use the real scanner with progress callback
        const scanner = new RealWebsiteScanner();
        const results = await scanner.scanWebsite(url, progressCallback);
        
        // Map the results to the expected format
        return {
            url: results.url,
            timestamp: results.timestamp,
            checks: results.compliance,
            compliance: results.compliance,
            overallScore: results.score,
            score: results.score,
            recommendations: results.recommendations,
            risks: results.risks,
            extractedData: results.extractedData,
            websiteContext: results.websiteContext,
            scanDuration: results.scanDuration,
            error: results.error
        };
    } catch (error) {
        console.error('Error in checkWebsiteCompliance:', error);
        // Return a default error result structure
        return {
            url: url,
            timestamp: new Date().toISOString(),
            checks: {
                ssl: {
                    status: 'error',
                    message: 'לא ניתן לבדוק את אישור ה-SSL',
                    recommendation: 'נסה שוב מאוחר יותר'
                },
                cookies: {
                    status: 'error',
                    message: 'לא ניתן לבדוק עוגיות',
                    recommendation: 'נסה שוב מאוחר יותר'
                },
                privacy: {
                    status: 'error',
                    message: 'לא ניתן לבדוק מדיניות פרטיות',
                    recommendation: 'נסה שוב מאוחר יותר'
                },
                hebrew: {
                    status: 'error',
                    message: 'לא ניתן לבדוק תוכן בעברית',
                    recommendation: 'נסה שוב מאוחר יותר'
                }
            },
            overallScore: 0,
            error: true
        };
    }
}

// Removed mock data functions - now using real scanner in real-scanner.js

function displayError(error, url) {
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) return;
    
    // Show the results container
    resultsContainer.style.display = 'block';
    
    // Create error display
    resultsContainer.innerHTML = `
        <div class="error-container">
            <div class="error-icon">❌</div>
            <h3>שגיאה בסריקת האתר</h3>
            <p class="error-url">${url ? new URL(url).hostname : 'האתר המבוקש'}</p>
            
            <div class="error-details">
                <h4>מה קרה?</h4>
                <p>${error?.message || 'לא הצלחנו לגשת לאתר או לנתח את התוכן שלו'}</p>
                
                <h4>סיבות אפשריות:</h4>
                <ul>
                    <li>האתר אינו זמין כרגע</li>
                    <li>כתובת האתר אינה נכונה</li>
                    <li>האתר חוסם סריקות אוטומטיות</li>
                    <li>בעיית חיבור לאינטרנט</li>
                    <li>האתר דורש הרשאות מיוחדות</li>
                </ul>
                
                <h4>מה לעשות?</h4>
                <ul>
                    <li>ודא שכתובת האתר נכונה</li>
                    <li>בדוק שהאתר עובד בדפדפן רגיל</li>
                    <li>נסה שוב בעוד מספר דקות</li>
                </ul>
            </div>
            
            <div class="error-actions">
                <button class="btn-primary" onclick="rescanWebsite()">
                    🔄 נסה שוב
                </button>
                <button class="btn-secondary" onclick="newScan()">
                    🆕 סרוק אתר אחר
                </button>
                <button class="btn-secondary" onclick="document.getElementById('checker-form').scrollIntoView({ behavior: 'smooth' })">
                    ⬆️ חזור לטופס
                </button>
            </div>
            
            <div class="error-footer">
                <p class="error-note">
                    💡 טיפ: אם הבעיה נמשכת, נסה להעתיק את כתובת האתר ישירות משורת הכתובת בדפדפן
                </p>
            </div>
        </div>
    `;
    
    // Always show scan controls on error
    const scanControls = document.getElementById('scan-controls');
    if (scanControls) {
        scanControls.style.display = 'flex';
    }
    
    // Update checker title to show error state
    const checkerTitle = document.getElementById('checker-title');
    if (checkerTitle) {
        checkerTitle.textContent = 'שגיאה בסריקה - נסה שוב';
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
    // Handle both 'checks' and 'compliance' property names
    const checks = results.checks || results.compliance;
    
    // Validate results structure
    if (!results || !checks) {
        console.error('Invalid results structure:', results);
        alert('שגיאה בעיבוד תוצאות הבדיקה');
        return;
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Create new interactive results display
    const resultsHTML = `
        <div class="results-header">
            <h3>תוצאות בדיקת ${results.url}</h3>
            <div class="overall-score ${getScoreClass(results.overallScore || results.score)}">
                <div class="score-circle">
                    <span class="score-number">${results.overallScore || results.score || 0}</span>
                    <span class="score-label">ציון כולל</span>
                </div>
                <div class="score-status">${getScoreStatus(results.overallScore || results.score)}</div>
            </div>
        </div>
        
        <div class="scan-metadata">
            <span>🕐 זמן סריקה: ${new Date(results.timestamp).toLocaleString('he-IL')}</span>
            ${results.scanDuration ? `<span>⏱️ משך: ${(results.scanDuration/1000).toFixed(2)} שניות</span>` : ''}
            ${results.organizationType ? `<span>🏢 סוג ארגון: ${results.organizationType.name}</span>` : ''}
        </div>
        
        ${results.extractedData ? `
        <div class="website-context">
            <h4>📊 מידע שנאסף מהאתר</h4>
            <div class="context-grid">
                ${results.extractedData.metadata ? `
                <div class="context-item">
                    <strong>מטא-דאטה:</strong>
                    <ul>
                        <li>כותרת: ${results.extractedData.metadata.title || 'לא נמצא'}</li>
                        <li>תיאור: ${results.extractedData.metadata.description || 'לא נמצא'}</li>
                        <li>שפה: ${results.extractedData.metadata.language || 'לא מוגדר'}</li>
                    </ul>
                </div>` : ''}
                
                ${results.extractedData.content ? `
                <div class="context-item">
                    <strong>ניתוח תוכן:</strong>
                    <ul>
                        <li>מילים: ${results.extractedData.content.wordCount || 0}</li>
                        <li>עברית: ${results.extractedData.content.hebrewPercentage || 0}%</li>
                        <li>אורך: ${results.extractedData.content.totalLength || 0} תווים</li>
                    </ul>
                </div>` : ''}
                
                ${results.extractedData.scripts && results.extractedData.scripts.length > 0 ? `
                <div class="context-item">
                    <strong>סקריפטים שזוהו:</strong>
                    <ul>
                        ${results.extractedData.scripts.map(s => `<li>${s.name}</li>`).join('')}
                    </ul>
                </div>` : ''}
                
                ${results.extractedData.forms && results.extractedData.forms.length > 0 ? `
                <div class="context-item">
                    <strong>טפסים באתר:</strong>
                    <ul>
                        <li>סה"כ טפסים: ${results.extractedData.forms.length}</li>
                        <li>שדות אימייל: ${results.extractedData.forms.filter(f => f.hasEmailField).length}</li>
                        <li>שדות סיסמה: ${results.extractedData.forms.filter(f => f.hasPasswordField).length}</li>
                    </ul>
                </div>` : ''}
                
                ${results.extractedData.links ? `
                <div class="context-item">
                    <strong>קישורים:</strong>
                    <ul>
                        <li>סה"כ: ${results.extractedData.links.total || 0}</li>
                        <li>חיצוניים: ${results.extractedData.links.external || 0}</li>
                        <li>מדיניות פרטיות: ${results.extractedData.links.privacyLinks?.length || 0}</li>
                    </ul>
                </div>` : ''}
                
                ${results.extractedData.cookies && results.extractedData.cookies.length > 0 ? `
                <div class="context-item">
                    <strong>עוגיות שזוהו:</strong>
                    <ul>
                        ${results.extractedData.cookies.map(c => `<li>${c.name}</li>`).join('')}
                    </ul>
                </div>` : ''}
            </div>
        </div>` : ''}
        
        <div class="results-grid" id="interactive-results">
            <!-- Results will be inserted here -->
        </div>
        
        <div class="recommendations" id="recommendations">
            <h4>המלצות לשיפור</h4>
            <ul id="recommendations-list"></ul>
        </div>
        
        ${results.risks && results.risks.length > 0 ? `
        <div class="risks-section">
            <h4>⚠️ סיכונים שזוהו</h4>
            <div class="risks-list">
                ${results.risks.map(risk => `
                    <div class="risk-item risk-${risk.level}">
                        <strong>${risk.description}</strong>
                        <p>השפעה: ${risk.impact}</p>
                    </div>
                `).join('')}
            </div>
        </div>` : ''}
        
        <div class="raw-data-section">
            <button class="btn-secondary" onclick="toggleRawData()">הצג נתונים גולמיים מלאים 📊</button>
            <div class="download-buttons" style="margin-top: 1rem;">
                <button class="btn-primary" onclick="downloadRawData()">
                    📥 הורד נתונים גולמיים (JSON)
                </button>
                <button class="btn-primary" onclick="downloadReport()">
                    📄 הורד דוח מלא (HTML)
                </button>
            </div>
            <pre id="raw-data" style="display: none;">${JSON.stringify(results, null, 2)}</pre>
        </div>
    `;
    
    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'block';
    
    // Display interactive check results
    const interactiveResults = document.getElementById('interactive-results');
    if (checks.ssl) displayInteractiveCheck(interactiveResults, 'SSL/הצפנה', checks.ssl, 'ssl');
    if (checks.cookies) displayInteractiveCheck(interactiveResults, 'עוגיות', checks.cookies, 'cookies');
    if (checks.privacy) displayInteractiveCheck(interactiveResults, 'מדיניות פרטיות', checks.privacy, 'privacy');
    if (checks.hebrew || checks.transparency) {
        const hebrewCheck = checks.hebrew || {
            status: checks.transparency.status,
            details: checks.transparency.details
        };
        displayInteractiveCheck(interactiveResults, 'תוכן בעברית', hebrewCheck, 'hebrew');
    }
    if (checks.dataRights) displayInteractiveCheck(interactiveResults, 'זכויות נושאי מידע', checks.dataRights, 'rights');
    if (checks.security) displayInteractiveCheck(interactiveResults, 'אבטחת מידע', checks.security, 'security');
    if (checks.consent) displayInteractiveCheck(interactiveResults, 'מנגנוני הסכמה', checks.consent, 'consent');
    
    // Display recommendations
    if (results.recommendations && Array.isArray(results.recommendations)) {
        displayDetailedRecommendations(results.recommendations);
    } else {
        displayRecommendations(checks);
    }
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function displayInteractiveCheck(container, title, check, checkType) {
    if (!check) return;
    
    const status = check.status || 'unknown';
    let statusClass = 'error';
    let statusIcon = '❌';
    let statusText = 'נכשל';
    
    if (status === 'pass' || status === 'compliant') {
        statusClass = 'success';
        statusIcon = '✅';
        statusText = 'עבר';
    } else if (status === 'warning' || status === 'partial') {
        statusClass = 'warning';
        statusIcon = '⚠️';
        statusText = 'חלקי';
    } else if (status === 'fail' || status === 'non-compliant') {
        statusClass = 'error';
        statusIcon = '❌';
        statusText = 'נכשל';
    }
    
    const checkId = `check-${checkType}-${Date.now()}`;
    
    const checkHTML = `
        <div class="interactive-check-item ${statusClass}" id="${checkId}">
            <div class="check-header" onclick="toggleCheckDetails('${checkId}')">
                <div class="check-title">
                    <span class="check-icon">${statusIcon}</span>
                    <h4>${title}</h4>
                </div>
                <div class="check-status">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span class="expand-icon">▼</span>
                </div>
            </div>
            <div class="check-details" style="display: none;">
                ${generateCheckDetails(check, checkType)}
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', checkHTML);
}

function generateCheckDetails(check, checkType) {
    let detailsHTML = '<div class="details-content">';
    
    // Add main message
    if (check.message) {
        detailsHTML += `<p class="main-message"><strong>סטטוס:</strong> ${check.message}</p>`;
    }
    
    // Add recommendation if exists
    if (check.recommendation) {
        detailsHTML += `
            <div class="detail-recommendation">
                <strong>💡 המלצה:</strong>
                <p>${check.recommendation}</p>
            </div>
        `;
    }
    
    // Add specific details based on check type
    if (check.details) {
        detailsHTML += '<div class="technical-details">';
        detailsHTML += '<h5>פרטים טכניים:</h5>';
        
        if (checkType === 'cookies' && check.details.cookieCount !== undefined) {
            detailsHTML += `
                <ul>
                    <li>מספר עוגיות שנמצאו: ${check.details.cookieCount}</li>
                    <li>עוגיות צד שלישי: ${check.details.thirdParty ? 'כן' : 'לא'}</li>
                    ${check.details.hasConsentBanner !== undefined ? 
                        `<li>באנר הסכמה: ${check.details.hasConsentBanner ? '✅ קיים' : '❌ חסר'}</li>` : ''}
                    ${check.details.allowsOptOut !== undefined ? 
                        `<li>אפשרות סירוב: ${check.details.allowsOptOut ? '✅ קיימת' : '❌ חסרה'}</li>` : ''}
                </ul>
            `;
        } else if (checkType === 'privacy' && check.details) {
            if (check.details.requiredSections) {
                detailsHTML += '<ul class="sections-checklist">';
                check.details.requiredSections.forEach(section => {
                    detailsHTML += `
                        <li class="${section.present ? 'present' : 'missing'}">
                            ${section.present ? '✅' : '❌'} ${section.name}
                        </li>
                    `;
                });
                detailsHTML += '</ul>';
            }
            if (check.details.lastUpdated) {
                detailsHTML += `<p>עדכון אחרון: ${check.details.lastUpdated}</p>`;
            }
        } else if (checkType === 'security' && check.details.measures) {
            detailsHTML += '<ul class="security-measures">';
            Object.entries(check.details.measures).forEach(([measure, enabled]) => {
                const measureNames = {
                    encryption: 'הצפנה',
                    accessControl: 'בקרת גישה',
                    auditLogs: 'רישום פעולות',
                    backups: 'גיבויים',
                    incidentResponse: 'תגובה לאירועים',
                    penetrationTesting: 'בדיקות חדירה'
                };
                detailsHTML += `
                    <li class="${enabled ? 'enabled' : 'disabled'}">
                        ${enabled ? '✅' : '❌'} ${measureNames[measure] || measure}
                    </li>
                `;
            });
            detailsHTML += '</ul>';
            if (check.details.complianceLevel) {
                detailsHTML += `<p><strong>רמת התאמה כוללת:</strong> ${check.details.complianceLevel}</p>`;
            }
        } else if (checkType === 'rights' && check.details) {
            detailsHTML += '<ul>';
            if (check.details.accessRight !== undefined) {
                detailsHTML += `<li>זכות עיון: ${check.details.accessRight ? '✅ מיושמת' : '❌ חסרה'}</li>`;
            }
            if (check.details.correctionRight !== undefined) {
                detailsHTML += `<li>זכות תיקון: ${check.details.correctionRight ? '✅ מיושמת' : '❌ חסרה'}</li>`;
            }
            if (check.details.deletionRight !== undefined) {
                detailsHTML += `<li>זכות מחיקה: ${check.details.deletionRight ? '✅ מיושמת' : '❌ חסרה'}</li>`;
            }
            if (check.details.responseTime) {
                detailsHTML += `<li>זמן תגובה: ${check.details.responseTime}</li>`;
            }
            detailsHTML += '</ul>';
        } else {
            // Generic details display
            detailsHTML += '<ul>';
            Object.entries(check.details).forEach(([key, value]) => {
                if (typeof value !== 'object') {
                    detailsHTML += `<li><strong>${key}:</strong> ${value}</li>`;
                }
            });
            detailsHTML += '</ul>';
        }
        
        detailsHTML += '</div>';
    }
    
    // Add raw data viewer
    detailsHTML += `
        <div class="raw-check-data">
            <button class="btn-link" onclick="toggleRawCheckData('${checkType}')">הצג נתונים גולמיים</button>
            <pre id="raw-${checkType}" style="display: none;">${JSON.stringify(check, null, 2)}</pre>
        </div>
    `;
    
    detailsHTML += '</div>';
    return detailsHTML;
}

function toggleCheckDetails(checkId) {
    const checkItem = document.getElementById(checkId);
    const details = checkItem.querySelector('.check-details');
    const expandIcon = checkItem.querySelector('.expand-icon');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        expandIcon.textContent = '▲';
    } else {
        details.style.display = 'none';
        expandIcon.textContent = '▼';
    }
}

function toggleRawCheckData(checkType) {
    const rawData = document.getElementById(`raw-${checkType}`);
    if (rawData) {
        rawData.style.display = rawData.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleRawData() {
    const rawData = document.getElementById('raw-data');
    if (rawData) {
        rawData.style.display = rawData.style.display === 'none' ? 'block' : 'none';
    }
}

function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
}

function getScoreStatus(score) {
    if (score >= 80) return 'מצוין! האתר עומד ברוב הדרישות';
    if (score >= 60) return 'טוב, אך יש מקום לשיפור';
    if (score >= 40) return 'נדרשים שיפורים משמעותיים';
    return 'נדרשת היערכות מיידית';
}

function displayRecommendations(checks) {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;
    
    recommendationsList.innerHTML = '';
    
    for (const check of Object.values(checks)) {
        if (check.recommendation) {
            const li = document.createElement('li');
            li.textContent = check.recommendation;
            recommendationsList.appendChild(li);
        }
    }
    
    const recommendationsSection = document.getElementById('recommendations');
    if (recommendationsList.children.length === 0) {
        recommendationsSection.style.display = 'none';
    } else {
        recommendationsSection.style.display = 'block';
    }
}

function getCategoryTitle(category) {
    const titles = {
        'ssl': 'אבטחת SSL',
        'cookies': 'ניהול עוגיות',
        'privacy': 'מדיניות פרטיות',
        'hebrew': 'תוכן בעברית',
        'security': 'אבטחת מידע',
        'dataCollection': 'איסוף נתונים',
        'transparency': 'שקיפות',
        'consent': 'הסכמה מדעת'
    };
    return titles[category] || category;
}

function displayDetailedRecommendations(recommendations) {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;
    
    recommendationsList.innerHTML = '';
    
    for (const rec of recommendations) {
        const li = document.createElement('li');
        
        // Handle different recommendation formats
        if (typeof rec === 'object' && rec !== null) {
            // Object format recommendation
            let recommendationText = '';
            
            // Check for different possible text fields
            if (rec.action) {
                recommendationText = rec.action;
            } else if (rec.message) {
                recommendationText = rec.message;
            } else if (rec.text) {
                recommendationText = rec.text;
            } else if (rec.description) {
                recommendationText = rec.description;
            }
            
            // Add category prefix if available
            if (rec.category && recommendationText) {
                const categoryTitle = getCategoryTitle(rec.category);
                li.innerHTML = `<strong>${categoryTitle}:</strong> ${recommendationText}`;
            } else if (recommendationText) {
                li.textContent = recommendationText;
            } else {
                // Skip empty recommendations
                continue;
            }
            
            // Apply priority styling
            if (rec.priority === 'high') {
                li.style.color = '#ef4444';
                li.style.fontWeight = '600';
            } else if (rec.priority === 'medium') {
                li.style.color = '#f59e0b';
            }
        } else if (typeof rec === 'string' && rec.trim()) {
            // Simple string recommendation
            li.textContent = rec;
        } else {
            // Skip invalid recommendations
            continue;
        }
        
        recommendationsList.appendChild(li);
    }
    
    const recommendationsSection = document.getElementById('recommendations');
    if (recommendationsList.children.length === 0) {
        recommendationsSection.style.display = 'none';
    } else {
        recommendationsSection.style.display = 'block';
    }
}

function handleNewsletterSignup(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    alert(`תודה על ההרשמה! נשלח עדכונים ל-${email}`);
    e.target.reset();
}

function initResourceDownloads() {
    window.downloadChecklist = function() {
        const checklist = `רשימת תיוג להיערכות לתיקון 13
=====================================

□ מיפוי ותיעוד מאגרי מידע
□ בדיקת חובת רישום מאגרים
□ הכנת מסמכי הגדרת מאגר
□ בחינת הצורך במינוי ממונה הגנת פרטיות
□ עדכון מדיניות פרטיות בעברית
□ הטמעת מנגנון הסכמה לעוגיות
□ יישום אמצעי אבטחת מידע
□ הכנת נהלי דיווח על אירועי אבטחה
□ הטמעת זכויות נושאי מידע
□ הכשרת עובדים

תאריך יעד: 14 באוגוסט 2025`;
        
        downloadTextFile('tikun13-checklist.txt', checklist);
    };
    
    window.downloadTemplate = function() {
        const template = `מדיניות פרטיות - תבנית לדוגמה
==================================

1. כללי
[שם החברה] ("החברה") מכבדת את פרטיותך ומחויבת להגן על המידע האישי שלך בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 ותיקון 13.

2. איסוף מידע
אנו אוספים את סוגי המידע הבאים:
- מידע שאתה מספק באופן ישיר
- מידע שנאסף באופן אוטומטי
- מידע מצדדים שלישיים

3. שימוש במידע
אנו משתמשים במידע שלך למטרות הבאות:
- אספקת השירותים
- שיפור חוויית המשתמש
- עמידה בדרישות החוק

4. זכויותיך
על פי החוק, זכותך:
- לעיין במידע האישי שלך (סעיף 13)
- לתקן מידע שגוי (סעיף 14)
- למחוק מידע בנסיבות מסוימות
- להתנגד לשימושים מסוימים

5. אבטחת מידע
אנו נוקטים באמצעי אבטחה טכנולוגיים וארגוניים להגנה על המידע שלך.

6. יצירת קשר
לשאלות בנושא פרטיות: privacy@example.co.il

עדכון אחרון: [תאריך]`;
        
        downloadTextFile('privacy-policy-template.txt', template);
    };
    
    window.downloadBanner = function() {
        const bannerCode = `<!-- Tikun 13 Cookie Consent Banner -->
<div id="cookie-consent" style="
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #2c3e50;
    color: white;
    padding: 20px;
    text-align: center;
    z-index: 9999;
    direction: rtl;
">
    <div style="max-width: 1200px; margin: 0 auto;">
        <p style="margin: 0 0 15px 0;">
            אתר זה משתמש בעוגיות כדי לשפר את חוויית הגלישה שלך. 
            <a href="/privacy" style="color: #3498db;">למידע נוסף</a>
        </p>
        <div>
            <button onclick="acceptCookies()" style="
                background: #27ae60;
                color: white;
                border: none;
                padding: 10px 30px;
                margin: 0 10px;
                border-radius: 5px;
                cursor: pointer;
            ">אשר הכל</button>
            <button onclick="showCookieSettings()" style="
                background: transparent;
                color: white;
                border: 1px solid white;
                padding: 10px 30px;
                margin: 0 10px;
                border-radius: 5px;
                cursor: pointer;
            ">הגדרות</button>
            <button onclick="rejectCookies()" style="
                background: transparent;
                color: white;
                border: 1px solid white;
                padding: 10px 30px;
                margin: 0 10px;
                border-radius: 5px;
                cursor: pointer;
            ">דחה</button>
        </div>
    </div>
</div>

<script>
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookie-consent').style.display = 'none';
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.getElementById('cookie-consent').style.display = 'none';
}

function showCookieSettings() {
    // פתח חלון הגדרות עוגיות
    alert('הגדרות עוגיות - יש להטמיע לפי הצורך');
}

// בדוק אם המשתמש כבר נתן הסכמה
if (localStorage.getItem('cookieConsent')) {
    document.getElementById('cookie-consent').style.display = 'none';
}
</script>`;
        
        downloadTextFile('cookie-banner.html', bannerCode);
    };
}

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

window.showTerms = function() {
    alert('תנאי השימוש יופיעו כאן');
};

window.showPrivacy = function() {
    alert('מדיניות הפרטיות תופיע כאן');
};

// Download functions
window.downloadRawData = function() {
    if (!latestScanResults) {
        alert('אין תוצאות סריקה להורדה');
        return;
    }
    
    const dataStr = JSON.stringify(latestScanResults, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tikun13-scan-${latestScanResults.websiteContext?.domain || 'website'}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
};

window.downloadReport = function() {
    if (!latestScanResults) {
        alert('אין תוצאות סריקה להורדה');
        return;
    }
    
    const report = generateHTMLReport(latestScanResults);
    const blob = new Blob([report], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tikun13-report-${latestScanResults.websiteContext?.domain || 'website'}-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
};

function generateHTMLReport(results) {
    const scoreClass = getScoreClass(results.score || 0);
    const scoreStatus = getScoreStatus(results.score || 0);
    
    return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>דוח בדיקת תיקון 13 - ${results.url}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .score-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: white;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            margin: 20px auto;
        }
        .section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .check-item {
            padding: 15px;
            margin: 10px 0;
            border-right: 4px solid;
            background: #f9f9f9;
        }
        .success { border-color: #10b981; }
        .warning { border-color: #f59e0b; }
        .error { border-color: #ef4444; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 10px;
            text-align: right;
            border: 1px solid #ddd;
        }
        th {
            background: #f5f5f5;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            margin-top: 40px;
            border-top: 2px solid #ddd;
        }
        .ionsec-branding {
            background: #1e293b;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-top: 30px;
        }
        .ionsec-branding a {
            color: #60a5fa;
            text-decoration: none;
        }
        pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            direction: ltr;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>דוח בדיקת התאמה לתיקון 13</h1>
        <p>חוק הגנת הפרטיות - תיקון מספר 13</p>
        <div class="score-circle">${results.score || 0}</div>
        <p style="text-align: center;">${scoreStatus}</p>
    </div>

    <div class="section">
        <h2>פרטי הסריקה</h2>
        <table>
            <tr><th>כתובת אתר</th><td>${results.url}</td></tr>
            <tr><th>תאריך סריקה</th><td>${new Date(results.timestamp).toLocaleString('he-IL')}</td></tr>
            <tr><th>משך סריקה</th><td>${results.scanDuration ? (results.scanDuration/1000).toFixed(2) + ' שניות' : 'לא זמין'}</td></tr>
            <tr><th>ציון כולל</th><td>${results.score || 0}/100</td></tr>
        </table>
    </div>

    ${results.extractedData ? `
    <div class="section">
        <h2>מידע שנאסף מהאתר</h2>
        <table>
            <tr><th>כותרת</th><td>${results.extractedData.metadata?.title || 'לא נמצא'}</td></tr>
            <tr><th>שפה</th><td>${results.extractedData.metadata?.language || 'לא מוגדר'}</td></tr>
            <tr><th>תוכן בעברית</th><td>${results.extractedData.content?.hebrewPercentage || 0}%</td></tr>
            <tr><th>טפסים</th><td>${results.extractedData.forms?.length || 0}</td></tr>
            <tr><th>עוגיות שזוהו</th><td>${results.extractedData.cookies?.length || 0}</td></tr>
            <tr><th>סקריפטים של צד שלישי</th><td>${results.extractedData.scripts?.length || 0}</td></tr>
        </table>
    </div>` : ''}

    <div class="section">
        <h2>תוצאות בדיקות התאמה</h2>
        ${Object.entries(results.compliance || results.checks || {}).map(([key, check]) => `
            <div class="check-item ${check.status === 'compliant' || check.status === 'pass' ? 'success' : 
                                    check.status === 'partial' || check.status === 'warning' ? 'warning' : 'error'}">
                <h3>${getCheckTitle(key)}</h3>
                <p>סטטוס: ${getStatusText(check.status)}</p>
                ${check.details?.recommendation ? `<p>המלצה: ${check.details.recommendation}</p>` : ''}
            </div>
        `).join('')}
    </div>

    ${results.recommendations && results.recommendations.length > 0 ? `
    <div class="section">
        <h2>המלצות לשיפור</h2>
        <ul>
            ${results.recommendations.map(rec => {
                if (typeof rec === 'object' && rec !== null) {
                    const text = rec.action || rec.message || rec.text || rec.description || '';
                    const category = rec.category ? getCategoryTitle(rec.category) + ': ' : '';
                    const priority = rec.priority ? ` (עדיפות: ${rec.priority === 'high' ? 'גבוהה' : rec.priority === 'medium' ? 'בינונית' : 'נמוכה'})` : '';
                    return text ? `<li><strong>${category}${text}</strong>${priority}</li>` : '';
                } else if (typeof rec === 'string') {
                    return `<li>${rec}</li>`;
                }
                return '';
            }).filter(item => item).join('')}
        </ul>
    </div>` : ''}

    ${results.risks && results.risks.length > 0 ? `
    <div class="section">
        <h2>סיכונים שזוהו</h2>
        ${results.risks.map(risk => `
            <div class="check-item ${risk.level === 'high' ? 'error' : risk.level === 'medium' ? 'warning' : 'success'}">
                <strong>${risk.description}</strong>
                <p>השפעה: ${risk.impact}</p>
            </div>
        `).join('')}
    </div>` : ''}

    <div class="ionsec-branding">
        <h3>פותח על ידי IONSEC.IO</h3>
        <p>פרויקט קוד פתוח לבדיקת התאמה לתיקון 13</p>
        <p>
            <a href="https://ionsec.io" target="_blank">IONSEC.IO</a> | 
            <a href="https://github.com/ionsec" target="_blank">GitHub</a> | 
            <a href="https://linkedin.com/company/ionsec" target="_blank">LinkedIn</a>
        </p>
        <p>לייעוץ מקצועי בנושא אבטחת מידע והגנת פרטיות: info@ionsec.io</p>
    </div>

    <div class="footer">
        <p>דוח זה נוצר באופן אוטומטי ומספק הערכה ראשונית בלבד</p>
        <p>לקבלת ייעוץ מקצועי מלא, מומלץ לפנות למומחה בתחום</p>
        <p>תאריך יצירת הדוח: ${new Date().toLocaleString('he-IL')}</p>
    </div>
</body>
</html>`;
}

function getCheckTitle(key) {
    const titles = {
        ssl: 'אבטחת SSL/HTTPS',
        cookies: 'ניהול עוגיות',
        privacy: 'מדיניות פרטיות',
        hebrew: 'תוכן בעברית',
        dataCollection: 'איסוף מידע',
        security: 'אמצעי אבטחה',
        transparency: 'שקיפות',
        dataRights: 'זכויות נושאי מידע',
        consent: 'מנגנוני הסכמה'
    };
    return titles[key] || key;
}

function getStatusText(status) {
    const statuses = {
        'compliant': 'תואם',
        'partial': 'תואם חלקית',
        'non-compliant': 'לא תואם',
        'pass': 'עבר',
        'warning': 'אזהרה',
        'fail': 'נכשל',
        'error': 'שגיאה'
    };
    return statuses[status] || status;
}

// Cancel scan function
window.cancelScan = function() {
    if (currentScan) {
        currentScan.cancel();
        currentScan = null;
    }
    showLoadingOverlay(false);
};

// Scan Control Functions
window.rescanWebsite = async function() {
    if (!lastScannedUrl) {
        alert('אין כתובת לסריקה חוזרת');
        return;
    }
    
    // Update UI
    document.getElementById('checker-title').textContent = 'מבצע סריקה חוזרת...';
    document.getElementById('website-url').value = lastScannedUrl;
    
    // Trigger form submit
    document.getElementById('checker-form').dispatchEvent(new Event('submit'));
};

window.newScan = function() {
    // Clear the input
    document.getElementById('website-url').value = '';
    
    // Reset title
    document.getElementById('checker-title').textContent = 'בדיקת התאמה חינמית';
    
    // Hide scan controls
    document.getElementById('scan-controls').style.display = 'none';
    
    // Hide results
    document.getElementById('results').style.display = 'none';
    
    // Focus on input
    document.getElementById('website-url').focus();
    
    // Scroll to form
    document.getElementById('checker-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.clearForm = function() {
    // Clear everything
    document.getElementById('website-url').value = '';
    document.getElementById('checker-title').textContent = 'בדיקת התאמה חינמית';
    document.getElementById('scan-controls').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    
    // Clear stored data
    lastScannedUrl = null;
    latestScanResults = null;
    
    // Focus on input
    document.getElementById('website-url').focus();
};