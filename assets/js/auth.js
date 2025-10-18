// Simple password protection for the recipe site
// Note: This is NOT cryptographically secure, just a basic barrier

(function() {
  'use strict';

  // Set your password here (change this!)
  const PASSWORD = 'holken';

  // Check if user is already authenticated
  function isAuthenticated() {
    return sessionStorage.getItem('recipeAuth') === 'true';
  }

  // Set authentication
  function setAuthenticated() {
    sessionStorage.setItem('recipeAuth', 'true');
  }

  // Show password prompt
  function showPasswordPrompt() {
    const overlay = document.getElementById('password-overlay');
    const form = document.getElementById('password-form');
    const input = document.getElementById('password-input');
    const error = document.getElementById('password-error');

    overlay.style.display = 'flex';
    input.focus();

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const enteredPassword = input.value;

      if (enteredPassword === PASSWORD) {
        setAuthenticated();
        overlay.style.display = 'none';
        error.style.display = 'none';
      } else {
        error.style.display = 'block';
        input.value = '';
        input.focus();
      }
    });
  }

  // Initialize
  if (!isAuthenticated()) {
    showPasswordPrompt();
  }
})();
