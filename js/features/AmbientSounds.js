/**
 * Ambient Sounds Module
 * Генерує заспокійливі звуки для релаксації під час перерви
 * Використовує Web Audio API для процедурної генерації
 */

import { $ } from '../utils/helpers.js';

class AmbientSounds {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.currentSound = null;
        this.nodes = [];

        this.elements = {
            container: null,
            soundButtons: null,
            volumeSlider: null,
            stopBtn: null,
            currentLabel: null,
        };

        // Доступні звуки
        this.sounds = {
            rain: {
                name: 'Дощ',
                icon: '🌧️',
                generator: () => this.generateRain(),
            },
            ocean: {
                name: 'Океан',
                icon: '🌊',
                generator: () => this.generateOcean(),
            },
            forest: {
                name: 'Ліс',
                icon: '🌲',
                generator: () => this.generateForest(),
            },
            fire: {
                name: 'Камін',
                icon: '🔥',
                generator: () => this.generateFire(),
            },
            wind: {
                name: 'Вітер',
                icon: '💨',
                generator: () => this.generateWind(),
            },
            night: {
                name: 'Ніч',
                icon: '🌙',
                generator: () => this.generateNight(),
            },
        };

        this.volume = 0.5;
    }

    /**
     * Ініціалізація
     */
    init() {
        this.cacheElements();
        this.bindEvents();
    }

    /**
     * Кешує DOM елементи
     */
    cacheElements() {
        this.elements = {
            container: $('ambientContainer'),
            volumeSlider: $('ambientVolume'),
            stopBtn: $('stopAmbient'),
            currentLabel: $('currentAmbient'),
        };

        // Знаходимо всі кнопки звуків
        if (this.elements.container) {
            this.elements.soundButtons = this.elements.container.querySelectorAll('[data-sound]');
        }
    }

    /**
     * Прив'язує події
     */
    bindEvents() {
        // Кнопки звуків
        if (this.elements.soundButtons) {
            this.elements.soundButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const soundKey = btn.dataset.sound;
                    this.play(soundKey);
                });
            });
        }

        // Кнопка зупинки
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stop());
        }

        // Гучність
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
    }

    /**
     * Ініціалізує Audio Context
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
        }

        // Відновлюємо контекст якщо він призупинений
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Відтворює звук
     * @param {string} soundKey - Ключ звуку
     */
    play(soundKey) {
        const sound = this.sounds[soundKey];
        if (!sound) return;

        // Зупиняємо поточний звук
        this.stop();

        // Ініціалізуємо контекст
        this.initAudioContext();

        // Генеруємо новий звук
        sound.generator();

        this.isPlaying = true;
        this.currentSound = soundKey;

        // Оновлюємо UI
        this.updateUI();
    }

    /**
     * Зупиняє звук
     */
    stop() {
        // Зупиняємо всі ноди
        this.nodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {
                // Ігноруємо помилки при зупинці
            }
        });

        this.nodes = [];
        this.isPlaying = false;
        this.currentSound = null;

        this.updateUI();
    }

    /**
     * Встановлює гучність
     * @param {number} value - Гучність від 0 до 1
     */
    setVolume(value) {
        this.volume = value;
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }

    /**
     * Оновлює UI
     */
    updateUI() {
        // Оновлюємо активну кнопку
        if (this.elements.soundButtons) {
            this.elements.soundButtons.forEach(btn => {
                const isActive = btn.dataset.sound === this.currentSound;
                btn.classList.toggle('ambient__btn--active', isActive);
            });
        }

        // Оновлюємо лейбл
        if (this.elements.currentLabel) {
            if (this.isPlaying && this.currentSound) {
                const sound = this.sounds[this.currentSound];
                this.elements.currentLabel.textContent = `${sound.icon} ${sound.name}`;
            } else {
                this.elements.currentLabel.textContent = 'Оберіть звук';
            }
        }

        // Показуємо/ховаємо кнопку зупинки
        if (this.elements.stopBtn) {
            this.elements.stopBtn.style.display = this.isPlaying ? 'inline-flex' : 'none';
        }
    }

    /**
     * Створює білий шум
     * @returns {AudioBufferSourceNode}
     */
    createWhiteNoise() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        return whiteNoise;
    }

    /**
     * Створює коричневий шум (глибший)
     * @returns {AudioBufferSourceNode}
     */
    createBrownNoise() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        const brownNoise = this.audioContext.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        return brownNoise;
    }

    /**
     * Генерує звук дощу
     */
    generateRain() {
        // Основний шум дощу
        const noise = this.createWhiteNoise();
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        filter.Q.value = 0.5;

        const gain = this.audioContext.createGain();
        gain.gain.value = 0.3;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        this.nodes.push(noise, filter, gain);

        // Додаємо крапельки
        this.addRainDrops();
    }

    /**
     * Додає звук крапель дощу
     */
    addRainDrops() {
        const createDrop = () => {
            if (!this.isPlaying || this.currentSound !== 'rain') return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = 2000 + Math.random() * 3000;

            gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.audioContext.currentTime + 0.1);

            // Наступна крапля
            setTimeout(createDrop, 50 + Math.random() * 200);
        };

        createDrop();
    }

    /**
     * Генерує звук океану
     */
    generateOcean() {
        const noise = this.createBrownNoise();
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;

        const gain = this.audioContext.createGain();
        gain.gain.value = 0.4;

        // LFO для хвиль
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Повільні хвилі
        lfoGain.gain.value = 200;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        lfo.start();

        this.nodes.push(noise, filter, gain, lfo, lfoGain);
    }

    /**
     * Генерує звук лісу
     */
    generateForest() {
        // Легкий вітер
        const wind = this.createWhiteNoise();
        const windFilter = this.audioContext.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.frequency.value = 300;
        windFilter.Q.value = 0.5;

        const windGain = this.audioContext.createGain();
        windGain.gain.value = 0.1;

        wind.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(this.masterGain);

        wind.start();
        this.nodes.push(wind, windFilter, windGain);

        // Додаємо пташок
        this.addBirds();
    }

    /**
     * Додає звуки птахів
     */
    addBirds() {
        const createBird = () => {
            if (!this.isPlaying || this.currentSound !== 'forest') return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            const baseFreq = 1500 + Math.random() * 2000;

            // Трель пташки
            const now = this.audioContext.currentTime;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.linearRampToValueAtTime(baseFreq * 1.2, now + 0.05);
            osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, now + 0.1);
            osc.frequency.linearRampToValueAtTime(baseFreq * 1.1, now + 0.15);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(now + 0.2);

            // Наступний птах
            setTimeout(createBird, 1000 + Math.random() * 4000);
        };

        createBird();
    }

    /**
     * Генерує звук каміна
     */
    generateFire() {
        const noise = this.createWhiteNoise();
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        const gain = this.audioContext.createGain();
        gain.gain.value = 0.3;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        this.nodes.push(noise, filter, gain);

        // Додаємо тріскіт
        this.addCrackles();
    }

    /**
     * Додає тріскіт вогню
     */
    addCrackles() {
        const createCrackle = () => {
            if (!this.isPlaying || this.currentSound !== 'fire') return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = 100 + Math.random() * 200;

            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(now + 0.05);

            setTimeout(createCrackle, 100 + Math.random() * 500);
        };

        createCrackle();
    }

    /**
     * Генерує звук вітру
     */
    generateWind() {
        const noise = this.createBrownNoise();
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.3;

        const gain = this.audioContext.createGain();

        // LFO для поривів вітру
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 0.15;

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        gain.gain.value = 0.2;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        lfo.start();

        this.nodes.push(noise, filter, gain, lfo, lfoGain);
    }

    /**
     * Генерує нічні звуки
     */
    generateNight() {
        // Тихий фоновий шум
        const noise = this.createBrownNoise();
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;

        const gain = this.audioContext.createGain();
        gain.gain.value = 0.1;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        this.nodes.push(noise, filter, gain);

        // Додаємо цвіркунів
        this.addCrickets();
    }

    /**
     * Додає звуки цвіркунів
     */
    addCrickets() {
        const createCricket = () => {
            if (!this.isPlaying || this.currentSound !== 'night') return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = 4000 + Math.random() * 1000;

            const now = this.audioContext.currentTime;
            const duration = 0.05;
            const repeats = 3 + Math.floor(Math.random() * 4);

            for (let i = 0; i < repeats; i++) {
                const t = now + i * 0.1;
                gain.gain.setValueAtTime(0.02, t);
                gain.gain.setValueAtTime(0, t + duration);
            }

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(now + repeats * 0.1);

            setTimeout(createCricket, 500 + Math.random() * 2000);
        };

        createCricket();
    }

    /**
     * Перевіряє чи грає звук
     * @returns {boolean}
     */
    isActive() {
        return this.isPlaying;
    }
}

export default AmbientSounds;
