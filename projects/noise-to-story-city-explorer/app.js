// Noise-to-Story City Explorer
// Capture sound, map city mood, generate stories, recommend zones

let moods = JSON.parse(localStorage.getItem('cityMoodData')||'[]');
let stories = [];

function analyzeSound(data) {
    // Simulate mood detection: loud = busy, soft = calm, birds = creative
    if(data.includes('traffic')) return 'busy';
    if(data.includes('rain')) return 'calm';
    if(data.includes('birds')) return 'creative';
    if(data.includes('crowd')) return 'busy';
    return 'neutral';
}

function generateStory(location, mood) {
    const templates = {
        busy: `In ${location}, the city pulses with energy. Amidst the traffic and crowd, stories of hustle unfold.`,
        calm: `In ${location}, rain softens the city’s edges. Travelers find peace in quiet corners.`,
        creative: `In ${location}, birdsong inspires artists and dreamers. The vibe is alive with possibility.`,
        neutral: `In ${location}, the city’s mood is a blend of moments, waiting for discovery.`
    };
    return templates[mood]||templates['neutral'];
}

function renderMap() {
    const moodMap = document.getElementById('moodMap');
    moodMap.innerHTML = '';
    moods.forEach((m,i)=>{
        const div = document.createElement('div');
        div.style.margin = '8px';
        div.style.padding = '12px';
        div.style.background = m.mood==='calm'?'#b2dfdb':m.mood==='busy'?'#ffe082':m.mood==='creative'?'#c5e1a5':'#ede7f6';
        div.style.borderRadius = '8px';
        div.innerHTML = `<b>${m.location}</b> <span class="tag">${m.mood}</span>`;
        moodMap.appendChild(div);
    });
    suggestZones();
}

function suggestZones() {
    const zoneSuggest = document.getElementById('zoneSuggest');
    let calm = moods.filter(m=>m.mood==='calm').map(m=>m.location);
    let creative = moods.filter(m=>m.mood==='creative').map(m=>m.location);
    zoneSuggest.innerHTML = `<b>Calm Zones:</b> ${calm.join(', ')||'None'}<br><b>Creative Vibe Spots:</b> ${creative.join(', ')||'None'}`;
}

function renderStories() {
    const storyList = document.getElementById('storyList');
    storyList.innerHTML = '';
    stories.forEach((s,i)=>{
        const li = document.createElement('li');
        li.innerHTML = `<span class="tag">${s.location}</span> ${s.story}<br><audio src="${s.sound}" controls></audio>`;
        storyList.appendChild(li);
    });
}

function setupNav() {
    const navCapture = document.getElementById('navCapture');
    const navMap = document.getElementById('navMap');
    const navStories = document.getElementById('navStories');
    const captureSection = document.getElementById('captureSection');
    const mapSection = document.getElementById('mapSection');
    const storiesSection = document.getElementById('storiesSection');
    function showSection(section) {
        [captureSection,mapSection,storiesSection].forEach(s=>s.classList.remove('active'));
        section.classList.add('active');
        [navCapture,navMap,navStories].forEach(b=>b.classList.remove('active'));
        if(section===captureSection) navCapture.classList.add('active');
        if(section===mapSection) navMap.classList.add('active');
        if(section===storiesSection) navStories.classList.add('active');
    }
    navCapture.onclick = ()=>showSection(captureSection);
    navMap.onclick = ()=>showSection(mapSection);
    navStories.onclick = ()=>showSection(storiesSection);
}

function setupCapture() {
    const startCaptureBtn = document.getElementById('startCaptureBtn');
    const captureStatus = document.getElementById('captureStatus');
    const locationForm = document.getElementById('locationForm');
    const locationInput = document.getElementById('locationInput');
    let soundData = '';
    startCaptureBtn.onclick = ()=>{
        // Simulate sound capture
        soundData = prompt('Describe ambient sound (traffic, rain, birds, crowd):');
        if(!soundData) { captureStatus.innerHTML = '<div class="error">No sound captured.</div>'; return; }
        captureStatus.innerHTML = `<div class="status">Sound captured: ${soundData}</div>`;
    };
    locationForm.onsubmit = e=>{
        e.preventDefault();
        const location = locationInput.value.trim();
        if(!location||!soundData) { captureStatus.innerHTML = '<div class="error">Capture sound and enter location.</div>'; return; }
        const mood = analyzeSound(soundData);
        moods.push({location,sound:soundData,mood});
        localStorage.setItem('cityMoodData',JSON.stringify(moods));
        // Generate story and soundtrack
        const story = generateStory(location,mood);
        const soundUrl = mood==='calm'?'rain.mp3':mood==='busy'?'traffic.mp3':mood==='creative'?'birds.mp3':'ambient.mp3';
        stories.push({location,story,sound:soundUrl});
        captureStatus.innerHTML = '<div class="status">Mood saved and story generated!</div>';
        locationForm.reset();
        renderMap();
        renderStories();
    };
}

window.onload = function() {
    setupNav();
    setupCapture();
    renderMap();
    renderStories();
};
