document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const recipeCards = document.querySelectorAll('.recipe-card');
  const noResults = document.getElementById('no-results');
  const recipesGrid = document.getElementById('recipes-grid');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active button state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const filterValue = this.getAttribute('data-filter');
      let visibleCount = 0;

      // Filter recipes
      recipeCards.forEach(card => {
        const cardTags = card.getAttribute('data-tags').split(',');

        if (filterValue === 'all' || cardTags.includes(filterValue)) {
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
    });
  });
});
