import argparse
import sys
import re
from pathlib import Path
from ruamel.yaml import YAML
from ruamel.yaml.scalarstring import PreservedScalarString

def setup_yaml():
    """Configure YAML instance for round-trip preservation."""
    yaml = YAML()
    yaml.preserve_quotes = True
    yaml.default_flow_style = False
    # yaml.indent(mapping=2, sequence=2, offset=2) # Removed to match extract_book.py and default behavior
    yaml.width = 4096
    return yaml

def load_glossary(glossary_path):
    """
    Load glossary terms from YAML file.
    Returns a dictionary mapping terms to their keys.
    """
    yaml = setup_yaml()
    try:
        with open(glossary_path, 'r', encoding='utf-8') as f:
            data = yaml.load(f)
            return data
    except FileNotFoundError:
        print(f"Error: Glossary file not found at {glossary_path}")
        sys.exit(1)

class TextEnricher:
    def __init__(self, glossary_data):
        self.term_map = {}
        self.term_categories = {}
        self.term_display = {}

        for key, entry in glossary_data.items():
            term = entry.get('term', '').strip()
            term_type = entry.get('type', '')

            if term:
                self.term_map[term.lower()] = key
                self.term_display[key] = term
            
            # Categorize
            if 'Garde' in term_type:
                self.term_categories[key] = 'guard'
            elif any(x in term_type for x in ['Attaque', 'Frappe', 'Coup', 'Technique', 'Mouvement']):
                self.term_categories[key] = 'technique'
            else:
                self.term_categories[key] = None
        
        # Sort by length descending to handle substrings correctly
        self.sorted_terms = sorted(self.term_map.keys(), key=len, reverse=True)
        
        if self.sorted_terms:
            # Build regex pattern: \b(term1|term2|...)\b
            # Escape terms to handle special characters
            pattern_str = r'\b(' + '|'.join(re.escape(t) for t in self.sorted_terms) + r')\b'
            self.pattern = re.compile(pattern_str, re.IGNORECASE)
        else:
            self.pattern = None

    def get_category(self, key):
        return self.term_categories.get(key)
    
    def get_term(self, key):
        return self.term_display.get(key, key)

    def enrich(self, text):
        if not text or not self.pattern:
            return text
            
        # Split by existing tags to avoid double replacement
        parts = re.split(r'(\{.*?\})', text)
        
        enriched_parts = []
        for part in parts:
            if part.startswith('{') and part.endswith('}'):
                enriched_parts.append(part)
            else:
                enriched_parts.append(self._replace_terms(part))
                
        return ''.join(enriched_parts)

    def _replace_terms(self, text):
        def replace_func(match):
            matched_text = match.group(0)
            key = self.term_map.get(matched_text.lower())
            if key:
                return f'{{{key}}}'
            return matched_text

        return self.pattern.sub(replace_func, text)

def process_file(file_path, enricher):
    yaml = setup_yaml()
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.load(f)
    except Exception as e:
        print(f"Error loading YAML file: {e}")
        return

    if not isinstance(data, list):
        print("Error: YAML root is not a list of sections.")
        return

    modified_count = 0
    enriched_count = 0

    for section in data:
        section_id = section.get('id', 'unknown')
        
        # 1. Inject Annotation if missing
        if 'annotation' not in section:
            annotation_id = f"{section_id}_ann"
            section['annotation'] = {
                'id': annotation_id,
                'note': None,
                'weapons': [],
                'weapon_type': None,
                'guards_mentioned': [],
                'techniques': [],
                'measures': [],
                'strategy': []
            }
            modified_count += 1

        # 2. Enrich Content
        content = section.get('content', {})
        found_keys = set()
        
        # Helper to enrich and preserve block style
        def enrich_field(obj, key):
            if key in obj and isinstance(obj[key], str):
                original = obj[key]
                enriched = enricher.enrich(original)
                
                # Extract keys from enriched text
                keys = re.findall(r'\{([^}]+)\}', enriched)
                for k in keys:
                    if enricher.get_category(k) is not None:
                        found_keys.add(k)

                if enriched != original:
                    # Use PreservedScalarString to keep | style if it was multiline or just to be safe
                    # Check if original was multiline or if we want to force it?
                    # The Constitution says "literal blocks ... preserved".
                    # If we change the string, we must ensure it stays a literal block if it should be.
                    # Usually treatise content is multiline.
                    obj[key] = PreservedScalarString(enriched)
                    return True
            return False

        if enrich_field(content, 'it'): enriched_count += 1
        if enrich_field(content, 'fr'): enriched_count += 1
        
        if 'en_versions' in content and isinstance(content['en_versions'], list):
            for version in content['en_versions']:
                if enrich_field(version, 'text'): enriched_count += 1

        # Populate annotation fields based on found keys
        if 'annotation' in section:
            guards = []
            techniques = []
            
            for key in found_keys:
                cat = enricher.get_category(key)
                if cat == 'guard':
                    guards.append(enricher.get_term(key))
                elif cat == 'technique':
                    techniques.append(enricher.get_term(key))
            
            guards.sort()
            techniques.sort()
            
            section['annotation']['guards_mentioned'] = guards
            section['annotation']['techniques'] = techniques

    # Save back
    with open(file_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f)
    
    print(f"Completed. Added annotations to {modified_count} sections. Enriched {enriched_count} text fields.")

def main():
    parser = argparse.ArgumentParser(
        description="Add annotation fields and enrich text with glossary links in treatise YAML files."
    )
    parser.add_argument(
        "input_file",
        type=str,
        help="Path to the treatise YAML file to process."
    )
    parser.add_argument(
        "--glossary",
        type=str,
        default="data/glossary.yaml",
        help="Path to the glossary YAML file (default: data/glossary.yaml)."
    )

    args = parser.parse_args()
    
    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f"Error: Input file {input_path} not found.")
        sys.exit(1)

    print(f"Processing {input_path}...")
    
    # Load glossary
    glossary_data = load_glossary(args.glossary)
    print(f"Loaded {len(glossary_data)} terms from glossary.")
    
    enricher = TextEnricher(glossary_data)

    process_file(input_path, enricher)

if __name__ == "__main__":
    main()
