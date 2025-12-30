/**
 * Simple Mode
 * Простий режим таймера - відстеження перерви
 */

import Timer from '../core/Timer.js';
import Storage from '../core/Storage.js';
import Notifications from '../core/Notifications.js';
import { PHASE_TYPES, DEFAULTS } from '../utils/constants.js';
import { validateBreakDuration } from '../utils/helpers.js';

class SimpleMode {
    constructor() {
        this.timer = new Timer();
        this.breakDuration = DEFAULTS.BREAK_DURATION;
        this.onUpdate = null;
        this.onComplete = null;
        this.onStateChange = null;

        this.setupListeners();
    }

    /**
     * Налаштовує слухачів подій таймера
     */
    setupListeners() {
        this.timer.on('tick', (data) => {
            if (this.onUpdate) {
                this.onUpdate(data);
            }
        });

        this.timer.on('complete', (data) => {
            Notifications.notifyPhaseComplete(PHASE_TYPES.SIMPLE_BREAK);

            Storage.addCompletedSession({
                type: 'break',
                duration: this.breakDuration,
                phase: PHASE_TYPES.SIMPLE_BREAK,
            });

            if (this.onComplete) {
                this.onComplete(data);
            }
        });

        this.timer.on('stateChange', (data) => {
            if (this.onStateChange) {
                this.onStateChange(data);
            }
        });
    }

    /**
     * Ініціалізація режиму
     */
    init() {
        const settings = Storage.getSettings();
        this.breakDuration = validateBreakDuration(settings.breakDuration);
        this.timer.setDuration(this.breakDuration);
        this.timer.setPhase(PHASE_TYPES.SIMPLE_BREAK);
    }

    /**
     * Встановлює тривалість перерви
     * @param {number} minutes - Хвилини
     */
    setDuration(minutes) {
        this.breakDuration = validateBreakDuration(minutes);
        this.timer.setDuration(this.breakDuration);
        Storage.updateSetting('breakDuration', this.breakDuration);
    }

    /**
     * Запускає таймер
     */
    start() {
        this.timer.setDuration(this.breakDuration);
        this.timer.setPhase(PHASE_TYPES.SIMPLE_BREAK);
        this.timer.start();
    }

    /**
     * Пауза
     */
    pause() {
        this.timer.pause();
    }

    /**
     * Продовжити
     */
    resume() {
        this.timer.resume();
    }

    /**
     * Скинути
     */
    reset() {
        this.timer.reset();
    }

    /**
     * Отримати стан таймера
     * @returns {string}
     */
    getState() {
        return this.timer.getState();
    }

    /**
     * Отримати прогрес
     * @returns {number}
     */
    getProgress() {
        return this.timer.getProgress();
    }

    /**
     * Отримати залишковий час в секундах
     * @returns {number}
     */
    getRemainingSeconds() {
        return this.timer.remainingSeconds;
    }

    /**
     * Отримати загальний час в секундах
     * @returns {number}
     */
    getTotalSeconds() {
        return this.timer.totalSeconds;
    }

    /**
     * Чи запущений
     * @returns {boolean}
     */
    isRunning() {
        return this.timer.isRunning();
    }

    /**
     * Чи на паузі
     * @returns {boolean}
     */
    isPaused() {
        return this.timer.isPaused();
    }

    /**
     * Чи в стані очікування
     * @returns {boolean}
     */
    isIdle() {
        return this.timer.isIdle();
    }

    /**
     * Знищення
     */
    destroy() {
        this.timer.destroy();
    }
}

export default SimpleMode;
