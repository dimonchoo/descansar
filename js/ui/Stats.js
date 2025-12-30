/**
 * Stats Module
 * Відображення глобальної статистики
 */

import Storage from '../core/Storage.js';
import { $, formatTimeHHMM } from '../utils/helpers.js';
import { PHASE_TYPES } from '../utils/constants.js';

class Stats {
    constructor() {
        this.elements = {
            streakDays: $('streakDays'),
            totalBreaks: $('totalBreaks'),
            totalMinutes: $('totalMinutes'),
            todayBreaks: $('todayBreaks'),
            todayMinutes: $('todayMinutes'),
            historyList: $('historyList'),
        };
    }

    /**
     * Ініціалізація та оновлення статистики
     */
    init() {
        this.update();
    }

    /**
     * Оновлює всю статистику
     */
    update() {
        const stats = Storage.getStats();
        const todayStats = this.getTodayStats(stats);

        // Загальна статистика
        if (this.elements.streakDays) {
            this.elements.streakDays.textContent = stats.streak || 0;
        }

        if (this.elements.totalBreaks) {
            this.elements.totalBreaks.textContent = stats.totalBreaks || 0;
        }

        if (this.elements.totalMinutes) {
            this.elements.totalMinutes.textContent = stats.totalBreakMinutes || 0;
        }

        // Статистика за сьогодні
        if (this.elements.todayBreaks) {
            this.elements.todayBreaks.textContent = todayStats.breaks;
        }

        if (this.elements.todayMinutes) {
            this.elements.todayMinutes.textContent = todayStats.minutes;
        }

        // Історія
        this.updateHistory(stats.history || []);
    }

    /**
     * Отримує статистику за сьогодні
     * @param {Object} stats - Загальна статистика
     * @returns {Object} Статистика за сьогодні
     */
    getTodayStats(stats) {
        const today = new Date().toISOString().split('T')[0];
        const todayHistory = (stats.history || []).filter(item => {
            return item.date && item.date.startsWith(today);
        });

        const breaks = todayHistory.filter(item => item.type === 'break').length;
        const minutes = todayHistory
            .filter(item => item.type === 'break')
            .reduce((sum, item) => sum + (item.duration || 0), 0);

        return { breaks, minutes };
    }

    /**
     * Оновлює список історії
     * @param {Array} history - Масив записів історії
     */
    updateHistory(history) {
        if (!this.elements.historyList) return;

        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<li class="history-list__empty">Поки немає записів</li>';
            return;
        }

        // Показуємо останні 10 записів
        const recentHistory = history.slice(0, 10);

        this.elements.historyList.innerHTML = recentHistory.map(item => {
            const icon = this.getPhaseIcon(item.phase);
            const label = this.getPhaseLabel(item.phase);
            const time = this.formatHistoryTime(item.date);

            return `
                <li class="history-list__item">
                    <div class="history-list__type">
                        <span class="history-list__icon">${icon}</span>
                        <span class="history-list__label">${label}</span>
                    </div>
                    <div class="history-list__meta">
                        <span class="history-list__duration">${item.duration} хв</span>
                        <span class="history-list__time">${time}</span>
                    </div>
                </li>
            `;
        }).join('');
    }

    /**
     * Отримує іконку для фази
     * @param {string} phase - Тип фази
     * @returns {string} Іконка
     */
    getPhaseIcon(phase) {
        const icons = {
            [PHASE_TYPES.WORK]: '💼',
            [PHASE_TYPES.SHORT_BREAK]: '☕',
            [PHASE_TYPES.LONG_BREAK]: '🧘',
            [PHASE_TYPES.SIMPLE_BREAK]: '⏸️',
        };
        return icons[phase] || '⏱️';
    }

    /**
     * Отримує назву фази
     * @param {string} phase - Тип фази
     * @returns {string} Назва
     */
    getPhaseLabel(phase) {
        const labels = {
            [PHASE_TYPES.WORK]: 'Робота',
            [PHASE_TYPES.SHORT_BREAK]: 'Коротка перерва',
            [PHASE_TYPES.LONG_BREAK]: 'Довга перерва',
            [PHASE_TYPES.SIMPLE_BREAK]: 'Перерва',
        };
        return labels[phase] || 'Перерва';
    }

    /**
     * Форматує час для історії
     * @param {string} dateStr - ISO дата
     * @returns {string} Форматований час
     */
    formatHistoryTime(dateStr) {
        if (!dateStr) return '';

        const date = new Date(dateStr);
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
        const itemDate = dateStr.split('T')[0];

        const time = date.toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit',
        });

        if (itemDate === today) {
            return `Сьогодні, ${time}`;
        } else if (itemDate === yesterday) {
            return `Вчора, ${time}`;
        } else {
            return date.toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'short',
            }) + `, ${time}`;
        }
    }
}

export default Stats;
