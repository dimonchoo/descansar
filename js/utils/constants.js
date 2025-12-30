/**
 * Application constants
 * Централізоване місце для всіх констант додатку
 */

// Часові константи
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const SECONDS_PER_MINUTE = 60;

// Оновлення UI
export const UI_UPDATE_INTERVAL = 1000;

// Валідація
export const VALIDATION = {
    MIN_BREAK_DURATION: 1,
    MAX_BREAK_DURATION: 480,
    MIN_WORK_DURATION: 1,
    MAX_WORK_DURATION: 120,
    MIN_SHORT_BREAK: 1,
    MAX_SHORT_BREAK: 30,
    MIN_LONG_BREAK: 5,
    MAX_LONG_BREAK: 60,
    MIN_CYCLES: 2,
    MAX_CYCLES: 10,
};

// Значення за замовчуванням
export const DEFAULTS = {
    BREAK_DURATION: 15,
    WORK_DURATION: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
    CYCLES_BEFORE_LONG: 4,
};

// Техніки продуктивності
export const TECHNIQUES = {
    POMODORO: {
        id: 'pomodoro',
        name: 'Pomodoro',
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        cyclesBeforeLong: 4,
    },
    FIFTY_TWO_SEVENTEEN: {
        id: '52-17',
        name: '52/17',
        workDuration: 52,
        shortBreak: 17,
        longBreak: 17,
        cyclesBeforeLong: 1,
    },
    CUSTOM: {
        id: 'custom',
        name: 'Власний',
    },
};

// Стани таймера
export const TIMER_STATES = {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
};

// Типи фаз (для розширеного режиму)
export const PHASE_TYPES = {
    WORK: 'work',
    SHORT_BREAK: 'short_break',
    LONG_BREAK: 'long_break',
    SIMPLE_BREAK: 'simple_break',
};

// Режими роботи
export const MODES = {
    SIMPLE: 'simple',
    ADVANCED: 'advanced',
};

// Ключі для localStorage
export const STORAGE_KEYS = {
    SETTINGS: 'descansar_settings',
    STATS: 'descansar_stats',
    THEME: 'descansar_theme',
    LAST_SESSION: 'descansar_last_session',
};

// Прогрес-бар константи (SVG)
export const PROGRESS_RING = {
    RADIUS: 90,
    CIRCUMFERENCE: 2 * Math.PI * 90, // ~565.49
};

// Звукові сповіщення
export const SOUNDS = {
    BREAK_END: '/assets/sounds/break-end.mp3',
    WORK_END: '/assets/sounds/work-end.mp3',
    TICK: '/assets/sounds/tick.mp3',
};

// Теми
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
};

// CSS класи для станів
export const CSS_CLASSES = {
    HIDDEN: 'hidden',
    ACTIVE: 'active',
    RUNNING: 'running',
    PAUSED: 'paused',
};
