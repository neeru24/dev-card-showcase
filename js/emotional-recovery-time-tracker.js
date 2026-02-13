// Emotional Recovery Time Tracker JavaScript

class EmotionalRecoveryTracker {
    constructor() {
        this.recoveryData = this.loadData();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();
        this.updateStressDisplay();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('recoveryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logRecoveryEvent();
        });

        // Stress level slider
        document.getElementById('stressLevel').addEventListener('input', () => {
            this.updateStressDisplay();
        });

        // Chart controls
        document.getElementById('timeRange').addEventListener('change', () => {
            this.renderChart();
        });

        document.getElementById('refreshChart').addEventListener('click', () => {
            this.renderChart();
        });

        // History controls
        document.getElementById('viewRecent').addEventListener('click', () => {
            this.toggleHistoryView('recent');
        });

        document.getElementById('viewAll').addEventListener('click', () => {
            this.toggleHistoryView('all');
        });
    }

    updateStressDisplay() {
        const stressLevel = document.getElementById('stressLevel').value;
        const stressValue = document.getElementById('stressValue');
        const stressText = document.getElementById('stressText');

        stressValue.textContent = stressLevel;

        const stressLabels = {
            1: 'Minimal',
            2: 'Low',
            3: 'Mild',
            4: 'Moderate',
            5: 'Moderate',
            6: 'High',
            7: 'High',
            8: 'Severe',
            9: 'Extreme',
            10: 'Critical'
        };

        stressText.textContent = stressLabels[stressLevel] || 'Moderate';
    }

    logRecoveryEvent() {
        const formData = {
            id: Date.now(),
            eventDate: document.getElementById('eventDate').value,
            eventTime: document.getElementById('eventTime').value,
            recoveryTime: document.getElementById('recoveryTime').value,
            stressLevel: parseInt(document.getElementById('stressLevel').value),
            eventType: document.getElementById('eventType').value,
            eventDescription: document.getElementById('eventDescription').value,
            recoveryNotes: document.getElementById('recoveryNotes').value,
            timestamp: new Date().toISOString()
        };

        // Calculate recovery duration in minutes
        const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
        const recoveryDateTime = new Date(formData.recoveryTime);
        const recoveryDuration = Math.round((recoveryDateTime - eventDateTime) / (1000 * 60)); // minutes

        if (recoveryDuration <= 0) {
            alert('Recovery time must be after the event time.');
            return;
        }

        formData.recoveryDuration = recoveryDuration;

        this.recoveryData.push(formData);
        this.saveData();
        this.resetForm();
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();

        // Show success message
        this.showNotification('Recovery event logged successfully!', 'success');
    }

    resetForm() {
        document.getElementById('recoveryForm').reset();
        // Set default date to today
        document.getElementById('eventDate').valueAsDate = new Date();
        this.updateStressDisplay();
    }

    updateDashboard() {
        const data = this.recoveryData;

        if (data.length === 0) {
            this.updateMetrics('--', '--', '0', '--');
            this.updateResilienceLevel(0, 'No data available');
            return;
        }

        // Calculate metrics
        const durations = data.map(d => d.recoveryDuration);
        const avgRecovery = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        const fastestRecovery = Math.min(...durations);
        const totalEvents = data.length;

        // Calculate resilience score (lower recovery time = higher resilience)
        const resilienceScore = this.calculateResilienceScore(durations);

        this.updateMetrics(
            this.formatDuration(avgRecovery),
            this.formatDuration(fastestRecovery),
            totalEvents.toString(),
            resilienceScore.toString()
        );

        this.updateResilienceLevel(resilienceScore / 100, this.getResilienceLabel(resilienceScore));
    }

    calculateResilienceScore(durations) {
        if (durations.length === 0) return 0;

        // Base score on average recovery time
        // Lower recovery time = higher score
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        // Score ranges:
        // < 30 min: 90-100 (Excellent)
        // 30-60 min: 70-89 (Good)
        // 60-120 min: 50-69 (Fair)
        // 120-240 min: 30-49 (Poor)
        // > 240 min: 10-29 (Needs improvement)

        let score;
        if (avgDuration < 30) score = 95;
        else if (avgDuration < 60) score = 80;
        else if (avgDuration < 120) score = 65;
        else if (avgDuration < 240) score = 45;
        else score = 25;

        // Adjust based on consistency (lower variance = higher score)
        const variance = this.calculateVariance(durations);
        const consistencyBonus = Math.max(0, 10 - (variance / 100));

        return Math.min(100, Math.round(score + consistencyBonus));
    }

    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    getResilienceLabel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        if (score >= 30) return 'Poor';
        return 'Needs Improvement';
    }

    updateMetrics(avgRecovery, fastestRecovery, totalEvents, resilienceScore) {
        document.getElementById('avgRecoveryTime').textContent = avgRecovery;
        document.getElementById('fastestRecovery').textContent = fastestRecovery;
        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('resilienceScore').textContent = resilienceScore;
    }

    updateResilienceLevel(percentage, label) {
        const fill = document.getElementById('resilienceFill');
        const labelEl = document.getElementById('resilienceLabel');

        fill.style.width = `${percentage * 100}%`;
        labelEl.textContent = label;
    }

    renderChart() {
        const timeRange = document.getElementById('timeRange').value;
        const filteredData = this.filterDataByTimeRange(timeRange);

        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = document.getElementById('recoveryChart').getContext('2d');

        // Prepare data for chart
        const chartData = this.prepareChartData(filteredData);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Recovery Time (minutes)',
                    data: chartData.durations,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Stress Level',
                    data: chartData.stressLevels,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Recovery Time (minutes)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        max: 10,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Stress Level'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Recovery Time: ${context.parsed.y} minutes`;
                                } else {
                                    return `Stress Level: ${context.parsed.y}/10`;
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    filterDataByTimeRange(range) {
        const now = new Date();
        const cutoff = new Date();

        switch (range) {
            case '7':
                cutoff.setDate(now.getDate() - 7);
                break;
            case '30':
                cutoff.setDate(now.getDate() - 30);
                break;
            case '90':
                cutoff.setDate(now.getDate() - 90);
                break;
            default:
                return this.recoveryData; // 'all'
        }

        return this.recoveryData.filter(item => {
            const eventDate = new Date(item.eventDate);
            return eventDate >= cutoff;
        });
    }

    prepareChartData(data) {
        // Sort by date
        const sortedData = data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        return {
            labels: sortedData.map(item => this.formatDate(new Date(item.eventDate))),
            durations: sortedData.map(item => item.recoveryDuration),
            stressLevels: sortedData.map(item => item.stressLevel)
        };
    }

    renderHistory(view = 'recent') {
        const historyList = document.getElementById('eventHistory');
        let data = this.recoveryData;

        if (view === 'recent') {
            data = data.slice(-10); // Show last 10 events
        }

        data.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

        if (data.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar"></i>
                    <p>No recovery events logged yet.</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = data.map(item => `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-date">${this.formatDate(new Date(item.eventDate))}</div>
                    <div class="history-item-duration">${this.formatDuration(item.recoveryDuration)}</div>
                </div>
                <div class="history-item-details">
                    <div><strong>Type:</strong> ${this.capitalizeFirst(item.eventType)}</div>
                    <div><strong>Stress:</strong> ${item.stressLevel}/10</div>
                </div>
                <div class="history-item-description">
                    <strong>Event:</strong> ${item.eventDescription}
                    ${item.recoveryNotes ? `<br><strong>Recovery:</strong> ${item.recoveryNotes}` : ''}
                </div>
            </div>
        `).join('');

        // Re-render icons
        lucide.createIcons();
    }

    toggleHistoryView(view) {
        document.getElementById('viewRecent').classList.toggle('active', view === 'recent');
        document.getElementById('viewAll').classList.toggle('active', view === 'all');
        this.renderHistory(view);
    }

    renderInsights() {
        const data = this.recoveryData;

        if (data.length === 0) {
            this.renderEmptyInsights();
            return;
        }

        // Recovery patterns
        const avgByType = this.calculateAverageByType(data);
        const patterns = Object.entries(avgByType)
            .sort(([,a], [,b]) => a - b)
            .map(([type, avg]) => `${this.capitalizeFirst(type)}: ${this.formatDuration(avg)}`)
            .join(', ');

        document.getElementById('recoveryPatterns').innerHTML = `
            <p>Your fastest recovery is typically from ${Object.entries(avgByType).reduce((a, b) => avgByType[a[0]] < avgByType[b[0]] ? a : b)[0]} events (${this.formatDuration(Math.min(...Object.values(avgByType)))}), while ${Object.entries(avgByType).reduce((a, b) => avgByType[a[0]] > avgByType[b[0]] ? a : b)[0]} events take longer (${this.formatDuration(Math.max(...Object.values(avgByType)))}).</p>
        `;

        // Stress triggers
        const stressByType = this.calculateAverageStressByType(data);
        const triggers = Object.entries(stressByType)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([type, avg]) => `${this.capitalizeFirst(type)} (${avg.toFixed(1)}/10)`)
            .join(', ');

        document.getElementById('stressTriggers').innerHTML = `
            <p>Your most stressful events are typically: ${triggers}.</p>
        `;

        // Improvement areas
        const improvements = this.generateImprovementTips(data);
        document.getElementById('improvementAreas').innerHTML = `
            <p>${improvements}</p>
        `;

        // Tips
        this.renderTips(data);
    }

    renderEmptyInsights() {
        document.getElementById('recoveryPatterns').innerHTML = '<p>Log some recovery events to see patterns.</p>';
        document.getElementById('stressTriggers').innerHTML = '<p>Track events to identify stress triggers.</p>';
        document.getElementById('improvementAreas').innerHTML = '<p>Build resilience through consistent tracking.</p>';
        document.getElementById('tips').innerHTML = '';
    }

    calculateAverageByType(data) {
        const typeGroups = {};
        data.forEach(item => {
            if (!typeGroups[item.eventType]) {
                typeGroups[item.eventType] = [];
            }
            typeGroups[item.eventType].push(item.recoveryDuration);
        });

        const averages = {};
        Object.keys(typeGroups).forEach(type => {
            averages[type] = typeGroups[type].reduce((a, b) => a + b, 0) / typeGroups[type].length;
        });

        return averages;
    }

    calculateAverageStressByType(data) {
        const typeGroups = {};
        data.forEach(item => {
            if (!typeGroups[item.eventType]) {
                typeGroups[item.eventType] = [];
            }
            typeGroups[item.eventType].push(item.stressLevel);
        });

        const averages = {};
        Object.keys(typeGroups).forEach(type => {
            averages[type] = typeGroups[type].reduce((a, b) => a + b, 0) / typeGroups[type].length;
        });

        return averages;
    }

    generateImprovementTips(data) {
        const avgDuration = data.reduce((sum, item) => sum + item.recoveryDuration, 0) / data.length;
        const avgStress = data.reduce((sum, item) => sum + item.stressLevel, 0) / data.length;

        let tips = [];

        if (avgDuration > 120) {
            tips.push('Consider developing quicker recovery strategies like deep breathing or mindfulness.');
        }

        if (avgStress > 7) {
            tips.push('High stress levels suggest focusing on stress prevention techniques.');
        }

        if (data.length < 5) {
            tips.push('Continue logging events to identify patterns and improve resilience.');
        }

        return tips.length > 0 ? tips.join(' ') : 'Keep tracking to maintain your emotional resilience!';
    }

    renderTips(data) {
        const tips = [
            {
                icon: 'clock',
                text: 'Track recovery times immediately after events for accurate data.'
            },
            {
                icon: 'target',
                text: 'Set goals to reduce average recovery time by 10% each month.'
            },
            {
                icon: 'brain',
                text: 'Practice mindfulness techniques to improve emotional regulation.'
            },
            {
                icon: 'trending-down',
                text: 'Monitor stress patterns to identify and avoid triggers.'
            }
        ];

        document.getElementById('tips').innerHTML = tips.map(tip => `
            <div class="tip-item">
                <i data-lucide="${tip.icon}"></i>
                <p>${tip.text}</p>
            </div>
        `).join('');

        lucide.createIcons();
    }

    renderBenchmarks() {
        const benchmarks = [
            {
                title: 'Excellent Resilience',
                description: 'Recovery within 30 minutes',
                range: '< 30 minutes'
            },
            {
                title: 'Good Resilience',
                description: 'Recovery within 1 hour',
                range: '30-60 minutes'
            },
            {
                title: 'Fair Resilience',
                description: 'Recovery within 2 hours',
                range: '60-120 minutes'
            },
            {
                title: 'Poor Resilience',
                description: 'Recovery takes 2-4 hours',
                range: '120-240 minutes'
            },
            {
                title: 'Needs Improvement',
                description: 'Recovery takes over 4 hours',
                range: '> 240 minutes'
            }
        ];

        document.getElementById('benchmarks').innerHTML = benchmarks.map(benchmark => `
            <div class="benchmark-item">
                <h4>${benchmark.title}</h4>
                <p>${benchmark.description}</p>
                <div class="benchmark-range">${benchmark.range}</div>
            </div>
        `).join('');
    }

    // Utility methods
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        alert(message);
    }

    loadData() {
        const data = localStorage.getItem('emotionalRecoveryData');
        return data ? JSON.parse(data) : [];
    }

    saveData() {
        localStorage.setItem('emotionalRecoveryData', JSON.stringify(this.recoveryData));
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmotionalRecoveryTracker();
});