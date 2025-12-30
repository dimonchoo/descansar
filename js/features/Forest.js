/**
 * Forest Module
 * Віртуальний ліс - дерево росте під час перерви
 */

import { $ } from '../utils/helpers.js';
import Storage from '../core/Storage.js';
import lottieAnimations from './LottieAnimations.js';

class Forest {
    constructor() {
        this.elements = {
            container: null,
            lottieContainer: null,
            ground: null,
            treeCount: null,
            message: null,
        };
        this.lottiePlayer = null;

        this.growthStages = [
            { stage: 0, emoji: '🌱', name: 'Насіння', minProgress: 0 },
            { stage: 1, emoji: '🌿', name: 'Паросток', minProgress: 20 },
            { stage: 2, emoji: '🪴', name: 'Рослина', minProgress: 40 },
            { stage: 3, emoji: '🌳', name: 'Молоде дерево', minProgress: 60 },
            { stage: 4, emoji: '🌲', name: 'Дерево', minProgress: 80 },
            { stage: 5, emoji: '🎄', name: 'Велике дерево', minProgress: 100 },
        ];

        this.currentProgress = 0;
        this.isGrowing = false;
        this.growInterval = null;
    }

    /**
     * Ініціалізація
     */
    init() {
        this.cacheElements();
        this.initLottie();
        this.updateTreeCount();
        this.reset();
    }

    /**
     * Ініціалізує Lottie анімацію
     */
    initLottie() {
        this.lottiePlayer = lottieAnimations.create('forestLottie', 'plant', {
            loop: false,
            autoplay: false,
        });
    }

    /**
     * Кешує DOM елементи
     */
    cacheElements() {
        this.elements = {
            container: $('forestContainer'),
            lottieContainer: $('forestLottie'),
            ground: $('forestGround'),
            treeCount: $('forestTreeCount'),
            message: $('forestMessage'),
            progressBar: $('forestProgress'),
        };
    }

    /**
     * Запускає ріст дерева
     * @param {number} totalSeconds - Загальна тривалість в секундах
     */
    startGrowing(totalSeconds) {
        if (this.isGrowing) return;

        this.isGrowing = true;
        this.currentProgress = 0;

        // Запускаємо Lottie анімацію
        lottieAnimations.play('forestLottie');

        // Розраховуємо крок росту
        const updateInterval = 1000; // 1 секунда
        const progressPerUpdate = 100 / totalSeconds;

        this.updateTree();
        this.updateMessage('Дерево почало рости...');

        this.growInterval = setInterval(() => {
            if (!this.isGrowing) {
                clearInterval(this.growInterval);
                return;
            }

            this.currentProgress += progressPerUpdate;

            if (this.currentProgress >= 100) {
                this.currentProgress = 100;
                this.complete();
            } else {
                this.updateTree();
            }

            this.updateProgressBar();
        }, updateInterval);
    }

    /**
     * Зупиняє ріст (перерва перервана)
     */
    stop() {
        if (!this.isGrowing) return;

        this.isGrowing = false;

        // Зупиняємо Lottie анімацію
        lottieAnimations.stop('forestLottie');

        if (this.growInterval) {
            clearInterval(this.growInterval);
            this.growInterval = null;
        }

        // Дерево засохло
        this.updateMessage('Дерево засохло 😢');
        if (this.elements.lottieContainer) {
            this.elements.lottieContainer.classList.add('forest__lottie--dead');
        }
    }

    /**
     * Завершує ріст успішно
     */
    complete() {
        this.isGrowing = false;

        if (this.growInterval) {
            clearInterval(this.growInterval);
            this.growInterval = null;
        }

        // Додаємо дерево до лісу
        this.addTreeToForest();

        this.updateTree();
        this.updateMessage('Дерево виросло! 🎉');

        if (this.elements.lottieContainer) {
            this.elements.lottieContainer.classList.add('forest__lottie--complete');
        }
    }

    /**
     * Скидає стан
     */
    reset() {
        this.isGrowing = false;
        this.currentProgress = 0;

        // Зупиняємо і скидаємо Lottie
        lottieAnimations.stop('forestLottie');

        if (this.growInterval) {
            clearInterval(this.growInterval);
            this.growInterval = null;
        }

        if (this.elements.lottieContainer) {
            this.elements.lottieContainer.className = 'forest__lottie';
        }

        if (this.elements.message) {
            this.elements.message.textContent = 'Почніть перерву щоб виростити дерево';
        }

        this.updateProgressBar();
    }

    /**
     * Оновлює відображення дерева
     */
    updateTree() {
        // Оновлюємо прогрес Lottie анімації
        lottieAnimations.setProgress('forestLottie', this.currentProgress);
    }

    /**
     * Отримує поточну стадію росту
     * @returns {Object} Стадія росту
     */
    getCurrentStage() {
        let currentStage = this.growthStages[0];

        for (const stage of this.growthStages) {
            if (this.currentProgress >= stage.minProgress) {
                currentStage = stage;
            }
        }

        return currentStage;
    }

    /**
     * Оновлює повідомлення
     * @param {string} message - Текст повідомлення
     */
    updateMessage(message) {
        if (this.elements.message) {
            this.elements.message.textContent = message;
        }
    }

    /**
     * Оновлює прогрес-бар
     */
    updateProgressBar() {
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = `${this.currentProgress}%`;
        }
    }

    /**
     * Додає дерево до лісу (зберігає в статистику)
     */
    addTreeToForest() {
        const stats = Storage.getStats();
        stats.treesGrown = (stats.treesGrown || 0) + 1;
        Storage.saveStats(stats);
        this.updateTreeCount();
    }

    /**
     * Оновлює лічильник дерев
     */
    updateTreeCount() {
        if (!this.elements.treeCount) return;

        const stats = Storage.getStats();
        const count = stats.treesGrown || 0;
        this.elements.treeCount.textContent = count;
    }

    /**
     * Перевіряє чи росте дерево
     * @returns {boolean}
     */
    isActive() {
        return this.isGrowing;
    }
}

export default Forest;
