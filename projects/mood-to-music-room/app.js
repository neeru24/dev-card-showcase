// Modular playlist manager
class PlaylistManager {
    constructor() {
        this.sources = ['spotify', 'youtube'];
    }
    render(playlist, container) {
        container.innerHTML = '';
        playlist.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'playlist-item';
            wrapper.innerHTML = `<h3>${item.title}</h3>`;
            if (item.url.includes('spotify')) {
                wrapper.innerHTML += `<iframe src="${item.url}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
            } else if (item.url.includes('youtube')) {
                wrapper.innerHTML += `<iframe width="300" height="80" src="${item.url}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                wrapper.innerHTML += `<a href="${item.url}" target="_blank">Play</a>`;
            }
            container.appendChild(wrapper);
        });
    }
    addTrack(mood, title, url) {
        moods[mood].playlist.push({ title, url });
    }
}

const playlistManager = new PlaylistManager();
// Mood-to-Music Room Core Logic
// ...existing code...

const moods = {
    focus: {
        visuals: 'focus',
        playlist: [
            { title: 'Lo-Fi Beats', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXc8kgYqQLMfH' },
            { title: 'Deep Focus', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgTdVQ' }
        ]
    },
    relax: {
        visuals: 'relax',
        playlist: [
            { title: 'Chill Vibes', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6' },
            { title: 'Relaxing Music', url: 'https://www.youtube.com/embed/2OEL4P1Rz04' }
        ]
    },
    stress: {
        visuals: 'stress',
        playlist: [
            { title: 'Stress Relief', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0' },
            { title: 'Calm Down', url: 'https://www.youtube.com/embed/1ZYbU82GVz4' }
        ]
    },
    sleep: {
        visuals: 'sleep',
        playlist: [
            { title: 'Sleep Sounds', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZd79rJ6a7lp' },
            { title: 'Sleep Music', url: 'https://www.youtube.com/embed/MkFQHScF4hA' }
        ]
    },
    custom: {
        visuals: 'custom',
        playlist: []
    }
};

let currentMood = 'focus';

function renderVisuals(mood) {
    const visuals = document.getElementById('visuals');
    visuals.innerHTML = '';
    visuals.style.background = '';
    // Remove existing canvas if any
    const oldCanvas = document.getElementById('mood-canvas');
    if (oldCanvas) oldCanvas.remove();
    const canvas = document.createElement('canvas');
    canvas.id = 'mood-canvas';
    canvas.width = visuals.offsetWidth || 900;
    canvas.height = visuals.offsetHeight || 300;
    visuals.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    switch (mood) {
        case 'focus':
            drawFocusVisual(ctx, canvas);
            break;
        case 'relax':
            drawRelaxVisual(ctx, canvas);
            break;
        case 'stress':
            drawStressVisual(ctx, canvas);
            break;
        case 'sleep':
            drawSleepVisual(ctx, canvas);
            break;
        case 'custom':
            drawCustomVisual(ctx, canvas);
            break;
    }
}

function drawFocusVisual(ctx, canvas) {
    // Animated moving lines for focus
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let t = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 15 + Math.sin(t + i) * 10);
            ctx.lineTo(canvas.width, i * 15 + Math.sin(t + i) * 10);
            ctx.strokeStyle = `rgba(100,200,255,0.2)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        // Add focus dots
        for (let j = 0; j < 10; j++) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2 + Math.sin(t + j) * 120, 50 + j * 20, 6, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(100,200,255,0.5)';
            ctx.fill();
        }
        t += 0.05;
        requestAnimationFrame(animate);
    }
    animate();
}

// Utility for advanced animation
function lerp(a, b, t) {
    return a + (b - a) * t;
}

function drawRelaxVisual(ctx, canvas) {
    // Animated waves for relax
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let t = 0;
    let shapes = Array.from({length: 8}, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 30 + 20,
        dx: Math.random() * 0.5 + 0.2,
        dy: Math.random() * 0.5 + 0.2
    }));
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Animated gradient background
        let grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#a8edea');
        grad.addColorStop(1, '#fed6e3');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Waves
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x += 10) {
                let y = 50 + i * 40 + Math.sin((x / 80) + t + i) * 20;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(180,220,255,0.3)`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        // Floating shapes
        shapes.forEach(shape => {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.r, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fill();
            shape.x += Math.sin(t) * shape.dx;
            shape.y += Math.cos(t) * shape.dy;
            if (shape.x > canvas.width) shape.x = 0;
            if (shape.y > canvas.height) shape.y = 0;
        });
        t += 0.02;
        requestAnimationFrame(animate);
    }
    animate();
}

function drawStressVisual(ctx, canvas) {
    // Calming circles for stress relief
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let t = 0;
    let bubbles = Array.from({length: 12}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 20 + 10,
        dx: Math.random() * 0.3 + 0.1,
        dy: Math.random() * 0.3 + 0.1
    }));
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Animated color background
        let grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#f6d365');
        grad.addColorStop(1, '#fda085');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Calming circles
        for (let i = 0; i < 10; i++) {
            let x = canvas.width / 2 + Math.sin(t + i) * 120;
            let y = canvas.height / 2 + Math.cos(t + i) * 80;
            ctx.beginPath();
            ctx.arc(x, y, 30 + Math.sin(t + i) * 10, 0, 2 * Math.PI);
            ctx.strokeStyle = `rgba(255,200,100,0.2)`;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        // Floating bubbles
        bubbles.forEach(bubble => {
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.r, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fill();
            bubble.x += Math.sin(t) * bubble.dx;
            bubble.y += Math.cos(t) * bubble.dy;
            if (bubble.x > canvas.width) bubble.x = 0;
            if (bubble.y > canvas.height) bubble.y = 0;
        });
        t += 0.03;
        requestAnimationFrame(animate);
    }
    animate();
}

function drawSleepVisual(ctx, canvas) {
    // Stars and moon for sleep
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let stars = Array.from({length: 50}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        twinkle: Math.random() * 0.5 + 0.5
    }));
    let moon = { x: canvas.width - 80, y: 60, r: 40, phase: 0 };
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Night gradient
        let grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#23243a');
        grad.addColorStop(1, '#cfd9df');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Animated moon
        ctx.save();
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.r, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,200,0.8)';
        ctx.shadowColor = 'rgba(255,255,200,0.5)';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();
        moon.phase += 0.01;
        // Twinkling stars
        stars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = Math.abs(Math.sin(moon.phase * star.twinkle));
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fill();
            ctx.restore();
            star.x += Math.sin(star.y) * 0.1;
            if (star.x > canvas.width) star.x = 0;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function drawCustomVisual(ctx, canvas) {
    // Placeholder for custom visuals
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '32px Segoe UI';
    ctx.fillStyle = '#fff';
    ctx.fillText('Custom Mood', canvas.width / 2 - 80, canvas.height / 2);
}

function renderPlaylist(mood) {
    const playlistDiv = document.getElementById('playlist');
    playlistDiv.innerHTML = '';
    const playlist = moods[mood].playlist;
    if (playlist.length === 0 && mood === 'custom') {
        playlistDiv.innerHTML = '<p>No playlist for custom mood. Add your own!</p>';
        const form = document.createElement('form');
        form.id = 'custom-playlist-form';
        form.innerHTML = `
            <input type="text" id="custom-title" placeholder="Track Title" required />
            <input type="text" id="custom-url" placeholder="Spotify/YouTube URL" required />
            <button type="submit">Add Track</button>
        `;
        playlistDiv.appendChild(form);
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('custom-title').value;
            const url = document.getElementById('custom-url').value;
            playlistManager.addTrack('custom', title, url);
            renderPlaylist('custom');
        });
        return;
    }
    playlistManager.render(playlist, playlistDiv);
    if (mood === 'custom') {
        // Show add track form for custom mood
        const form = document.createElement('form');
        form.id = 'custom-playlist-form';
        form.innerHTML = `
            <input type="text" id="custom-title" placeholder="Track Title" required />
            <input type="text" id="custom-url" placeholder="Spotify/YouTube URL" required />
            <button type="submit">Add Track</button>
        `;
        playlistDiv.appendChild(form);
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('custom-title').value;
            const url = document.getElementById('custom-url').value;
            playlistManager.addTrack('custom', title, url);
            renderPlaylist('custom');
        });
    }
}

function setMood(mood) {
    currentMood = mood;
    renderVisuals(mood);
    renderPlaylist(mood);
}

document.getElementById('mood-select').addEventListener('change', e => {
    setMood(e.target.value);
});

document.getElementById('ai-detect').addEventListener('click', () => {
    // AI mood detection stub
    aiDetectMood();
});

function aiDetectMood() {
    // Placeholder for AI mood detection
    // In future, integrate with emotion API or webcam analysis
    // For now, randomly select a mood
    const moodKeys = Object.keys(moods).filter(m => m !== 'custom');
    const detectedMood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
    alert('AI detected mood: ' + detectedMood);
    setMood(detectedMood);
    document.getElementById('mood-select').value = detectedMood;
}

document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
        activatePresetRoom(btn.dataset.mood);
    });
});

function activatePresetRoom(mood) {
    setMood(mood);
    document.getElementById('mood-select').value = mood;
    // Optionally, show preset info or tips
    const playlistDiv = document.getElementById('playlist');
    const info = document.createElement('div');
    info.className = 'preset-info';
    info.innerHTML = `<p>Preset Room: <strong>${mood.charAt(0).toUpperCase() + mood.slice(1)}</strong></p>`;
    playlistDiv.appendChild(info);
}

// Initial render
setMood(currentMood);

// ...more code will be added for visuals, AI, and playlist integration...
