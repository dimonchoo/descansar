/**
 * Controls Module
 * Управління кнопками та введенням
 */

import { $, on, toggleClass, validateBreakDuration, debounce } from '../utils/helpers.js';
import { TIMER_STATES, MODES } from '../utils/constants.js';

class Controls {
    constructor() {
        this.elements = {
            startBtn: $('startBtn'),
            pauseBtn: $('pauseBtn'),
            resetBtn: $('resetBtn'),
            secondaryControls: $('secondaryControls'),
            breakDurationInput: $('breakDuration'),
            modeTabSimple: $('tab-simple'),
            modeTabAdvanced: $('tab-advanced'),
            panelSimple: $('panel-simple'),
            panelAdvanced: $('panel-advanced'),
            sessionStats: $('sessionStats'),
            themeToggle: $('themeToggle'),
            settingsToggle: $('settingsToggle'),
            settingsModal: $('settingsModal'),
            closeSettings: $('closeSettings'),
            customSettings: $('customSettings'),
        };

        // Callbacks
        this.onStart = null;
        this.onPause = null;
        this.onResume = null;
        this.onReset = null;
        this.onDurationChange = null;
        this.onModeChange = null;
        this.onTechniqueSelect = null;
        this.onThemeToggle = null;
        this.onPresetSelect = null;

        this.currentMode = MODES.SIMPLE;
        this.timerState = TIMER_STATES.IDLE;

        this.init();
    }

    /**
     * Ініціалізація контролів
     */
    init() {
        this.bindEvents();
    }

    /**
     * Прив'язує обробники подій
     */
    bindEvents() {
        // Start button
        on(this.elements.startBtn, 'click', () => this.handleStartClick());

        // Pause button
        on(this.elements.pauseBtn, 'click', () => this.handlePauseClick());

        // Reset button
        on(this.elements.resetBtn, 'click', () => {
            if (this.onReset) this.onReset();
        });

        // Duration input
        if (this.elements.breakDurationInput) {
            const debouncedChange = debounce((value) => {
                if (this.onDurationChange) {
                    this.onDurationChange(validateBreakDuration(value));
                }
            }, 300);

            on(this.elements.breakDurationInput, 'input', (e) => {
                debouncedChange(e.target.value);
            });
        }

        // Adjust buttons (+5, -5)
        document.querySelectorAll('[data-adjust]').forEach(btn => {
            on(btn, 'click', (e) => {
                const adjust = parseInt(e.currentTarget.dataset.adjust, 10);
                this.adjustDuration(adjust);
            });
        });

        // Preset buttons
        document.querySelectorAll('[data-preset]').forEach(btn => {
            on(btn, 'click', (e) => {
                const preset = parseInt(e.currentTarget.dataset.preset, 10);
                this.setDuration(preset);
                if (this.onPresetSelect) this.onPresetSelect(preset);
            });
        });

        // Mode tabs
        on(this.elements.modeTabSimple, 'click', () => this.switchMode(MODES.SIMPLE));
        on(this.elements.modeTabAdvanced, 'click', () => this.switchMode(MODES.ADVANCED));

        // Technique cards
        document.querySelectorAll('[data-technique]').forEach(card => {
            on(card, 'click', (e) => {
                const technique = e.currentTarget.dataset.technique;
                this.selectTechnique(technique);
            });
        });

        // Theme toggle
        on(this.elements.themeToggle, 'click', () => {
            if (this.onThemeToggle) this.onThemeToggle();
        });

        // Settings modal
        on(this.elements.settingsToggle, 'click', () => this.openSettings());
        on(this.elements.closeSettings, 'click', () => this.closeSettings());

        // Close modal on backdrop click
        on(this.elements.settingsModal, 'click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    /**
     * Обробляє натискання кнопки Start
     */
    handleStartClick() {
        if (this.timerState === TIMER_STATES.IDLE || this.timerState === TIMER_STATES.COMPLETED) {
            if (this.onStart) this.onStart();
        } else if (this.timerState === TIMER_STATES.PAUSED) {
            if (this.onResume) this.onResume();
        }
    }

    /**
     * Обробляє натискання кнопки Pause
     */
    handlePauseClick() {
        if (this.timerState === TIMER_STATES.RUNNING) {
            if (this.onPause) this.onPause();
        } else if (this.timerState === TIMER_STATES.PAUSED) {
            if (this.onResume) this.onResume();
        }
    }

    /**
     * Обробляє клавіатурні скорочення
     * @param {KeyboardEvent} e
     */
    handleKeydown(e) {
        // Ігноруємо якщо фокус на input
        if (e.target.tagName === 'INPUT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.handleStartClick();
                break;
            case 'KeyR':
                if (this.onReset) this.onReset();
                break;
            case 'Escape':
                this.closeSettings();
                break;
        }
    }

    /**
     * Регулює тривалість
     * @param {number} adjustment - Зміна в хвилинах
     */
    adjustDuration(adjustment) {
        if (!this.elements.breakDurationInput) return;

        const current = parseInt(this.elements.breakDurationInput.value, 10) || 15;
        const newValue = validateBreakDuration(current + adjustment);

        this.setDuration(newValue);
    }

    /**
     * Встановлює тривалість
     * @param {number} minutes - Хвилини
     */
    setDuration(minutes) {
        if (this.elements.breakDurationInput) {
            this.elements.breakDurationInput.value = minutes;
        }
        if (this.onDurationChange) {
            this.onDurationChange(minutes);
        }
    }

    /**
     * Перемикає режим
     * @param {string} mode - Режим
     */
    switchMode(mode) {
        this.currentMode = mode;

        // Оновлюємо таби
        const isSimple = mode === MODES.SIMPLE;

        toggleClass(this.elements.modeTabSimple, 'mode-selector__tab--active', isSimple);
        toggleClass(this.elements.modeTabAdvanced, 'mode-selector__tab--active', !isSimple);

        this.elements.modeTabSimple?.setAttribute('aria-selected', isSimple);
        this.elements.modeTabAdvanced?.setAttribute('aria-selected', !isSimple);

        // Перемикаємо панелі
        if (this.elements.panelSimple) {
            toggleClass(this.elements.panelSimple, 'panel--hidden', !isSimple);
            this.elements.panelSimple.hidden = !isSimple;
        }

        if (this.elements.panelAdvanced) {
            toggleClass(this.elements.panelAdvanced, 'panel--hidden', isSimple);
            this.elements.panelAdvanced.hidden = isSimple;
        }

        // Показуємо/ховаємо статистику
        if (this.elements.sessionStats) {
            toggleClass(this.elements.sessionStats, 'stats--hidden', isSimple);
        }

        if (this.onModeChange) {
            this.onModeChange(mode);
        }
    }

    /**
     * Вибирає техніку
     * @param {string} technique - ID техніки
     */
    selectTechnique(technique) {
        // Оновлюємо UI
        document.querySelectorAll('[data-technique]').forEach(card => {
            toggleClass(card, 'technique-card--active', card.dataset.technique === technique);
        });

        // Показуємо/ховаємо кастомні налаштування
        if (this.elements.customSettings) {
            toggleClass(this.elements.customSettings, 'custom-settings--hidden', technique !== 'custom');
        }

        if (this.onTechniqueSelect) {
            this.onTechniqueSelect(technique);
        }
    }

    /**
     * Оновлює стан кнопок згідно стану таймера
     * @param {string} state - Стан таймера
     */
    updateState(state) {
        this.timerState = state;

        const isIdle = state === TIMER_STATES.IDLE;
        const isRunning = state === TIMER_STATES.RUNNING;
        const isPaused = state === TIMER_STATES.PAUSED;
        const isCompleted = state === TIMER_STATES.COMPLETED;

        // Оновлюємо головну кнопку
        if (this.elements.startBtn) {
            const btnText = this.elements.startBtn.querySelector('.btn__text');
            const btnIcon = this.elements.startBtn.querySelector('.btn__icon');

            if (isIdle || isCompleted) {
                if (btnText) btnText.textContent = 'Почати перерву';
                if (btnIcon) btnIcon.textContent = '▶';
                this.elements.startBtn.classList.remove('btn--hidden');
            } else if (isRunning) {
                this.elements.startBtn.classList.add('btn--hidden');
            } else if (isPaused) {
                if (btnText) btnText.textContent = 'Продовжити';
                if (btnIcon) btnIcon.textContent = '▶';
                this.elements.startBtn.classList.remove('btn--hidden');
            }
        }

        // Оновлюємо вторинні кнопки
        if (this.elements.secondaryControls) {
            toggleClass(this.elements.secondaryControls, 'controls__secondary--hidden', isIdle);
        }

        // Оновлюємо кнопку паузи
        if (this.elements.pauseBtn) {
            const btnText = this.elements.pauseBtn.querySelector('.btn__text');
            const btnIcon = this.elements.pauseBtn.querySelector('.btn__icon');

            if (isPaused) {
                if (btnText) btnText.textContent = 'Продовжити';
                if (btnIcon) btnIcon.textContent = '▶';
            } else {
                if (btnText) btnText.textContent = 'Пауза';
                if (btnIcon) btnIcon.textContent = '⏸';
            }
        }

        // Блокуємо/розблоковуємо input під час роботи таймера
        if (this.elements.breakDurationInput) {
            this.elements.breakDurationInput.disabled = isRunning || isPaused;
        }
    }

    /**
     * Відкриває налаштування
     */
    openSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.showModal();
        }
    }

    /**
     * Закриває налаштування
     */
    closeSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.close();
        }
    }

    /**
     * Отримати поточний режим
     * @returns {string}
     */
    getMode() {
        return this.currentMode;
    }
}

export default Controls;
