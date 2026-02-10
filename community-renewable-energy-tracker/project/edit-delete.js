// Edit & Delete Projects
const projects = JSON.parse(localStorage.getItem('communityProjects') || '[]');
const projectsList = document.getElementById('edit-delete-projects-list');
const editModal = document.getElementById('edit-modal');
const closeModal = document.getElementById('close-modal');
const editForm = document.getElementById('edit-project-form');
let editIdx = null;

function renderProjects() {
    projectsList.innerHTML = '';
    if (projects.length === 0) {
        projectsList.innerHTML = '<p>No projects submitted yet.</p>';
        return;
    }
    projects.forEach((project, idx) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <h3>${project.name}</h3>
            <p><strong>Location:</strong> ${project.location}</p>
            <p>${project.description}</p>
            <div class="progress-bar">
                <div class="progress-bar-inner" style="width: ${project.progress}%">${project.progress}%</div>
            </div>
            <div class="project-actions">
                <button class="edit-btn" data-idx="${idx}">Edit</button>
                <button class="delete-btn" data-idx="${idx}">Delete</button>
            </div>
        `;
        projectsList.appendChild(card);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            editIdx = parseInt(btn.getAttribute('data-idx'));
            openEditModal(editIdx);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            if (confirm('Are you sure you want to delete this project?')) {
                projects.splice(idx, 1);
                localStorage.setItem('communityProjects', JSON.stringify(projects));
                renderProjects();
            }
        });
    });
}

function openEditModal(idx) {
    const project = projects[idx];
    document.getElementById('edit-project-name').value = project.name;
    document.getElementById('edit-location').value = project.location;
    document.getElementById('edit-description').value = project.description;
    document.getElementById('edit-progress').value = project.progress;
    editModal.style.display = 'flex';
}

closeModal.onclick = function() {
    editModal.style.display = 'none';
    editIdx = null;
};

window.onclick = function(event) {
    if (event.target === editModal) {
        editModal.style.display = 'none';
        editIdx = null;
    }
};

editForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (editIdx === null) return;
    projects[editIdx] = {
        name: document.getElementById('edit-project-name').value.trim(),
        location: document.getElementById('edit-location').value.trim(),
        description: document.getElementById('edit-description').value.trim(),
        progress: parseInt(document.getElementById('edit-progress').value, 10)
    };
    localStorage.setItem('communityProjects', JSON.stringify(projects));
    renderProjects();
    editModal.style.display = 'none';
    editIdx = null;
});

renderProjects();
