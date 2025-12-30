/**
 * Utility helper functions
 */

import { SECONDS_PER_MINUTE, VALIDATION } from './constants.js';

/**
 * Форматує секунди у MM:SS формат
 * @param {number} totalSeconds - Загальна кількість секунд
 * @returns {string} Форматований час
 */
export function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Форматує час у HH:MM формат
 * @param {Date} date - Дата для форматування
 * @returns {string} Форматований час
 */
export function formatTimeHHMM(date) {
    return date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Валідує та нормалізує числове значення
 * @param {any} value - Значення для валідації
 * @param {number} min - Мінімальне значення
 * @param {number} max - Максимальне значення
 * @param {number} defaultValue - Значення за замовчуванням
 * @returns {number} Валідне число
 */
export function validateNumber(value, min, max, defaultValue) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < min || num > max) {
        return defaultValue;
    }
    return num;
}

/**
 * Валідує тривалість перерви
 * @param {any} value - Значення
 * @param {number} defaultValue - Значення за замовчуванням
 * @returns {number} Валідна тривалість
 */
export function validateBreakDuration(value, defaultValue = 15) {
    return validateNumber(
        value,
        VALIDATION.MIN_BREAK_DURATION,
        VALIDATION.MAX_BREAK_DURATION,
        defaultValue
    );
}

/**
 * Debounce функція для обмеження частоти викликів
 * @param {Function} func - Функція для виклику
 * @param {number} wait - Затримка в мс
 * @returns {Function} Debounced функція
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Генерує унікальний ID
 * @returns {string} Унікальний ідентифікатор
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Перевіряє підтримку Notification API
 * @returns {boolean}
 */
export function supportsNotifications() {
    return 'Notification' in window;
}

/**
 * Перевіряє чи дозволені сповіщення
 * @returns {boolean}
 */
export function notificationsAllowed() {
    return supportsNotifications() && Notification.permission === 'granted';
}

/**
 * Безпечно отримує елемент DOM
 * @param {string} id - ID елемента
 * @returns {HTMLElement|null}
 */
export function $(id) {
    return document.getElementById(id);
}

/**
 * Безпечно додає event listener
 * @param {string|HTMLElement} target - ID або елемент
 * @param {string} event - Назва події
 * @param {Function} handler - Обробник
 */
export function on(target, event, handler) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        element.addEventListener(event, handler);
    }
}

/**
 * Додає/видаляє клас залежно від умови
 * @param {HTMLElement} element - Елемент
 * @param {string} className - Назва класу
 * @param {boolean} condition - Умова
 */
export function toggleClass(element, className, condition) {
    if (element) {
        element.classList.toggle(className, condition);
    }
}

/**
 * Обчислює час повернення
 * @param {number} minutes - Кількість хвилин
 * @returns {Date} Час повернення
 */
export function calculateReturnTime(minutes) {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60 * 1000);
}

/**
 * Конвертує хвилини в секунди
 * @param {number} minutes - Хвилини
 * @returns {number} Секунди
 */
export function minutesToSeconds(minutes) {
    return minutes * SECONDS_PER_MINUTE;
}

/**
 * Перевіряє чи браузер в режимі prefers-reduced-motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Перевіряє чи браузер в темному режимі
 * @returns {boolean}
 */
export function prefersDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
