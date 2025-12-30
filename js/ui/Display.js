/**
 * Display Module
 * Відображення часу та інформації
 */

import { formatTime, formatTimeHHMM, $, calculateReturnTime } from '../utils/helpers.js';
import { PROGRESS_RING, PHASE_TYPES } from '../utils/constants.js';

class Display {
    constructor() {
        this.elements = {
            timerDisplay: $('timerDisplay'),
            timerLabel: $('timerLabel'),
            currentTime: $('currentTime'),
            returnTime: $('returnTime'),
            progressCircle: $('progressCircle'),
            completedCycles: $('completedCycles'),
            totalWorkTime: $('totalWorkTime'),
        };

        this.clockInterval = null;
        this.originalTitle = document.title;
        this.isRunning = false;
        this.init();
    }

    /**
     * Ініціалізація дисплея
     */
    init() {
        // Налаштовуємо progress ring
        if (this.elements.progressCircle) {
            this.elements.progressCircle.style.strokeDasharray = PROGRESS_RING.CIRCUMFERENCE;
            this.elements.progressCircle.style.strokeDashoffset = 0;
        }

        // Запускаємо годинник
        this.startClock();
    }

    /**
     * Запускає оновлення годинника
     */
    startClock() {
        this.updateClock();
        this.clockInterval = setInterval(() => this.updateClock(), 1000);
    }

    /**
     * Оновлює поточний час
     */
    updateClock() {
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = formatTimeHHMM(new Date());
        }
    }

    /**
     * Оновлює відображення таймера
     * @param {number} remainingSeconds - Залишок секунд
     * @param {number} totalSeconds - Загальна кількість секунд
     * @param {string} phase - Поточна фаза
     */
    updateTimer(remainingSeconds, totalSeconds, phase) {
        this.isRunning = true;
        const timeStr = formatTime(remainingSeconds);

        // Оновлюємо час
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.textContent = timeStr;
        }

        // Оновлюємо title вкладки
        this.updateTitle(timeStr, phase);

        // Оновлюємо прогрес
        this.updateProgress(remainingSeconds, totalSeconds);

        // Оновлюємо час повернення
        this.updateReturnTime(remainingSeconds);

        // Оновлюємо лейбл фази
        this.updatePhaseLabel(phase);
    }

    /**
     * Оновлює title сторінки
     * @param {string} timeStr - Час у форматі MM:SS
     * @param {string} phase - Тип фази
     */
    updateTitle(timeStr, phase) {
        const phaseIcons = {
            [PHASE_TYPES.WORK]: '💼',
            [PHASE_TYPES.SHORT_BREAK]: '☕',
            [PHASE_TYPES.LONG_BREAK]: '🧘',
            [PHASE_TYPES.SIMPLE_BREAK]: '⏸️',
        };
        const icon = phaseIcons[phase] || '⏱️';
        document.title = `${timeStr} ${icon} Descansar`;
    }

    /**
     * Скидає title до оригінального
     */
    resetTitle() {
        this.isRunning = false;
        document.title = this.originalTitle;
    }

    /**
     * Оновлює прогрес-бар
     * @param {number} remainingSeconds - Залишок секунд
     * @param {number} totalSeconds - Загальна кількість секунд
     */
    updateProgress(remainingSeconds, totalSeconds) {
        if (!this.elements.progressCircle) return;

        const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
        const offset = PROGRESS_RING.CIRCUMFERENCE * (1 - progress);

        this.elements.progressCircle.style.strokeDashoffset = offset;
    }

    /**
     * Оновлює час повернення
     * @param {number} remainingSeconds - Залишок секунд
     */
    updateReturnTime(remainingSeconds) {
        if (!this.elements.returnTime) return;

        const returnDate = new Date(Date.now() + remainingSeconds * 1000);
        this.elements.returnTime.textContent = formatTimeHHMM(returnDate);
    }

    /**
     * Оновлює лейбл фази
     * @param {string} phase - Тип фази
     */
    updatePhaseLabel(phase) {
        if (!this.elements.timerLabel) return;

        const labels = {
            [PHASE_TYPES.WORK]: 'Час працювати',
            [PHASE_TYPES.SHORT_BREAK]: 'Коротка перерва',
            [PHASE_TYPES.LONG_BREAK]: 'Довга перерва',
            [PHASE_TYPES.SIMPLE_BREAK]: 'Перерва',
        };

        this.elements.timerLabel.textContent = labels[phase] || 'Перерва';
    }

    /**
     * Встановлює початковий стан
     * @param {number} durationMinutes - Тривалість в хвилинах
     */
    setInitialState(durationMinutes) {
        const totalSeconds = durationMinutes * 60;

        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.textContent = formatTime(totalSeconds);
        }

        if (this.elements.timerLabel) {
            this.elements.timerLabel.textContent = 'Готовий до старту';
        }

        if (this.elements.returnTime) {
            const returnDate = calculateReturnTime(durationMinutes);
            this.elements.returnTime.textContent = formatTimeHHMM(returnDate);
        }

        // Скидаємо прогрес
        this.updateProgress(totalSeconds, totalSeconds);

        // Скидаємо title
        this.resetTitle();
    }

    /**
     * Показує повідомлення про завершення
     * @param {string} phase - Тип фази
     */
    showCompleted(phase) {
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.textContent = '00:00';
        }

        if (this.elements.timerLabel) {
            const messages = {
                [PHASE_TYPES.WORK]: 'Час для перерви!',
                [PHASE_TYPES.SHORT_BREAK]: 'Перерва завершена!',
                [PHASE_TYPES.LONG_BREAK]: 'Довга перерва завершена!',
                [PHASE_TYPES.SIMPLE_BREAK]: 'Час повертатися!',
            };
            this.elements.timerLabel.textContent = messages[phase] || 'Завершено!';
        }

        // Оновлюємо title з повідомленням про завершення
        document.title = '🔔 Час! | Descansar';
    }

    /**
     * Оновлює статистику сесії
     * @param {Object} stats - Статистика
     */
    updateSessionStats(stats) {
        if (this.elements.completedCycles) {
            this.elements.completedCycles.textContent = stats.completedCycles || 0;
        }

        if (this.elements.totalWorkTime) {
            const hours = Math.floor(stats.totalWorkMinutes / 60);
            const minutes = stats.totalWorkMinutes % 60;
            this.elements.totalWorkTime.textContent = hours > 0
                ? `${hours}:${String(minutes).padStart(2, '0')}`
                : `${minutes} хв`;
        }
    }

    /**
     * Знищення
     */
    destroy() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }
}

export default Display;
