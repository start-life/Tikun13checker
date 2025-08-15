// Report Generator for Amendment 13 Compliance Assessment
// Generates HTML and PDF reports from assessment results

class AssessmentReportGenerator {
    constructor() {
        this.results = null;
        this.answers = null;
    }

    generateResultsHTML(results, answers) {
        this.results = results;
        this.answers = answers;
        
        return `
            <div class="assessment-results" id="assessment-report">
                ${this.generateHeader()}
                ${this.generateScoreSection()}
                ${this.generateFinesSection()}
                ${this.generateRecommendationsSection()}
                ${this.generateComplianceMatrixSection()}
                ${this.generateActionButtons()}
            </div>
        `;
    }

    generateHeader() {
        return `
            <div class="results-header">
                <h1>דוח עמידה בתיקון 13 לחוק הגנת הפרטיות</h1>
                <p class="report-date">תאריך: ${new Date().toLocaleDateString('he-IL')}</p>
                <p class="report-organization">${this.getOrganizationDescription()}</p>
            </div>
        `;
    }

    getOrganizationDescription() {
        const orgTypes = {
            public: 'גוף ציבורי',
            private: 'חברה פרטית',
            databroker: 'סוחר נתונים',
            security: 'גוף ביטחוני',
            financial: 'מוסד פיננסי',
            healthcare: 'מוסד רפואי'
        };
        
        const dataCounts = {
            less_10k: 'פחות מ-10,000 נושאי מידע',
            '10k_100k': '10,000-100,000 נושאי מידע',
            '100k_500k': '100,000-500,000 נושאי מידע',
            '500k_1m': '500,000-1,000,000 נושאי מידע',
            over_1m: 'מעל מיליון נושאי מידע'
        };
        
        const orgType = orgTypes[this.answers.org_type] || 'ארגון';
        const dataCount = dataCounts[this.answers.data_subjects_count] || '';
        
        return `${orgType} | ${dataCount}`;
    }

    generateScoreSection() {
        const { score, riskLevel } = this.results;
        const scoreClass = this.getScoreClass(score);
        
        return `
            <div class="score-section">
                <div class="score-container">
                    <div class="score-circle ${scoreClass}" style="--score-color: ${riskLevel.color}">
                        <svg viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" fill="none" stroke="#e0e0e0" stroke-width="10"/>
                            <circle cx="100" cy="100" r="90" fill="none" stroke="${riskLevel.color}" 
                                    stroke-width="10" stroke-dasharray="${score * 5.65} 565" 
                                    transform="rotate(-90 100 100)"/>
                        </svg>
                        <div class="score-text">
                            <span class="score-value">${score}</span>
                            <span class="score-label">ציון עמידה</span>
                        </div>
                    </div>
                    
                    <div class="risk-indicator">
                        <h3>רמת סיכון: <span style="color: ${riskLevel.color}">${riskLevel.label}</span></h3>
                        <p class="risk-description">${riskLevel.description}</p>
                        <div class="risk-bar">
                            <div class="risk-fill" style="width: ${Math.min(100, this.results.riskScore)}%; background: ${riskLevel.color}"></div>
                        </div>
                    </div>
                </div>
                
                <div class="score-interpretation">
                    ${this.getScoreInterpretation(score)}
                </div>
            </div>
        `;
    }

    getScoreClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    getScoreInterpretation(score) {
        if (score >= 80) {
            return `
                <div class="interpretation success">
                    <h4>מצוין! 🎉</h4>
                    <p>הארגון שלכם מוכן היטב לתיקון 13. המשיכו לשמור על הסטנדרטים הגבוהים.</p>
                </div>
            `;
        } else if (score >= 60) {
            return `
                <div class="interpretation warning">
                    <h4>טוב, אך יש מקום לשיפור 📈</h4>
                    <p>הארגון בדרך הנכונה, אך נדרשות פעולות נוספות לעמידה מלאה בדרישות.</p>
                </div>
            `;
        } else if (score >= 40) {
            return `
                <div class="interpretation caution">
                    <h4>נדרשים שיפורים משמעותיים ⚠️</h4>
                    <p>קיימים פערים משמעותיים שיש לטפל בהם בהקדם לפני כניסת החוק לתוקף.</p>
                </div>
            `;
        } else {
            return `
                <div class="interpretation danger">
                    <h4>מצב קריטי - נדרשת פעולה מיידית! 🚨</h4>
                    <p>הארגון חשוף לסיכונים משמעותיים. יש להתחיל בתוכנית היערכות מקיפה מיידית.</p>
                </div>
            `;
        }
    }

    generateFinesSection() {
        const { violations, totalFines } = this.results;
        
        if (violations.length === 0) {
            return `
                <div class="fines-section success">
                    <h2>✅ לא זוהו הפרות פוטנציאליות</h2>
                    <p>בהתבסס על התשובות שלכם, לא זוהו הפרות ברורות של דרישות החוק.</p>
                </div>
            `;
        }
        
        return `
            <div class="fines-section">
                <h2>חשיפה לעיצומים כספיים</h2>
                <div class="total-fine">
                    <span class="fine-label">סך חשיפה פוטנציאלית:</span>
                    <span class="fine-amount">₪${totalFines.toLocaleString()}</span>
                </div>
                
                <div class="violations-list">
                    <h3>הפרות שזוהו:</h3>
                    ${violations.map(violation => `
                        <div class="violation-item ${violation.severity}">
                            <div class="violation-header">
                                <span class="violation-severity-badge ${violation.severity}">
                                    ${this.getSeverityLabel(violation.severity)}
                                </span>
                                <span class="violation-fine">₪${violation.fine.toLocaleString()}</span>
                            </div>
                            <div class="violation-desc">${violation.description}</div>
                            ${violation.law_reference ? `
                                <div class="violation-reference">
                                    <small>📖 ${violation.law_reference}</small>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="fines-disclaimer">
                    <p><strong>הערה:</strong> הקנסות המוצגים הם הערכה בלבד. הקנסות בפועל נקבעים על ידי הרשות להגנת הפרטיות בהתאם לנסיבות הספציפיות.</p>
                </div>
            </div>
        `;
    }

    getSeverityLabel(severity) {
        const labels = {
            high: 'חמור',
            medium: 'בינוני',
            low: 'קל',
            critical: 'קריטי'
        };
        return labels[severity] || severity;
    }

    generateRecommendationsSection() {
        const { recommendations } = this.results;
        
        if (recommendations.length === 0) {
            return '';
        }
        
        // Group recommendations by priority
        const critical = recommendations.filter(r => r.priority === 'critical');
        const high = recommendations.filter(r => r.priority === 'high');
        const medium = recommendations.filter(r => r.priority === 'medium');
        const low = recommendations.filter(r => r.priority === 'low');
        
        return `
            <div class="recommendations-section">
                <h2>המלצות לתיקון</h2>
                
                ${critical.length > 0 ? `
                    <div class="priority-group critical">
                        <h3>🔴 פעולות קריטיות - דורשות טיפול מיידי</h3>
                        ${this.renderRecommendations(critical)}
                    </div>
                ` : ''}
                
                ${high.length > 0 ? `
                    <div class="priority-group high">
                        <h3>🟠 עדיפות גבוהה - תוך 30 ימים</h3>
                        ${this.renderRecommendations(high)}
                    </div>
                ` : ''}
                
                ${medium.length > 0 ? `
                    <div class="priority-group medium">
                        <h3>🟡 עדיפות בינונית - תוך 60 ימים</h3>
                        ${this.renderRecommendations(medium)}
                    </div>
                ` : ''}
                
                ${low.length > 0 ? `
                    <div class="priority-group low">
                        <h3>🟢 עדיפות נמוכה - תוך 120 ימים</h3>
                        ${this.renderRecommendations(low)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderRecommendations(recommendations) {
        return recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="rec-header">
                    <span class="rec-category">${this.getCategoryLabel(rec.category)}</span>
                    <span class="rec-timeline">⏱️ ${rec.timeline}</span>
                </div>
                <div class="rec-action">${rec.action}</div>
                ${rec.description ? `<div class="rec-description">${rec.description}</div>` : ''}
            </div>
        `).join('');
    }

    getCategoryLabel(category) {
        const labels = {
            dpo: 'ממונה הגנת פרטיות',
            registration: 'רישום מאגרים',
            security: 'אבטחת מידע',
            transparency: 'שקיפות',
            training: 'הדרכה',
            documentation: 'תיעוד',
            policy: 'מדיניות',
            principles: 'עקרונות',
            consent: 'הסכמה',
            rights: 'זכויות',
            processing: 'עיבוד מידע'
        };
        return labels[category] || category;
    }

    generateComplianceMatrixSection() {
        const { complianceMatrix } = this.results;
        
        return `
            <div class="compliance-matrix">
                <h2>מטריצת עמידה בדרישות</h2>
                <table class="compliance-table">
                    <thead>
                        <tr>
                            <th>תחום</th>
                            <th>סטטוס</th>
                            <th>דרישה</th>
                            <th>עמידה</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(complianceMatrix).map(([key, item]) => `
                            <tr>
                                <td>${this.getMatrixCategoryLabel(key)}</td>
                                <td class="${item.compliant ? 'status-ok' : 'status-fail'}">
                                    ${item.status}
                                </td>
                                <td>${item.requirement}</td>
                                <td>${item.compliant ? '✅ עומד' : '❌ לא עומד'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getMatrixCategoryLabel(key) {
        const labels = {
            dpo: 'ממונה הגנת פרטיות',
            registration: 'רישום מאגרים',
            security: 'אבטחת מידע',
            rights: 'זכויות נושאי מידע',
            documentation: 'תיעוד',
            consent: 'ניהול הסכמות'
        };
        return labels[key] || key;
    }

    generateActionButtons() {
        return `
            <div class="action-buttons">
                <button class="btn-primary" onclick="assessmentEngine.downloadPDF()">
                    📥 הורד דוח PDF
                </button>
                <button class="btn-primary" onclick="assessmentEngine.shareResults()">
                    📤 שתף תוצאות
                </button>
                <button class="btn-secondary" onclick="assessmentEngine.downloadActionPlan()">
                    📋 הורד תוכנית פעולה
                </button>
                <button class="btn-secondary" onclick="assessmentEngine.restartAssessment()">
                    🔄 התחל הערכה חדשה
                </button>
                <button class="btn-secondary" onclick="showAssessmentSection(false)">
                    🏠 חזור לעמוד הראשי
                </button>
            </div>
        `;
    }

    generatePDFContent() {
        // Simplified HTML for PDF generation
        return `
            <!DOCTYPE html>
            <html lang="he" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>דוח עמידה בתיקון 13</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        direction: rtl;
                        padding: 20px;
                    }
                    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                    h2 { color: #34495e; margin-top: 30px; }
                    h3 { color: #7f8c8d; }
                    .score-section { background: #ecf0f1; padding: 20px; border-radius: 10px; margin: 20px 0; }
                    .violation-item { background: #fff5f5; border-right: 4px solid #e74c3c; padding: 10px; margin: 10px 0; }
                    .recommendation-item { background: #f0f8ff; border-right: 4px solid #3498db; padding: 10px; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: right; }
                    th { background: #34495e; color: white; }
                    .status-ok { color: #27ae60; font-weight: bold; }
                    .status-fail { color: #e74c3c; font-weight: bold; }
                    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #bdc3c7; text-align: center; }
                </style>
            </head>
            <body>
                ${this.generateHeader()}
                
                <div class="score-section">
                    <h2>ציון עמידה: ${this.results.score}%</h2>
                    <p>רמת סיכון: ${this.results.riskLevel.label}</p>
                    <p>${this.results.riskLevel.description}</p>
                </div>
                
                ${this.results.totalFines > 0 ? `
                    <h2>חשיפה לקנסות: ₪${this.results.totalFines.toLocaleString()}</h2>
                    ${this.results.violations.map(v => `
                        <div class="violation-item">
                            <strong>${v.description}</strong><br>
                            קנס משוער: ₪${v.fine.toLocaleString()}<br>
                            ${v.law_reference ? `סימוכין: ${v.law_reference}` : ''}
                        </div>
                    `).join('')}
                ` : ''}
                
                <h2>המלצות לשיפור</h2>
                ${this.results.recommendations.map(rec => `
                    <div class="recommendation-item">
                        <strong>${rec.action}</strong><br>
                        עדיפות: ${rec.priority} | זמן יעד: ${rec.timeline}
                    </div>
                `).join('')}
                
                <h2>מטריצת עמידה</h2>
                <table>
                    <thead>
                        <tr>
                            <th>תחום</th>
                            <th>סטטוס</th>
                            <th>עמידה</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(this.results.complianceMatrix).map(([key, item]) => `
                            <tr>
                                <td>${this.getMatrixCategoryLabel(key)}</td>
                                <td>${item.status}</td>
                                <td class="${item.compliant ? 'status-ok' : 'status-fail'}">
                                    ${item.compliant ? 'עומד' : 'לא עומד'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>דוח זה נוצר על ידי כלי הערכה עצמית לתיקון 13</p>
                    <p>פותח על ידי IONSEC.IO | ${new Date().toLocaleDateString('he-IL')}</p>
                    <p><strong>הערה:</strong> דוח זה מספק הערכה ראשונית בלבד ואינו מהווה ייעוץ משפטי</p>
                </div>
            </body>
            </html>
        `;
    }

    generateActionPlan() {
        const { recommendations, violations } = this.results;
        
        // Sort recommendations by priority and timeline
        const sortedRecs = [...recommendations].sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        let plan = `תוכנית פעולה להיערכות לתיקון 13\n`;
        plan += `${'='.repeat(50)}\n\n`;
        plan += `תאריך: ${new Date().toLocaleDateString('he-IL')}\n`;
        plan += `ארגון: ${this.getOrganizationDescription()}\n`;
        plan += `ציון עמידה נוכחי: ${this.results.score}%\n\n`;
        
        if (violations.length > 0) {
            plan += `הפרות שזוהו:\n`;
            plan += `${'-'.repeat(30)}\n`;
            violations.forEach(v => {
                plan += `• ${v.description} (קנס פוטנציאלי: ₪${v.fine.toLocaleString()})\n`;
            });
            plan += `\n`;
        }
        
        plan += `פעולות נדרשות:\n`;
        plan += `${'='.repeat(50)}\n\n`;
        
        let actionNumber = 1;
        sortedRecs.forEach(rec => {
            plan += `${actionNumber}. ${rec.action}\n`;
            plan += `   עדיפות: ${rec.priority === 'critical' ? 'קריטית' : rec.priority === 'high' ? 'גבוהה' : rec.priority === 'medium' ? 'בינונית' : 'נמוכה'}\n`;
            plan += `   זמן יעד: ${rec.timeline}\n`;
            if (rec.description) {
                plan += `   הערות: ${rec.description}\n`;
            }
            plan += `\n`;
            actionNumber++;
        });
        
        plan += `\nסיכום:\n`;
        plan += `${'-'.repeat(30)}\n`;
        plan += `סך הכל ${sortedRecs.length} פעולות לביצוע\n`;
        plan += `תאריך יעד סופי: 14 באוגוסט 2025\n\n`;
        
        plan += `הערות חשובות:\n`;
        plan += `• תוכנית זו מבוססת על הערכה עצמית ואינה מהווה ייעוץ משפטי\n`;
        plan += `• מומלץ להיוועץ בעורך דין המתמחה בדיני פרטיות\n`;
        plan += `• יש לעדכן את התוכנית בהתאם להתפתחויות והנחיות הרשות להגנת הפרטיות\n`;
        
        return plan;
    }
}

// Add methods to AssessmentEngine for report actions
AssessmentEngine.prototype.downloadPDF = async function() {
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
    
    alert('הדוח הורד בהצלחה. ניתן להדפיס אותו כ-PDF מהדפדפן.');
};

AssessmentEngine.prototype.shareResults = function() {
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
};

AssessmentEngine.prototype.downloadActionPlan = function() {
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
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssessmentReportGenerator;
} else {
    window.AssessmentReportGenerator = AssessmentReportGenerator;
}