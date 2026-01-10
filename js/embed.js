/**
 * Descansar Embed Script
 * Вбудовуваний віджет таймера перерв
 *
 * Використання:
 * <div id="descansar-timer"></div>
 * <script src="https://descansar.pages.dev/js/embed.js" data-duration="15"></script>
 */

(function() {
    'use strict';

    // Отримуємо поточний скрипт та його атрибути
    const currentScript = document.currentScript;

    // Detect language from data-lang attribute or document lang
    function detectLang() {
        const dataLang = currentScript?.getAttribute('data-lang');
        if (dataLang) return dataLang;

        const htmlLang = document.documentElement.lang;
        if (htmlLang && htmlLang.startsWith('uk')) return 'uk';

        return 'en';
    }

    // Translations
    const i18n = {
        en: {
            ready: 'Ready',
            break: 'Break',
            paused: 'Paused',
            timeToReturn: 'Time to return!',
            start: 'Start',
            pause: 'Pause',
            resume: 'Resume',
            reset: 'Reset',
            now: 'Now',
            returnAt: 'Return at',
        },
        uk: {
            ready: 'Готовий',
            break: 'Перерва',
            paused: 'Пауза',
            timeToReturn: 'Час повертатися!',
            start: 'Старт',
            pause: 'Пауза',
            resume: 'Продовжити',
            reset: 'Скинути',
            now: 'Зараз',
            returnAt: 'Повернутись о',
        },
    };

    const lang = detectLang();
    const t = (key) => i18n[lang]?.[key] || i18n.en[key] || key;

    const options = {
        container: currentScript?.getAttribute('data-container') || '#descansar-timer',
        duration: parseInt(currentScript?.getAttribute('data-duration')) || 15,
        theme: currentScript?.getAttribute('data-theme') || 'light',
        compact: currentScript?.getAttribute('data-compact') === 'true',
        branding: currentScript?.getAttribute('data-branding') !== 'false',
        autostart: currentScript?.getAttribute('data-autostart') === 'true',
        lang: lang,
    };

    // Стилі віджета
    const styles = `
        .descansar-widget {
            --dsc-primary: #6366f1;
            --dsc-primary-dark: #4f46e5;
            --dsc-bg: #f8fafc;
            --dsc-bg-secondary: #ffffff;
            --dsc-bg-tertiary: #f1f5f9;
            --dsc-text: #1e293b;
            --dsc-text-secondary: #64748b;
            --dsc-text-muted: #94a3b8;
            --dsc-border: #e2e8f0;
            --dsc-radius: 0.5rem;
            --dsc-radius-lg: 0.75rem;
            --dsc-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            --dsc-font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;

            font-family: var(--dsc-font);
            background: var(--dsc-bg);
            border-radius: var(--dsc-radius-lg);
            padding: 1.5rem;
            text-align: center;
            box-sizing: border-box;
        }

        .descansar-widget * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .descansar-widget[data-theme="dark"] {
            --dsc-primary: #818cf8;
            --dsc-primary-dark: #6366f1;
            --dsc-bg: #1e293b;
            --dsc-bg-secondary: #334155;
            --dsc-bg-tertiary: #475569;
            --dsc-text: #f1f5f9;
            --dsc-text-secondary: #cbd5e1;
            --dsc-text-muted: #94a3b8;
            --dsc-border: #475569;
        }

        .descansar-widget__timer {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .descansar-widget__progress {
            position: relative;
            width: 160px;
            height: 160px;
        }

        .descansar-widget__progress svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }

        .descansar-widget__progress-bg {
            fill: none;
            stroke: var(--dsc-bg-tertiary);
            stroke-width: 8;
        }

        .descansar-widget__progress-bar {
            fill: none;
            stroke: var(--dsc-primary);
            stroke-width: 8;
            stroke-linecap: round;
            transition: stroke-dashoffset 0.3s ease;
        }

        .descansar-widget__display {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }

        .descansar-widget__time {
            display: block;
            font-size: 2.25rem;
            font-weight: 700;
            font-family: var(--dsc-font-mono);
            color: var(--dsc-text);
            letter-spacing: -0.02em;
        }

        .descansar-widget__label {
            display: block;
            font-size: 0.875rem;
            color: var(--dsc-text-secondary);
            margin-top: 0.25rem;
        }

        .descansar-widget__info {
            display: flex;
            gap: 2rem;
            justify-content: center;
            margin-top: 0.5rem;
        }

        .descansar-widget__info-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }

        .descansar-widget__info-label {
            font-size: 0.75rem;
            color: var(--dsc-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .descansar-widget__info-value {
            font-size: 1.125rem;
            font-weight: 600;
            font-family: var(--dsc-font-mono);
            color: var(--dsc-text);
        }

        .descansar-widget__controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            margin-top: 1rem;
        }

        .descansar-widget__btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            font-family: var(--dsc-font);
            border-radius: var(--dsc-radius);
            cursor: pointer;
            transition: all 0.15s ease;
            border: 2px solid var(--dsc-border);
            background: var(--dsc-bg-secondary);
            color: var(--dsc-text);
        }

        .descansar-widget__btn:hover {
            border-color: var(--dsc-primary);
            color: var(--dsc-primary);
        }

        .descansar-widget__btn--primary {
            background: var(--dsc-primary);
            border-color: var(--dsc-primary);
            color: white;
            padding: 1rem 2rem;
            font-size: 1rem;
        }

        .descansar-widget__btn--primary:hover {
            background: var(--dsc-primary-dark);
            border-color: var(--dsc-primary-dark);
            color: white;
        }

        .descansar-widget__btn--hidden {
            display: none;
        }

        .descansar-widget__secondary {
            display: flex;
            gap: 0.75rem;
        }

        .descansar-widget__secondary--hidden {
            display: none;
        }

        .descansar-widget__branding {
            margin-top: 1rem;
            font-size: 0.75rem;
            color: var(--dsc-text-muted);
        }

        .descansar-widget__branding a {
            color: var(--dsc-primary);
            text-decoration: none;
        }

        .descansar-widget__branding a:hover {
            text-decoration: underline;
        }

        /* Compact mode */
        .descansar-widget--compact .descansar-widget__info {
            display: none;
        }

        .descansar-widget--compact .descansar-widget__label {
            display: none;
        }

        .descansar-widget--compact .descansar-widget__progress {
            width: 120px;
            height: 120px;
        }

        .descansar-widget--compact .descansar-widget__time {
            font-size: 1.875rem;
        }

        /* Animation */
        @keyframes descansar-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .descansar-widget--running .descansar-widget__time {
            animation: descansar-pulse 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
            .descansar-widget--running .descansar-widget__time {
                animation: none;
            }
        }
    `;

    // Константи для прогрес-кільця
    const CIRCUMFERENCE = 2 * Math.PI * 90;

    // Стани таймера
    const STATES = {
        IDLE: 'idle',
        RUNNING: 'running',
        PAUSED: 'paused',
        COMPLETED: 'completed'
    };

    // Хелпери
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function formatTimeHHMM(date) {
        const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }

    // Клас віджета
    class DescansarWidget {
        constructor(container, opts) {
            this.container = typeof container === 'string'
                ? document.querySelector(container)
                : container;

            if (!this.container) {
                console.error('Descansar: Container not found:', container);
                return;
            }

            this.duration = opts.duration || 15;
            this.theme = opts.theme || 'light';
            this.compact = opts.compact || false;
            this.branding = opts.branding !== false;
            this.autostart = opts.autostart || false;

            this.state = STATES.IDLE;
            this.remainingSeconds = this.duration * 60;
            this.totalSeconds = this.duration * 60;
            this.interval = null;

            this.init();
        }

        init() {
            this.injectStyles();
            this.render();
            this.bindEvents();
            this.startClock();

            if (this.autostart) {
                this.start();
            }

            this.dispatchEvent('ready', { duration: this.duration });
        }

        injectStyles() {
            if (document.getElementById('descansar-widget-styles')) return;

            const styleEl = document.createElement('style');
            styleEl.id = 'descansar-widget-styles';
            styleEl.textContent = styles;
            document.head.appendChild(styleEl);
        }

        render() {
            const compactClass = this.compact ? 'descansar-widget--compact' : '';

            this.container.innerHTML = `
                <div class="descansar-widget ${compactClass}" data-theme="${this.theme}">
                    <div class="descansar-widget__timer">
                        <div class="descansar-widget__progress">
                            <svg viewBox="0 0 200 200">
                                <circle class="descansar-widget__progress-bg" cx="100" cy="100" r="90"/>
                                <circle class="descansar-widget__progress-bar" cx="100" cy="100" r="90"/>
                            </svg>
                            <div class="descansar-widget__display">
                                <span class="descansar-widget__time">00:00</span>
                                <span class="descansar-widget__label">${t('ready')}</span>
                            </div>
                        </div>

                        <div class="descansar-widget__info">
                            <div class="descansar-widget__info-item">
                                <span class="descansar-widget__info-label">${t('now')}</span>
                                <span class="descansar-widget__info-value descansar-widget__current-time">--:--</span>
                            </div>
                            <div class="descansar-widget__info-item">
                                <span class="descansar-widget__info-label">${t('returnAt')}</span>
                                <span class="descansar-widget__info-value descansar-widget__return-time">--:--</span>
                            </div>
                        </div>
                    </div>

                    <div class="descansar-widget__controls">
                        <button type="button" class="descansar-widget__btn descansar-widget__btn--primary descansar-widget__start-btn">
                            <span>▶</span>
                            <span>${t('start')}</span>
                        </button>
                        <div class="descansar-widget__secondary descansar-widget__secondary--hidden">
                            <button type="button" class="descansar-widget__btn descansar-widget__pause-btn">
                                <span>⏸</span>
                                <span>${t('pause')}</span>
                            </button>
                            <button type="button" class="descansar-widget__btn descansar-widget__reset-btn">
                                <span>↺</span>
                                <span>${t('reset')}</span>
                            </button>
                        </div>
                    </div>

                    ${this.branding ? `
                        <div class="descansar-widget__branding">
                            Powered by <a href="https://descansar.pages.dev" target="_blank" rel="noopener">Descansar</a>
                        </div>
                    ` : ''}
                </div>
            `;

            this.cacheElements();
            this.setupProgressRing();
            this.updateDisplay();
        }

        cacheElements() {
            this.widget = this.container.querySelector('.descansar-widget');
            this.elements = {
                time: this.container.querySelector('.descansar-widget__time'),
                label: this.container.querySelector('.descansar-widget__label'),
                currentTime: this.container.querySelector('.descansar-widget__current-time'),
                returnTime: this.container.querySelector('.descansar-widget__return-time'),
                progressBar: this.container.querySelector('.descansar-widget__progress-bar'),
                startBtn: this.container.querySelector('.descansar-widget__start-btn'),
                pauseBtn: this.container.querySelector('.descansar-widget__pause-btn'),
                resetBtn: this.container.querySelector('.descansar-widget__reset-btn'),
                secondary: this.container.querySelector('.descansar-widget__secondary'),
            };
        }

        setupProgressRing() {
            if (this.elements.progressBar) {
                this.elements.progressBar.style.strokeDasharray = CIRCUMFERENCE;
                this.elements.progressBar.style.strokeDashoffset = 0;
            }
        }

        bindEvents() {
            this.elements.startBtn?.addEventListener('click', () => this.start());
            this.elements.pauseBtn?.addEventListener('click', () => this.togglePause());
            this.elements.resetBtn?.addEventListener('click', () => this.reset());
        }

        start() {
            if (this.state === STATES.RUNNING) return;

            this.state = STATES.RUNNING;
            this.widget?.classList.add('descansar-widget--running');
            this.updateControls();

            this.interval = setInterval(() => this.tick(), 1000);
            this.dispatchEvent('start', { duration: this.duration });
        }

        tick() {
            if (this.remainingSeconds <= 0) {
                this.complete();
                return;
            }

            this.remainingSeconds--;
            this.updateDisplay();
        }

        togglePause() {
            if (this.state === STATES.RUNNING) {
                this.pause();
            } else if (this.state === STATES.PAUSED) {
                this.resume();
            }
        }

        pause() {
            this.state = STATES.PAUSED;
            this.widget?.classList.remove('descansar-widget--running');
            clearInterval(this.interval);
            this.updateControls();
            this.dispatchEvent('pause');
        }

        resume() {
            this.state = STATES.RUNNING;
            this.widget?.classList.add('descansar-widget--running');
            this.interval = setInterval(() => this.tick(), 1000);
            this.updateControls();
            this.dispatchEvent('resume');
        }

        reset() {
            clearInterval(this.interval);
            this.state = STATES.IDLE;
            this.widget?.classList.remove('descansar-widget--running');
            this.remainingSeconds = this.totalSeconds;
            this.updateDisplay();
            this.updateControls();
            this.dispatchEvent('reset');
        }

        complete() {
            clearInterval(this.interval);
            this.state = STATES.COMPLETED;
            this.widget?.classList.remove('descansar-widget--running');
            this.remainingSeconds = 0;
            this.updateDisplay();
            this.updateControls();

            if (this.elements.label) {
                this.elements.label.textContent = t('timeToReturn');
            }

            this.dispatchEvent('complete', { duration: this.duration });
        }

        updateDisplay() {
            if (this.elements.time) {
                this.elements.time.textContent = formatTime(this.remainingSeconds);
            }

            if (this.elements.returnTime) {
                const returnDate = new Date(Date.now() + this.remainingSeconds * 1000);
                this.elements.returnTime.textContent = formatTimeHHMM(returnDate);
            }

            this.updateProgress();
        }

        updateProgress() {
            if (!this.elements.progressBar) return;

            const progress = this.totalSeconds > 0 ? this.remainingSeconds / this.totalSeconds : 1;
            const offset = CIRCUMFERENCE * (1 - progress);
            this.elements.progressBar.style.strokeDashoffset = offset;
        }

        updateControls() {
            const isIdle = this.state === STATES.IDLE;
            const isRunning = this.state === STATES.RUNNING;
            const isPaused = this.state === STATES.PAUSED;
            const isCompleted = this.state === STATES.COMPLETED;

            // Start button
            if (this.elements.startBtn) {
                this.elements.startBtn.classList.toggle('descansar-widget__btn--hidden', !(isIdle || isCompleted));
            }

            // Secondary controls
            if (this.elements.secondary) {
                this.elements.secondary.classList.toggle('descansar-widget__secondary--hidden', isIdle || isCompleted);
            }

            // Pause button text
            if (this.elements.pauseBtn) {
                const spans = this.elements.pauseBtn.querySelectorAll('span');
                if (isPaused) {
                    spans[0].textContent = '▶';
                    spans[1].textContent = t('resume');
                } else {
                    spans[0].textContent = '⏸';
                    spans[1].textContent = t('pause');
                }
            }

            // Timer label
            if (this.elements.label && this.state !== STATES.COMPLETED) {
                const labels = {
                    [STATES.IDLE]: t('ready'),
                    [STATES.RUNNING]: t('break'),
                    [STATES.PAUSED]: t('paused'),
                };
                this.elements.label.textContent = labels[this.state] || t('ready');
            }
        }

        startClock() {
            const updateClock = () => {
                if (this.elements.currentTime) {
                    this.elements.currentTime.textContent = formatTimeHHMM(new Date());
                }

                if (this.state === STATES.IDLE && this.elements.returnTime) {
                    const returnDate = new Date(Date.now() + this.duration * 60 * 1000);
                    this.elements.returnTime.textContent = formatTimeHHMM(returnDate);
                }
            };

            updateClock();
            setInterval(updateClock, 1000);
        }

        setDuration(minutes) {
            this.duration = minutes;
            this.totalSeconds = minutes * 60;
            this.remainingSeconds = minutes * 60;
            this.updateDisplay();
        }

        dispatchEvent(eventName, data = {}) {
            const event = new CustomEvent('descansar', {
                detail: { event: eventName, ...data }
            });
            this.container.dispatchEvent(event);

            // Також відправляємо глобальну подію
            window.dispatchEvent(new CustomEvent('descansar', {
                detail: { event: eventName, ...data }
            }));
        }
    }

    // Ініціалізація
    function init() {
        const widget = new DescansarWidget(options.container, options);

        // Експортуємо в глобальний простір для програмного керування
        window.DescansarWidget = DescansarWidget;
        window.descansar = widget;
    }

    // Запуск після завантаження DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
