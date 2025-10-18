document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll(".recipe-checkbox");
  const toggleBtn = document.getElementById("shopping-list-toggle");
  const panel = document.getElementById("shopping-list-panel");
  const closeBtn = document.getElementById("close-shopping-list");
  const clearBtn = document.getElementById("clear-shopping-list");
  const printBtn = document.getElementById("print-shopping-list");
  const aiSummarizeBtn = document.getElementById("ai-summarize");
  const countSpan = document.getElementById("shopping-count");
  const selectedRecipesDiv = document.getElementById("selected-recipes");
  const ingredientsListDiv = document.getElementById("ingredients-list");
  const emptyMessage = document.getElementById("empty-message");
  const aiSummaryDiv = document.getElementById("ai-summary");
  const aiSummaryContent = document.getElementById("ai-summary-content");

  let selectedRecipes = new Map();
  let currentCombinedIngredients = [];

  // Get ingredients from data attribute
  function getIngredients(card) {
    const ingredientsData = card.getAttribute("data-ingredients");
    if (!ingredientsData || ingredientsData === "null") {
      return [];
    }
    try {
      return JSON.parse(ingredientsData);
    } catch (e) {
      console.error("Error parsing ingredients:", e);
      return [];
    }
  }

  // Parse ingredient to extract quantity, unit, and name
  function parseIngredient(ingredient) {
    // Match patterns like "500 g nötfärs" or "2 msk olja" or "1 lök"
    // Units must be followed by space or end of string to avoid matching "g" in "gul"
    const match = ingredient.match(
      /^([\d,./½¼¾-]+)\s+(g|kg|ml|dl|cl|l|msk|tsk|st|krm|förpackning|burk|påse)\s+(.+)$/i
    );

    if (match) {
      let amount = match[1];
      // Convert fractions
      amount = amount
        .replace("½", "0.5")
        .replace("¼", "0.25")
        .replace("¾", "0.75");
      // Handle ranges like "2-3" - take the middle value
      if (amount.includes("-")) {
        const parts = amount.split("-").map((s) => s.trim());
        const [min, max] = parts.map(parseFloat);
        amount = ((min + max) / 2).toString();
      }

      return {
        amount: parseFloat(amount.replace(",", ".")),
        unit: match[2].toLowerCase(),
        name: match[3].trim().toLowerCase(),
      };
    }

    // Try to match just a number without unit (like "1 lök")
    const simpleMatch = ingredient.match(/^([\d,./½¼¾]+)\s+(.+)$/);
    if (simpleMatch) {
      let amount = simpleMatch[1];
      amount = amount
        .replace("½", "0.5")
        .replace("¼", "0.25")
        .replace("¾", "0.75");

      return {
        amount: parseFloat(amount.replace(",", ".")),
        unit: "st",
        name: simpleMatch[2].trim().toLowerCase(),
      };
    }

    // If no quantity found, return as-is
    return {
      amount: null,
      unit: null,
      name: ingredient.toLowerCase().trim(),
    };
  }

  // Combine ingredients with same name and unit
  function combineIngredients(allIngredients) {
    const combined = new Map();

    allIngredients.forEach((ingredient) => {
      const parsed = parseIngredient(ingredient);
      const key = `${parsed.name}|${parsed.unit || ""}`;

      if (combined.has(key)) {
        const existing = combined.get(key);
        if (parsed.amount !== null && existing.amount !== null) {
          existing.amount += parsed.amount;
        } else {
          // Can't combine, add as separate item
          combined.set(`${key}|${Math.random()}`, parsed);
        }
      } else {
        combined.set(key, parsed);
      }
    });

    // Convert back to display format
    return Array.from(combined.values()).map((item) => {
      if (item.amount !== null) {
        // Round to reasonable precision
        const roundedAmount = Math.round(item.amount * 10) / 10;
        return `${roundedAmount} ${item.unit} ${item.name}`.trim();
      } else {
        return item.name;
      }
    });
  }

  // Update shopping list display
  function updateShoppingList() {
    const count = selectedRecipes.size;
    countSpan.textContent = count;

    if (count === 0) {
      emptyMessage.style.display = "block";
      selectedRecipesDiv.innerHTML = "";
      ingredientsListDiv.innerHTML = "";
      return;
    }

    emptyMessage.style.display = "none";

    // Display selected recipes
    let recipesHTML = '<h3>Valda recept:</h3><ul class="recipe-list">';
    selectedRecipes.forEach((ingredients, title) => {
      recipesHTML += `<li>${title}</li>`;
    });
    recipesHTML += "</ul>";
    selectedRecipesDiv.innerHTML = recipesHTML;

    // Combine all ingredients
    const allIngredients = [];
    selectedRecipes.forEach((ingredients) => {
      allIngredients.push(...ingredients);
    });

    // Combine ingredients with same name
    const combinedIngredients = combineIngredients(allIngredients);
    currentCombinedIngredients = combinedIngredients;

    // Display ingredients with checkboxes (all checked by default)
    let ingredientsHTML = '<h3>Ingredienser:</h3><ul class="ingredient-list">';
    combinedIngredients.forEach((ingredient, index) => {
      ingredientsHTML += `<li><label><input type="checkbox" class="ingredient-check" data-ingredient="${ingredient}" checked> ${ingredient}</label></li>`;
    });
    ingredientsHTML += "</ul>";
    ingredientsListDiv.innerHTML = ingredientsHTML;

    // Hide AI summary when list changes
    aiSummaryDiv.style.display = "none";
  }

  // Handle checkbox change
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function (e) {
      e.stopPropagation();
      const card = this.closest(".recipe-card");
      const title = card.getAttribute("data-recipe-title");

      if (this.checked) {
        const ingredients = getIngredients(card);
        selectedRecipes.set(title, ingredients);
      } else {
        selectedRecipes.delete(title);
      }

      updateShoppingList();
    });
  });

  // Toggle panel
  toggleBtn.addEventListener("click", function () {
    panel.classList.toggle("open");
  });

  closeBtn.addEventListener("click", function () {
    panel.classList.remove("open");
  });

  // Clear all
  clearBtn.addEventListener("click", function () {
    checkboxes.forEach((cb) => (cb.checked = false));
    selectedRecipes.clear();
    updateShoppingList();
  });

  // Get only checked ingredients
  function getCheckedIngredients() {
    const checkedBoxes = document.querySelectorAll(".ingredient-check:checked");
    return Array.from(checkedBoxes).map((cb) =>
      cb.getAttribute("data-ingredient")
    );
  }

  // Print shopping list
  printBtn.addEventListener("click", function () {
    const printWindow = window.open("", "_blank");
    const recipesListHTML = Array.from(selectedRecipes.keys())
      .map((title) => `<li>${title}</li>`)
      .join("");
    const checkedIngredients = getCheckedIngredients();
    const ingredientsHTML = checkedIngredients
      .map((ing) => `<li>${ing}</li>`)
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inköpslista</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2c3e50; }
          h2 { color: #3498db; margin-top: 20px; }
          ul { line-height: 1.8; }
          li { margin-bottom: 5px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>🛒 Inköpslista</h1>
        <h2>Recept:</h2>
        <ul>${recipesListHTML}</ul>
        <h2>Ingredienser:</h2>
        <ul>${ingredientsHTML}</ul>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  });

  // AI Summarize shopping list
  aiSummarizeBtn.addEventListener("click", async function () {
    const checkedIngredients = getCheckedIngredients();

    if (checkedIngredients.length === 0) {
      alert("Lägg till recept och välj ingredienser först!");
      return;
    }

    // Show message about copying to Claude
    const ingredientsList = checkedIngredients
      .map((ing, i) => `${i + 1}. ${ing}`)
      .join("\n");

    const promptText = `Här är en inköpslista från flera recept. Kan du optimera den genom att:
1. Kombinera liknande ingredienser (t.ex. "1 msk salt" + "1 tsk salt" = praktisk mängd)
2. Konvertera till praktiska mängder för inköp
3. Gruppera ingredienser logiskt (mejeri, kött, grönsaker, torrvaror, kryddor)
4. Ta bort dubbletter
5. Skriv på svenska

När du är klar:
➡️ Lägg till en “ICA-baserad lista” som ett kodblock sist i svaret, där du listar alla ingredienser en per rad, utan mängdangivelser, bara som rena produktnamn — t.ex.
mjölk  
vetemjöl  
nötfärs  
gul lök

Ingredienser:
${ingredientsList}`;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(promptText);

      aiSummaryContent.innerHTML = `
        <div class="clipboard-success">
          <p><strong>✅ Kopierat till urklipp!</strong></p>
          <p>Gå till <a href="https://claude.ai" target="_blank">claude.ai</a> och klistra in texten för att få en optimerad inköpslista.</p>
          <details style="margin-top: 1rem;">
            <summary style="cursor: pointer; color: var(--color-accent);">Visa kopierad text</summary>
            <pre style="margin-top: 0.5rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; font-size: 0.85rem; overflow-x: auto;">${promptText}</pre>
          </details>
        </div>
      `;
      aiSummaryDiv.style.display = "block";
    } catch (err) {
      // Fallback if clipboard doesn't work
      aiSummaryContent.innerHTML = `
        <div class="clipboard-fallback">
          <p><strong>Kopiera denna text och klistra in på claude.ai:</strong></p>
          <textarea readonly style="width: 100%; min-height: 200px; margin-top: 0.5rem; padding: 0.5rem; font-family: monospace; font-size: 0.85rem;">${promptText}</textarea>
          <p style="margin-top: 1rem;">Gå till <a href="https://claude.ai" target="_blank">claude.ai</a> för att optimera listan.</p>
        </div>
      `;
      aiSummaryDiv.style.display = "block";
    }
  });

  // Close panel when clicking outside
  panel.addEventListener("click", function (e) {
    if (e.target === panel) {
      panel.classList.remove("open");
    }
  });
});
