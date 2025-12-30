/**
 * Timer Module
 * Базовий клас таймера з EventEmitter паттерном
 */

import { TIMER_STATES, MS_PER_SECOND, PHASE_TYPES } from '../utils/constants.js';
import { minutesToSeconds } from '../utils/helpers.js';

class Timer {
    constructor() {
        this.state = TIMER_STATES.IDLE;
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
        this.intervalId = null;
        this.startTime = null;
        this.pausedAt = null;
        this.currentPhase = PHASE_TYPES.SIMPLE_BREAK;

        // Event listeners
        this.listeners = {
            tick: [],
            start: [],
            pause: [],
            resume: [],
            reset: [],
            complete: [],
            stateChange: [],
        };
    }

    /**
     * Підписка на подію
     * @param {string} event - Назва події
     * @param {Function} callback - Обробник
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Відписка від події
     * @param {string} event - Назва події
     * @param {Function} callback - Обробник
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Виклик події
     * @param {string} event - Назва події
     * @param {any} data - Дані події
     */
    emit(event, data = {}) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Встановлює тривалість таймера
     * @param {number} minutes - Тривалість в хвилинах
     */
    setDuration(minutes) {
        this.totalSeconds = minutesToSeconds(minutes);
        this.remainingSeconds = this.totalSeconds;
    }

    /**
     * Встановлює фазу
     * @param {string} phase - Тип фази
     */
    setPhase(phase) {
        this.currentPhase = phase;
    }

    /**
     * Запускає таймер
     */
    start() {
        if (this.state === TIMER_STATES.RUNNING) return;

        this.state = TIMER_STATES.RUNNING;
        this.startTime = Date.now();

        this.intervalId = setInterval(() => this.tick(), MS_PER_SECOND);

        this.emit('start', {
            totalSeconds: this.totalSeconds,
            remainingSeconds: this.remainingSeconds,
            phase: this.currentPhase,
        });
        this.emit('stateChange', { state: this.state });
    }

    /**
     * Один тік таймера
     */
    tick() {
        if (this.state !== TIMER_STATES.RUNNING) return;

        this.remainingSeconds--;

        this.emit('tick', {
            remainingSeconds: this.remainingSeconds,
            totalSeconds: this.totalSeconds,
            progress: this.getProgress(),
            phase: this.currentPhase,
        });

        if (this.remainingSeconds <= 0) {
            this.complete();
        }
    }

    /**
     * Ставить таймер на паузу
     */
    pause() {
        if (this.state !== TIMER_STATES.RUNNING) return;

        this.state = TIMER_STATES.PAUSED;
        this.pausedAt = Date.now();

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.emit('pause', {
            remainingSeconds: this.remainingSeconds,
        });
        this.emit('stateChange', { state: this.state });
    }

    /**
     * Продовжує таймер
     */
    resume() {
        if (this.state !== TIMER_STATES.PAUSED) return;

        this.state = TIMER_STATES.RUNNING;
        this.intervalId = setInterval(() => this.tick(), MS_PER_SECOND);

        this.emit('resume', {
            remainingSeconds: this.remainingSeconds,
        });
        this.emit('stateChange', { state: this.state });
    }

    /**
     * Скидає таймер
     */
    reset() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.state = TIMER_STATES.IDLE;
        this.remainingSeconds = this.totalSeconds;
        this.startTime = null;
        this.pausedAt = null;

        this.emit('reset', {
            totalSeconds: this.totalSeconds,
        });
        this.emit('stateChange', { state: this.state });
    }

    /**
     * Завершує таймер
     */
    complete() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.state = TIMER_STATES.COMPLETED;
        this.remainingSeconds = 0;

        this.emit('complete', {
            phase: this.currentPhase,
            totalSeconds: this.totalSeconds,
        });
        this.emit('stateChange', { state: this.state });
    }

    /**
     * Повертає прогрес (0-1)
     * @returns {number} Прогрес
     */
    getProgress() {
        if (this.totalSeconds === 0) return 0;
        return (this.totalSeconds - this.remainingSeconds) / this.totalSeconds;
    }

    /**
     * Повертає залишковий прогрес (1-0)
     * @returns {number} Залишковий прогрес
     */
    getRemainingProgress() {
        return 1 - this.getProgress();
    }

    /**
     * Чи запущений таймер
     * @returns {boolean}
     */
    isRunning() {
        return this.state === TIMER_STATES.RUNNING;
    }

    /**
     * Чи на паузі таймер
     * @returns {boolean}
     */
    isPaused() {
        return this.state === TIMER_STATES.PAUSED;
    }

    /**
     * Чи в стані очікування
     * @returns {boolean}
     */
    isIdle() {
        return this.state === TIMER_STATES.IDLE;
    }

    /**
     * Чи завершений
     * @returns {boolean}
     */
    isCompleted() {
        return this.state === TIMER_STATES.COMPLETED;
    }

    /**
     * Отримує поточний стан
     * @returns {string}
     */
    getState() {
        return this.state;
    }

    /**
     * Знищує таймер
     */
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.listeners = {
            tick: [],
            start: [],
            pause: [],
            resume: [],
            reset: [],
            complete: [],
            stateChange: [],
        };
    }
}

export default Timer;
