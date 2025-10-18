# Tag Normalization Plan

## Current Issues
- Duplicate meanings: "vardagsmat" vs "vardag"
- Redundant: "middag" and "huvudrätt"
- Too specific: "bacon", "nötfärs", "ris", "curry" as tags
- Recipe names as tags: "lasagne", "köttfärssås"

## Recommended Tag Structure

### 1. Meal Type (Måltid)
- `frukost`
- `lunch`
- `middag`
- `efterrätt`
- `fika`

### 2. Main Protein (Protein)
- `kyckling`
- `nötfärs`
- `fläsk`
- `fisk`
- `skaldjur`
- `vegetarisk`

### 3. Cuisine (Kök)
- `svenskt`
- `italienskt`
- `mexikanskt`
- `asiatiskt`
- `amerikanskt`

### 4. Cooking Method (Metod)
- `gratäng`
- `friterat`
- `ugnsrätt`
- `gryta`
- `stekpanna`
- `rått` (salads, etc)

### 5. Characteristics (Egenskaper)
- `snabbt` (under 30 min)
- `enkelt`
- `barnvänligt`
- `lyxigt`
- `vardagsmat`

### 6. Base/Starch (Bas)
- `pasta`
- `ris`
- `potatis`
- `bröd`

## Proposed Changes

### pannkakor.md
**Current**: `[vegetarisk, frukost, lunch, klassiker]`
**Suggested**: `[frukost, lunch, vegetarisk, enkelt]`

### kyckling-curry.md
**Current**: `[kyckling, middag, curry, snabbt]`
**Suggested**: `[middag, kyckling, asiatiskt, snabbt, gryta]`

### kottfarsgratang.md
**Current**: `[vardagsmat, gratäng, nötfärs]`
**Suggested**: `[middag, nötfärs, gratäng, vardagsmat]`

### gratinerade-burritos.md
**Current**: `[middag, mexikanskt, gratäng]`
**Suggested**: `[middag, nötfärs, mexikanskt, gratäng]`

### spagetti-och-kottfarssas-lyx.md
**Current**: `[vardag, pasta]`
**Suggested**: `[middag, nötfärs, pasta, italienskt, vardagsmat]`

### kyckling-och-bacongratang-pa-risbadd.md
**Current**: `[kyckling, huvudrätt, gratäng, ris, bacon]`
**Suggested**: `[middag, kyckling, gratäng, ris]`

### lasagne-av-markus-aujalay.md
**Current**: `[lasagne, pasta, huvudrätt, italienskt]`
**Suggested**: `[middag, nötfärs, pasta, gratäng, italienskt]`

### kottfarssas-markus-aujalay-800g.md
**Current**: `[köttfärssås, pasta, italienskt, middag]`
**Suggested**: `[nötfärs, pasta, italienskt, gryta]` (it's a sauce/base)

### chicken-nuggets-med-chilimayo.md
**Current**: `[kyckling, middag, barnvänligt, friterat, sås]`
**Suggested**: `[middag, kyckling, friterat, barnvänligt, snabbt]`

### kyckling-a-la-creme.md (guessing from grep)
**Current**: `[kyckling, pasta, middag, snabbt]`
**Suggested**: `[middag, kyckling, pasta, krämigt, snabbt]`

### kyckling-och-kycklinggratang-pa-pasta.md (guessing)
**Current**: `[kyckling, middag, ugn, krämigt, pasta]`
**Suggested**: `[middag, kyckling, pasta, gratäng, krämigt]`

### flygande-jakob.md (guessing)
**Current**: `[kyckling, middag, husman, enkelt]`
**Suggested**: `[middag, kyckling, ris, svenskt, gratäng, barnvänligt]`

## Rules for Tags

1. **Max 5-6 tags per recipe**
2. **Always include meal type first** (frukost/lunch/middag/etc)
3. **Always include protein second** (kyckling/nötfärs/vegetarisk/etc)
4. **Order**: Meal Type → Protein → Cuisine → Base → Method → Characteristics
5. **Remove**: Recipe names, specific ingredients, duplicate meanings
6. **Keep it searchable**: Think about how users will filter

## Implementation

Run this to see all recipes that need updating:
```bash
find _recipes -name "*.md" -type f
```

Would you like me to create a script to automatically update all the tags?
