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

        // Apply Amendment 13 risk multipliers based on organization context
        const riskMultiplier = this.calculateRiskMultiplier(question, answers);
        const adjustedRisk = Math.min(5, risk * riskMultiplier);

        this.riskScore += adjustedRisk * weight;
        this.totalScore += Math.max(0, (5 - adjustedRisk)) * weight;
    }

    calculateRiskMultiplier(question, answers) {
        let multiplier = 1.0;
        
        // Organization type multipliers
        const orgType = answers.org_type;
        if (orgType === 'public') {
            multiplier *= 1.3; // Public bodies have higher regulatory scrutiny
        } else if (orgType === 'databroker') {
            multiplier *= 1.4; // Data brokers face strictest requirements
        } else if (orgType === 'financial' || orgType === 'healthcare') {
            multiplier *= 1.2; // Regulated industries have higher standards
        }
        
        // Sensitive data multiplier
        const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
        if (hasSensitiveData) {
            multiplier *= 1.2; // Processing sensitive data increases risk
        }
        
        // Data scale multiplier
        const dataCount = answers.data_subjects_count;
        if (dataCount === 'over_1m') {
            multiplier *= 1.3; // Large scale processing
        } else if (dataCount === '500k_1m' || dataCount === '100k_500k') {
            multiplier *= 1.1; // Medium scale processing
        }
        
        // DPO requirement multiplier - if DPO required but not appointed
        if (question.id && question.id.includes('dpo') && 
            this.requiresDPO(orgType, dataCount) && 
            answers.dpo_appointed === 'no') {
            multiplier *= 1.5; // Critical violation
        }
        
        return multiplier;
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
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            
            if (this.requiresDPO(orgType, dataCount)) {
                this.violations.push({
                    severity: 'high',
                    category: 'dpo',
                    description: 'חובת מינוי ממונה הגנת פרטיות לא מולאה',
                    fine: this.calculateDPOFine(orgType, dataCount, hasSensitiveData),
                    law_reference: 'סעיף 17ב1 לחוק'
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
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            this.violations.push({
                severity: 'medium',
                category: 'transparency',
                description: 'הודעת פרטיות חסרה - הפרת חובת היידוע',
                fine: this.calculateInformationNoticeFine(answers.data_subjects_count, hasSensitiveData),
                law_reference: 'סעיף 11 לחוק'
            });
        } else if (answers.privacy_notice === 'outdated' || answers.privacy_notice === 'partial') {
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            this.violations.push({
                severity: 'low',
                category: 'transparency',
                description: 'הודעת פרטיות לא מלאה או מעודכנת',
                fine: Math.round(this.calculateInformationNoticeFine(answers.data_subjects_count, hasSensitiveData) * 0.5),
                law_reference: 'סעיף 11 לחוק'
            });
        }

        // Security violations
        if (answers.security_level === 'unknown' || answers.security_level === 'basic') {
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            this.violations.push({
                severity: 'high',
                category: 'security',
                description: 'רמת אבטחה לא מספקת - הפרת תקנות אבטחת מידע',
                fine: this.calculateSecurityRegulationFine(answers.security_level, hasSensitiveData),
                law_reference: 'תקנות אבטחת מידע, תשע״ז-2017'
            });
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
                fine: this.calculateDataSubjectRightsFine(),
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

        // New Amendment 13 specific violations

        // Breach notification violations (72 hours reporting)
        if (answers.breach_notification_timeline === 'no') {
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            this.violations.push({
                severity: 'high',
                category: 'security',
                description: 'אין נוהל דיווח תוך 72 שעות על אירועי אבטחה חמורים',
                fine: this.calculateBreachNotificationFine(answers.org_type, hasSensitiveData),
                law_reference: 'סעיף 23לא לחוק - דיווח על אירועי אבטחה'
            });
        } else if (answers.breach_notification_timeline === 'yes_partial') {
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            this.violations.push({
                severity: 'medium',
                category: 'security',
                description: 'נוהל דיווח אירועי אבטחה קיים אך לא מיושם במלואו',
                fine: Math.round(this.calculateBreachNotificationFine(answers.org_type, hasSensitiveData) * 0.5),
                law_reference: 'סעיף 23לא לחוק - דיווח על אירועי אבטחה'
            });
        }

        // Large database notification violations  
        if (answers.large_database_notification === 'no') {
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            this.violations.push({
                severity: 'medium',
                category: 'notification',
                description: 'הפרת חובת הודעה על מאגר מידע גדול עם מידע רגיש',
                fine: this.calculateRegistrationFine(answers.org_type, answers.data_subjects_count),
                law_reference: 'סעיף 8א(ב) לחוק'
            });
        }

        // Illegal data source violations
        if (answers.illegal_data_source === 'no') {
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            this.violations.push({
                severity: 'high',
                category: 'processing',
                description: 'סיכון לעיבוד מידע שנאסף באופן לא חוקי',
                fine: this.calculateDataProcessingFine(answers.data_subjects_count, hasSensitiveData),
                law_reference: 'סעיף 8(ד) לחוק - איסור עיבוד מידע בלתי חוקי'
            });
        }

        // Unauthorized processing violations
        if (answers.unauthorized_processing === 'no' || answers.unauthorized_processing === 'partial') {
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            const severity = answers.unauthorized_processing === 'no' ? 'high' : 'medium';
            this.violations.push({
                severity,
                category: 'processing',
                description: 'עיבוד מידע ללא הרשאה מבעל השליטה במאגר',
                fine: this.calculateDataProcessingFine(answers.data_subjects_count, hasSensitiveData),
                law_reference: 'סעיף 8(ג) לחוק - איסור עיבוד ללא הרשאה'
            });
        }

        // Purpose limitation violations
        if (answers.purpose_limitation === 'no' || answers.purpose_limitation === 'sometimes') {
            const hasSensitiveData = this.hasSensitiveData(answers.sensitive_data);
            const severity = answers.purpose_limitation === 'no' ? 'high' : 'medium';
            this.violations.push({
                severity,
                category: 'processing',
                description: 'עיבוד מידע שלא למטרה שלשמה נאסף',
                fine: this.calculateDataProcessingFine(answers.data_subjects_count, hasSensitiveData),
                law_reference: 'סעיף 8(ב) לחוק - עיבוד בניגוד למטרה'
            });
        }

        // Criminal offense risk violations
        if (answers.criminal_prevention_measures && answers.criminal_prevention_measures.length < 2) {
            this.violations.push({
                severity: 'high',
                category: 'criminal',
                description: 'סיכון גבוה לביצוע עבירות פליליות - אמצעי מניעה לא מספקים',
                fine: 0, // Criminal penalties are handled separately by authorities
                law_reference: 'פרק ה1 לחוק - עבירות פליליות'
            });
        }

        // EU data transfer violations
        if (answers.receives_eu_data === 'yes') {
            // EU data deletion mechanism violations
            if (answers.eu_data_deletion_mechanism === 'no') {
                this.violations.push({
                    severity: 'medium',
                    category: 'eu_transfer',
                    description: 'חסר מנגנון למחיקת מידע מהאיחוד האירופי',
                    fine: 15000, // Fixed fine for EU regulation violations
                    law_reference: 'תקנות הגנת הפרטיות (הוראות לעניין מידע שהועבר מהאזור הכלכלי האירופי)'
                });
            }

            // EU data subject notification violations
            if (answers.eu_data_subject_notifications === 'no') {
                this.violations.push({
                    severity: 'medium',
                    category: 'eu_transfer',
                    description: 'אי הודעה לנושאי מידע מהאיחוד האירופי על העברות לצד שלישי',
                    fine: 15000,
                    law_reference: 'תקנות הגנת הפרטיות (הוראות לעניין מידע שהועבר מהאזור הכלכלי האירופי)'
                });
            }

            // EU regulation compliance violations
            if (answers.eu_regulation_compliance && answers.eu_regulation_compliance.length < 3) {
                this.violations.push({
                    severity: 'medium',
                    category: 'eu_transfer',
                    description: 'אי עמידה בתקנות הגנת הפרטיות לעניין מידע מהאיחוד האירופי',
                    fine: this.calculateEUTransferFine(answers.data_subjects_count),
                    law_reference: 'תקנות הגנת הפרטיות (הוראות לעניין מידע שהועבר מהאזור הכלכלי האירופי)'
                });
            }
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

        // Timeline-based recommendations
        const implementationDate = new Date('2025-08-14');
        const today = new Date();
        const daysUntil = Math.ceil((implementationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        if (daysUntil > 0) {
            const urgency = daysUntil < 30 ? 'critical' : daysUntil < 90 ? 'high' : 'medium';
            const timelineText = daysUntil < 30 ? 'מיידי - החוק נכנס לתוקף בקרוב!' :
                                daysUntil < 90 ? `דחוף - ${daysUntil} ימים נותרו` :
                                `${daysUntil} ימים לכניסת החוק לתוקף`;
            
            this.recommendations.push({
                priority: urgency,
                category: 'timeline',
                action: `השלימו היערכות לתיקון 13 - נותרו ${daysUntil} ימים`,
                timeline: timelineText,
                description: 'תאריך יישום: 14 באוגוסט 2025'
            });
        }

        // Breach notification recommendations
        if (answers.breach_notification_timeline === 'no') {
            this.recommendations.push({
                priority: 'critical',
                category: 'security',
                action: 'הקימו נוהל דיווח 72 שעות על אירועי אבטחה',
                timeline: 'מיידי',
                description: 'חובה חוקית - עד ₪500,000 קנס'
            });
        } else if (answers.breach_notification_timeline === 'yes_partial') {
            this.recommendations.push({
                priority: 'high',
                category: 'security',
                action: 'השלימו יישום נוהל דיווח 72 שעות',
                timeline: '30 ימים',
                description: 'סיכון לקנסות על אי-דיווח'
            });
        } else if (answers.breach_notification_timeline === 'yes_manual') {
            this.recommendations.push({
                priority: 'medium',
                category: 'security',
                action: 'שקלו אוטומציה של נוהל דיווח אירועי אבטחה',
                timeline: '90 ימים',
                description: 'שיפור יעילות ומהירות דיווח'
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

    calculateDPOFine(orgType, dataCount, hasSensitiveData = false) {
        // Based on Amendment 13 - DPO violation penalties
        // סעיף 23כה - עיצומים כספיים עבור הפרות ממונה הגנת הפרטיות
        
        const dataSubjectCounts = {
            less_10k: 10000,
            "10k_100k": 50000,
            "100k_500k": 250000,
            "500k_1m": 750000,
            over_1m: 1000000
        };
        
        const subjectCount = dataSubjectCounts[dataCount] || 50000;
        
        // Has sensitive data - 4 ₪ per subject, min 40,000 ₪
        // No sensitive data - 2 ₪ per subject, min 20,000 ₪
        const basePerSubject = hasSensitiveData ? 4 : 2;
        const minFine = hasSensitiveData ? 40000 : 20000;
        
        const calculatedFine = subjectCount * basePerSubject;
        return Math.max(calculatedFine, minFine);
    }

    calculateRegistrationFine(orgType, dataCount) {
        // Based on Amendment 13 - Registration violation penalties
        // סעיף 23כו - עיצומים כספיים עבור הפרות רישום מאגרים
        
        const baseFine = 150000; // Base fine: ₪150,000
        
        // Double for databases over 1 million subjects
        const isLargeDatabase = dataCount === 'over_1m';
        
        return isLargeDatabase ? baseFine * 2 : baseFine;
    }

    calculateDataProcessingFine(dataCount, hasSensitiveData = false) {
        // Based on Amendment 13 - Data processing violation penalties
        // סעיף 23כח - עיצומים עבור עיבוד מידע שלא כדין
        
        const dataSubjectCounts = {
            less_10k: 10000,
            "10k_100k": 50000,
            "100k_500k": 250000,
            "500k_1m": 750000,
            over_1m: 1000000
        };
        
        const subjectCount = dataSubjectCounts[dataCount] || 50000;
        const perSubjectFine = hasSensitiveData ? 8 : 4; // ₪8 for sensitive, ₪4 for regular
        const minFine = 200000; // Minimum ₪200,000
        
        const calculatedFine = subjectCount * perSubjectFine;
        return Math.max(calculatedFine, minFine);
    }

    calculateInformationNoticeFine(dataCount, hasSensitiveData = false) {
        // Based on Amendment 13 - Information notice violation penalties  
        // סעיף 23כט - עיצומים עבור הפרות מסירת הודעה לאדם
        
        const dataSubjectCounts = {
            less_10k: 10000,
            "10k_100k": 50000,
            "100k_500k": 250000,
            "500k_1m": 750000,
            over_1m: 1000000
        };
        
        const subjectCount = dataSubjectCounts[dataCount] || 50000;
        const perSubjectFine = hasSensitiveData ? 100 : 50; // ₪100 for sensitive, ₪50 for regular
        const minFine = 30000; // Minimum ₪30,000
        
        const calculatedFine = subjectCount * perSubjectFine;
        return Math.max(calculatedFine, minFine);
    }

    calculateDataSubjectRightsFine() {
        // Based on Amendment 13 - Data subject rights violation penalties
        // סעיף 23ל - עיצומים עבור הפרות זכויות נושא המידע
        
        return 15000; // Fixed ₪15,000 fine
    }

    calculateSecurityRegulationFine(securityLevel, hasSensitiveData = false) {
        // Based on Amendment 13 - Security regulation violation penalties
        // תקנות אבטחת מידע - עיצומים כספיים
        
        const basicFines = {
            basic_violation: hasSensitiveData ? 80000 : 20000,
            medium_violation: hasSensitiveData ? 160000 : 40000,
            high_violation: hasSensitiveData ? 320000 : 80000
        };
        
        // Determine violation level based on security level
        if (securityLevel === 'unknown' || securityLevel === 'basic') {
            return basicFines.high_violation; // High security violation
        } else if (securityLevel === 'medium') {
            return basicFines.medium_violation; // Medium security violation
        }
        
        return basicFines.basic_violation; // Basic violation
    }

    hasSensitiveData(sensitiveDataArray) {
        // Check if organization processes sensitive data according to Amendment 13
        if (!sensitiveDataArray || sensitiveDataArray.length === 0) return false;
        return !sensitiveDataArray.includes('none') && sensitiveDataArray.length > 0;
    }

    calculateBreachNotificationFine(orgType, hasSensitiveData = false) {
        // Based on Amendment 13 - Breach notification violation penalties
        // סעיף 23לא - עיצומים כספיים עבור אי דיווח על אירועי אבטחה חמורים
        
        // Base fine structure for breach notification failures
        let baseFine = 100000; // ₪100,000 base fine for non-reporting
        
        // Organization type multipliers
        if (orgType === 'public') {
            baseFine *= 1.5; // Public bodies have stricter obligations
        } else if (orgType === 'databroker') {
            baseFine *= 2.0; // Data brokers face highest penalties  
        } else if (orgType === 'financial' || orgType === 'healthcare') {
            baseFine *= 1.3; // Regulated industries have enhanced obligations
        }
        
        // Sensitive data multiplier
        if (hasSensitiveData) {
            baseFine *= 1.5; // Higher penalty for sensitive data breaches
        }
        
        // Cap at maximum penalty
        const maxFine = 500000; // Maximum ₪500,000
        
        return Math.min(baseFine, maxFine);
    }

    calculateEUTransferFine(dataCount) {
        // Based on Amendment 13 - EU transfer regulation violations
        // תקנות הגנת הפרטיות (הוראות לעניין מידע שהועבר מהאזור הכלכלי האירופי)
        
        const dataSubjectCounts = {
            less_10k: 10000,
            "10k_100k": 50000,
            "100k_500k": 250000,
            "500k_1m": 750000,
            over_1m: 1000000
        };
        
        const subjectCount = dataSubjectCounts[dataCount] || 50000;
        const perSubjectFine = 4; // ₪4 per subject for EU transfer violations
        
        const calculatedFine = subjectCount * perSubjectFine;
        return calculatedFine;
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
        // Amendment 13 adjusted thresholds with more granular risk assessment
        if (score < 15) return { 
            level: 'low', 
            label: 'נמוך', 
            color: '#4CAF50',
            description: 'הארגון בסיכון נמוך לאי עמידה בתיקון 13',
            actionRequired: 'המשך מעקב ובחינה תקופתית'
        };
        if (score < 30) return { 
            level: 'medium', 
            label: 'בינוני', 
            color: '#FF9800',
            description: 'נדרשים שיפורים בתחומים מסוימים לפני יישום תיקון 13',
            actionRequired: 'תכנון ויישום תוכנית התאמה תוך 6 חודשים'
        };
        if (score < 50) return { 
            level: 'high', 
            label: 'גבוה', 
            color: '#FF5722',
            description: 'נדרשת פעולה מיידית לתיקון ליקויים משמעותיים',
            actionRequired: 'תיקון דחוף תוך 90 יום - התייעצות עם יועץ משפטי'
        };
        if (score < 70) return { 
            level: 'critical', 
            label: 'קריטי', 
            color: '#F44336',
            description: 'מצב קריטי - סיכון גבוה מאוד לקנסות חמורים',
            actionRequired: 'פעולה מיידית תוך 30 יום - ייעוץ משפטי דחוף'
        };
        return { 
            level: 'emergency', 
            label: 'חירום', 
            color: '#B71C1C',
            description: 'מצב חירום - הפרות מרובות עם חשיפה לסנקציות קשות',
            actionRequired: 'הפסקת פעילות עד לתיקון - ייעוץ משפטי מיידי'
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