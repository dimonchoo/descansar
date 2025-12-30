/**
 * Advanced Mode
 * Розширений режим з підтримкою технік продуктивності
 */

import Timer from '../core/Timer.js';
import Storage from '../core/Storage.js';
import Notifications from '../core/Notifications.js';
import { PHASE_TYPES, TECHNIQUES, DEFAULTS } from '../utils/constants.js';
import { validateNumber, VALIDATION } from '../utils/constants.js';

class AdvancedMode {
    constructor() {
        this.timer = new Timer();

        // Поточна техніка
        this.technique = null;

        // Налаштування поточної техніки
        this.settings = {
            workDuration: DEFAULTS.WORK_DURATION,
            shortBreak: DEFAULTS.SHORT_BREAK,
            longBreak: DEFAULTS.LONG_BREAK,
            cyclesBeforeLong: DEFAULTS.CYCLES_BEFORE_LONG,
        };

        // Стан сесії
        this.currentPhase = PHASE_TYPES.WORK;
        this.currentCycle = 0;
        this.completedCycles = 0;
        this.totalWorkMinutes = 0;
        this.isAutoAdvance = true;

        // Callbacks
        this.onUpdate = null;
        this.onComplete = null;
        this.onStateChange = null;
        this.onPhaseChange = null;

        this.setupListeners();
    }

    /**
     * Налаштовує слухачів подій таймера
     */
    setupListeners() {
        this.timer.on('tick', (data) => {
            if (this.onUpdate) {
                this.onUpdate({
                    ...data,
                    currentCycle: this.currentCycle,
                    completedCycles: this.completedCycles,
                    currentPhase: this.currentPhase,
                });
            }
        });

        this.timer.on('complete', () => {
            this.handlePhaseComplete();
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
        const savedSettings = Storage.getSettings();

        if (savedSettings.selectedTechnique) {
            this.setTechnique(savedSettings.selectedTechnique);
        }

        // Завантажуємо кастомні налаштування
        this.settings = {
            workDuration: savedSettings.workDuration || DEFAULTS.WORK_DURATION,
            shortBreak: savedSettings.shortBreak || DEFAULTS.SHORT_BREAK,
            longBreak: savedSettings.longBreak || DEFAULTS.LONG_BREAK,
            cyclesBeforeLong: savedSettings.cyclesBeforeLong || DEFAULTS.CYCLES_BEFORE_LONG,
        };
    }

    /**
     * Встановлює техніку
     * @param {string} techniqueId - ID техніки
     */
    setTechnique(techniqueId) {
        this.technique = techniqueId;

        // Застосовуємо пресети техніки
        if (techniqueId === TECHNIQUES.POMODORO.id) {
            this.settings = {
                workDuration: TECHNIQUES.POMODORO.workDuration,
                shortBreak: TECHNIQUES.POMODORO.shortBreak,
                longBreak: TECHNIQUES.POMODORO.longBreak,
                cyclesBeforeLong: TECHNIQUES.POMODORO.cyclesBeforeLong,
            };
        } else if (techniqueId === TECHNIQUES.FIFTY_TWO_SEVENTEEN.id) {
            this.settings = {
                workDuration: TECHNIQUES.FIFTY_TWO_SEVENTEEN.workDuration,
                shortBreak: TECHNIQUES.FIFTY_TWO_SEVENTEEN.shortBreak,
                longBreak: TECHNIQUES.FIFTY_TWO_SEVENTEEN.longBreak,
                cyclesBeforeLong: TECHNIQUES.FIFTY_TWO_SEVENTEEN.cyclesBeforeLong,
            };
        }
        // Для custom — залишаємо поточні налаштування

        Storage.updateSetting('selectedTechnique', techniqueId);
    }

    /**
     * Оновлює кастомні налаштування
     * @param {Object} newSettings - Нові налаштування
     */
    updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings,
        };

        // Зберігаємо в storage
        Storage.saveSettings({
            workDuration: this.settings.workDuration,
            shortBreak: this.settings.shortBreak,
            longBreak: this.settings.longBreak,
            cyclesBeforeLong: this.settings.cyclesBeforeLong,
        });
    }

    /**
     * Запускає сесію
     * @param {string} startPhase - Початкова фаза (опціонально)
     */
    start(startPhase = PHASE_TYPES.WORK) {
        this.currentPhase = startPhase;
        this.startCurrentPhase();
    }

    /**
     * Запускає поточну фазу
     */
    startCurrentPhase() {
        const duration = this.getPhaseDuration(this.currentPhase);

        this.timer.setDuration(duration);
        this.timer.setPhase(this.currentPhase);
        this.timer.start();

        if (this.onPhaseChange) {
            this.onPhaseChange({
                phase: this.currentPhase,
                duration: duration,
                cycle: this.currentCycle,
            });
        }
    }

    /**
     * Отримує тривалість фази
     * @param {string} phase - Тип фази
     * @returns {number} Тривалість в хвилинах
     */
    getPhaseDuration(phase) {
        switch (phase) {
            case PHASE_TYPES.WORK:
                return this.settings.workDuration;
            case PHASE_TYPES.SHORT_BREAK:
                return this.settings.shortBreak;
            case PHASE_TYPES.LONG_BREAK:
                return this.settings.longBreak;
            default:
                return this.settings.workDuration;
        }
    }

    /**
     * Обробляє завершення фази
     */
    handlePhaseComplete() {
        // Сповіщення
        Notifications.notifyPhaseComplete(this.currentPhase);

        // Оновлюємо статистику
        if (this.currentPhase === PHASE_TYPES.WORK) {
            this.completedCycles++;
            this.totalWorkMinutes += this.settings.workDuration;
            this.currentCycle++;

            Storage.addCompletedSession({
                type: 'work',
                duration: this.settings.workDuration,
                phase: PHASE_TYPES.WORK,
            });
        } else {
            const breakDuration = this.currentPhase === PHASE_TYPES.LONG_BREAK
                ? this.settings.longBreak
                : this.settings.shortBreak;

            Storage.addCompletedSession({
                type: 'break',
                duration: breakDuration,
                phase: this.currentPhase,
            });
        }

        // Визначаємо наступну фазу
        const nextPhase = this.getNextPhase();

        if (this.onComplete) {
            this.onComplete({
                completedPhase: this.currentPhase,
                nextPhase: nextPhase,
                completedCycles: this.completedCycles,
                totalWorkMinutes: this.totalWorkMinutes,
            });
        }

        // Автоматично переходимо до наступної фази
        if (this.isAutoAdvance) {
            this.currentPhase = nextPhase;
            // Невелика пауза перед наступною фазою
            setTimeout(() => {
                this.startCurrentPhase();
            }, 1000);
        }
    }

    /**
     * Визначає наступну фазу
     * @returns {string} Наступна фаза
     */
    getNextPhase() {
        if (this.currentPhase === PHASE_TYPES.WORK) {
            // Після роботи — перерва
            if (this.currentCycle >= this.settings.cyclesBeforeLong) {
                this.currentCycle = 0;
                return PHASE_TYPES.LONG_BREAK;
            }
            return PHASE_TYPES.SHORT_BREAK;
        } else {
            // Після перерви — робота
            return PHASE_TYPES.WORK;
        }
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
     * Скинути поточну фазу
     */
    reset() {
        this.timer.reset();
    }

    /**
     * Скинути всю сесію
     */
    resetSession() {
        this.timer.reset();
        this.currentCycle = 0;
        this.completedCycles = 0;
        this.totalWorkMinutes = 0;
        this.currentPhase = PHASE_TYPES.WORK;
    }

    /**
     * Пропустити поточну фазу
     */
    skipPhase() {
        this.timer.reset();
        this.currentPhase = this.getNextPhase();
        this.startCurrentPhase();
    }

    /**
     * Встановлює автоперехід між фазами
     * @param {boolean} enabled - Увімкнено/вимкнено
     */
    setAutoAdvance(enabled) {
        this.isAutoAdvance = enabled;
    }

    /**
     * Отримати стан таймера
     * @returns {string}
     */
    getState() {
        return this.timer.getState();
    }

    /**
     * Отримати поточну фазу
     * @returns {string}
     */
    getCurrentPhase() {
        return this.currentPhase;
    }

    /**
     * Отримати прогрес
     * @returns {number}
     */
    getProgress() {
        return this.timer.getProgress();
    }

    /**
     * Отримати статистику сесії
     * @returns {Object}
     */
    getSessionStats() {
        return {
            completedCycles: this.completedCycles,
            currentCycle: this.currentCycle,
            totalWorkMinutes: this.totalWorkMinutes,
            currentPhase: this.currentPhase,
        };
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
     * Знищення
     */
    destroy() {
        this.timer.destroy();
    }
}

export default AdvancedMode;
