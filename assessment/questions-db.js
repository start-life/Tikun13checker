// Questions Database for Amendment 13 Compliance Assessment
// Based on comprehensive research on Israeli Privacy Protection Law Amendment 13

const assessmentQuestions = {
    sections: [
        {
            id: "org_profile",
            title: "פרופיל הארגון",
            icon: "🏢",
            description: "מידע בסיסי על הארגון לקביעת רמת החובות",
            questions: [
                {
                    id: "org_type",
                    text: "מהו סוג הארגון שלכם?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "public", label: "גוף ציבורי (משרד ממשלתי, עירייה, קופת חולים, אוניברסיטה)" },
                        { value: "private", label: "חברה פרטית" },
                        { value: "databroker", label: "סוחר נתונים" },
                        { value: "security", label: "גוף ביטחוני" },
                        { value: "financial", label: "מוסד פיננסי (בנק, חברת ביטוח)" },
                        { value: "healthcare", label: "מוסד רפואי (בית חולים)" }
                    ],
                    weight: 3,
                    riskFactor: {
                        public: 3,
                        private: 1,
                        databroker: 3,
                        security: 2,
                        financial: 3,
                        healthcare: 3
                    }
                },
                {
                    id: "data_subjects_count",
                    text: "כמה נושאי מידע יש במאגרי המידע שלכם?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "less_10k", label: "פחות מ-10,000" },
                        { value: "10k_100k", label: "10,000 - 100,000" },
                        { value: "100k_500k", label: "100,000 - 500,000" },
                        { value: "500k_1m", label: "500,000 - 1,000,000" },
                        { value: "over_1m", label: "מעל 1,000,000" }
                    ],
                    weight: 2,
                    riskFactor: {
                        less_10k: 1,
                        "10k_100k": 2,
                        "100k_500k": 3,
                        "500k_1m": 4,
                        over_1m: 5
                    }
                },
                {
                    id: "sensitive_data",
                    text: "האם אתם מעבדים מידע רגיש במיוחד?",
                    type: "multiselect",
                    required: true,
                    options: [
                        { value: "medical", label: "מידע רפואי" },
                        { value: "biometric", label: "מידע ביומטרי" },
                        { value: "genetic", label: "מידע גנטי" },
                        { value: "sexual", label: "נטייה מינית" },
                        { value: "criminal", label: "מידע פלילי" },
                        { value: "personality", label: "הערכות אישיות" },
                        { value: "none", label: "לא מעבדים מידע רגיש" }
                    ],
                    weight: 3,
                    calculateRisk: (selected) => selected.includes("none") ? 1 : selected.length * 2
                },
                {
                    id: "annual_revenue",
                    text: "מהו המחזור השנתי של הארגון?",
                    type: "select",
                    required: false,
                    options: [
                        { value: "small", label: "עד 10 מיליון ₪" },
                        { value: "medium", label: "10-50 מיליון ₪" },
                        { value: "large", label: "50-500 מיליון ₪" },
                        { value: "enterprise", label: "מעל 500 מיליון ₪" }
                    ],
                    weight: 1,
                    riskFactor: {
                        small: 1,
                        medium: 2,
                        large: 3,
                        enterprise: 4
                    }
                }
            ]
        },
        {
            id: "dpo",
            title: "ממונה על הגנת הפרטיות (DPO)",
            icon: "👤",
            description: "בדיקת מינוי וכישורי ממונה הגנת פרטיות",
            questions: [
                {
                    id: "dpo_appointed",
                    text: "האם מיניתם ממונה על הגנת הפרטיות?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, מונה DPO" },
                        { value: "no", label: "לא מונה DPO" },
                        { value: "process", label: "בתהליך מינוי" }
                    ],
                    weight: 5,
                    riskFactor: {
                        yes: 0,
                        no: 5,
                        process: 2
                    }
                },
                {
                    id: "dpo_qualified",
                    text: "האם ל-DPO יש את הכישורים הנדרשים?",
                    type: "multiselect",
                    required: false,
                    dependsOn: "dpo_appointed",
                    showIf: ["yes", "process"],
                    options: [
                        { value: "legal", label: "ידע משפטי בדיני הגנת הפרטיות" },
                        { value: "tech", label: "הבנה טכנולוגית ואבטחת מידע" },
                        { value: "org", label: "היכרות עם פעילות הארגון" },
                        { value: "training", label: "הכשרה מקצועית בתחום" }
                    ],
                    weight: 3,
                    calculateRisk: (selected) => 4 - selected.length
                },
                {
                    id: "dpo_independence",
                    text: "האם ה-DPO פועל באופן עצמאי?",
                    type: "select",
                    required: false,
                    dependsOn: "dpo_appointed",
                    showIf: ["yes"],
                    options: [
                        { value: "yes", label: "כן, מדווח ישירות למנכ\"ל" },
                        { value: "partial", label: "עצמאות חלקית" },
                        { value: "no", label: "אין עצמאות מלאה" }
                    ],
                    weight: 2,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 4
                    }
                },
                {
                    id: "dpo_published",
                    text: "האם פרטי ה-DPO מפורסמים לציבור?",
                    type: "select",
                    required: false,
                    dependsOn: "dpo_appointed",
                    showIf: ["yes"],
                    options: [
                        { value: "yes", label: "כן, באתר ובערוצים נוספים" },
                        { value: "partial", label: "מפורסם חלקית" },
                        { value: "no", label: "לא מפורסם" }
                    ],
                    weight: 2,
                    riskFactor: {
                        yes: 0,
                        partial: 1,
                        no: 3
                    }
                }
            ]
        },
        {
            id: "database_registration",
            title: "רישום והודעה על מאגרי מידע",
            icon: "📋",
            description: "עמידה בדרישות רישום ותיעוד מאגרים",
            questions: [
                {
                    id: "database_registered",
                    text: "האם המאגרים שלכם רשומים כנדרש?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, כל המאגרים רשומים" },
                        { value: "partial", label: "חלק מהמאגרים רשומים" },
                        { value: "no", label: "לא רשומים" },
                        { value: "exempt", label: "פטורים מרישום" }
                    ],
                    weight: 4,
                    riskFactor: {
                        yes: 0,
                        partial: 3,
                        no: 5,
                        exempt: 0
                    }
                },
                {
                    id: "ppa_notification",
                    text: "האם הודעתם לרשות להגנת הפרטיות על מאגרי מידע רגיש?",
                    type: "select",
                    required: false,
                    options: [
                        { value: "yes", label: "כן, הודענו כנדרש" },
                        { value: "no", label: "לא הודענו" },
                        { value: "na", label: "לא רלוונטי (פחות מ-100,000 נושאי מידע רגיש)" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        no: 4,
                        na: 0
                    }
                },
                {
                    id: "database_documentation",
                    text: "האם קיימים מסמכי הגדרת מאגר מעודכנים?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, מלאים ומעודכנים" },
                        { value: "partial", label: "קיימים אך לא מלאים" },
                        { value: "outdated", label: "קיימים אך לא מעודכנים" },
                        { value: "no", label: "לא קיימים" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        outdated: 3,
                        no: 5
                    }
                }
            ]
        },
        {
            id: "information_security",
            title: "אבטחת מידע",
            icon: "🔒",
            description: "אמצעי אבטחה וממשל אבטחת מידע",
            questions: [
                {
                    id: "security_level",
                    text: "מהי רמת האבטחה של המאגרים שלכם?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "high", label: "גבוהה (תקנות אבטחה מלאות)" },
                        { value: "medium", label: "בינונית (אמצעים בסיסיים+)" },
                        { value: "basic", label: "בסיסית (מינימום נדרש)" },
                        { value: "unknown", label: "לא ידוע" }
                    ],
                    weight: 4,
                    riskFactor: {
                        high: 1,
                        medium: 2,
                        basic: 3,
                        unknown: 5
                    }
                },
                {
                    id: "security_measures",
                    text: "אילו אמצעי אבטחה יושמו?",
                    type: "multiselect",
                    required: true,
                    options: [
                        { value: "encryption", label: "הצפנה" },
                        { value: "access_control", label: "בקרת גישה" },
                        { value: "monitoring", label: "ניטור ולוגים" },
                        { value: "backup", label: "גיבויים" },
                        { value: "incident_response", label: "תגובה לאירועים" },
                        { value: "penetration_test", label: "מבחני חדירה" }
                    ],
                    weight: 3,
                    calculateRisk: (selected) => Math.max(0, 6 - selected.length)
                },
                {
                    id: "security_officer",
                    text: "האם מונה ממונה אבטחת מידע?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן" },
                        { value: "no", label: "לא" },
                        { value: "outsourced", label: "מיקור חוץ" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        no: 4,
                        outsourced: 1
                    }
                },
                {
                    id: "security_training",
                    text: "מתי בוצעה הדרכת אבטחה אחרונה?",
                    type: "select",
                    required: false,
                    options: [
                        { value: "recent", label: "בשנה האחרונה" },
                        { value: "old", label: "לפני יותר משנה" },
                        { value: "never", label: "לא בוצעה" }
                    ],
                    weight: 2,
                    riskFactor: {
                        recent: 0,
                        old: 2,
                        never: 4
                    }
                }
            ]
        },
        {
            id: "data_subject_rights",
            title: "זכויות נושאי המידע",
            icon: "⚖️",
            description: "מימוש זכויות עיון, תיקון ומחיקה",
            questions: [
                {
                    id: "privacy_notice",
                    text: "האם קיימת הודעת פרטיות מקיפה?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, מלאה ומעודכנת" },
                        { value: "partial", label: "קיימת אך חסרה" },
                        { value: "outdated", label: "קיימת אך לא מעודכנת" },
                        { value: "no", label: "לא קיימת" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        outdated: 3,
                        no: 5
                    }
                },
                {
                    id: "access_requests",
                    text: "האם קיים תהליך לטיפול בבקשות גישה למידע?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, תהליך מובנה" },
                        { value: "partial", label: "תהליך חלקי" },
                        { value: "no", label: "אין תהליך" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 4
                    }
                },
                {
                    id: "consent_management",
                    text: "האם מנוהלות הסכמות כדין?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, מערכת ניהול הסכמות מלאה" },
                        { value: "partial", label: "ניהול חלקי" },
                        { value: "no", label: "לא מנוהל" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 4
                    }
                },
                {
                    id: "deletion_policy",
                    text: "האם קיימת מדיניות מחיקת מידע?",
                    type: "select",
                    required: false,
                    options: [
                        { value: "yes", label: "כן, מדיניות מעודכנת" },
                        { value: "partial", label: "מדיניות חלקית" },
                        { value: "no", label: "אין מדיניות" }
                    ],
                    weight: 2,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 3
                    }
                }
            ]
        },
        {
            id: "data_processing",
            title: "עיבוד מידע ועמידה בדרישות",
            icon: "⚙️",
            description: "עקרונות עיבוד מידע והתקשרויות עם צדדים שלישיים",
            questions: [
                {
                    id: "lawful_processing",
                    text: "האם כל עיבוד המידע מבוצע כדין?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, עם בסיס חוקי מתועד" },
                        { value: "mostly", label: "ברוב המקרים" },
                        { value: "unknown", label: "לא ברור" },
                        { value: "no", label: "לא" }
                    ],
                    weight: 4,
                    riskFactor: {
                        yes: 0,
                        mostly: 2,
                        unknown: 4,
                        no: 5
                    }
                },
                {
                    id: "purpose_limitation",
                    text: "האם מקפידים על הגבלת מטרה?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, תמיד" },
                        { value: "mostly", label: "לרוב" },
                        { value: "sometimes", label: "לעיתים" },
                        { value: "no", label: "לא" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        mostly: 1,
                        sometimes: 3,
                        no: 5
                    }
                },
                {
                    id: "data_minimization",
                    text: "האם מיושם עקרון צמצום המידע?",
                    type: "select",
                    required: false,
                    options: [
                        { value: "yes", label: "כן, סקירה שנתית" },
                        { value: "partial", label: "חלקית" },
                        { value: "no", label: "לא" }
                    ],
                    weight: 2,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 3
                    }
                },
                {
                    id: "third_party_agreements",
                    text: "האם קיימים הסכמים עם מעבדי משנה?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, הסכמים מלאים" },
                        { value: "partial", label: "הסכמים חלקיים" },
                        { value: "no", label: "אין הסכמים" },
                        { value: "na", label: "אין מעבדי משנה" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 5,
                        na: 0
                    }
                }
            ]
        }
    ],

    // Helper functions for question logic
    getQuestionById: function(questionId) {
        for (const section of this.sections) {
            const question = section.questions.find(q => q.id === questionId);
            if (question) return question;
        }
        return null;
    },

    getSectionById: function(sectionId) {
        return this.sections.find(s => s.id === sectionId);
    },

    getAllQuestions: function() {
        const allQuestions = [];
        this.sections.forEach(section => {
            section.questions.forEach(question => {
                allQuestions.push({
                    ...question,
                    sectionId: section.id,
                    sectionTitle: section.title
                });
            });
        });
        return allQuestions;
    },

    getVisibleQuestions: function(answers) {
        const visibleQuestions = [];
        this.sections.forEach(section => {
            section.questions.forEach(question => {
                if (!question.dependsOn || this.shouldShowQuestion(question, answers)) {
                    visibleQuestions.push({
                        ...question,
                        sectionId: section.id,
                        sectionTitle: section.title
                    });
                }
            });
        });
        return visibleQuestions;
    },

    shouldShowQuestion: function(question, answers) {
        if (!question.dependsOn) return true;
        const dependencyAnswer = answers[question.dependsOn];
        if (!dependencyAnswer) return false;
        return question.showIf.includes(dependencyAnswer);
    },

    getTotalSections: function() {
        return this.sections.length;
    },

    getTotalQuestions: function() {
        return this.getAllQuestions().length;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = assessmentQuestions;
} else {
    window.assessmentQuestions = assessmentQuestions;
}