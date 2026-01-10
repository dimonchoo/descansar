/**
 * Internationalization (i18n) Module
 * Provides translations for the app
 */

const translations = {
    en: {
        // Timer labels
        readyToStart: 'Ready to start',
        workTime: 'Work time',
        shortBreak: 'Short break',
        longBreak: 'Long break',
        break: 'Break',
        paused: 'Paused',
        ready: 'Ready',

        // Completion messages
        timeForBreak: 'Time for a break!',
        breakComplete: 'Break complete!',
        longBreakComplete: 'Long break complete!',
        timeToReturn: 'Time to return!',
        completed: 'Completed!',
        timeUp: 'Time!',

        // Button labels
        startBreak: 'Start break',
        pause: 'Pause',
        resume: 'Resume',
        reset: 'Reset',

        // Time units
        min: 'min',
        hour: 'hour',

        // Notifications
        notifications: {
            simpleBreakTitle: 'Break complete!',
            simpleBreakBody: 'Time to get back to work',
            shortBreakTitle: 'Short break complete!',
            shortBreakBody: 'Time to continue working',
            longBreakTitle: 'Long break complete!',
            longBreakBody: 'Well rested! Time to work',
            workTitle: 'Work session complete!',
            workBody: 'Time for a well-deserved rest',
        },

        // Embed widget
        embed: {
            ready: 'Ready',
            break: 'Break',
            paused: 'Paused',
            timeToReturn: 'Time to return!',
            pause: 'Pause',
            resume: 'Resume',
            reset: 'Reset',
            start: 'Start',
        },
    },

    uk: {
        // Timer labels
        readyToStart: 'Готовий до старту',
        workTime: 'Час працювати',
        shortBreak: 'Коротка перерва',
        longBreak: 'Довга перерва',
        break: 'Перерва',
        paused: 'Пауза',
        ready: 'Готовий',

        // Completion messages
        timeForBreak: 'Час для перерви!',
        breakComplete: 'Перерва завершена!',
        longBreakComplete: 'Довга перерва завершена!',
        timeToReturn: 'Час повертатися!',
        completed: 'Завершено!',
        timeUp: 'Час!',

        // Button labels
        startBreak: 'Почати перерву',
        pause: 'Пауза',
        resume: 'Продовжити',
        reset: 'Скинути',

        // Time units
        min: 'хв',
        hour: 'год',

        // Notifications
        notifications: {
            simpleBreakTitle: 'Перерва завершена!',
            simpleBreakBody: 'Час повертатися до роботи',
            shortBreakTitle: 'Коротка перерва завершена!',
            shortBreakBody: 'Час продовжити роботу',
            longBreakTitle: 'Довга перерва завершена!',
            longBreakBody: 'Ви чудово відпочили! Час працювати',
            workTitle: 'Робочий час завершено!',
            workBody: 'Час для заслуженого відпочинку',
        },

        // Embed widget
        embed: {
            ready: 'Готовий',
            break: 'Перерва',
            paused: 'Пауза',
            timeToReturn: 'Час повертатися!',
            pause: 'Пауза',
            resume: 'Продовжити',
            reset: 'Скинути',
            start: 'Старт',
        },
    },
};

/**
 * Detects current language from URL or document lang attribute
 * @returns {string} Language code ('en' or 'uk')
 */
function detectLanguage() {
    // Check URL path for /uk
    if (window.location.pathname.startsWith('/uk')) {
        return 'uk';
    }

    // Check document lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang.startsWith('uk')) {
        return 'uk';
    }

    // Default to English
    return 'en';
}

// Current language
let currentLang = detectLanguage();

/**
 * Gets translation for a key
 * @param {string} key - Translation key (supports dot notation like 'notifications.workTitle')
 * @param {string} [lang] - Optional language override
 * @returns {string} Translated string
 */
function t(key, lang = currentLang) {
    const keys = key.split('.');
    let result = translations[lang] || translations.en;

    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            // Fallback to English
            result = translations.en;
            for (const k2 of keys) {
                result = result?.[k2];
                if (result === undefined) break;
            }
            break;
        }
    }

    return result || key;
}

/**
 * Sets current language
 * @param {string} lang - Language code
 */
function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
    }
}

/**
 * Gets current language
 * @returns {string} Current language code
 */
function getLanguage() {
    return currentLang;
}

/**
 * Checks if current language is Ukrainian
 * @returns {boolean}
 */
function isUkrainian() {
    return currentLang === 'uk';
}

export { t, setLanguage, getLanguage, isUkrainian, detectLanguage, translations };
export default { t, setLanguage, getLanguage, isUkrainian, detectLanguage };
