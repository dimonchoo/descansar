/**
 * Notifications Module
 * Управління сповіщеннями (Push + Sound)
 */

import { SOUNDS, PHASE_TYPES } from '../utils/constants.js';
import { supportsNotifications } from '../utils/helpers.js';
import Storage from './Storage.js';

class Notifications {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.soundEnabled = true;
    }

    /**
     * Ініціалізація модуля сповіщень
     */
    async init() {
        const settings = Storage.getSettings();
        this.enabled = settings.enableNotifications;
        this.soundEnabled = settings.enableSound;

        // Запит дозволу на сповіщення
        if (this.enabled && supportsNotifications()) {
            await this.requestPermission();
        }

        // Попередньо завантажуємо звуки
        await this.preloadSounds();
    }

    /**
     * Запитує дозвіл на сповіщення
     * @returns {Promise<boolean>}
     */
    async requestPermission() {
        if (!supportsNotifications()) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    /**
     * Попередньо завантажує звуки
     */
    async preloadSounds() {
        // Використовуємо Web Audio API для кращого контролю
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * Відтворює звук сповіщення
     * @param {string} type - Тип звуку
     */
    async playSound(type = 'default') {
        if (!this.soundEnabled) return;

        try {
            // Генеруємо простий звук за допомогою Web Audio API
            if (this.audioContext) {
                // Розблокуємо аудіо контекст якщо потрібно
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }

                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                // Різні звуки для різних типів
                if (type === 'work_end') {
                    // Короткий приємний сигнал для закінчення роботи
                    oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
                    oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
                    oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
                } else if (type === 'break_end') {
                    // Більш енергійний сигнал для закінчення перерви
                    oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime); // G5
                    oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.15); // E5
                } else {
                    // Стандартний сигнал
                    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
                    oscillator.frequency.setValueAtTime(554.37, this.audioContext.currentTime + 0.15); // C#5
                }

                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
            }
        } catch (e) {
            console.warn('Unable to play sound:', e);
        }
    }

    /**
     * Показує push-сповіщення
     * @param {string} title - Заголовок
     * @param {Object} options - Опції
     */
    showNotification(title, options = {}) {
        if (!this.enabled || !supportsNotifications() || Notification.permission !== 'granted') {
            return;
        }

        const defaultOptions = {
            icon: '/assets/icons/icon-192.png',
            badge: '/assets/icons/badge-72.png',
            vibrate: [200, 100, 200],
            tag: 'descansar-timer',
            renotify: true,
            requireInteraction: false,
            ...options,
        };

        try {
            const notification = new Notification(title, defaultOptions);

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Автоматично закриваємо через 10 секунд
            setTimeout(() => notification.close(), 10000);
        } catch (e) {
            console.warn('Unable to show notification:', e);
        }
    }

    /**
     * Сповіщення про завершення перерви
     * @param {string} phase - Тип фази
     */
    notifyPhaseComplete(phase) {
        const messages = {
            [PHASE_TYPES.SIMPLE_BREAK]: {
                title: 'Перерва завершена!',
                body: 'Час повертатися до роботи',
                sound: 'break_end',
            },
            [PHASE_TYPES.SHORT_BREAK]: {
                title: 'Коротка перерва завершена!',
                body: 'Час продовжити роботу',
                sound: 'break_end',
            },
            [PHASE_TYPES.LONG_BREAK]: {
                title: 'Довга перерва завершена!',
                body: 'Ви чудово відпочили! Час працювати',
                sound: 'break_end',
            },
            [PHASE_TYPES.WORK]: {
                title: 'Робочий час завершено!',
                body: 'Час для заслуженого відпочинку',
                sound: 'work_end',
            },
        };

        const message = messages[phase] || messages[PHASE_TYPES.SIMPLE_BREAK];

        this.showNotification(message.title, { body: message.body });
        this.playSound(message.sound);
    }

    /**
     * Оновлює налаштування сповіщень
     * @param {boolean} enabled - Чи увімкнені push
     * @param {boolean} soundEnabled - Чи увімкнений звук
     */
    updateSettings(enabled, soundEnabled) {
        this.enabled = enabled;
        this.soundEnabled = soundEnabled;

        Storage.updateSetting('enableNotifications', enabled);
        Storage.updateSetting('enableSound', soundEnabled);
    }

    /**
     * Перевіряє чи увімкнені сповіщення
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled && supportsNotifications() && Notification.permission === 'granted';
    }

    /**
     * Перевіряє чи увімкнений звук
     * @returns {boolean}
     */
    isSoundEnabled() {
        return this.soundEnabled;
    }
}

// Синглтон
export default new Notifications();
