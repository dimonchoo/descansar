/**
 * Storage Module
 * Управління збереженням даних в localStorage
 */

import { STORAGE_KEYS, DEFAULTS, THEMES } from '../utils/constants.js';

class Storage {
    /**
     * Зберігає дані в localStorage
     * @param {string} key - Ключ
     * @param {any} value - Значення
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage: Unable to save', key, e);
        }
    }

    /**
     * Отримує дані з localStorage
     * @param {string} key - Ключ
     * @param {any} defaultValue - Значення за замовчуванням
     * @returns {any} Збережене значення або default
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage: Unable to read', key, e);
            return defaultValue;
        }
    }

    /**
     * Видаляє дані з localStorage
     * @param {string} key - Ключ
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Storage: Unable to remove', key, e);
        }
    }

    /**
     * Очищає всі дані додатку
     */
    static clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            Storage.remove(key);
        });
    }

    // --- Налаштування ---

    /**
     * Отримує налаштування
     * @returns {Object} Налаштування
     */
    static getSettings() {
        return Storage.get(STORAGE_KEYS.SETTINGS, {
            enableNotifications: true,
            enableSound: true,
            autoTheme: false,
            breakDuration: DEFAULTS.BREAK_DURATION,
            workDuration: DEFAULTS.WORK_DURATION,
            shortBreak: DEFAULTS.SHORT_BREAK,
            longBreak: DEFAULTS.LONG_BREAK,
            cyclesBeforeLong: DEFAULTS.CYCLES_BEFORE_LONG,
            selectedTechnique: null,
            mode: 'simple',
        });
    }

    /**
     * Зберігає налаштування
     * @param {Object} settings - Налаштування
     */
    static saveSettings(settings) {
        const current = Storage.getSettings();
        Storage.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
    }

    /**
     * Оновлює одне налаштування
     * @param {string} key - Ключ налаштування
     * @param {any} value - Значення
     */
    static updateSetting(key, value) {
        Storage.saveSettings({ [key]: value });
    }

    // --- Тема ---

    /**
     * Отримує збережену тему
     * @returns {string} Тема
     */
    static getTheme() {
        return Storage.get(STORAGE_KEYS.THEME, THEMES.LIGHT);
    }

    /**
     * Зберігає тему
     * @param {string} theme - Тема
     */
    static saveTheme(theme) {
        Storage.set(STORAGE_KEYS.THEME, theme);
    }

    // --- Статистика ---

    /**
     * Отримує статистику
     * @returns {Object} Статистика
     */
    static getStats() {
        return Storage.get(STORAGE_KEYS.STATS, {
            totalBreaks: 0,
            totalWorkSessions: 0,
            totalBreakMinutes: 0,
            totalWorkMinutes: 0,
            streak: 0,
            lastActiveDate: null,
            history: [],
        });
    }

    /**
     * Зберігає статистику
     * @param {Object} stats - Статистика
     */
    static saveStats(stats) {
        Storage.set(STORAGE_KEYS.STATS, stats);
    }

    /**
     * Додає завершену сесію до статистики
     * @param {Object} session - Дані сесії
     */
    static addCompletedSession(session) {
        const stats = Storage.getStats();
        const today = new Date().toISOString().split('T')[0];

        // Оновлення streak
        if (stats.lastActiveDate === today) {
            // Вже активний сьогодні
        } else if (stats.lastActiveDate === Storage.getYesterday()) {
            stats.streak += 1;
        } else {
            stats.streak = 1;
        }

        stats.lastActiveDate = today;

        if (session.type === 'break') {
            stats.totalBreaks += 1;
            stats.totalBreakMinutes += session.duration;
        } else {
            stats.totalWorkSessions += 1;
            stats.totalWorkMinutes += session.duration;
        }

        // Зберігаємо останні 30 записів історії
        stats.history.unshift({
            ...session,
            date: new Date().toISOString(),
        });
        stats.history = stats.history.slice(0, 30);

        Storage.saveStats(stats);
    }

    /**
     * Отримує вчорашню дату
     * @returns {string} Дата у форматі YYYY-MM-DD
     */
    static getYesterday() {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    }

    // --- Остання сесія ---

    /**
     * Зберігає останню сесію (для відновлення)
     * @param {Object} session - Дані сесії
     */
    static saveLastSession(session) {
        Storage.set(STORAGE_KEYS.LAST_SESSION, session);
    }

    /**
     * Отримує останню сесію
     * @returns {Object|null} Дані сесії
     */
    static getLastSession() {
        return Storage.get(STORAGE_KEYS.LAST_SESSION, null);
    }

    /**
     * Видаляє останню сесію
     */
    static clearLastSession() {
        Storage.remove(STORAGE_KEYS.LAST_SESSION);
    }
}

export default Storage;
