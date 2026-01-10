/**
 * Notifications Module
 * Управління сповіщеннями (Push + Sound)
 */

import { SOUNDS, PHASE_TYPES } from '../utils/constants.js';
import { supportsNotifications } from '../utils/helpers.js';
import Storage from './Storage.js';
import { t } from '../utils/i18n.js';

class Notifications {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.soundEnabled = true;
        this.wakeLock = null;
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
            // Спочатку пробуємо Web Audio API
            if (this.audioContext) {
                // Розблокуємо аудіо контекст якщо потрібно
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }

                // Створюємо більш помітний звук
                this.playTone(type);
            } else {
                // Fallback: використовуємо HTML5 Audio з data URL (простий beep)
                this.playFallbackSound();
            }
        } catch (e) {
            console.warn('Unable to play sound:', e);
            // Спробуємо fallback
            this.playFallbackSound();
        }
    }

    /**
     * Відтворює тон через Web Audio API
     * @param {string} type - Тип звуку
     */
    playTone(type) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Створюємо кілька нот для мелодії
        const notes = type === 'break_end'
            ? [784, 659, 784, 1047] // G5, E5, G5, C6 - енергійна мелодія
            : [523, 659, 784, 1047]; // C5, E5, G5, C6 - приємна мелодія

        notes.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(freq, now + i * 0.15);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.4, now + i * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);

            oscillator.start(now + i * 0.15);
            oscillator.stop(now + i * 0.15 + 0.3);
        });
    }

    /**
     * Fallback звук через HTML5 Audio
     */
    playFallbackSound() {
        try {
            // Генеруємо простий beep звук як base64
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
            console.warn('Fallback sound failed:', e);
        }
    }

    /**
     * Розблоковує аудіо (викликати при першій взаємодії)
     */
    async unlockAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                // Тихий тестовий звук
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                gainNode.gain.value = 0.001;
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.001);
            } catch (e) {
                // Ігноруємо помилки
            }
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

    /**
     * Вібрує пристрій (для мобільних)
     * @param {number[]} pattern - Патерн вібрації [вібрація, пауза, вібрація...]
     */
    vibrate(pattern = [200, 100, 200, 100, 300]) {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                console.warn('Vibration failed:', e);
            }
        }
    }

    /**
     * Запитує Wake Lock щоб екран не засинав
     */
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock активовано');

                // Перезапитуємо якщо сторінка знову стає видимою
                document.addEventListener('visibilitychange', async () => {
                    if (this.wakeLock !== null && document.visibilityState === 'visible') {
                        this.wakeLock = await navigator.wakeLock.request('screen');
                    }
                });
            } catch (e) {
                console.warn('Wake Lock failed:', e);
            }
        }
    }

    /**
     * Звільняє Wake Lock
     */
    async releaseWakeLock() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
                console.log('Wake Lock деактивовано');
            } catch (e) {
                console.warn('Wake Lock release failed:', e);
            }
        }
    }

    /**
     * Сповіщення про завершення з усіма ефектами
     * @param {string} phase - Тип фази
     */
    notifyPhaseComplete(phase) {
        const messages = {
            [PHASE_TYPES.SIMPLE_BREAK]: {
                title: t('notifications.simpleBreakTitle'),
                body: t('notifications.simpleBreakBody'),
                sound: 'break_end',
            },
            [PHASE_TYPES.SHORT_BREAK]: {
                title: t('notifications.shortBreakTitle'),
                body: t('notifications.shortBreakBody'),
                sound: 'break_end',
            },
            [PHASE_TYPES.LONG_BREAK]: {
                title: t('notifications.longBreakTitle'),
                body: t('notifications.longBreakBody'),
                sound: 'break_end',
            },
            [PHASE_TYPES.WORK]: {
                title: t('notifications.workTitle'),
                body: t('notifications.workBody'),
                sound: 'work_end',
            },
        };

        const message = messages[phase] || messages[PHASE_TYPES.SIMPLE_BREAK];

        // Всі типи сповіщень
        this.showNotification(message.title, { body: message.body });
        this.playSound(message.sound);
        this.vibrate(); // Вібрація для мобільних

        // Звільняємо Wake Lock після завершення
        this.releaseWakeLock();
    }
}

// Синглтон
export default new Notifications();
