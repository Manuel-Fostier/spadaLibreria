# ImportDialog Mockup

**Spec Reference**: FR-022 (Import file conflict handling)  
**User Story**: Phase 7 (Polish & Cross-Cutting Concerns)  
**Task**: T006, T056 (implementation)  
**File**: `scripts/extract-book.py` (Python script) + Optional UI component

## Overview

The ImportDialog handles file conflicts when the import script (`extract-book.py`) would overwrite existing files. It provides three options: Replace, Rename, or Cancel.

## Dialog UI

### Main Import Conflict Dialog

```
╔════════════════════════════════════════════════════╗
║ ⚠️  File Already Exists                            ║
╟────────────────────────────────────────────────────╢
║                                                    ║
║ The file already exists:                           ║
║                                                    ║
║ 📄 data/treatises/marozzo_opera_nova.yaml        ║
║                                                    ║
║ What would you like to do?                        ║
║                                                    ║
║ [🔄 Replace]  ← Overwrite with new file          ║
║                 (original backed up as .bak)      ║
║                                                    ║
║ [📋 Rename]   ← Save with new name               ║
║                 marozzo_opera_nova_1.yaml         ║
║                                                    ║
║ [❌ Cancel]   ← Stop import, don't save           ║
║                                                    ║
╟────────────────────────────────────────────────────╢
║ ☐ Ask again for future conflicts                 ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

## Dialog Options Explained

### Option 1: Replace

```
User clicks [🔄 Replace]
  ↓
Script creates backup:
  data/treatises/marozzo_opera_nova.yaml
    → data/treatises/marozzo_opera_nova.yaml.bak
  ↓
New file written:
  data/treatises/marozzo_opera_nova.yaml (new content)
  ↓
User sees confirmation:
  ✓ File replaced successfully
    Backup saved: marozzo_opera_nova.yaml.bak
    
This is useful when:
- Updating the same treatise with corrections
- Re-extracting better quality data
- User explicitly wants to overwrite
```

---

### Option 2: Rename

```
User clicks [📋 Rename]
  ↓
Script checks for conflicts:
  marozzo_opera_nova.yaml - EXISTS
  marozzo_opera_nova_1.yaml - CHECK
  marozzo_opera_nova_2.yaml - CHECK
  marozzo_opera_nova_3.yaml - AVAILABLE ✓
  ↓
New file written:
  data/treatises/marozzo_opera_nova_3.yaml (new content)
  ↓
User sees confirmation:
  ✓ File saved as: marozzo_opera_nova_3.yaml
    Original file unchanged: marozzo_opera_nova.yaml
    
This is useful when:
- Adding a new version/variant of the same treatise
- Comparing different extractions
- Keeping multiple versions for research
```

---

### Option 3: Cancel

```
User clicks [❌ Cancel]
  ↓
Import stops
  ↓
No files written
  No backups created
  ↓
User sees message:
  ⚠️ Import cancelled - no files were changed
  
This is useful when:
- User selected wrong file by mistake
- Need to review something first
- Want to handle backup manually
```

---

## Implementation Context

### In Command Line (Python Script)

```bash
$ uv run extract-book --author marozzo --pages "34-102"

Extracting Marozzo Opera Nova, pages 34-102...
Building search index... [████████████────────] 60%
Saving output to: data/treatises/marozzo_opera_nova.yaml

⚠️ File conflict detected!

File exists: data/treatises/marozzo_opera_nova.yaml

Options:
  1. Replace (backup current file as .bak)
  2. Rename (save as marozzo_opera_nova_1.yaml)
  3. Cancel (stop, don't save anything)

Enter choice (1-3): _
```

---

### In Web UI (Optional Future)

If the user eventually adds a web UI for imports:

```
┌──────────────────────────────────┐
│ 📤 Import Treatise Extract       │
├──────────────────────────────────┤
│                                  │
│ Select PDF file:                 │
│ [📁 Choose file...] marozzo.pdf │
│                                  │
│ Select pages:                    │
│ From page: [34_____]              │
│ To page:   [102____]              │
│                                  │
│ [Import] [Cancel]                │
│                                  │
└──────────────────────────────────┘

After clicking [Import], if file exists:

[Modal appears with conflict dialog shown above]

User makes choice → Script continues with selected option
```

---

## Backup File Naming

### Naming Convention

```
Original file:
  data/treatises/marozzo_opera_nova.yaml

When user clicks "Replace":
  Backup created:
  data/treatises/marozzo_opera_nova.yaml.bak

Multiple backups (if replacing multiple times):
  marozzo_opera_nova.yaml      (current file)
  marozzo_opera_nova.yaml.bak  (most recent backup)
  marozzo_opera_nova.yaml.bak.1 (older backups - optional)
  marozzo_opera_nova.yaml.bak.2
```

**Note**: Only one .bak file per original, or keep numbered backups for history.

---

## Technical Implementation

### Python Script (`scripts/extract-book.py`)

```python
import os
import shutil
from pathlib import Path
import sys

def handle_file_conflict(output_path: Path) -> str:
    """
    Handle file conflict when output file already exists.
    Returns: 'replace', 'rename', or 'cancel'
    """
    if not output_path.exists():
        return 'proceed'  # No conflict
    
    print(f"\n⚠️  File conflict detected!")
    print(f"The file already exists: {output_path}")
    print("\nWhat would you like to do?")
    print("1. Replace   - Overwrite (backup as .bak)")
    print("2. Rename    - Save with new name")
    print("3. Cancel    - Stop import")
    
    while True:
        choice = input("\nEnter choice (1-3): ").strip()
        if choice in ['1', '2', '3']:
            return ['replace', 'rename', 'cancel'][int(choice) - 1]
        print("Invalid choice. Enter 1, 2, or 3.")


def save_output(content: str, output_path: Path, conflict_action: str) -> Path:
    """
    Save extracted content to file, handling conflicts.
    Returns: Path to saved file
    """
    if conflict_action == 'replace':
        # Create backup
        backup_path = output_path.with_suffix(output_path.suffix + '.bak')
        shutil.copy2(output_path, backup_path)
        print(f"✓ Backup created: {backup_path}")
        
        # Write new file
        output_path.write_text(content, encoding='utf-8')
        print(f"✓ File replaced: {output_path}")
        return output_path
    
    elif conflict_action == 'rename':
        # Find available numbered filename
        stem = output_path.stem
        suffix = output_path.suffix
        parent = output_path.parent
        
        counter = 1
        while True:
            new_name = f"{stem}_{counter}{suffix}"
            new_path = parent / new_name
            if not new_path.exists():
                break
            counter += 1
        
        new_path.write_text(content, encoding='utf-8')
        print(f"✓ File saved as: {new_path}")
        return new_path
    
    elif conflict_action == 'cancel':
        print("⚠️  Import cancelled - no files were changed")
        sys.exit(0)


# Main extraction flow
def main(author: str, pages: tuple):
    output_path = Path(f"data/treatises/{author}_opera_nova.yaml")
    
    # Extract content
    content = extract_from_pdf(...)
    
    # Check for conflicts
    conflict_action = handle_file_conflict(output_path)
    
    # Save output
    final_path = save_output(content, output_path, conflict_action)
    
    print(f"\n✓ Import complete!")
    print(f"  Saved to: {final_path}")


if __name__ == '__main__':
    main(...)
```

---

## User Workflows

### Workflow 1: First Import (No Conflict)

```
$ uv run extract-book marozzo --pages "34-102"
  ↓
Extracting...
Processing pages 34-102... ✓
  ↓
Output path: data/treatises/marozzo_opera_nova.yaml
File doesn't exist yet
  ↓
✓ File saved successfully
  Import complete!
```

---

### Workflow 2: Update Existing (Choose Replace)

```
$ uv run extract-book marozzo --pages "34-102"
  ↓
Extracting with improvements...
Processing pages 34-102... ✓
  ↓
⚠️ File conflict: marozzo_opera_nova.yaml exists
Options: Replace / Rename / Cancel
  ↓
User enters: 1 (Replace)
  ↓
✓ Backup created: marozzo_opera_nova.yaml.bak
✓ File replaced with new content
  Import complete!
```

---

### Workflow 3: Add Variant (Choose Rename)

```
$ uv run extract-book marozzo --pages "1-33"  (different pages)
  ↓
Extracting earlier pages...
Processing pages 1-33... ✓
  ↓
⚠️ File conflict: marozzo_opera_nova.yaml exists
Options: Replace / Rename / Cancel
  ↓
User enters: 2 (Rename)
  ↓
✓ File saved as: marozzo_opera_nova_1.yaml
  (original file unchanged)
  Import complete!
```

---

## Error Handling

```python
# Handle various edge cases

# Case 1: No write permissions
try:
    output_path.write_text(content)
except PermissionError:
    print("❌ Error: No write permissions to directory")
    print(f"  Path: {output_path.parent}")
    sys.exit(1)

# Case 2: Disk full
except OSError as e:
    if e.errno == 28:  # No space left
        print("❌ Error: Disk full, cannot save file")
        sys.exit(1)

# Case 3: Invalid filename
if not is_valid_filename(output_path.name):
    print(f"❌ Error: Invalid filename: {output_path.name}")
    sys.exit(1)
```

---

## Batch Processing (Multiple Files)

If importing multiple treatises:

```bash
$ uv run extract-book --batch

Process marozzo.pdf? (y/n): y
  → data/treatises/marozzo_opera_nova.yaml
    [No conflict] ✓

Process manciolino.pdf? (y/n): y
  → data/treatises/manciolino_opera_nova.yaml
    ⚠️ File conflict!
    Options: (1) Replace (2) Rename (3) Cancel (4) Skip
    
    User enters: 2 (Rename for this one)
    → Saved as: manciolino_opera_nova_1.yaml ✓

Process duecci.pdf? (y/n): y
  → data/treatises/duecci_opera_nova.yaml
    [No conflict] ✓

Summary:
✓ Imported 3 files successfully
  - marozzo_opera_nova.yaml
  - manciolino_opera_nova_1.yaml
  - duecci_opera_nova.yaml
```

---

## Related Mockups

None - this is standalone import handling

---

## Success Criteria (from spec v2.0)

✅ **FR-022**: System handles import file conflicts by prompting user with Replace/Rename/Cancel options
✅ **Backup strategy**: Original file backed up with .bak extension when replacing
✅ **Clear confirmation**: User sees what action was taken
✅ **Data safety**: User has explicit control before overwriting
