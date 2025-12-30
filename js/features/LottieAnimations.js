/**
 * Lottie Animations Module
 * Керує Lottie анімаціями в додатку
 */

// URLs до безкоштовних Lottie анімацій
const ANIMATION_URLS = {
    // Дихання
    breathing: 'https://lottie.host/e4e9cf44-8c16-4e0a-8a1f-7e6e9c7e8f4d/breathing.json',
    breathingAlt: 'https://assets10.lottiefiles.com/packages/lf20_qm8eqzse.json',
    meditation: 'https://assets2.lottiefiles.com/packages/lf20_w6yztbfk.json',

    // Природа / Ліс
    tree: 'https://assets9.lottiefiles.com/packages/lf20_4kx2q32n.json',
    treeGrow: 'https://assets4.lottiefiles.com/packages/lf20_rpmpib7z.json',
    forest: 'https://assets3.lottiefiles.com/packages/lf20_mdbdc5l7.json',
    plant: 'https://assets5.lottiefiles.com/packages/lf20_ystsffqy.json',

    // Святкування
    confetti: 'https://assets5.lottiefiles.com/packages/lf20_touohxv0.json',
    success: 'https://assets4.lottiefiles.com/packages/lf20_jbrw3hcz.json',
    celebration: 'https://assets1.lottiefiles.com/packages/lf20_aEFaHc.json',
    fireworks: 'https://assets5.lottiefiles.com/packages/lf20_u4yrau.json',

    // Очі
    eye: 'https://assets10.lottiefiles.com/packages/lf20_xvrofzfk.json',
    eyeBlink: 'https://assets8.lottiefiles.com/packages/lf20_g4wqji2g.json',

    // Релаксація
    waves: 'https://assets9.lottiefiles.com/packages/lf20_slvbvwwl.json',
    relaxing: 'https://assets5.lottiefiles.com/packages/lf20_xbf1be8x.json',

    // Природа/Погода
    rain: 'https://assets10.lottiefiles.com/packages/lf20_rpmpib7z.json',
    sun: 'https://assets8.lottiefiles.com/packages/lf20_xlky4kvh.json',
    moon: 'https://assets2.lottiefiles.com/packages/lf20_rbtawnwz.json',

    // Вогонь
    fire: 'https://assets8.lottiefiles.com/packages/lf20_5tl1xxnz.json',
    campfire: 'https://assets4.lottiefiles.com/packages/lf20_uu0x8lqv.json',
};

class LottieAnimations {
    constructor() {
        this.players = new Map();
        this.loadedAnimations = new Map();
    }

    /**
     * Створює Lottie player в контейнері
     * @param {string} containerId - ID контейнера
     * @param {string} animationKey - Ключ анімації з ANIMATION_URLS
     * @param {Object} options - Опції плеєра
     * @returns {HTMLElement|null} - Lottie player елемент
     */
    create(containerId, animationKey, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} not found`);
            return null;
        }

        const url = ANIMATION_URLS[animationKey];
        if (!url) {
            console.warn(`Animation "${animationKey}" not found`);
            return null;
        }

        // Створюємо lottie-player елемент
        const player = document.createElement('lottie-player');
        player.setAttribute('src', url);
        player.setAttribute('background', 'transparent');

        // Застосовуємо опції
        const defaults = {
            loop: true,
            autoplay: false,
            mode: 'normal',
            speed: 1,
            style: 'width: 100%; height: 100%;',
        };

        const mergedOptions = { ...defaults, ...options };

        if (mergedOptions.loop) player.setAttribute('loop', '');
        if (mergedOptions.autoplay) player.setAttribute('autoplay', '');
        player.setAttribute('mode', mergedOptions.mode);
        player.setAttribute('speed', mergedOptions.speed);
        player.setAttribute('style', mergedOptions.style);

        // Очищуємо контейнер і додаємо плеєр
        container.innerHTML = '';
        container.appendChild(player);

        // Зберігаємо референс
        this.players.set(containerId, player);

        return player;
    }

    /**
     * Отримує плеєр по ID контейнера
     * @param {string} containerId - ID контейнера
     * @returns {HTMLElement|null}
     */
    get(containerId) {
        return this.players.get(containerId) || null;
    }

    /**
     * Запускає анімацію
     * @param {string} containerId - ID контейнера
     */
    play(containerId) {
        const player = this.get(containerId);
        if (player && player.play) {
            player.play();
        }
    }

    /**
     * Зупиняє анімацію
     * @param {string} containerId - ID контейнера
     */
    stop(containerId) {
        const player = this.get(containerId);
        if (player && player.stop) {
            player.stop();
        }
    }

    /**
     * Призупиняє анімацію
     * @param {string} containerId - ID контейнера
     */
    pause(containerId) {
        const player = this.get(containerId);
        if (player && player.pause) {
            player.pause();
        }
    }

    /**
     * Встановлює швидкість
     * @param {string} containerId - ID контейнера
     * @param {number} speed - Швидкість (1 = нормальна)
     */
    setSpeed(containerId, speed) {
        const player = this.get(containerId);
        if (player) {
            player.setAttribute('speed', speed);
        }
    }

    /**
     * Встановлює напрямок
     * @param {string} containerId - ID контейнера
     * @param {number} direction - 1 або -1
     */
    setDirection(containerId, direction) {
        const player = this.get(containerId);
        if (player && player.setDirection) {
            player.setDirection(direction);
        }
    }

    /**
     * Переходить до кадру
     * @param {string} containerId - ID контейнера
     * @param {number} frame - Номер кадру
     */
    goToFrame(containerId, frame) {
        const player = this.get(containerId);
        if (player && player.seek) {
            player.seek(frame);
        }
    }

    /**
     * Встановлює прогрес (0-100)
     * @param {string} containerId - ID контейнера
     * @param {number} progress - Прогрес у відсотках
     */
    setProgress(containerId, progress) {
        const player = this.get(containerId);
        if (player && player.getLottie) {
            const lottie = player.getLottie();
            if (lottie) {
                const frame = (progress / 100) * lottie.totalFrames;
                lottie.goToAndStop(frame, true);
            }
        }
    }

    /**
     * Змінює анімацію
     * @param {string} containerId - ID контейнера
     * @param {string} animationKey - Ключ нової анімації
     */
    changeAnimation(containerId, animationKey) {
        const player = this.get(containerId);
        const url = ANIMATION_URLS[animationKey];

        if (player && url) {
            player.load(url);
        }
    }

    /**
     * Відтворює анімацію один раз і викликає callback
     * @param {string} containerId - ID контейнера
     * @param {Function} onComplete - Callback після завершення
     */
    playOnce(containerId, onComplete) {
        const player = this.get(containerId);
        if (!player) return;

        player.removeAttribute('loop');
        player.play();

        const handleComplete = () => {
            player.removeEventListener('complete', handleComplete);
            if (onComplete) onComplete();
        };

        player.addEventListener('complete', handleComplete);
    }

    /**
     * Видаляє плеєр
     * @param {string} containerId - ID контейнера
     */
    destroy(containerId) {
        const player = this.get(containerId);
        if (player) {
            player.stop();
            player.remove();
            this.players.delete(containerId);
        }
    }

    /**
     * Отримує URL анімації
     * @param {string} key - Ключ анімації
     * @returns {string|null}
     */
    static getUrl(key) {
        return ANIMATION_URLS[key] || null;
    }

    /**
     * Отримує всі доступні анімації
     * @returns {Object}
     */
    static getAvailableAnimations() {
        return { ...ANIMATION_URLS };
    }
}

// Синглтон для глобального використання
const lottieAnimations = new LottieAnimations();

export default lottieAnimations;
export { ANIMATION_URLS };
