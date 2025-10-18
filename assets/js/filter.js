document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const recipeCards = document.querySelectorAll('.recipe-card');
  const noResults = document.getElementById('no-results');
  const recipesGrid = document.getElementById('recipes-grid');

  // Get current tags from URL parameter (returns array)
  function getTagsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const tagParam = params.get('tag');
    if (!tagParam || tagParam === 'all') {
      return [];
    }
    return tagParam.split(',').filter(t => t.trim());
  }

  // Update URL with tag parameter
  function updateUrl(tags) {
    const url = new URL(window.location);
    if (tags.length === 0) {
      url.searchParams.delete('tag');
    } else {
      url.searchParams.set('tag', tags.join(','));
    }
    window.history.pushState({}, '', url);
  }

  // Filter recipes by tags (must match ALL tags)
  function filterRecipes(activeTags) {
    let visibleCount = 0;

    recipeCards.forEach(card => {
      const cardTags = card.getAttribute('data-tags').split(',').map(t => t.trim());

      // Show if no filters active OR card has ALL active tags
      const shouldShow = activeTags.length === 0 ||
                        activeTags.every(tag => cardTags.includes(tag));

      if (shouldShow) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide no results message
    if (visibleCount === 0) {
      recipesGrid.style.display = 'none';
      noResults.style.display = 'block';
    } else {
      recipesGrid.style.display = 'grid';
      noResults.style.display = 'none';
    }
  }

  // Update active button state
  function updateActiveButtons(activeTags) {
    filterButtons.forEach(btn => {
      const btnTag = btn.getAttribute('data-filter');

      if (btnTag === 'all') {
        // "All" button is active when no tags selected
        if (activeTags.length === 0) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      } else {
        // Other buttons are active if their tag is in the active tags list
        if (activeTags.includes(btnTag)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  // Handle filter button clicks
  filterButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const clickedTag = this.getAttribute('data-filter');
      let currentTags = getTagsFromUrl();

      if (clickedTag === 'all') {
        // Clear all filters
        currentTags = [];
      } else {
        // Toggle the clicked tag
        const tagIndex = currentTags.indexOf(clickedTag);
        if (tagIndex > -1) {
          // Remove tag if already active
          currentTags.splice(tagIndex, 1);
        } else {
          // Add tag if not active
          currentTags.push(clickedTag);
        }
      }

      updateUrl(currentTags);
      updateActiveButtons(currentTags);
      filterRecipes(currentTags);
    });
  });

  // Apply filter on page load based on URL
  const initialTags = getTagsFromUrl();
  updateActiveButtons(initialTags);
  filterRecipes(initialTags);

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function() {
    const tags = getTagsFromUrl();
    updateActiveButtons(tags);
    filterRecipes(tags);
  });
});
