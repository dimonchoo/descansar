/**
 * Eye Exercises Module
 * Вправи для очей під час перерв
 */

import { $ } from '../utils/helpers.js';
import lottieAnimations from './LottieAnimations.js';

class EyeExercises {
    constructor() {
        this.isRunning = false;
        this.currentExercise = null;
        this.currentStep = 0;
        this.stepTimeout = null;
        this.lottiePlayer = null;

        this.elements = {
            container: null,
            lottieContainer: null,
            visual: null,
            instruction: null,
            timer: null,
            progress: null,
            startBtn: null,
            stopBtn: null,
            typeSelector: null,
            description: null,
        };

        // Вправи для очей
        this.exercises = {
            'rule-20-20-20': {
                name: 'Правило 20-20-20',
                description: 'Подивіться на об\'єкт за 6 метрів протягом 20 секунд',
                steps: [
                    { instruction: 'Знайдіть об\'єкт вдалині', duration: 3, visual: 'search' },
                    { instruction: 'Дивіться на нього', duration: 20, visual: 'focus-far' },
                    { instruction: 'Чудово! Очі відпочили', duration: 2, visual: 'done' },
                ],
            },
            'blink': {
                name: 'Швидке моргання',
                description: 'Зволожує очі та знімає напругу',
                steps: [
                    { instruction: 'Моргайте швидко', duration: 10, visual: 'blink' },
                    { instruction: 'Заплющте очі', duration: 5, visual: 'closed' },
                    { instruction: 'Відкрийте очі', duration: 2, visual: 'open' },
                    { instruction: 'Повторіть моргання', duration: 10, visual: 'blink' },
                    { instruction: 'Готово!', duration: 2, visual: 'done' },
                ],
            },
            'focus-shift': {
                name: 'Зміна фокусу',
                description: 'Тренує м\'язи очей',
                steps: [
                    { instruction: 'Тримайте палець перед обличчям', duration: 3, visual: 'finger' },
                    { instruction: 'Дивіться на палець', duration: 5, visual: 'focus-near' },
                    { instruction: 'Дивіться вдалечінь', duration: 5, visual: 'focus-far' },
                    { instruction: 'Знову на палець', duration: 5, visual: 'focus-near' },
                    { instruction: 'Знову вдалечінь', duration: 5, visual: 'focus-far' },
                    { instruction: 'Чудово!', duration: 2, visual: 'done' },
                ],
            },
            'palming': {
                name: 'Пальмінг',
                description: 'Повне розслаблення очей у темряві',
                steps: [
                    { instruction: 'Потріть долоні для тепла', duration: 5, visual: 'rub' },
                    { instruction: 'Закрийте очі долонями', duration: 3, visual: 'cover' },
                    { instruction: 'Розслабтесь у темряві', duration: 20, visual: 'dark' },
                    { instruction: 'Повільно відкрийте', duration: 3, visual: 'open' },
                    { instruction: 'Очі відпочили!', duration: 2, visual: 'done' },
                ],
            },
            'circles': {
                name: 'Кругові рухи',
                description: 'Розминка м\'язів очей',
                steps: [
                    { instruction: 'Рухайте очима по колу →', duration: 8, visual: 'circle-right' },
                    { instruction: 'Тепер у зворотному ←', duration: 8, visual: 'circle-left' },
                    { instruction: 'Заплющте очі', duration: 3, visual: 'closed' },
                    { instruction: 'Відмінно!', duration: 2, visual: 'done' },
                ],
            },
        };

        this.currentExerciseKey = 'rule-20-20-20';
    }

    /**
     * Ініціалізація
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderExerciseSelector();
        this.initLottie();
    }

    /**
     * Ініціалізує Lottie анімацію
     */
    initLottie() {
        this.lottiePlayer = lottieAnimations.create('eyeLottie', 'eye', {
            loop: true,
            autoplay: false,
        });
    }

    /**
     * Кешує DOM елементи
     */
    cacheElements() {
        this.elements = {
            container: $('eyeExerciseContainer'),
            lottieContainer: $('eyeLottie'),
            visual: $('eyeVisual'),
            instruction: $('eyeInstruction'),
            timer: $('eyeTimer'),
            progress: $('eyeProgress'),
            startBtn: $('startEyeExercise'),
            stopBtn: $('stopEyeExercise'),
            typeSelector: $('eyeExerciseType'),
            description: $('eyeExerciseDescription'),
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
                this.currentExerciseKey = e.target.value;
                this.updateDescription();
            });
        }
    }

    /**
     * Рендерить селектор вправ
     */
    renderExerciseSelector() {
        if (!this.elements.typeSelector) return;

        this.elements.typeSelector.innerHTML = Object.entries(this.exercises)
            .map(([key, ex]) => `<option value="${key}">${ex.name}</option>`)
            .join('');

        this.updateDescription();
    }

    /**
     * Оновлює опис вправи
     */
    updateDescription() {
        if (!this.elements.description) return;

        const exercise = this.exercises[this.currentExerciseKey];
        this.elements.description.textContent = exercise.description;
    }

    /**
     * Запускає вправу
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.currentStep = 0;
        this.currentExercise = this.exercises[this.currentExerciseKey];

        // Запускаємо Lottie анімацію
        lottieAnimations.play('eyeLottie');

        this.updateUI(true);
        this.runStep();
    }

    /**
     * Зупиняє вправу
     */
    stop() {
        this.isRunning = false;

        // Зупиняємо Lottie анімацію
        lottieAnimations.stop('eyeLottie');

        if (this.stepTimeout) {
            clearTimeout(this.stepTimeout);
            this.stepTimeout = null;
        }

        this.updateUI(false);
        this.resetVisual();

        if (this.elements.instruction) {
            this.elements.instruction.textContent = 'Натисніть старт';
        }
        if (this.elements.timer) {
            this.elements.timer.textContent = '';
        }
    }

    /**
     * Виконує поточний крок
     */
    runStep() {
        if (!this.isRunning || !this.currentExercise) return;

        const step = this.currentExercise.steps[this.currentStep];
        if (!step) {
            this.complete();
            return;
        }

        // Оновлюємо інструкцію
        if (this.elements.instruction) {
            this.elements.instruction.textContent = step.instruction;
        }

        // Оновлюємо візуал
        this.updateVisual(step.visual);

        // Оновлюємо прогрес
        this.updateProgress();

        // Запускаємо таймер
        this.runStepTimer(step.duration);
    }

    /**
     * Таймер кроку
     * @param {number} duration - Тривалість в секундах
     */
    runStepTimer(duration) {
        let remaining = duration;

        const tick = () => {
            if (!this.isRunning) return;

            if (this.elements.timer) {
                this.elements.timer.textContent = remaining > 0 ? remaining : '';
            }

            if (remaining > 0) {
                remaining--;
                this.stepTimeout = setTimeout(tick, 1000);
            } else {
                this.nextStep();
            }
        };

        tick();
    }

    /**
     * Переходить до наступного кроку
     */
    nextStep() {
        if (!this.isRunning) return;

        this.currentStep++;

        if (this.currentStep >= this.currentExercise.steps.length) {
            this.complete();
        } else {
            this.runStep();
        }
    }

    /**
     * Завершує вправу
     */
    complete() {
        this.isRunning = false;

        if (this.elements.instruction) {
            this.elements.instruction.textContent = 'Вправу завершено!';
        }
        if (this.elements.timer) {
            this.elements.timer.textContent = '';
        }

        this.updateVisual('done');
        this.updateUI(false);

        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * Оновлює візуальну частину
     * @param {string} type - Тип візуалу
     */
    updateVisual(type) {
        if (!this.elements.visual) return;

        // Видаляємо всі класи візуалів
        this.elements.visual.className = 'eye-visual';

        // Додаємо новий клас
        this.elements.visual.classList.add(`eye-visual--${type}`);

        // Оновлюємо іконку
        const icons = {
            'search': '👀',
            'focus-far': '🏔️',
            'focus-near': '👆',
            'done': '✅',
            'blink': '😉',
            'closed': '😌',
            'open': '👁️',
            'finger': '☝️',
            'rub': '👐',
            'cover': '🙈',
            'dark': '🌙',
            'circle-right': '↻',
            'circle-left': '↺',
        };

        this.elements.visual.textContent = icons[type] || '👁️';
    }

    /**
     * Скидає візуал
     */
    resetVisual() {
        if (!this.elements.visual) return;

        this.elements.visual.className = 'eye-visual';
        this.elements.visual.textContent = '👁️';
    }

    /**
     * Оновлює прогрес
     */
    updateProgress() {
        if (!this.elements.progress || !this.currentExercise) return;

        const total = this.currentExercise.steps.length;
        const current = this.currentStep + 1;
        this.elements.progress.textContent = `${current}/${total}`;
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
        if (this.elements.progress) {
            this.elements.progress.style.display = isRunning ? 'block' : 'none';
        }
        if (this.elements.container) {
            this.elements.container.classList.toggle('eye-exercise--active', isRunning);
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

export default EyeExercises;
