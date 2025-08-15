// Scoring Engine for Amendment 13 Compliance Assessment
// Calculates compliance scores, risk levels, fines, and recommendations

class ComplianceCalculator {
    constructor() {
        this.violations = [];
        this.recommendations = [];
        this.totalScore = 0;
        this.maxScore = 0;
        this.riskScore = 0;
    }

    // Main calculation method
    calculateCompliance(answers, questions) {
        this.reset();
        
        // Process each answered question
        questions.sections.forEach(section => {
            section.questions.forEach(question => {
                const answer = answers[question.id];
                if (answer !== undefined && answer !== null) {
                    this.processAnswer(question, answer, answers);
                }
            });
        });

        // Generate specific violations and recommendations
        this.generateViolations(answers);
        this.generateRecommendations(answers);

        // Calculate final scores
        const compliancePercentage = this.maxScore > 0 
            ? Math.round((this.totalScore / this.maxScore) * 100)
            : 0;

        const riskLevel = this.getRiskLevel(this.riskScore);
        const totalFines = this.violations.reduce((sum, v) => sum + v.fine, 0);

        return {
            score: compliancePercentage,
            riskLevel,
            riskScore: this.riskScore,
            violations: this.violations,
            recommendations: this.recommendations,
            totalFines,
            complianceMatrix: this.generateComplianceMatrix(answers)
        };
    }

    reset() {
        this.violations = [];
        this.recommendations = [];
        this.totalScore = 0;
        this.maxScore = 0;
        this.riskScore = 0;
    }

    processAnswer(question, answer, answers) {
        const weight = question.weight || 1;
        this.maxScore += weight * 5;

        let risk = 0;
        
        if (question.type === 'multiselect') {
            risk = question.calculateRisk 
                ? question.calculateRisk(answer) 
                : this.calculateMultiselectRisk(answer, question);
        } else {
            risk = question.riskFactor && question.riskFactor[answer] 
                ? question.riskFactor[answer] 
                : 0;
        }

        this.riskScore += risk * weight;
        this.totalScore += Math.max(0, (5 - risk)) * weight;
    }

    calculateMultiselectRisk(selected, question) {
        if (!selected || selected.length === 0) return 5;
        if (selected.includes('none')) return 0;
        // Default: more selections = lower risk
        return Math.max(0, 5 - selected.length);
    }

    generateViolations(answers) {
        // DPO violations
        if (answers.dpo_appointed === 'no') {
            const orgType = answers.org_type;
            const dataCount = answers.data_subjects_count;
            
            if (this.requiresDPO(orgType, dataCount)) {
                this.violations.push({
                    severity: 'high',
                    category: 'dpo',
                    description: 'חובת מינוי ממונה הגנת פרטיות לא מולאה',
                    fine: this.calculateDPOFine(orgType, dataCount),
                    law_reference: 'סעיף 17ב לחוק'
                });
            }
        }

        // Database registration violations
        if (answers.database_registered === 'no' || answers.database_registered === 'partial') {
            const orgType = answers.org_type;
            if (this.requiresRegistration(orgType)) {
                this.violations.push({
                    severity: 'high',
                    category: 'registration',
                    description: 'מאגרי מידע לא רשומים כנדרש',
                    fine: this.calculateRegistrationFine(orgType, answers.data_subjects_count),
                    law_reference: 'סעיף 8 לחוק'
                });
            }
        }

        // Privacy notice violations
        if (answers.privacy_notice === 'no') {
            this.violations.push({
                severity: 'medium',
                category: 'transparency',
                description: 'הודעת פרטיות חסרה',
                fine: 50000,
                law_reference: 'סעיף 11 לחוק'
            });
        } else if (answers.privacy_notice === 'outdated' || answers.privacy_notice === 'partial') {
            this.violations.push({
                severity: 'low',
                category: 'transparency',
                description: 'הודעת פרטיות לא מלאה או מעודכנת',
                fine: 25000,
                law_reference: 'סעיף 11 לחוק'
            });
        }

        // Security violations
        if (answers.security_level === 'unknown' || answers.security_level === 'basic') {
            const sensitiveData = answers.sensitive_data || [];
            if (sensitiveData.length > 0 && !sensitiveData.includes('none')) {
                this.violations.push({
                    severity: 'high',
                    category: 'security',
                    description: 'רמת אבטחה לא מספקת למידע רגיש',
                    fine: 100000,
                    law_reference: 'תקנות אבטחת מידע'
                });
            }
        }

        // Consent management violations
        if (answers.consent_management === 'no') {
            this.violations.push({
                severity: 'medium',
                category: 'consent',
                description: 'אין מנגנון ניהול הסכמות',
                fine: 75000,
                law_reference: 'סעיף 2(1) לחוק'
            });
        }

        // Data subject rights violations
        if (answers.access_requests === 'no') {
            this.violations.push({
                severity: 'medium',
                category: 'rights',
                description: 'אין תהליך למימוש זכות עיון',
                fine: 50000,
                law_reference: 'סעיף 13 לחוק'
            });
        }

        // Third party agreements violations
        if (answers.third_party_agreements === 'no' && answers.third_party_agreements !== 'na') {
            this.violations.push({
                severity: 'medium',
                category: 'processing',
                description: 'חסרים הסכמים עם מעבדי משנה',
                fine: 60000,
                law_reference: 'סעיף 17ד לחוק'
            });
        }
    }

    generateRecommendations(answers) {
        // Critical recommendations
        if (answers.dpo_appointed === 'no' && this.requiresDPO(answers.org_type, answers.data_subjects_count)) {
            this.recommendations.push({
                priority: 'critical',
                category: 'dpo',
                action: 'מנו ממונה על הגנת הפרטיות באופן מיידי',
                timeline: 'מיידי',
                description: 'חובה חוקית עבור הארגון שלכם'
            });
        }

        if (answers.database_registered !== 'yes' && answers.database_registered !== 'exempt') {
            this.recommendations.push({
                priority: 'high',
                category: 'registration',
                action: 'השלימו רישום מאגרים ברשות להגנת הפרטיות',
                timeline: '30 ימים',
                description: 'נדרש לעמידה בדרישות החוק'
            });
        }

        // High priority recommendations
        if (answers.security_measures) {
            const missingMeasures = this.getMissingSecurityMeasures(answers.security_measures);
            if (missingMeasures.length > 0) {
                this.recommendations.push({
                    priority: 'high',
                    category: 'security',
                    action: `יישמו אמצעי אבטחה חסרים: ${this.translateSecurityMeasures(missingMeasures).join(', ')}`,
                    timeline: '90 ימים',
                    description: 'חיזוק אבטחת המידע'
                });
            }
        }

        if (answers.privacy_notice !== 'yes') {
            this.recommendations.push({
                priority: answers.privacy_notice === 'no' ? 'high' : 'medium',
                category: 'transparency',
                action: answers.privacy_notice === 'no' 
                    ? 'צרו הודעת פרטיות מקיפה'
                    : 'עדכנו והשלימו את הודעת הפרטיות',
                timeline: '60 ימים',
                description: 'שקיפות כלפי נושאי המידע'
            });
        }

        // Medium priority recommendations
        if (answers.security_training === 'never') {
            this.recommendations.push({
                priority: 'medium',
                category: 'training',
                action: 'בצעו הדרכת אבטחת מידע לעובדים',
                timeline: '30 ימים',
                description: 'העלאת מודעות לאבטחת מידע'
            });
        } else if (answers.security_training === 'old') {
            this.recommendations.push({
                priority: 'medium',
                category: 'training',
                action: 'רעננו הדרכת אבטחת מידע',
                timeline: '60 ימים',
                description: 'עדכון ידע העובדים'
            });
        }

        if (answers.database_documentation === 'no' || answers.database_documentation === 'outdated') {
            this.recommendations.push({
                priority: 'medium',
                category: 'documentation',
                action: answers.database_documentation === 'no'
                    ? 'הכינו מסמכי הגדרת מאגר'
                    : 'עדכנו מסמכי הגדרת מאגר',
                timeline: '45 ימים',
                description: 'תיעוד נדרש לפי החוק'
            });
        }

        if (answers.deletion_policy === 'no') {
            this.recommendations.push({
                priority: 'medium',
                category: 'policy',
                action: 'גבשו מדיניות מחיקת מידע',
                timeline: '60 ימים',
                description: 'ניהול מחזור חיי המידע'
            });
        }

        // Low priority recommendations
        if (answers.data_minimization !== 'yes') {
            this.recommendations.push({
                priority: 'low',
                category: 'principles',
                action: 'יישמו עקרון צמצום המידע',
                timeline: '120 ימים',
                description: 'אספו רק מידע הכרחי'
            });
        }

        if (answers.dpo_published === 'no' && answers.dpo_appointed === 'yes') {
            this.recommendations.push({
                priority: 'low',
                category: 'transparency',
                action: 'פרסמו פרטי ממונה הגנת הפרטיות',
                timeline: '14 ימים',
                description: 'נגישות לנושאי המידע'
            });
        }
    }

    requiresDPO(orgType, dataCount) {
        // Public bodies always require DPO
        if (orgType === 'public') return true;
        
        // Data brokers with significant data
        if (orgType === 'databroker' && dataCount !== 'less_10k') return true;
        
        // Financial and healthcare with large scale processing
        if ((orgType === 'financial' || orgType === 'healthcare') && 
            (dataCount === '100k_500k' || dataCount === '500k_1m' || dataCount === 'over_1m')) {
            return true;
        }
        
        return false;
    }

    requiresRegistration(orgType) {
        return orgType === 'public' || orgType === 'databroker';
    }

    calculateDPOFine(orgType, dataCount) {
        const baseFine = 50000;
        const multipliers = {
            public: 2,
            databroker: 1.5,
            financial: 2,
            healthcare: 2,
            private: 1,
            security: 1
        };
        
        const sizeMultiplier = {
            less_10k: 0.5,
            "10k_100k": 1,
            "100k_500k": 1.5,
            "500k_1m": 2,
            over_1m: 3
        };

        return Math.round(baseFine * (multipliers[orgType] || 1) * (sizeMultiplier[dataCount] || 1));
    }

    calculateRegistrationFine(orgType, dataCount) {
        const baseFine = 30000;
        const dataSubjectFine = {
            less_10k: 10000,
            "10k_100k": 30000,
            "100k_500k": 80000,
            "500k_1m": 150000,
            over_1m: 300000
        };

        return baseFine + (dataSubjectFine[dataCount] || 0);
    }

    getMissingSecurityMeasures(implementedMeasures) {
        const allMeasures = ['encryption', 'access_control', 'monitoring', 'backup', 'incident_response', 'penetration_test'];
        return allMeasures.filter(m => !implementedMeasures.includes(m));
    }

    translateSecurityMeasures(measures) {
        const translations = {
            encryption: 'הצפנה',
            access_control: 'בקרת גישה',
            monitoring: 'ניטור ולוגים',
            backup: 'גיבויים',
            incident_response: 'תגובה לאירועים',
            penetration_test: 'מבחני חדירה'
        };
        return measures.map(m => translations[m] || m);
    }

    getRiskLevel(score) {
        if (score < 20) return { 
            level: 'low', 
            label: 'נמוך', 
            color: '#4CAF50',
            description: 'הארגון בסיכון נמוך לאי עמידה'
        };
        if (score < 40) return { 
            level: 'medium', 
            label: 'בינוני', 
            color: '#FF9800',
            description: 'נדרשים שיפורים בתחומים מסוימים'
        };
        if (score < 60) return { 
            level: 'high', 
            label: 'גבוה', 
            color: '#FF5722',
            description: 'נדרשת פעולה מיידית לתיקון ליקויים'
        };
        return { 
            level: 'critical', 
            label: 'קריטי', 
            color: '#F44336',
            description: 'מצב קריטי - סיכון גבוה מאוד לקנסות והפרות'
        };
    }

    generateComplianceMatrix(answers) {
        return {
            dpo: {
                status: this.getDPOStatus(answers),
                requirement: this.getDPORequirement(answers),
                compliant: answers.dpo_appointed === 'yes'
            },
            registration: {
                status: this.getRegistrationStatus(answers),
                requirement: this.getRegistrationRequirement(answers),
                compliant: answers.database_registered === 'yes' || answers.database_registered === 'exempt'
            },
            security: {
                status: this.getSecurityStatus(answers),
                requirement: 'רמת אבטחה ' + this.getSecurityLevelText(answers.security_level),
                compliant: answers.security_level === 'high' || answers.security_level === 'medium'
            },
            rights: {
                status: this.getRightsStatus(answers),
                requirement: 'תהליכים למימוש זכויות',
                compliant: answers.privacy_notice === 'yes' && answers.access_requests === 'yes'
            },
            documentation: {
                status: this.getDocumentationStatus(answers),
                requirement: 'מסמכי הגדרת מאגר מעודכנים',
                compliant: answers.database_documentation === 'yes'
            },
            consent: {
                status: this.getConsentStatus(answers),
                requirement: 'מנגנון ניהול הסכמות',
                compliant: answers.consent_management === 'yes'
            }
        };
    }

    getDPOStatus(answers) {
        if (answers.dpo_appointed === 'yes') return 'תקין';
        if (answers.dpo_appointed === 'process') return 'בתהליך';
        return 'נדרש טיפול';
    }

    getDPORequirement(answers) {
        const orgType = answers.org_type;
        const dataCount = answers.data_subjects_count;
        
        if (orgType === 'public') return 'חובה לגוף ציבורי';
        if (orgType === 'databroker' && dataCount !== 'less_10k') return 'חובה לסוחר נתונים';
        if ((orgType === 'financial' || orgType === 'healthcare') && 
            (dataCount === '100k_500k' || dataCount === '500k_1m' || dataCount === 'over_1m')) {
            return 'חובה - עיבוד מידע רגיש בהיקף גדול';
        }
        return 'מומלץ';
    }

    getRegistrationStatus(answers) {
        if (answers.database_registered === 'yes' || answers.database_registered === 'exempt') return 'תקין';
        if (answers.database_registered === 'partial') return 'חלקי';
        return 'נדרש טיפול';
    }

    getRegistrationRequirement(answers) {
        const orgType = answers.org_type;
        if (orgType === 'public') return 'חובת רישום לכל המאגרים';
        if (orgType === 'databroker') return 'חובת רישום מעל 10,000 נושאי מידע';
        return 'פטור מרישום לפי התיקון';
    }

    getSecurityStatus(answers) {
        if (answers.security_level === 'high') return 'תקין';
        if (answers.security_level === 'medium') return 'סביר';
        return 'נדרש שיפור';
    }

    getSecurityLevelText(level) {
        const levels = {
            high: 'גבוהה',
            medium: 'בינונית',
            basic: 'בסיסית',
            unknown: 'לא ידועה'
        };
        return levels[level] || 'לא מוגדרת';
    }

    getRightsStatus(answers) {
        if (answers.privacy_notice === 'yes' && answers.access_requests === 'yes') return 'תקין';
        if (answers.privacy_notice === 'partial' || answers.access_requests === 'partial') return 'חלקי';
        return 'נדרש שיפור';
    }

    getDocumentationStatus(answers) {
        if (answers.database_documentation === 'yes') return 'תקין';
        if (answers.database_documentation === 'partial' || answers.database_documentation === 'outdated') return 'נדרש עדכון';
        return 'חסר';
    }

    getConsentStatus(answers) {
        if (answers.consent_management === 'yes') return 'תקין';
        if (answers.consent_management === 'partial') return 'חלקי';
        return 'חסר';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComplianceCalculator;
} else {
    window.ComplianceCalculator = ComplianceCalculator;
}