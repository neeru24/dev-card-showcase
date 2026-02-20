/**
 * AI-Driven Recommendation Engine
 * Handles user behavior tracking and generates personalized project suggestions.
 */

const RecommendationEngine = {
  // Storage keys
  STORAGE_KEYS: {
    HISTORY: 'user_interaction_history',
    PREFERENCES: 'user_preferences'
  },

  // Configuration
  CONFIG: {
    MAX_HISTORY_ITEMS: 50,
    MIN_INTERACTIONS_FOR_REC: 3
  },

  /**
   * Track a user interaction with a project
   * @param {Object} project - The project object (title, tags, etc.)
   */
  trackInteraction: function(project) {
    if (!project) return;

    const history = this.getHistory();
    const interaction = {
      title: project.title,
      tags: project.tags || [],
      timestamp: Date.now()
    };

    // Add to beginning of history
    history.unshift(interaction);

    // Limit history size
    if (history.length > this.CONFIG.MAX_HISTORY_ITEMS) {
      history.pop();
    }

    // Save to local storage
    localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(history));
    
    // Trigger an update if the widget is present
    this.updateWidget();
  },

  /**
   * Retrieve user interaction history
   * @returns {Array} List of past interactions
   */
  getHistory: function() {
    try {
      const history = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (e) {
      console.error("Error reading history:", e);
      return [];
    }
  },

  /**
   * Analyze history to find top interest categories/tags
   * @returns {Object} Map of tag -> frequency
   */
  analyzePreferences: function() {
    const history = this.getHistory();
    const tagCounts = {};

    history.forEach(interaction => {
      interaction.tags.forEach(tag => {
        // Normalize tag
        const normalizedTag = tag.trim(); 
        tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
      });
    });

    return tagCounts;
  },

  /**
   * Generate recommendations based on user history
   * @param {Array} allProjects - List of all available projects
   * @returns {Array} List of recommended projects
   */
  getRecommendations: function(allProjects) {
    const history = this.getHistory();
    
    // If not enough history, return trending or random (fallback)
    if (history.length < this.CONFIG.MIN_INTERACTIONS_FOR_REC) {
      return this.getTrendingProjects(allProjects);
    }

    const tagCounts = this.analyzePreferences();
    const viewedTitles = new Set(history.map(h => h.title));

    // Score each project
    const scoredProjects = allProjects.map(project => {
      // Skip if already viewed (optional: maybe show again if it's a tool?)
      // For now, let's include them but with lower score if we wanted, 
      // but usually recommendations are for *new* things. 
      // Let's filter out recently viewed 
      if (viewedTitles.has(project.title)) return { project, score: -1 };

      let score = 0;
      if (project.tags) {
        project.tags.forEach(tag => {
          const normalizedTag = tag.trim();
          if (tagCounts[normalizedTag]) {
            score += tagCounts[normalizedTag];
          }
        });
      }
      return { project, score };
    });

    // Sort by score descending
    scoredProjects.sort((a, b) => b.score - a.score);

    // Return top 4 unique recommendations with score > 0
    return scoredProjects
      .filter(item => item.score > 0)
      .slice(0, 4)
      .map(item => item.project);
  },

  /**
   * Fallback: Get random or trending projects
   */
  getTrendingProjects: function(allProjects) {
    // For now, just return random 4 projects as "Trending"
    // In a real app, this would come from a backend
    const shuffled = [...allProjects].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  },

  /**
   * Initialize and render the recommendation widget
   * @param {Array} allProjects - The full list of projects
   */
  initWidget: function(allProjects) {
    this.allProjects = allProjects; // Cache for updates
    this.renderWidget();
  },

  /**
   * Render the recommendation UI
   */
  renderWidget: function() {
    const container = document.getElementById('recommendationContainer');
    if (!container || !this.allProjects) return;

    const recommendations = this.getRecommendations(this.allProjects);
    const history = this.getHistory();
    const isPersonalized = history.length >= this.CONFIG.MIN_INTERACTIONS_FOR_REC;

    if (recommendations.length === 0) {
      container.style.display = 'none';
      return;
    }

    const title = isPersonalized ? "✨ Recommended For You" : "🔥 Trending Projects";
    const subtitle = isPersonalized 
      ? "Based on your browsing habits" 
      : "Popular among other developers";

    let html = `
      <div class="recommendation-header">
        <div class="rec-title-group">
          <h2>${title}</h2>
          <p>${subtitle}</p>
        </div>
        ${history.length > 0 ? `<button onclick="RecommendationEngine.clearHistory()" class="reset-btn" title="Reset Recommendations"><i class="fas fa-undo"></i> Reset</button>` : ''}
      </div>
      <div class="recommendation-grid">
    `;

    recommendations.forEach(project => {
      html += this.createCardHTML(project);
    });

    html += `</div>`;
    
    container.innerHTML = html;
    container.style.display = 'block';
    
    // Add animation class
    setTimeout(() => {
        const cards = container.querySelectorAll('.rec-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
    }, 100);
  },

  createCardHTML: function(project) {
    // Helper to generate stars/rating (mock)
    const rating = (Math.random() * (5 - 4) + 4).toFixed(1);
    
    return `
      <div class="rec-card" onclick="window.projectCardClicked('${project.title.replace(/'/g, "\\'")}')">
        <div class="rec-card-content">
          <div class="rec-tags">
            ${project.tags.slice(0, 2).map(tag => `<span class="rec-tag">${tag}</span>`).join('')}
          </div>
          <h3>${project.title}</h3>
          <p>${project.description.substring(0, 80)}...</p>
          <div class="rec-footer">
            <span class="rec-rating"><i class="fas fa-star"></i> ${rating}</span>
            <a href="${project.links.live}" target="_blank" class="rec-link">Try It <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
        <div class="rec-glow"></div>
      </div>
    `;
  },
  
  clearHistory: function() {
      if(confirm("Reset your personalization history?")) {
        localStorage.removeItem(this.STORAGE_KEYS.HISTORY);
        this.renderWidget();
      }
  },
  
  updateWidget: function() {
      if (this.allProjects) {
          this.renderWidget();
      }
  }
};

// Expose globally
window.RecommendationEngine = RecommendationEngine;

// Helper global function for click handling from string HTML
window.projectCardClicked = function(title) {
    if (window.RecommendationEngine && window.RecommendationEngine.allProjects) {
        const project = window.RecommendationEngine.allProjects.find(p => p.title === title);
        if (project) {
            window.RecommendationEngine.trackInteraction(project);
        }
    }
};
