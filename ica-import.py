#!/usr/bin/env python3
"""
ICA Recipe Importer
Fetches a recipe from ica.se and converts it to markdown format for Jekyll.
Usage: python ica-import.py <ica-recipe-url>
"""

import sys
import re
import json
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from html.parser import HTMLParser
import unicodedata


class ICARecipeParser(HTMLParser):
    """Parser to extract recipe data from ICA recipe pages."""

    def __init__(self):
        super().__init__()
        self.recipe_data = {}
        self.in_script = False
        self.script_content = ""

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            attrs_dict = dict(attrs)
            if attrs_dict.get('type') == 'application/ld+json':
                self.in_script = True
                self.script_content = ""

    def handle_endtag(self, tag):
        if tag == 'script' and self.in_script:
            self.in_script = False
            try:
                data = json.loads(self.script_content)
                if isinstance(data, dict) and data.get('@type') == 'Recipe':
                    self.recipe_data = data
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get('@type') == 'Recipe':
                            self.recipe_data = item
                            break
            except json.JSONDecodeError:
                pass

    def handle_data(self, data):
        if self.in_script:
            self.script_content += data


def fetch_recipe(url):
    """Fetch the recipe page from ICA."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        req = Request(url, headers=headers)
        with urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        return html
    except (URLError, HTTPError) as e:
        print(f"Error fetching recipe: {e}")
        sys.exit(1)


def parse_recipe(html):
    """Parse recipe data from HTML."""
    parser = ICARecipeParser()
    parser.feed(html)
    return parser.recipe_data


def clean_text(text):
    """Clean and normalize text."""
    if not text:
        return ""
    # Normalize unicode characters
    text = unicodedata.normalize('NFKD', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def parse_duration(iso_duration):
    """Convert ISO 8601 duration to readable format."""
    if not iso_duration:
        return None

    # Parse PT format (e.g., PT30M, PT1H30M)
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?', iso_duration)
    if match:
        hours, minutes = match.groups()
        parts = []
        if hours:
            parts.append(f"{hours}h")
        if minutes:
            parts.append(f"{minutes} min")
        return " ".join(parts) if parts else None
    return None


def generate_slug(title):
    """Generate a URL-friendly slug from title."""
    # First normalize to NFC to ensure consistent character representation
    slug = unicodedata.normalize('NFC', title.lower())
    # Replace Swedish and other special characters
    replacements = {
        'å': 'a', 'ä': 'a', 'ö': 'o',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'à': 'a', 'á': 'a', 'â': 'a',
        'ü': 'u', 'ù': 'u', 'ú': 'u',
        'ï': 'i', 'í': 'i', 'ì': 'i',
        'ñ': 'n', 'ç': 'c'
    }
    for old_char, new_char in replacements.items():
        slug = slug.replace(old_char, new_char)
    # Replace any non-alphanumeric characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Remove leading/trailing hyphens and multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug


def infer_tags(recipe_data):
    """Infer tags from recipe data."""
    tags = []

    # Check recipe category
    category = recipe_data.get('recipeCategory', '').lower()
    if category:
        tags.append(category)

    # Check keywords
    keywords = recipe_data.get('keywords', '')
    if keywords:
        keyword_list = [k.strip().lower() for k in keywords.split(',')]
        tags.extend(keyword_list)

    # Dietary restrictions from name/description
    name_and_desc = (recipe_data.get('name', '') + ' ' +
                     recipe_data.get('description', '')).lower()

    if 'vegetarisk' in name_and_desc or 'vegetarian' in name_and_desc:
        tags.append('vegetarian')
    if 'vegan' in name_and_desc:
        tags.append('vegan')
    if 'kyckling' in name_and_desc:
        tags.append('chicken')
    if 'nöt' in name_and_desc or 'köttfärs' in name_and_desc:
        tags.append('beef')
    if 'fisk' in name_and_desc:
        tags.append('fish')

    # Meal times
    if any(word in name_and_desc for word in ['frukost', 'breakfast']):
        tags.append('breakfast')
    if any(word in name_and_desc for word in ['lunch']):
        tags.append('lunch')
    if any(word in name_and_desc for word in ['middag', 'dinner']):
        tags.append('dinner')
    if any(word in name_and_desc for word in ['dessert', 'efterrätt']):
        tags.append('dessert')

    # Remove duplicates and return
    return list(set(tags))


def convert_to_markdown(recipe_data):
    """Convert recipe data to markdown format."""
    if not recipe_data:
        print("Error: No recipe data found in the page")
        sys.exit(1)

    # Extract basic info
    title = clean_text(recipe_data.get('name', 'Untitled Recipe'))
    description = clean_text(recipe_data.get('description', ''))

    # Parse times
    prep_time = parse_duration(recipe_data.get('prepTime'))
    cook_time = parse_duration(recipe_data.get('cookTime'))
    total_time = parse_duration(recipe_data.get('totalTime'))

    # Servings
    servings = recipe_data.get('recipeYield', '')
    if isinstance(servings, list):
        servings = servings[0] if servings else ''
    servings = clean_text(str(servings))

    # Infer tags
    tags = infer_tags(recipe_data)

    # Build frontmatter
    frontmatter = "---\n"
    frontmatter += f"title: {title}\n"
    if description:
        frontmatter += f"description: {description}\n"
    if prep_time:
        frontmatter += f"prep_time: {prep_time}\n"
    if cook_time:
        frontmatter += f"cook_time: {cook_time}\n"
    if servings:
        frontmatter += f"servings: {servings}\n"
    frontmatter += f"difficulty: Medium\n"
    if tags:
        tags_str = "[" + ", ".join(tags) + "]"
        frontmatter += f"tags: {tags_str}\n"
    frontmatter += "source: ICA\n"
    frontmatter += "---\n\n"

    # Build ingredients section
    markdown = "## Ingredienser\n\n"
    ingredients = recipe_data.get('recipeIngredient', [])
    if isinstance(ingredients, list):
        for ingredient in ingredients:
            ingredient = clean_text(ingredient)
            if ingredient:
                markdown += f"- {ingredient}\n"
    markdown += "\n"

    # Build instructions section
    markdown += "## Instruktioner\n\n"
    instructions = recipe_data.get('recipeInstructions', [])

    if isinstance(instructions, list):
        step_num = 1
        for instruction in instructions:
            if isinstance(instruction, dict):
                text = instruction.get('text', '')
            else:
                text = instruction

            text = clean_text(text)
            if text:
                markdown += f"{step_num}. {text}\n\n"
                step_num += 1
    elif isinstance(instructions, str):
        # Sometimes it's just a string
        for line in instructions.split('\n'):
            line = clean_text(line)
            if line:
                markdown += f"- {line}\n"
        markdown += "\n"

    return frontmatter + markdown, generate_slug(title)


def save_recipe(markdown, slug):
    """Save the markdown file to _recipes folder."""
    filename = f"_recipes/{slug}.md"

    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(markdown)
        print(f"Recipe saved to: {filename}")
        return filename
    except IOError as e:
        print(f"Error saving file: {e}")
        sys.exit(1)


def main():
    """Main function."""
    if len(sys.argv) != 2:
        print("Usage: python ica-import.py <ica-recipe-url>")
        print("Example: python ica-import.py https://www.ica.se/recept/spaghetti-och-kottfarssas-712805/")
        sys.exit(1)

    url = sys.argv[1]

    if 'ica.se/recept/' not in url:
        print("Error: Please provide a valid ICA recipe URL")
        sys.exit(1)

    print(f"Fetching recipe from: {url}")
    html = fetch_recipe(url)

    print("Parsing recipe data...")
    recipe_data = parse_recipe(html)

    print("Converting to markdown...")
    markdown, slug = convert_to_markdown(recipe_data)

    filename = save_recipe(markdown, slug)

    print("\nRecipe imported successfully!")
    print(f"Title: {recipe_data.get('name', 'Unknown')}")
    print(f"File: {filename}")
    print("\nYou can now edit the file to adjust tags, difficulty, or other metadata.")


if __name__ == '__main__':
    main()
