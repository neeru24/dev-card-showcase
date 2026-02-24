// User Journey Heatmap Visualizer - JavaScript

class UserJourneyHeatmapVisualizer {
    constructor() {
        this.sessions = [];
        this.currentSession = null;
        this.isRecording = false;
        this.charts = {};
        this.settings = {
            recordClicks: true,
            recordHovers: true,
            recordScrolls: true,
            autoSave: true,
            heatmapOpacity: 0.7
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadSessions();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
        this.updateSessionSelect();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.getAttribute('href').substring(1));
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Recording controls
        document.getElementById('start-recording').addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('stop-recording').addEventListener('click', () => {
            this.stopRecording();
        });

        document.getElementById('clear-session').addEventListener('click', () => {
            this.clearCurrentSession();
        });

        // Heatmap controls
        document.getElementById('generate-heatmap').addEventListener('click', () => {
            this.generateHeatmap();
        });

        // Settings
        document.getElementById('record-clicks').addEventListener('change', (e) => {
            this.settings.recordClicks = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('record-hovers').addEventListener('change', (e) => {
            this.settings.recordHovers = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('record-scrolls').addEventListener('change', (e) => {
            this.settings.recordScrolls = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('auto-save').addEventListener('change', (e) => {
            this.settings.autoSave = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('heatmap-opacity').addEventListener('input', (e) => {
            this.settings.heatmapOpacity = parseFloat(e.target.value);
            document.getElementById('opacity-value').textContent = e.target.value;
            this.saveSettings();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.clearAllData();
            }
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });
    }

    switchSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    startRecording() {
        this.currentSession = {
            id: Date.now().toString(),
            startTime: Date.now(),
            interactions: [],
            metadata: {
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                url: window.location.href
            }
        };

        this.isRecording = true;
        this.updateRecordingUI();

        // Add event listeners for recording
        if (this.settings.recordClicks) {
            document.addEventListener('click', this.handleClick.bind(this), true);
        }
        if (this.settings.recordHovers) {
            document.addEventListener('mouseover', this.handleHover.bind(this), true);
        }
        if (this.settings.recordScrolls) {
            window.addEventListener('scroll', this.handleScroll.bind(this), true);
        }

        // Start session timer
        this.sessionTimer = setInterval(() => {
            this.updateSessionDuration();
        }, 1000);
    }

    stopRecording() {
        this.isRecording = false;
        this.updateRecordingUI();

        // Remove event listeners
        document.removeEventListener('click', this.handleClick.bind(this), true);
        document.removeEventListener('mouseover', this.handleHover.bind(this), true);
        window.removeEventListener('scroll', this.handleScroll.bind(this), true);

        // Stop timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }

        // Save session
        if (this.currentSession && this.settings.autoSave) {
            this.currentSession.endTime = Date.now();
            this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
            this.sessions.push(this.currentSession);
            this.saveSessions();
            this.updateDashboard();
            this.updateSessionSelect();
            this.updateSessionList();
        }
    }

    handleClick(event) {
        if (!this.isRecording || !this.settings.recordClicks) return;

        const interaction = {
            type: 'click',
            timestamp: Date.now(),
            x: event.clientX,
            y: event.clientY,
            target: this.getElementInfo(event.target),
            pageX: event.pageX,
            pageY: event.pageY
        };

        this.currentSession.interactions.push(interaction);
        this.updateSessionStats();
    }

    handleHover(event) {
        if (!this.isRecording || !this.settings.recordHovers) return;

        // Throttle hover events
        if (this.lastHoverTime && Date.now() - this.lastHoverTime < 100) return;
        this.lastHoverTime = Date.now();

        const interaction = {
            type: 'hover',
            timestamp: Date.now(),
            x: event.clientX,
            y: event.clientY,
            target: this.getElementInfo(event.target),
            pageX: event.pageX,
            pageY: event.pageY
        };

        this.currentSession.interactions.push(interaction);
        this.updateSessionStats();
    }

    handleScroll(event) {
        if (!this.isRecording || !this.settings.recordScrolls) return;

        // Throttle scroll events
        if (this.lastScrollTime && Date.now() - this.lastScrollTime < 200) return;
        this.lastScrollTime = Date.now();

        const interaction = {
            type: 'scroll',
            timestamp: Date.now(),
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        this.currentSession.interactions.push(interaction);
        this.updateSessionStats();
    }

    getElementInfo(element) {
        const rect = element.getBoundingClientRect();
        return {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            textContent: element.textContent?.substring(0, 50) || '',
            boundingRect: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            }
        };
    }

    updateRecordingUI() {
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const status = document.getElementById('recording-status');

        if (this.isRecording) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            status.textContent = '🔴 Recording...';
            status.style.color = '#ff6b6b';
            document.body.classList.add('recording');
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            status.textContent = 'Not recording';
            status.style.color = '';
            document.body.classList.remove('recording');
        }
    }

    updateSessionStats() {
        if (!this.currentSession) return;

        const clicks = this.currentSession.interactions.filter(i => i.type === 'click').length;
        const hovers = this.currentSession.interactions.filter(i => i.type === 'hover').length;
        const scrolls = this.currentSession.interactions.filter(i => i.type === 'scroll').length;

        document.getElementById('click-count').textContent = clicks;
        document.getElementById('hover-count').textContent = hovers;
        document.getElementById('scroll-count').textContent = scrolls;
    }

    updateSessionDuration() {
        if (!this.currentSession) return;

        const duration = Math.floor((Date.now() - this.currentSession.startTime) / 1000);
        document.getElementById('session-duration').textContent = `${duration}s`;
    }

    clearCurrentSession() {
        this.currentSession = null;
        this.updateSessionStats();
        document.getElementById('session-duration').textContent = '0s';
    }

    generateHeatmap() {
        const sessionId = document.getElementById('session-select').value;
        const interactionType = document.getElementById('interaction-type').value;

        if (!sessionId) {
            alert('Please select a session to visualize.');
            return;
        }

        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        this.clearHeatmap();

        let interactions = session.interactions;
        if (interactionType !== 'all') {
            interactions = interactions.filter(i => i.type === interactionType);
        }

        const heatmapContainer = document.getElementById('heatmap-overlay');
        const containerRect = heatmapContainer.getBoundingClientRect();

        interactions.forEach(interaction => {
            if (interaction.type === 'scroll') return; // Skip scroll for now

            const point = document.createElement('div');
            point.className = 'heatmap-point';
            point.style.left = `${interaction.x}px`;
            point.style.top = `${interaction.y}px`;
            point.style.width = '20px';
            point.style.height = '20px';
            point.style.backgroundColor = this.getHeatmapColor(interaction.type);
            point.style.opacity = this.settings.heatmapOpacity;
            point.style.position = 'absolute';

            heatmapContainer.appendChild(point);
        });
    }

    getHeatmapColor(type) {
        switch (type) {
            case 'click': return 'rgba(255, 107, 107, 0.8)'; // Red
            case 'hover': return 'rgba(79, 209, 255, 0.8)'; // Blue
            case 'scroll': return 'rgba(81, 207, 102, 0.8)'; // Green
            default: return 'rgba(255, 212, 59, 0.8)'; // Yellow
        }
    }

    clearHeatmap() {
        const heatmapContainer = document.getElementById('heatmap-overlay');
        heatmapContainer.innerHTML = '';
    }

    updateDashboard() {
        const totalSessions = this.sessions.length;
        const totalInteractions = this.sessions.reduce((sum, session) => sum + session.interactions.length, 0);
        const avgDuration = totalSessions > 0 ?
            this.sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / totalSessions / 1000 : 0;

        document.getElementById('total-sessions').textContent = totalSessions;
        document.getElementById('total-interactions').textContent = totalInteractions;
        document.getElementById('avg-session-time').textContent = `${Math.floor(avgDuration)}s`;

        // Find most clicked element
        const elementCounts = {};
        this.sessions.forEach(session => {
            session.interactions.forEach(interaction => {
                if (interaction.type === 'click' && interaction.target) {
                    const key = `${interaction.target.tagName}.${interaction.target.className}`;
                    elementCounts[key] = (elementCounts[key] || 0) + 1;
                }
            });
        });

        const topElement = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0];
        document.getElementById('top-element').textContent = topElement ? topElement[0] : '-';

        this.updateCharts();
    }

    updateSessionSelect() {
        const select = document.getElementById('session-select');
        select.innerHTML = '<option value="">Select Session</option>';

        this.sessions.forEach(session => {
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = `Session ${session.id} (${new Date(session.startTime).toLocaleString()})`;
            select.appendChild(option);
        });
    }

    updateSessionList() {
        const container = document.getElementById('session-list');
        container.innerHTML = '';

        this.sessions.slice(-10).reverse().forEach(session => {
            const item = document.createElement('div');
            item.className = 'session-item';
            item.innerHTML = `
                <div>
                    <strong>Session ${session.id}</strong>
                    <br>
                    <small>${new Date(session.startTime).toLocaleString()} - ${session.interactions.length} interactions</small>
                </div>
                <button onclick="visualizer.loadSession('${session.id}')" class="secondary-btn">View</button>
            `;
            container.appendChild(item);
        });
    }

    loadSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            document.getElementById('session-select').value = sessionId;
            this.generateHeatmap();
            this.switchSection('heatmap');
        }
    }

    initializeCharts() {
        // Interaction chart
        const interactionCtx = document.getElementById('interaction-chart').getContext('2d');
        this.charts.interaction = new Chart(interactionCtx, {
            type: 'bar',
            data: {
                labels: ['Clicks', 'Hovers', 'Scrolls'],
                datasets: [{
                    label: 'Interactions',
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 107, 107, 0.8)',
                        'rgba(79, 209, 255, 0.8)',
                        'rgba(81, 207, 102, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Timeline chart
        const timelineCtx = document.getElementById('timeline-chart').getContext('2d');
        this.charts.timeline = new Chart(timelineCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Interactions Over Time',
                    data: [],
                    borderColor: 'rgba(79, 209, 255, 1)',
                    backgroundColor: 'rgba(79, 209, 255, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Interactions'
                        }
                    }
                }
            }
        });

        // Element chart
        const elementCtx = document.getElementById('element-chart').getContext('2d');
        this.charts.element = new Chart(elementCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(255, 107, 107, 0.8)',
                        'rgba(79, 209, 255, 0.8)',
                        'rgba(81, 207, 102, 0.8)',
                        'rgba(255, 212, 59, 0.8)',
                        'rgba(142, 68, 173, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    updateCharts() {
        // Update interaction chart
        const totalClicks = this.sessions.reduce((sum, session) =>
            sum + session.interactions.filter(i => i.type === 'click').length, 0);
        const totalHovers = this.sessions.reduce((sum, session) =>
            sum + session.interactions.filter(i => i.type === 'hover').length, 0);
        const totalScrolls = this.sessions.reduce((sum, session) =>
            sum + session.interactions.filter(i => i.type === 'scroll').length, 0);

        this.charts.interaction.data.datasets[0].data = [totalClicks, totalHovers, totalScrolls];
        this.charts.interaction.update();

        // Update element chart
        const elementCounts = {};
        this.sessions.forEach(session => {
            session.interactions.forEach(interaction => {
                if (interaction.target) {
                    const key = interaction.target.tagName;
                    elementCounts[key] = (elementCounts[key] || 0) + 1;
                }
            });
        });

        const sortedElements = Object.entries(elementCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        this.charts.element.data.labels = sortedElements.map(([key]) => key);
        this.charts.element.data.datasets[0].data = sortedElements.map(([, value]) => value);
        this.charts.element.update();

        // Update timeline chart
        if (this.sessions.length > 0) {
            const timelineData = this.generateTimelineData();
            this.charts.timeline.data.labels = timelineData.labels;
            this.charts.timeline.data.datasets[0].data = timelineData.data;
            this.charts.timeline.update();
        }
    }

    generateTimelineData() {
        const now = Date.now();
        const hours = [];
        const data = [];

        for (let i = 23; i >= 0; i--) {
            const hourStart = now - (i * 60 * 60 * 1000);
            const hourEnd = hourStart + (60 * 60 * 1000);
            const hourLabel = new Date(hourStart).getHours() + ':00';

            const interactions = this.sessions
                .flatMap(session => session.interactions)
                .filter(interaction => interaction.timestamp >= hourStart && interaction.timestamp < hourEnd)
                .length;

            hours.push(hourLabel);
            data.push(interactions);
        }

        return { labels: hours, data };
    }

    saveSettings() {
        localStorage.setItem('userJourneySettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('userJourneySettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }

        // Apply settings to UI
        document.getElementById('record-clicks').checked = this.settings.recordClicks;
        document.getElementById('record-hovers').checked = this.settings.recordHovers;
        document.getElementById('record-scrolls').checked = this.settings.recordScrolls;
        document.getElementById('auto-save').checked = this.settings.autoSave;
        document.getElementById('heatmap-opacity').value = this.settings.heatmapOpacity;
        document.getElementById('opacity-value').textContent = this.settings.heatmapOpacity;

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
    }

    saveSessions() {
        localStorage.setItem('userJourneySessions', JSON.stringify(this.sessions));
    }

    loadSessions() {
        const saved = localStorage.getItem('userJourneySessions');
        if (saved) {
            this.sessions = JSON.parse(saved);
        }
    }

    exportData() {
        const data = {
            sessions: this.sessions,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-journey-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.sessions) {
                            this.sessions = [...this.sessions, ...data.sessions];
                            this.saveSessions();
                            this.updateDashboard();
                            this.updateSessionSelect();
                            this.updateSessionList();
                            alert('Data imported successfully!');
                        }
                    } catch (error) {
                        alert('Error importing data. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearAllData() {
        this.sessions = [];
        this.saveSessions();
        this.updateDashboard();
        this.updateSessionSelect();
        this.updateSessionList();
        localStorage.removeItem('userJourneySettings');
        this.loadSettings(); // Reset to defaults
    }
}

// Initialize the visualizer
const visualizer = new UserJourneyHeatmapVisualizer();