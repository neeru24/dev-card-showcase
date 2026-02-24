// Digital Memory Capsule Logic
// Store and visualize digital memories

const memoryForm = document.getElementById('memory-form');
const memoryInput = document.getElementById('memory-input');
const memoryLogDiv = document.getElementById('memory-log');

let memoryLog = JSON.parse(localStorage.getItem('digitalCapsule')) || [];

function renderMemoryLog() {
    memoryLogDiv.innerHTML = '';
    memoryLog.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'memory-entry';
        div.innerHTML = `<strong>Memory:</strong> ${entry}`;
        memoryLogDiv.appendChild(div);
    });
}

memoryForm.addEventListener('submit', e => {
    e.preventDefault();
    const memory = memoryInput.value.trim();
    if (!memory) return;
    memoryLog.push(memory);
    localStorage.setItem('digitalCapsule', JSON.stringify(memoryLog));
    renderMemoryLog();
    memoryInput.value = '';
});

renderMemoryLog();
