#!/usr/bin/env python3
"""
Script to refactor glossary.yaml by adding a 'category' field to each term entry.
This makes categories part of the data structure rather than just comments.
"""

import re
from pathlib import Path
import sys


def refactor_glossary(input_file: Path, output_file: Path):
    """Add category field to each glossary entry."""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    output_lines = []
    current_category = None
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Detect category header (lines starting with "# " that are not comment boxes)
        if line.strip().startswith('# ') and not line.strip().startswith('###'):
            current_category = line.strip()[2:].strip()  # Remove "# " prefix
            output_lines.append(line)
            i += 1
        
        # Detect a term entry (key followed by colon at start of line, lowercase with underscores)
        elif re.match(r'^[a-z_]+:', line):
            # Add the term key line
            output_lines.append(line)
            i += 1
            
            if current_category and i < len(lines):
                # Check the next line - if it's the 'term:' field, add category after it
                next_line = lines[i]
                if re.match(r'\s+term:', next_line):
                    output_lines.append(next_line)
                    output_lines.append(f'  category: {current_category}\n')
                    i += 1
                else:
                    # Add category as first field
                    output_lines.append(f'  category: {current_category}\n')
        else:
            output_lines.append(line)
            i += 1
    
    # Write the refactored content
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)
    
    print(f"✓ Refactored glossary written to {output_file}")
    print(f"  Added 'category' field based on section headers")


if __name__ == "__main__":
    # Default paths
    input_path = Path(__file__).parent.parent / "spadalibreria" / "data" / "glossary.yaml"
    output_path = Path(__file__).parent.parent / "spadalibreria" / "data" / "glossary_refactored.yaml"
    
    if len(sys.argv) > 1:
        input_path = Path(sys.argv[1])
    if len(sys.argv) > 2:
        output_path = Path(sys.argv[2])
    
    print(f"Refactoring glossary...")
    print(f"  Input:  {input_path}")
    print(f"  Output: {output_path}")
    
    refactor_glossary(input_path, output_path)
