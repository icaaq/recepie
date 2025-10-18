# Receptsida

En minimalistisk receptwebbplats byggd med Jekyll och publicerad via GitHub Pages.

## Funktioner

- Ren design med fokus på typografi
- Receptkort i rutnätsvy
- Dynamisk taggbaserad filtrering
- Responsiv design
- Utskriftsvänliga receptsidor
- Markdown-baserade receptfiler

## Kom igång

### Förutsättningar

- Ruby (version 2.5 eller högre)
- Bundler

### Lokal utveckling

1. Installera beroenden:
   ```bash
   bundle install
   ```

2. Starta den lokala servern:
   ```bash
   bundle exec jekyll serve
   ```

3. Öppna din webbläsare på `http://localhost:4000`

## Lägg till nya recept

### Importera från ICA (Automatiskt)

Du kan automatiskt importera recept från ica.se med det medföljande skriptet:

```bash
./import-recipe https://www.ica.se/recept/RECEPT-URL/
```

Exempel:
```bash
./import-recipe https://www.ica.se/recept/spaghetti-och-kottfarssas-712805/
```

Eller använd Python-skriptet direkt:
```bash
python3 ica-import.py https://www.ica.se/recept/RECEPT-URL/
```

Skriptet kommer att:
- Hämta receptet från ICA
- Extrahera titel, beskrivning, ingredienser och instruktioner
- Auto-generera taggar baserat på receptets innehåll
- Spara det som en markdown-fil i `_recipes/`

Efter importen kan du redigera filen för att justera taggar, svårighetsgrad eller andra detaljer.

### Manuellt skapande

Skapa en ny `.md`-fil i mappen `_recipes` med följande frontmatter:

```yaml
---
title: Receptets titel
description: En kort beskrivning av receptet
prep_time: 15 min
cook_time: 30 min
servings: 4
difficulty: Lätt
tags: [vegetarisk, middag, snabbt]
---

## Ingredienser

- Ingrediens 1
- Ingrediens 2

## Instruktioner

1. Steg 1
2. Steg 2
```

### Tillgängliga taggar

Du kan använda vilka taggar du vill. Några exempel:

- **Maträtt**: kyckling, nötkött, fisk, vegetarisk, pasta, ris
- **Måltidstyp**: frukost, lunch, middag, mellanmål, dessert
- **Tillagningsmetod**: bakning, grillning, ugn, wok
- **Tillfälle**: vardag, fest, snabbt, lyxigt
- **Kök**: italienskt, mexikanskt, asiatiskt, svenskt

Filterknapparna uppdateras automatiskt baserat på alla taggar som används i dina recept.

## Publicera till GitHub Pages

1. Skapa ett nytt repository på GitHub

2. Initiera git och pusha din kod:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/DITT-ANVÄNDARNAMN/DITT-REPO.git
   git push -u origin main
   ```

3. Aktivera GitHub Pages:
   - Gå till ditt repositorys Settings
   - Navigera till "Pages" i vänstermenyn
   - Under "Build and deployment", välj "GitHub Actions" som källa
   - Arbetsflödet kommer automatiskt att köras och publicera din sida

4. Din sida kommer att finnas på: `https://DITT-ANVÄNDARNAMN.github.io/DITT-REPO/`

## Projektstruktur

```
.
├── _config.yml           # Jekyll-konfiguration
├── _recipes/             # Recept-markdown-filer
├── _layouts/             # Sidmallar
│   ├── default.html
│   └── recipe.html
├── _includes/            # Återanvändbara komponenter
│   └── recipe-card.html
├── assets/
│   ├── css/
│   │   └── main.css      # Stilar
│   └── js/
│       └── filter.js     # Taggfiltreringslogik
├── ica-import.py         # ICA-importskript
├── import-recipe         # Importkommando
└── index.html            # Startsida med receptrutnät
```

## Anpassning

### Färger

Redigera CSS-variablerna i [assets/css/main.css](assets/css/main.css):

```css
:root {
  --color-text: #2c3e50;
  --color-accent: #3498db;
  /* ... */
}
```

### Sidinformation

Redigera [_config.yml](_config.yml):

```yaml
title: Holkens Recept
description: En minimalistisk receptsamling
```

## Licens

Använd gärna denna mall för din egen receptsida!
