/**
 * Exercises Module
 * Вправи для перерв: дихання, очі, розминка
 */

import { $ } from '../utils/helpers.js';

class Exercises {
    constructor() {
        this.currentExercise = null;
        this.isRunning = false;
        this.animationFrame = null;
        this.phaseTimeout = null;

        this.elements = {
            container: null,
            circle: null,
            instruction: null,
            timer: null,
            startBtn: null,
            stopBtn: null,
            typeSelector: null,
        };

        // Дихальні техніки
        this.breathingTechniques = {
            relaxing: {
                name: 'Релаксація 4-7-8',
                description: 'Заспокійлива техніка для зняття стресу',
                phases: [
                    { name: 'Вдих', duration: 4, scale: 1.5 },
                    { name: 'Затримка', duration: 7, scale: 1.5 },
                    { name: 'Видих', duration: 8, scale: 1 },
                ],
            },
            box: {
                name: 'Квадратне дихання',
                description: 'Баланс та концентрація',
                phases: [
                    { name: 'Вдих', duration: 4, scale: 1.5 },
                    { name: 'Затримка', duration: 4, scale: 1.5 },
                    { name: 'Видих', duration: 4, scale: 1 },
                    { name: 'Затримка', duration: 4, scale: 1 },
                ],
            },
            energizing: {
                name: 'Енергія 4-4',
                description: 'Швидке відновлення енергії',
                phases: [
                    { name: 'Вдих', duration: 4, scale: 1.5 },
                    { name: 'Видих', duration: 4, scale: 1 },
                ],
            },
        };

        this.currentTechnique = 'box';
        this.currentPhaseIndex = 0;
        this.cyclesCompleted = 0;
        this.totalCycles = 3;
    }

    /**
     * Ініціалізація
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderTechniqueSelector();
    }

    /**
     * Кешує DOM елементи
     */
    cacheElements() {
        this.elements = {
            container: $('exerciseContainer'),
            circle: $('breathingCircle'),
            instruction: $('breathingInstruction'),
            timer: $('breathingTimer'),
            startBtn: $('startExercise'),
            stopBtn: $('stopExercise'),
            typeSelector: $('exerciseType'),
            cycleCounter: $('cycleCounter'),
            description: $('exerciseDescription'),
        };
    }

    /**
     * Прив'язує події
     */
    bindEvents() {
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.start());
        }

        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stop());
        }

        if (this.elements.typeSelector) {
            this.elements.typeSelector.addEventListener('change', (e) => {
                this.currentTechnique = e.target.value;
                this.updateDescription();
            });
        }
    }

    /**
     * Рендерить селектор технік
     */
    renderTechniqueSelector() {
        if (!this.elements.typeSelector) return;

        this.elements.typeSelector.innerHTML = Object.entries(this.breathingTechniques)
            .map(([key, tech]) => `<option value="${key}">${tech.name}</option>`)
            .join('');

        this.updateDescription();
    }

    /**
     * Оновлює опис техніки
     */
    updateDescription() {
        if (!this.elements.description) return;

        const technique = this.breathingTechniques[this.currentTechnique];
        this.elements.description.textContent = technique.description;
    }

    /**
     * Запускає вправу
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.currentPhaseIndex = 0;
        this.cyclesCompleted = 0;

        this.updateUI(true);
        this.runPhase();
    }

    /**
     * Зупиняє вправу
     */
    stop() {
        this.isRunning = false;

        if (this.phaseTimeout) {
            clearTimeout(this.phaseTimeout);
            this.phaseTimeout = null;
        }

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.resetCircle();
        this.updateUI(false);

        if (this.elements.instruction) {
            this.elements.instruction.textContent = 'Готово!';
        }
        if (this.elements.timer) {
            this.elements.timer.textContent = '';
        }
    }

    /**
     * Виконує поточну фазу
     */
    runPhase() {
        if (!this.isRunning) return;

        const technique = this.breathingTechniques[this.currentTechnique];
        const phase = technique.phases[this.currentPhaseIndex];

        // Оновлюємо інструкцію
        if (this.elements.instruction) {
            this.elements.instruction.textContent = phase.name;
        }

        // Анімуємо коло
        this.animateCircle(phase.scale, phase.duration);

        // Запускаємо таймер фази
        this.runPhaseTimer(phase.duration);
    }

    /**
     * Таймер фази
     * @param {number} duration - Тривалість в секундах
     */
    runPhaseTimer(duration) {
        let remaining = duration;

        const tick = () => {
            if (!this.isRunning) return;

            if (this.elements.timer) {
                this.elements.timer.textContent = remaining;
            }

            if (remaining > 0) {
                remaining--;
                this.phaseTimeout = setTimeout(tick, 1000);
            } else {
                this.nextPhase();
            }
        };

        tick();
    }

    /**
     * Переходить до наступної фази
     */
    nextPhase() {
        if (!this.isRunning) return;

        const technique = this.breathingTechniques[this.currentTechnique];
        this.currentPhaseIndex++;

        // Якщо всі фази пройдені - новий цикл
        if (this.currentPhaseIndex >= technique.phases.length) {
            this.currentPhaseIndex = 0;
            this.cyclesCompleted++;

            this.updateCycleCounter();

            // Перевіряємо чи досягли ліміту циклів
            if (this.cyclesCompleted >= this.totalCycles) {
                this.complete();
                return;
            }
        }

        this.runPhase();
    }

    /**
     * Завершує вправу
     */
    complete() {
        this.isRunning = false;

        if (this.elements.instruction) {
            this.elements.instruction.textContent = 'Чудово!';
        }
        if (this.elements.timer) {
            this.elements.timer.textContent = '';
        }

        this.resetCircle();
        this.updateUI(false);

        // Callback для зовнішнього використання
        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * Анімує коло
     * @param {number} targetScale - Цільовий розмір
     * @param {number} duration - Тривалість в секундах
     */
    animateCircle(targetScale, duration) {
        if (!this.elements.circle) return;

        this.elements.circle.style.transition = `transform ${duration}s ease-in-out`;
        this.elements.circle.style.transform = `scale(${targetScale})`;
    }

    /**
     * Скидає коло до початкового стану
     */
    resetCircle() {
        if (!this.elements.circle) return;

        this.elements.circle.style.transition = 'transform 0.5s ease-out';
        this.elements.circle.style.transform = 'scale(1)';
    }

    /**
     * Оновлює лічильник циклів
     */
    updateCycleCounter() {
        if (!this.elements.cycleCounter) return;

        this.elements.cycleCounter.textContent = `${this.cyclesCompleted}/${this.totalCycles}`;
    }

    /**
     * Оновлює UI
     * @param {boolean} isRunning - Чи запущена вправа
     */
    updateUI(isRunning) {
        if (this.elements.startBtn) {
            this.elements.startBtn.style.display = isRunning ? 'none' : 'inline-flex';
        }
        if (this.elements.stopBtn) {
            this.elements.stopBtn.style.display = isRunning ? 'inline-flex' : 'none';
        }
        if (this.elements.typeSelector) {
            this.elements.typeSelector.disabled = isRunning;
        }
        if (this.elements.cycleCounter) {
            this.elements.cycleCounter.textContent = isRunning
                ? `${this.cyclesCompleted}/${this.totalCycles}`
                : '';
        }
        if (this.elements.container) {
            this.elements.container.classList.toggle('exercise--active', isRunning);
        }
    }

    /**
     * Перевіряє чи запущена вправа
     * @returns {boolean}
     */
    isActive() {
        return this.isRunning;
    }
}

export default Exercises;
