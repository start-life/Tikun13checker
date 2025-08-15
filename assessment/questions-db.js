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
                    text: "האם ל-DPO יש את הכישורים הנדרשים לפי החוק?",
                    type: "multiselect",
                    required: false,
                    dependsOn: "dpo_appointed",
                    showIf: ["yes", "process"],
                    options: [
                        { value: "privacy_law_deep", label: "ידע מעמיק בדיני הגנת הפרטיות (חובה)" },
                        { value: "tech_security", label: "הבנה הולמת בטכנולוגיה ואבטחת מידע (חובה)" },
                        { value: "org_activities", label: "היכרות עם תחומי פעילות הארגון ומטרותיו (חובה)" },
                        { value: "professional_training", label: "הכשרה מקצועית רלוונטית" }
                    ],
                    weight: 4,
                    calculateRisk: (selected) => {
                        // All first 3 are mandatory per Amendment 13
                        const mandatory = ["privacy_law_deep", "tech_security", "org_activities"];
                        const hasMandatory = mandatory.every(req => selected.includes(req));
                        return hasMandatory ? Math.max(0, 4 - selected.length) : 5;
                    }
                },
                {
                    id: "dpo_conflict_of_interest",
                    text: "האם ה-DPO נמנע מניגוד עניינים?",
                    type: "select",
                    required: false,
                    dependsOn: "dpo_appointed",
                    showIf: ["yes"],
                    options: [
                        { value: "yes", label: "כן, אין תפקידים נוספים היוצרים ניגוד עניינים" },
                        { value: "partial", label: "יש תפקידים נוספים אך לא בניגוד עניינים" },
                        { value: "no", label: "יש תפקידים נוספים שיוצרים ניגוד עניינים" },
                        { value: "unknown", label: "לא בדקנו נושא זה" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        partial: 1,
                        no: 5,
                        unknown: 3
                    }
                },
                {
                    id: "dpo_resources",
                    text: "האם ה-DPO זוכה לתנאים ומשאבים נאותים למילוי תפקידו?",
                    type: "multiselect",
                    required: false,
                    dependsOn: "dpo_appointed",
                    showIf: ["yes"],
                    options: [
                        { value: "time_allocation", label: "הקצאת זמן נאותה לתפקיד" },
                        { value: "budget_resources", label: "משאבים תקציביים מתאימים" },
                        { value: "training_budget", label: "תקציב להכשרות ועדכון ידע" },
                        { value: "access_to_mgmt", label: "גישה להנהלה ולמידע רלוונטי" },
                        { value: "involvement_decisions", label: "מעורבות בכל נושא הנוגע לדיני הגנת הפרטיות" }
                    ],
                    weight: 3,
                    calculateRisk: (selected) => Math.max(0, 5 - selected.length)
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
                    id: "dpo_tasks",
                    text: "אילו מתפקידי ה-DPO כפי שמוגדרים בחוק מתבצעים בפועל?",
                    type: "multiselect",
                    required: false,
                    dependsOn: "dpo_appointed",
                    showIf: ["yes"],
                    options: [
                        { value: "professional_authority", label: "משמש סמכות מקצועית ומוקד ידע" },
                        { value: "training_plan", label: "הכין תכנית הדרכה בתחום הגנת הפרטיות" },
                        { value: "monitoring_plan", label: "הכין תכנית לבקרה שוטפת על עמידה בדרישות החוק" },
                        { value: "security_documents", label: "וידא קיום נוהל אבטחת מידע ומסמך הגדרות מאגר" },
                        { value: "subject_requests", label: "מטפל בפניות נושאי מידע ובקשות למימוש זכויות" },
                        { value: "ppa_liaison", label: "משמש איש קשר עם הרשות להגנת הפרטיות" }
                    ],
                    weight: 3,
                    calculateRisk: (selected) => Math.max(0, 6 - selected.length)
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
                    text: "מהי רמת האבטחה הנדרשת למאגרים שלכם לפי תקנות אבטחת מידע?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "high", label: "רמת אבטחה גבוהה - מעל 100,000 נושאי מידע או מידע רגיש במיוחד" },
                        { value: "medium", label: "רמת אבטחה בינונית - 10,000-100,000 נושאי מידע" },
                        { value: "basic", label: "רמת אבטחה בסיסית - עד 10,000 נושאי מידע" },
                        { value: "individual", label: "מאגר המנוהל בידי יחיד" },
                        { value: "unknown", label: "לא ודאי איזו רמה נדרשת" }
                    ],
                    weight: 4,
                    riskFactor: {
                        high: 1,
                        medium: 2,
                        basic: 2,
                        individual: 1,
                        unknown: 5
                    }
                },
                {
                    id: "security_document_compliance",
                    text: "האם קיימים מסמכי הגדרות מאגר ונוהל אבטחת מידע כנדרש?",
                    type: "multiselect",
                    required: true,
                    options: [
                        { value: "database_definition", label: "מסמך הגדרות מאגר מעודכן (תקנה 2)" },
                        { value: "security_procedure", label: "נוהל אבטחת מידע (תקנה 4)" },
                        { value: "risk_assessment", label: "סקר סיכונים (רק לרמת אבטחה גבוהה)" },
                        { value: "penetration_tests", label: "מבדקי חדירות (רק לרמת אבטחה גבוהה)" },
                        { value: "incident_logging", label: "תיעוד אירועי אבטחה (תקנה 11)" }
                    ],
                    weight: 4,
                    calculateRisk: (selected) => Math.max(0, 5 - selected.length)
                },
                {
                    id: "breach_notification_timeline",
                    text: "האם יש נוהל דיווח תוך 72 שעות על אירוע אבטחה חמור לרשות להגנת הפרטיות?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes_automated", label: "כן, מערכת אוטומטית שמדווחת תוך 72 שעות" },
                        { value: "yes_manual", label: "כן, תהליך ידני מוגדר עם אחראים וזמנים" },
                        { value: "yes_partial", label: "קיים נוהל אך לא מיושם במלואו" },
                        { value: "no", label: "לא קיים נוהל דיווח" },
                        { value: "na", label: "לא רלוונטי - אין עיבוד מידע רגיש" }
                    ],
                    weight: 4,
                    riskFactor: {
                        yes_automated: 0,
                        yes_manual: 1,
                        yes_partial: 3,
                        no: 5,
                        na: 0
                    }
                },
                {
                    id: "security_measures",
                    text: "אילו אמצעי אבטחה יושמו בהתאם לתקנות אבטחת מידע?",
                    type: "multiselect",
                    required: true,
                    options: [
                        { value: "system_structure", label: "מבנה המאגר ומערכותיו (תקנה 5)" },
                        { value: "system_protection", label: "הגנת מערכות וכניסה לאתרים (תקנה 6)" },
                        { value: "personnel_management", label: "ניהול כוח אדם והדרכה (תקנה 7)" },
                        { value: "access_permissions", label: "קביעת הרשאות גישה (תקנות 8-9)" },
                        { value: "access_monitoring", label: "בקרה ותיעוד גישה (תקנה 10)" },
                        { value: "incident_handling", label: "טיפול באירועי אבטחה (תקנה 11)" },
                        { value: "system_separation", label: "הפרדת מערכות - מידור (תקנה 13)" },
                        { value: "network_security", label: "אבטחת חיבור ברשת (תקנה 14)" },
                        { value: "outsourcing_control", label: "בקרה על מיקור חוץ (תקנה 15)" },
                        { value: "periodic_audit", label: "ביקורת תקופתית (תקנה 16)" }
                    ],
                    weight: 4,
                    calculateRisk: (selected) => Math.max(0, 10 - selected.length)
                },
                {
                    id: "security_officer",
                    text: "האם נדרש ומונה ממונה אבטחת מידע לפי תיקון 13?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes_required", label: "כן, נדרש ומונה" },
                        { value: "no_required", label: "לא מונה למרות שנדרש" },
                        { value: "not_required", label: "לא נדרש (פחות מ-5 מאגרים או ארגון קטן)" },
                        { value: "outsourced", label: "מיקור חוץ" },
                        { value: "unknown", label: "לא ודאי אם נדרש" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes_required: 0,
                        no_required: 5,
                        not_required: 0,
                        outsourced: 1,
                        unknown: 2
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
        },
        {
            id: "notification_requirements",
            title: "חובות הודעה וצמצום רישום",
            icon: "📢",
            description: "דרישות הודעה לרשות והוראות חדשות בעקבות תיקון 13",
            questions: [
                {
                    id: "large_database_notification",
                    text: "האם הודעתם לרשות על מאגרי מידע גדולים עם מידע רגיש (מעל 100,000 נושאי מידע)?",
                    type: "select",
                    required: false,
                    options: [
                        { value: "yes", label: "כן, הודענו כנדרש" },
                        { value: "no", label: "לא הודענו למרות שנדרש" },
                        { value: "not_required", label: "לא נדרש (פחות מ-100,000 או ללא מידע רגיש)" },
                        { value: "unknown", label: "לא ודאי אם נדרש" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        no: 4,
                        not_required: 0,
                        unknown: 2
                    }
                },
                {
                    id: "database_exemption_status",
                    text: "מה מצב הפטור מרישום מאגרים לאחר תיקון 13?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "exempt_private", label: "פטור מרישום - חברה פרטית שאינה סוחרת נתונים" },
                        { value: "must_register_public", label: "חייב ברישום - גוף ציבורי" },
                        { value: "must_register_databroker", label: "חייב ברישום - סוחר נתונים מעל 10,000 נושאי מידע" },
                        { value: "notification_only", label: "חייב בהודעה בלבד - מעל 100,000 נושאי מידע רגיש" }
                    ],
                    weight: 4,
                    riskFactor: {
                        exempt_private: 0,
                        must_register_public: 1,
                        must_register_databroker: 1,
                        notification_only: 1
                    }
                },
                {
                    id: "ppa_preliminary_opinion",
                    text: "האם שקלתם לבקש חוות דעת מקדמית מהרשות להגנת הפרטיות בנושאים מורכבים?",
                    type: "select",
                    required: false,
                    options: [
                        { value: "yes", label: "כן, קיבלנו חוות דעת מקדמית" },
                        { value: "in_process", label: "בתהליך בקשת חוות דעת" },
                        { value: "considering", label: "שוקלים לבקש חוות דעת" },
                        { value: "no_need", label: "לא רלוונטי לארגון שלנו" },
                        { value: "not_aware", label: "לא היינו מודעים לאפשרות זו" }
                    ],
                    weight: 1,
                    riskFactor: {
                        yes: 0,
                        in_process: 0,
                        considering: 0,
                        no_need: 0,
                        not_aware: 1
                    }
                }
            ]
        },
        {
            id: "processing_prohibitions",
            title: "איסורי עיבוד מידע",
            icon: "🚫",
            description: "איסורים חדשים על עיבוד מידע שנקבעו בתיקון 13",
            questions: [
                {
                    id: "illegal_data_source",
                    text: "האם אתם מבצעים בדיקות למניעת עיבוד מידע שנאסף באופן לא חוקי?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, בודקים מקור המידע" },
                        { value: "partial", label: "בודקים באופן חלקי" },
                        { value: "no", label: "לא בודקים" },
                        { value: "unknown", label: "לא ודאי מה המצב" }
                    ],
                    weight: 4,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 5,
                        unknown: 3
                    }
                },
                {
                    id: "unauthorized_processing",
                    text: "האם כל עיבוד המידע מתבצע עם הרשאה מבעל השליטה במאגר?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, כל עיבוד מורשה מראש" },
                        { value: "mostly", label: "רוב העיבוד מורשה" },
                        { value: "partial", label: "חלק מהעיבוד מתבצע ללא הרשאה" },
                        { value: "no", label: "אין בקרה על הרשאות עיבוד" }
                    ],
                    weight: 4,
                    riskFactor: {
                        yes: 0,
                        mostly: 1,
                        partial: 3,
                        no: 5
                    }
                },
                {
                    id: "purpose_limitation",
                    text: "האם המידע מעובד אך ורק למטרה שלשמה נאסף?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, אך ורק למטרה המקורית" },
                        { value: "compatible", label: "למטרות תואמות בלבד" },
                        { value: "sometimes", label: "לעיתים למטרות אחרות" },
                        { value: "no", label: "מעובד למטרות שונות ללא הגבלה" }
                    ],
                    weight: 4,
                    riskFactor: {
                        yes: 0,
                        compatible: 1,
                        sometimes: 3,
                        no: 5
                    }
                }
            ]
        },
        {
            id: "judicial_orders",
            title: "צווים שיפוטיים ואכיפה",
            icon: "⚖️",
            description: "הסמכויות החדשות של הרשות להפסקת עיבוד מידע",
            questions: [
                {
                    id: "processing_cessation_risk",
                    text: "האם קיים סיכון לצו שיפוטי להפסקת עיבוד מידע?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "low", label: "סיכון נמוך - עמידה מלאה בחוק" },
                        { value: "medium", label: "סיכון בינוני - יש ליקויים קלים" },
                        { value: "high", label: "סיכון גבוה - יש הפרות משמעותיות" },
                        { value: "critical", label: "סיכון קריטי - הפרות חמורות וממושכות" }
                    ],
                    weight: 3,
                    riskFactor: {
                        low: 0,
                        medium: 2,
                        high: 4,
                        critical: 5
                    }
                },
                {
                    id: "deletion_preparedness",
                    text: "האם אתם מוכנים למחיקת מידע במידת הצורך על פי צו בית משפט?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, קיימים נוהלים וכלים למחיקה" },
                        { value: "partial", label: "חלקית - יש יכולת מחיקה חלקית" },
                        { value: "difficult", label: "קשה - מחיקה תהיה מסובכת" },
                        { value: "no", label: "לא - אין יכולת מחיקה יעילה" }
                    ],
                    weight: 2,
                    riskFactor: {
                        yes: 0,
                        partial: 1,
                        difficult: 3,
                        no: 4
                    }
                }
            ]
        },
        {
            id: "criminal_offenses",
            title: "עבירות פליליות חדשות",
            icon: "🚨",
            description: "עבירות פליליות חדשות שנוספו בתיקון 13",
            questions: [
                {
                    id: "criminal_risk_awareness",
                    text: "האם ההנהלה מודעת לעבירות הפליליות החדשות בתיקון 13?",
                    type: "multiselect",
                    required: true,
                    options: [
                        { value: "unauthorized_processing", label: "עיבוד מידע ללא הרשאה" },
                        { value: "false_information", label: "מסירת מידע כוזב בהודעות לרשות" },
                        { value: "public_data_misuse", label: "מסירת מידע מגוף ציבורי שלא כדין" },
                        { value: "obstruction", label: "הפרעה לפעילות הרשות" },
                        { value: "deception", label: "הטעיה של הרשות" }
                    ],
                    weight: 2,
                    calculateRisk: (selected) => Math.max(0, 5 - selected.length)
                },
                {
                    id: "criminal_prevention_measures",
                    text: "אילו אמצעים נקטתם למניעת עבירות פליליות?",
                    type: "multiselect",
                    required: true,
                    options: [
                        { value: "training", label: "הדרכה לצוות על העבירות החדשות" },
                        { value: "procedures", label: "נהלים למניעת עיבוד לא מורשה" },
                        { value: "verification", label: "בדיקת נכונות מידע לרשות" },
                        { value: "compliance_officer", label: "מינוי אחראי עמידה בחוק" },
                        { value: "regular_review", label: "בדיקות תקופתיות של עמידה בדרישות" }
                    ],
                    weight: 3,
                    calculateRisk: (selected) => Math.max(0, 5 - selected.length)
                }
            ]
        },
        {
            id: "eu_data_transfer",
            title: "העברת מידע מהאיחוד האירופי",
            icon: "🇪🇺",
            description: "דרישות מיוחדות למידע שהועבר מהאזור הכלכלי האירופי",
            questions: [
                {
                    id: "receives_eu_data",
                    text: "האם הארגון מקבל מידע אישי מהאזור הכלכלי האירופי?",
                    type: "select",
                    required: true,
                    options: [
                        { value: "yes", label: "כן, מקבלים מידע מהאיחוד האירופי" },
                        { value: "no", label: "לא, אין מידע מהאיחוד האירופי" },
                        { value: "unknown", label: "לא ודאי" }
                    ],
                    weight: 2,
                    riskFactor: {
                        yes: 2,
                        no: 0,
                        unknown: 1
                    }
                },
                {
                    id: "eu_data_deletion_mechanism",
                    text: "האם קיים מנגנון למחיקת מידע מהאיחוד האירופי כנדרש?",
                    type: "select",
                    required: false,
                    dependsOn: "receives_eu_data",
                    showIf: ["yes"],
                    options: [
                        { value: "yes", label: "כן, קיים מנגנון מלא" },
                        { value: "partial", label: "קיים מנגנון חלקי" },
                        { value: "no", label: "לא קיים מנגנון" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 4
                    }
                },
                {
                    id: "eu_data_minimization",
                    text: "האם מקיימים עקרון צמצום המידע למידע מהאיחוד האירופי?",
                    type: "select",
                    required: false,
                    dependsOn: "receives_eu_data",
                    showIf: ["yes"],
                    options: [
                        { value: "yes", label: "כן, אוספים רק מידע הכרחי" },
                        { value: "partial", label: "חלקית" },
                        { value: "no", label: "לא מקיימים עקרון זה" }
                    ],
                    weight: 2,
                    riskFactor: {
                        yes: 0,
                        partial: 2,
                        no: 3
                    }
                },
                {
                    id: "eu_data_subject_notifications",
                    text: "האם מודיעים לנושאי המידע מהאיחוד האירופי על העברת מידעם לצד שלישי?",
                    type: "select",
                    required: false,
                    dependsOn: "receives_eu_data",
                    showIf: ["yes"],
                    options: [
                        { value: "yes", label: "כן, תמיד מודיעים מראש" },
                        { value: "sometimes", label: "מודיעים לעיתים" },
                        { value: "no", label: "לא מודיעים" },
                        { value: "no_transfers", label: "לא מעבירים לצד שלישי" }
                    ],
                    weight: 3,
                    riskFactor: {
                        yes: 0,
                        sometimes: 2,
                        no: 4,
                        no_transfers: 0
                    }
                },
                {
                    id: "eu_regulation_compliance",
                    text: "האם מקיימים את תקנות הגנת הפרטיות לעניין מידע שהועבר מהאזור הכלכלי האירופי?",
                    type: "multiselect",
                    required: false,
                    dependsOn: "receives_eu_data",
                    showIf: ["yes"],
                    options: [
                        { value: "accuracy_maintenance", label: "הפעלת מנגנון לוודא שהמידע נכון ומעודכן" },
                        { value: "automatic_deletion", label: "מחיקה אוטומטית של מידע שאינו נחוץ" },
                        { value: "correction_mechanism", label: "מנגנון לתיקון מידע לא נכון" },
                        { value: "deletion_on_request", label: "מחיקת מידע לבקשת נושא המידע" },
                        { value: "transfer_notifications", label: "הודעות על העברות לצד שלישי" }
                    ],
                    weight: 4,
                    calculateRisk: (selected) => Math.max(0, 5 - selected.length)
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