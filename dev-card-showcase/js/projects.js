// Global variables
let allProjectsData = []; // Combined static and JSON projects
let filteredProjects = []; // Currently filtered projects
let projectCards = [];
let activeFilter = "all";
let currentPage = 1;
const projectsPerPage = 12;

// Static projects moved to static-projects.js


function createProjectCard(project, index) {
    const card = document.createElement("div");
    card.className = "project-card";
    // Track interaction on click
    card.onclick = function () {
        if (window.RecommendationEngine) {
            window.RecommendationEngine.trackInteraction(project);
        }
    };
    const projectIndex = (currentPage - 1) * projectsPerPage + index;
    card.style.setProperty('--project-index', index);

    const tagsHTML = (project.tags || [])
        .map(tag => `<span class="tag">${tag}</span>`)
        .join("");

    const authorName = (project.author && project.author.name) ? project.author.name : "Unknown Contributor";

    card.innerHTML = `
        <h2>${project.title || "Untitled Project"}</h2>
        <p class="project-desc">${project.description || "No description provided."}</p>

        <div class="project-tags">
            ${tagsHTML}
        </div>

        <div class="project-footer">
            <span>By ${authorName}</span>
            <div class="project-links">
                ${(project.links && project.links.github) ? `<a href="${project.links.github}" target="_blank"><i class="fab fa-github"></i></a>` : ""}
                ${(project.links && project.links.live) ? `<a href="${project.links.live}" target="_blank"><i class="fas fa-external-link-alt"></i></a>` : ""}
            </div>
        </div>
        `;

    return card;
}

async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        let fetchedProjects = [];
        if (response.ok) {
            fetchedProjects = await response.json();
        }

        let staticProjects = [];
        try {
            const module = await import('./static-projects.js');
            staticProjects = module.staticProjects;
        } catch (e) {
            console.error("Failed to load static projects:", e);
        }

        // Combine and deduplicate
        const combined = [...staticProjects, ...fetchedProjects];
        allProjectsData = Array.from(new Map(combined
            .filter(p => p && p.title)
            .map(p => [p.title, p]))
            .values());

        // Initial set of filtered projects is all projects
        filteredProjects = [...allProjectsData];

        // Initialize Recommendation Engine
        if (window.RecommendationEngine) {
            window.RecommendationEngine.initWidget(allProjectsData);
        }

        // Populate contributor filter
        populateContributorFilter();

        // Sort initially A-Z
        sortProjects("az");

        renderProjects();
    } catch (error) {
        console.error("Error loading projects:", error);
        const container = document.getElementById("projectsContainer");
        if (container) {
            container.innerHTML = '<div class="loading">Error loading projects. Please refresh the page.</div>';
        }
    }
}

function sortProjects(order) {
    filteredProjects.sort((a, b) => {
        if (order === "az") {
            return a.title.localeCompare(b.title);
        } else {
            return b.title.localeCompare(a.title);
        }
    });
}

function populateContributorFilter() {
    const filter = document.getElementById("contributorFilter");
    if (!filter) return;

    // Clear existing options except the first one
    while (filter.options.length > 1) {
        filter.remove(1);
    }

    const contributors = [...new Set(allProjectsData
        .filter(p => p.author && p.author.name)
        .map(p => p.author.name))].sort();
    contributors.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        filter.appendChild(option);
    });

    filter.addEventListener("change", () => {
        currentPage = 1;
        runFilter(searchInput.value.toLowerCase(), activeFilter);
    });
}

function renderProjects() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;

    container.innerHTML = "";
    projectCards = [];

    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);

    if (projectsToShow.length === 0) {
        const emptyState = document.getElementById("noProjectsState");
        if (emptyState) emptyState.classList.add("visible");
    } else {
        const emptyState = document.getElementById("noProjectsState");
        if (emptyState) emptyState.classList.remove("visible");

        projectsToShow.forEach((project, index) => {
            const card = createProjectCard(project, index);
            container.appendChild(card);
            projectCards.push(card);
        });
    }

    updatePagination();

    // Circle cursor animation might need re-binding or just works if it's on document
}

function updatePagination() {
    const container = document.getElementById("paginationContainer");
    if (!container) return;

    container.innerHTML = "";
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn";
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        currentPage--;
        renderProjects();
        scrollToTop();
    };
    container.appendChild(prevBtn);

    // Page Numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstPage = createPageBtn(1);
        container.appendChild(firstPage);
        if (startPage > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.innerText = "...";
            container.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createPageBtn(i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.innerText = "...";
            container.appendChild(ellipsis);
        }
        const lastPage = createPageBtn(totalPages);
        container.appendChild(lastPage);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn";
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        currentPage++;
        renderProjects();
        scrollToTop();
    };
    container.appendChild(nextBtn);
}

function createPageBtn(page) {
    const btn = document.createElement("button");
    btn.className = `pagination-btn ${page === currentPage ? "active" : ""}`;
    btn.innerText = page;
    btn.onclick = () => {
        currentPage = page;
        renderProjects();
        scrollToTop();
    };
    return btn;
}
// Circle cursor animation
document.addEventListener("DOMContentLoaded", function () {
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll(".circle");

    circles.forEach(function (circle) {
        circle.x = 0;
        circle.y = 0;
    });

    window.addEventListener("mousemove", function (e) {
        coords.x = e.pageX;
        coords.y = e.pageY - window.scrollY;
    });

    function animateCircles() {
        let x = coords.x;
        let y = coords.y;
        circles.forEach(function (circle, index) {
            circle.style.left = `${x - 12}px`;
            circle.style.top = `${y - 12}px`;
            circle.style.transform = `scale(${(circles.length - index) / circles.length})`;
            const nextCircle = circles[index + 1] || circles[0];
            circle.x = x;
            circle.y = y;
            x += (nextCircle.x - x) * 0.3;
            y += (nextCircle.y - y) * 0.3;
        });

        requestAnimationFrame(animateCircles);
    }

    animateCircles();
});


// 1. Navbar Hamburger Menu Logic
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

// 2. View Toggle (Grid vs List) Logic
const viewToggleBtn = document.getElementById("viewToggleBtn");
const projectsContainer = document.querySelector(".projects-container");
let isCompact = false;

if (viewToggleBtn) {
    viewToggleBtn.addEventListener("click", () => {
        isCompact = !isCompact;
        projectsContainer.classList.toggle("compact-view");
        viewToggleBtn.innerHTML = isCompact
            ? '<i class="fas fa-th-list"></i>'
            : '<i class="fas fa-th-large"></i>';
    });
}

// 3. Search, Filter, and Sort Logic
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");

// --- Search Event ---
searchInput.addEventListener("input", () => {
    currentPage = 1;
    runFilter(searchInput.value.toLowerCase(), activeFilter);
});

// --- Filter Button Events ---
filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        activeFilter = btn.dataset.tech;
        currentPage = 1;
        runFilter(searchInput.value.toLowerCase(), activeFilter);
    });
});

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Show button only when scrolled down
window.addEventListener("scroll", function () {
    const btn = document.getElementById("scrollToTop");
    if (window.scrollY > 300) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
});


// --- Sort Event ---
sortSelect.addEventListener("change", () => {
    sortProjects(sortSelect.value);
    renderProjects();
});

// --- Core Filtering Function ---
function runFilter(query, tech) {
    const contributorValue = document.getElementById("contributorFilter")?.value || "";

    filteredProjects = allProjectsData.filter((project) => {
        const title = (project.title || "").toLowerCase();
        const description = (project.description || "").toLowerCase();
        const tags = (project.tags || []).join(" ").toLowerCase();
        const author = (project.author && project.author.name) ? project.author.name.toLowerCase() : "";

        const matchesSearch = title.includes(query) ||
            description.includes(query) ||
            tags.includes(query) ||
            author.includes(query);

        const matchesTech = (tech === "all") || tags.includes(tech.toLowerCase());

        const matchesContributor = !contributorValue || author === contributorValue.toLowerCase();

        return matchesSearch && matchesTech && matchesContributor;
    });

    // Re-apply current sort
    sortProjects(sortSelect.value);
    renderProjects();
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
});

// Keyboard Shortcuts Overlay Functionality
document.addEventListener('DOMContentLoaded', function () {
    const shortcutsOverlay = document.getElementById('keyboardShortcutsOverlay');
    const closeShortcutsBtn = document.getElementById('closeShortcuts');

    // Function to show shortcuts overlay
    function showShortcutsOverlay() {
        shortcutsOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Function to hide shortcuts overlay
    function hideShortcutsOverlay() {
        shortcutsOverlay.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    // Show overlay when "?" key is pressed
    document.addEventListener('keydown', function (e) {
        // Only trigger if not typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        if (e.key === '?' || e.key === '¿') {
            e.preventDefault();
            showShortcutsOverlay();
        }

        // Also hide overlay with Escape key
        if (e.key === 'Escape' && shortcutsOverlay.classList.contains('show')) {
            hideShortcutsOverlay();
        }
    });

    // Close overlay when close button is clicked
    if (closeShortcutsBtn) {
        closeShortcutsBtn.addEventListener('click', hideShortcutsOverlay);
    }

    // Close overlay when clicking outside the modal
    shortcutsOverlay.addEventListener('click', function (e) {
        if (e.target === shortcutsOverlay) {
            hideShortcutsOverlay();
        }
    });
});

