// Main Assessment Engine for Amendment 13 Compliance
// Manages questionnaire flow, state, and UI interactions

class AssessmentEngine {
    constructor() {
        this.questions = window.assessmentQuestions;
        this.calculator = new window.ComplianceCalculator();
        this.currentSectionIndex = 0;
        this.answers = {};
        this.isCompleted = false;
        this.startTime = null;
        
        // Load saved state from localStorage
        this.loadState();
        
        // Initialize UI
        this.initializeUI();
    }

    initializeUI() {
        // Create assessment container if it doesn't exist
        const container = document.getElementById('assessment-container');
        if (!container) {
            console.error('Assessment container not found');
            return;
        }
        
        // Set initial content
        if (this.isCompleted) {
            this.showResults();
        } else if (Object.keys(this.answers).length > 0) {
            this.showResumeDialog();
        } else {
            this.showWelcome();
        }
    }

    showWelcome() {
        const container = document.getElementById('assessment-container');
        container.innerHTML = `
            <div class="assessment-welcome">
                <div class="welcome-card">
                    <h2>ברוכים הבאים להערכה העצמית לתיקון 13</h2>
                    <p>כלי זה יעזור לכם להעריך את מידת המוכנות של הארגון שלכם לעמידה בדרישות תיקון 13 לחוק הגנת הפרטיות.</p>
                    
                    <div class="assessment-benefits">
                        <h3>מה תקבלו בסיום ההערכה:</h3>
                        <ul>
                            <li>📊 ציון עמידה כולל (0-100)</li>
                            <li>⚠️ זיהוי הפרות פוטנציאליות וקנסות</li>
                            <li>📋 המלצות מעשיות לשיפור</li>
                            <li>📄 דוח מפורט להורדה</li>
                            <li>🎯 תוכנית פעולה מותאמת אישית</li>
                        </ul>
                    </div>
                    
                    <div class="assessment-info">
                        <div class="info-item">
                            <span class="info-icon">⏱️</span>
                            <span>זמן משוער: 10-15 דקות</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">💾</span>
                            <span>התשובות נשמרות אוטומטית</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🔒</span>
                            <span>המידע נשאר אצלכם בלבד</span>
                        </div>
                    </div>
                    
                    <div class="assessment-actions">
                        <button class="btn-primary" onclick="assessmentEngine.startAssessment()">
                            התחל הערכה
                        </button>
                        <button class="btn-secondary" onclick="assessmentEngine.loadSampleData()">
                            טען נתונים לדוגמה
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showResumeDialog() {
        const completedCount = Object.keys(this.answers).length;
        const totalQuestions = this.questions.getTotalQuestions();
        const percentage = Math.round((completedCount / totalQuestions) * 100);
        
        const container = document.getElementById('assessment-container');
        container.innerHTML = `
            <div class="assessment-resume">
                <div class="resume-card">
                    <h2>נמצאה הערכה בתהליך</h2>
                    <p>השלמת ${completedCount} מתוך ${totalQuestions} שאלות (${percentage}%)</p>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    
                    <div class="resume-actions">
                        <button class="btn-primary" onclick="assessmentEngine.resumeAssessment()">
                            המשך מהמקום שעצרת
                        </button>
                        <button class="btn-secondary" onclick="assessmentEngine.restartAssessment()">
                            התחל מחדש
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    startAssessment() {
        this.currentSectionIndex = 0;
        this.answers = {};
        this.isCompleted = false;
        this.startTime = new Date().toISOString();
        this.saveState();
        this.showSection(0);
    }

    resumeAssessment() {
        // Find the last answered section
        let lastSection = 0;
        this.questions.sections.forEach((section, index) => {
            const hasAnswers = section.questions.some(q => this.answers[q.id] !== undefined);
            if (hasAnswers) lastSection = index;
        });
        
        this.currentSectionIndex = lastSection;
        this.showSection(lastSection);
    }

    restartAssessment() {
        if (confirm('האם אתה בטוח שברצונך להתחיל מחדש? כל התשובות הקיימות יימחקו.')) {
            this.clearState();
            this.startAssessment();
        }
    }

    showSection(sectionIndex) {
        if (sectionIndex < 0 || sectionIndex >= this.questions.sections.length) {
            this.calculateAndShowResults();
            return;
        }
        
        const section = this.questions.sections[sectionIndex];
        const container = document.getElementById('assessment-container');
        
        // Build section HTML
        let html = `
            <div class="assessment-section">
                <div class="section-header">
                    <div class="progress-indicator">
                        <span>סעיף ${sectionIndex + 1} מתוך ${this.questions.sections.length}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((sectionIndex + 1) / this.questions.sections.length) * 100}%"></div>
                        </div>
                    </div>
                    <h2>${section.icon} ${section.title}</h2>
                    <p class="section-description">${section.description}</p>
                </div>
                
                <div class="questions-container">
                    ${this.renderSectionQuestions(section)}
                </div>
                
                <div class="section-navigation">
                    <button class="btn-secondary" onclick="assessmentEngine.previousSection()" 
                            ${sectionIndex === 0 ? 'disabled' : ''}>
                        הקודם
                    </button>
                    <button class="btn-primary" onclick="assessmentEngine.nextSection()">
                        ${sectionIndex === this.questions.sections.length - 1 ? 'סיים והצג תוצאות' : 'הבא'}
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Restore answers for this section
        this.restoreAnswers(section);
    }

    renderSectionQuestions(section) {
        let html = '';
        
        section.questions.forEach((question, index) => {
            // Check if question should be displayed based on dependencies
            if (!this.shouldShowQuestion(question)) {
                return;
            }
            
            html += `
                <div class="question-block" data-question-id="${question.id}">
                    <label class="question-label">
                        ${question.required ? '<span class="required">*</span>' : ''}
                        ${index + 1}. ${question.text}
                    </label>
            `;
            
            if (question.type === 'select') {
                html += this.renderSelectQuestion(question);
            } else if (question.type === 'multiselect') {
                html += this.renderMultiselectQuestion(question);
            }
            
            html += '</div>';
        });
        
        return html;
    }

    renderSelectQuestion(question) {
        let html = `
            <select class="form-select" data-question-id="${question.id}" 
                    onchange="assessmentEngine.handleAnswer('${question.id}', this.value)">
                <option value="">בחר תשובה...</option>
        `;
        
        question.options.forEach(option => {
            const selected = this.answers[question.id] === option.value ? 'selected' : '';
            html += `<option value="${option.value}" ${selected}>${option.label}</option>`;
        });
        
        html += '</select>';
        return html;
    }

    renderMultiselectQuestion(question) {
        let html = '<div class="checkbox-group">';
        
        question.options.forEach(option => {
            const checked = (this.answers[question.id] || []).includes(option.value) ? 'checked' : '';
            html += `
                <label class="checkbox-label">
                    <input type="checkbox" value="${option.value}" ${checked}
                           data-question-id="${question.id}"
                           onchange="assessmentEngine.handleMultiselectAnswer('${question.id}', this)">
                    <span>${option.label}</span>
                </label>
            `;
        });
        
        html += '</div>';
        return html;
    }

    shouldShowQuestion(question) {
        if (!question.dependsOn) return true;
        
        const dependencyAnswer = this.answers[question.dependsOn];
        if (!dependencyAnswer) return false;
        
        return question.showIf && question.showIf.includes(dependencyAnswer);
    }

    handleAnswer(questionId, value) {
        this.answers[questionId] = value;
        this.saveState();
        
        // Check if we need to update dependent questions
        this.updateDependentQuestions(questionId);
    }

    handleMultiselectAnswer(questionId, checkbox) {
        let current = this.answers[questionId] || [];
        
        if (checkbox.checked) {
            // Handle "none" option
            if (checkbox.value === 'none') {
                current = ['none'];
                // Uncheck all other options
                document.querySelectorAll(`input[data-question-id="${questionId}"]:not([value="none"])`)
                    .forEach(cb => cb.checked = false);
            } else {
                // Remove "none" if other option is selected
                current = current.filter(v => v !== 'none');
                current.push(checkbox.value);
                // Uncheck "none" option
                const noneCheckbox = document.querySelector(`input[data-question-id="${questionId}"][value="none"]`);
                if (noneCheckbox) noneCheckbox.checked = false;
            }
        } else {
            current = current.filter(v => v !== checkbox.value);
        }
        
        this.answers[questionId] = current;
        this.saveState();
    }

    updateDependentQuestions(parentQuestionId) {
        const currentSection = this.questions.sections[this.currentSectionIndex];
        let needsRefresh = false;
        
        currentSection.questions.forEach(question => {
            if (question.dependsOn === parentQuestionId) {
                needsRefresh = true;
            }
        });
        
        if (needsRefresh) {
            this.showSection(this.currentSectionIndex);
        }
    }

    restoreAnswers(section) {
        section.questions.forEach(question => {
            const answer = this.answers[question.id];
            if (!answer) return;
            
            if (question.type === 'select') {
                const select = document.querySelector(`select[data-question-id="${question.id}"]`);
                if (select) select.value = answer;
            } else if (question.type === 'multiselect') {
                const checkboxes = document.querySelectorAll(`input[data-question-id="${question.id}"]`);
                checkboxes.forEach(cb => {
                    cb.checked = answer.includes(cb.value);
                });
            }
        });
    }

    validateSection() {
        const section = this.questions.sections[this.currentSectionIndex];
        let isValid = true;
        let firstError = null;
        
        section.questions.forEach(question => {
            if (!this.shouldShowQuestion(question)) return;
            
            if (question.required && !this.answers[question.id]) {
                isValid = false;
                if (!firstError) firstError = question.id;
                
                // Highlight error
                const questionBlock = document.querySelector(`[data-question-id="${question.id}"]`);
                if (questionBlock) {
                    questionBlock.classList.add('error');
                }
            }
        });
        
        if (!isValid && firstError) {
            alert('אנא מלא את כל השדות החובה המסומנים ב-*');
            document.querySelector(`[data-question-id="${firstError}"]`)?.scrollIntoView({ behavior: 'smooth' });
        }
        
        return isValid;
    }

    nextSection() {
        if (this.validateSection()) {
            this.currentSectionIndex++;
            
            if (this.currentSectionIndex >= this.questions.sections.length) {
                this.calculateAndShowResults();
            } else {
                this.showSection(this.currentSectionIndex);
            }
        }
    }

    previousSection() {
        if (this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            this.showSection(this.currentSectionIndex);
        }
    }

    calculateAndShowResults() {
        // Show loading
        const container = document.getElementById('assessment-container');
        container.innerHTML = `
            <div class="assessment-loading">
                <div class="spinner"></div>
                <h3>מחשב תוצאות...</h3>
                <p>מנתח ${Object.keys(this.answers).length} תשובות</p>
            </div>
        `;
        
        // Calculate results
        setTimeout(() => {
            const results = this.calculator.calculateCompliance(this.answers, this.questions);
            this.isCompleted = true;
            this.saveResults(results);
            this.displayResults(results);
        }, 1500);
    }

    displayResults(results) {
        const container = document.getElementById('assessment-container');
        const reportGenerator = new AssessmentReportGenerator();
        container.innerHTML = reportGenerator.generateResultsHTML(results, this.answers);
        
        // Scroll to top of results
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    loadSampleData() {
        // Load sample answers for demonstration
        this.answers = {
            org_type: 'public',
            data_subjects_count: '100k_500k',
            sensitive_data: ['medical', 'biometric'],
            annual_revenue: 'large',
            dpo_appointed: 'process',
            database_registered: 'partial',
            database_documentation: 'outdated',
            security_level: 'medium',
            security_measures: ['encryption', 'access_control', 'backup'],
            security_officer: 'yes',
            security_training: 'old',
            privacy_notice: 'partial',
            access_requests: 'partial',
            consent_management: 'no',
            lawful_processing: 'mostly',
            purpose_limitation: 'mostly',
            data_minimization: 'partial',
            third_party_agreements: 'partial'
        };
        
        this.saveState();
        this.calculateAndShowResults();
    }

    // State management
    saveState() {
        const state = {
            answers: this.answers,
            currentSectionIndex: this.currentSectionIndex,
            isCompleted: this.isCompleted,
            startTime: this.startTime,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('tikun13_assessment', JSON.stringify(state));
    }

    loadState() {
        const saved = localStorage.getItem('tikun13_assessment');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.answers = state.answers || {};
                this.currentSectionIndex = state.currentSectionIndex || 0;
                this.isCompleted = state.isCompleted || false;
                this.startTime = state.startTime;
            } catch (e) {
                console.error('Failed to load saved state:', e);
            }
        }
    }

    clearState() {
        localStorage.removeItem('tikun13_assessment');
        localStorage.removeItem('tikun13_assessment_results');
        this.answers = {};
        this.currentSectionIndex = 0;
        this.isCompleted = false;
        this.startTime = null;
    }

    saveResults(results) {
        const resultsData = {
            results,
            answers: this.answers,
            timestamp: new Date().toISOString(),
            completionTime: this.startTime ? 
                Math.round((new Date() - new Date(this.startTime)) / 1000 / 60) : null
        };
        
        localStorage.setItem('tikun13_assessment_results', JSON.stringify(resultsData));
    }

    showResults() {
        const saved = localStorage.getItem('tikun13_assessment_results');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.displayResults(data.results);
            } catch (e) {
                console.error('Failed to load saved results:', e);
                this.showWelcome();
            }
        } else {
            this.showWelcome();
        }
    }
    
    // Download HTML Report
    downloadHTML() {
        const reportGenerator = new AssessmentReportGenerator();
        const savedResults = localStorage.getItem('tikun13_assessment_results');
        
        if (!savedResults) {
            alert('אין תוצאות להורדה');
            return;
        }
        
        const data = JSON.parse(savedResults);
        reportGenerator.results = data.results;
        reportGenerator.answers = data.answers;
        
        const htmlContent = reportGenerator.generatePDFContent();
        
        // Create blob and download
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tikun13-assessment-${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('הדוח הורד בהצלחה כקובץ HTML. ניתן לפתוח אותו בדפדפן או להדפיס כ-PDF.');
    }
    
    // Share Results
    shareResults() {
        const savedResults = localStorage.getItem('tikun13_assessment_results');
        if (!savedResults) return;
        
        const data = JSON.parse(savedResults);
        const shareText = `דוח עמידה בתיקון 13:\nציון: ${data.results.score}%\nרמת סיכון: ${data.results.riskLevel.label}\nהפרות: ${data.results.violations.length}\nקנסות פוטנציאליים: ₪${data.results.totalFines.toLocaleString()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'דוח עמידה בתיקון 13',
                text: shareText
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(shareText)
                .then(() => alert('התוצאות הועתקו ללוח'))
                .catch(err => console.error('Failed to copy:', err));
        }
    }
    
    // Download Action Plan
    downloadActionPlan() {
        const reportGenerator = new AssessmentReportGenerator();
        const savedResults = localStorage.getItem('tikun13_assessment_results');
        
        if (!savedResults) {
            alert('אין תוצאות ליצירת תוכנית פעולה');
            return;
        }
        
        const data = JSON.parse(savedResults);
        reportGenerator.results = data.results;
        reportGenerator.answers = data.answers;
        
        const actionPlan = reportGenerator.generateActionPlan();
        
        // Download as text file
        const blob = new Blob([actionPlan], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tikun13-action-plan-${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the assessment page
    if (document.getElementById('assessment-container')) {
        window.assessmentEngine = new AssessmentEngine();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssessmentEngine;
} else {
    window.AssessmentEngine = AssessmentEngine;
}