/**
 * Descansar - Main Application
 * Точка входу додатку
 */

import SimpleMode from './modes/SimpleMode.js';
import AdvancedMode from './modes/AdvancedMode.js';
import Display from './ui/Display.js';
import Controls from './ui/Controls.js';
import Stats from './ui/Stats.js';
import Exercises from './features/Exercises.js';
import EyeExercises from './features/EyeExercises.js';
import Forest from './features/Forest.js';
import AmbientSounds from './features/AmbientSounds.js';
import lottieAnimations from './features/LottieAnimations.js';
import Storage from './core/Storage.js';
import Notifications from './core/Notifications.js';
import { MODES, THEMES, TIMER_STATES } from './utils/constants.js';
import { prefersDarkMode } from './utils/helpers.js';

class App {
    constructor() {
        this.simpleMode = null;
        this.advancedMode = null;
        this.display = null;
        this.controls = null;
        this.stats = null;
        this.exercises = null;
        this.eyeExercises = null;
        this.forest = null;
        this.ambientSounds = null;
        this.currentMode = MODES.SIMPLE;
        this.activeTimer = null;
    }

    /**
     * Ініціалізація додатку
     */
    async init() {
        // Ініціалізуємо сповіщення
        await Notifications.init();

        // Ініціалізуємо тему
        this.initTheme();

        // Ініціалізуємо режими
        this.simpleMode = new SimpleMode();
        this.simpleMode.init();

        this.advancedMode = new AdvancedMode();
        this.advancedMode.init();

        // Ініціалізуємо UI
        this.display = new Display();
        this.controls = new Controls();
        this.stats = new Stats();
        this.stats.init();

        // Ініціалізуємо вправи
        this.exercises = new Exercises();
        this.exercises.init();

        this.eyeExercises = new EyeExercises();
        this.eyeExercises.init();

        this.forest = new Forest();
        this.forest.init();

        this.ambientSounds = new AmbientSounds();
        this.ambientSounds.init();

        // Встановлюємо активний таймер
        this.activeTimer = this.simpleMode;

        // Прив'язуємо обробники
        this.bindEvents();

        // Встановлюємо початковий стан
        this.setInitialState();

        console.log('Descansar initialized');
    }

    /**
     * Ініціалізує тему
     */
    initTheme() {
        const savedTheme = Storage.getTheme();
        const settings = Storage.getSettings();

        let theme = savedTheme;

        if (settings.autoTheme) {
            theme = prefersDarkMode() ? THEMES.DARK : THEMES.LIGHT;
        }

        this.applyTheme(theme);

        // Слухаємо зміни системної теми
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (Storage.getSettings().autoTheme) {
                this.applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
            }
        });
    }

    /**
     * Застосовує тему
     * @param {string} theme - Тема
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Storage.saveTheme(theme);

        // Оновлюємо meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === THEMES.DARK ? '#1f2937' : '#6366f1';
        }
    }

    /**
     * Перемикає тему
     */
    toggleTheme() {
        const currentTheme = Storage.getTheme();
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        this.applyTheme(newTheme);

        // Вимикаємо автотему при ручному перемиканні
        Storage.updateSetting('autoTheme', false);
    }

    /**
     * Прив'язує обробники подій
     */
    bindEvents() {
        // Прив'язка подій для Simple Mode
        this.simpleMode.onUpdate = (data) => {
            this.display.updateTimer(data.remainingSeconds, data.totalSeconds, data.phase);
        };

        this.simpleMode.onComplete = () => {
            this.display.showCompleted(this.simpleMode.timer.currentPhase);
            this.controls.updateState(TIMER_STATES.COMPLETED);
            this.stats.update(); // Оновлюємо статистику
            this.showCelebration(); // Показуємо анімацію святкування
        };

        this.simpleMode.onStateChange = (data) => {
            this.controls.updateState(data.state);
        };

        // Прив'язка подій для Advanced Mode
        this.advancedMode.onUpdate = (data) => {
            this.display.updateTimer(data.remainingSeconds, data.totalSeconds, data.currentPhase);
            this.display.updateSessionStats({
                completedCycles: data.completedCycles,
                totalWorkMinutes: this.advancedMode.totalWorkMinutes,
            });
        };

        this.advancedMode.onComplete = (data) => {
            this.display.showCompleted(data.completedPhase);
            this.display.updateSessionStats({
                completedCycles: data.completedCycles,
                totalWorkMinutes: data.totalWorkMinutes,
            });
            this.stats.update(); // Оновлюємо статистику
        };

        this.advancedMode.onPhaseChange = (data) => {
            this.display.updatePhaseLabel(data.phase);
        };

        this.advancedMode.onStateChange = (data) => {
            this.controls.updateState(data.state);
        };

        // Прив'язка подій для Controls
        this.controls.onStart = () => this.handleStart();
        this.controls.onPause = () => this.handlePause();
        this.controls.onResume = () => this.handleResume();
        this.controls.onReset = () => this.handleReset();
        this.controls.onDurationChange = (duration) => this.handleDurationChange(duration);
        this.controls.onModeChange = (mode) => this.handleModeChange(mode);
        this.controls.onTechniqueSelect = (technique) => this.handleTechniqueSelect(technique);
        this.controls.onThemeToggle = () => this.toggleTheme();

        // Налаштування
        this.bindSettingsEvents();
    }

    /**
     * Прив'язує події налаштувань
     */
    bindSettingsEvents() {
        const enableNotifications = document.getElementById('enableNotifications');
        const enableSound = document.getElementById('enableSound');
        const autoTheme = document.getElementById('autoTheme');
        const clearData = document.getElementById('clearData');

        if (enableNotifications) {
            const settings = Storage.getSettings();
            enableNotifications.checked = settings.enableNotifications;

            enableNotifications.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    const granted = await Notifications.requestPermission();
                    if (!granted) {
                        e.target.checked = false;
                        return;
                    }
                }
                Notifications.updateSettings(e.target.checked, Storage.getSettings().enableSound);
            });
        }

        if (enableSound) {
            const settings = Storage.getSettings();
            enableSound.checked = settings.enableSound;

            enableSound.addEventListener('change', (e) => {
                Notifications.updateSettings(Storage.getSettings().enableNotifications, e.target.checked);
            });
        }

        if (autoTheme) {
            const settings = Storage.getSettings();
            autoTheme.checked = settings.autoTheme;

            autoTheme.addEventListener('change', (e) => {
                Storage.updateSetting('autoTheme', e.target.checked);
                if (e.target.checked) {
                    this.applyTheme(prefersDarkMode() ? THEMES.DARK : THEMES.LIGHT);
                }
            });
        }

        if (clearData) {
            clearData.addEventListener('click', () => {
                if (confirm('Ви впевнені, що хочете очистити всі дані? Це видалить статистику та налаштування.')) {
                    Storage.clearAll();
                    window.location.reload();
                }
            });
        }

        // Custom settings для Advanced mode
        ['workDuration', 'shortBreak', 'longBreak', 'cyclesBeforeLong'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => {
                    this.advancedMode.updateSettings({
                        workDuration: parseInt(document.getElementById('workDuration')?.value, 10) || 25,
                        shortBreak: parseInt(document.getElementById('shortBreak')?.value, 10) || 5,
                        longBreak: parseInt(document.getElementById('longBreak')?.value, 10) || 15,
                        cyclesBeforeLong: parseInt(document.getElementById('cyclesBeforeLong')?.value, 10) || 4,
                    });
                });
            }
        });
    }

    /**
     * Встановлює початковий стан
     */
    setInitialState() {
        const settings = Storage.getSettings();

        // Встановлюємо тривалість
        this.simpleMode.setDuration(settings.breakDuration);
        this.display.setInitialState(settings.breakDuration);

        // Встановлюємо стан контролів
        this.controls.updateState(TIMER_STATES.IDLE);
    }

    /**
     * Обробляє старт
     */
    handleStart() {
        // Розблоковуємо аудіо при першій взаємодії
        Notifications.unlockAudio();
        this.activeTimer.start();

        // Запускаємо ріст дерева
        const totalSeconds = this.currentMode === MODES.SIMPLE
            ? this.simpleMode.breakDuration * 60
            : this.advancedMode.settings.workDuration * 60;
        this.forest.startGrowing(totalSeconds);
    }

    /**
     * Обробляє паузу
     */
    handlePause() {
        this.activeTimer.pause();
    }

    /**
     * Обробляє продовження
     */
    handleResume() {
        this.activeTimer.resume();
    }

    /**
     * Обробляє скидання
     */
    handleReset() {
        this.activeTimer.reset();

        // Зупиняємо ріст дерева (воно засохне)
        if (this.forest.isActive()) {
            this.forest.stop();
        }

        if (this.currentMode === MODES.SIMPLE) {
            this.display.setInitialState(this.simpleMode.breakDuration);
        } else {
            this.advancedMode.resetSession();
            this.display.setInitialState(this.advancedMode.settings.workDuration);
            this.display.updateSessionStats({ completedCycles: 0, totalWorkMinutes: 0 });
        }

        // Скидаємо ліс для наступної перерви
        setTimeout(() => this.forest.reset(), 2000);
    }

    /**
     * Обробляє зміну тривалості
     * @param {number} duration - Нова тривалість
     */
    handleDurationChange(duration) {
        this.simpleMode.setDuration(duration);

        if (!this.simpleMode.isRunning() && !this.simpleMode.isPaused()) {
            this.display.setInitialState(duration);
        }
    }

    /**
     * Обробляє зміну режиму
     * @param {string} mode - Новий режим
     */
    handleModeChange(mode) {
        // Скидаємо поточний таймер
        if (this.activeTimer) {
            this.activeTimer.reset();
        }

        this.currentMode = mode;
        Storage.updateSetting('mode', mode);

        if (mode === MODES.SIMPLE) {
            this.activeTimer = this.simpleMode;
            this.display.setInitialState(this.simpleMode.breakDuration);
        } else {
            this.activeTimer = this.advancedMode;
            this.display.setInitialState(this.advancedMode.settings.workDuration);
            this.display.updateSessionStats({ completedCycles: 0, totalWorkMinutes: 0 });
        }

        this.controls.updateState(TIMER_STATES.IDLE);
    }

    /**
     * Обробляє вибір техніки
     * @param {string} technique - ID техніки
     */
    handleTechniqueSelect(technique) {
        this.advancedMode.setTechnique(technique);

        // Оновлюємо відображення
        if (this.currentMode === MODES.ADVANCED && this.advancedMode.isIdle()) {
            this.display.setInitialState(this.advancedMode.settings.workDuration);
        }
    }

    /**
     * Показує анімацію святкування
     */
    showCelebration() {
        const container = document.getElementById('celebrationLottie');
        if (!container) return;

        // Показуємо контейнер
        container.style.display = 'block';

        // Створюємо Lottie анімацію
        lottieAnimations.create('celebrationLottie', 'confetti', {
            loop: false,
            autoplay: true,
        });

        // Ховаємо після завершення анімації
        setTimeout(() => {
            container.style.display = 'none';
            lottieAnimations.destroy('celebrationLottie');
        }, 3000);
    }
}

// Запуск додатку
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();

    // Для дебагу
    window.descansar = app;
});
