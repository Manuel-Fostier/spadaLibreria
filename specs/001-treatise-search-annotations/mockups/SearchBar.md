# SearchBar Component Mockup

**Spec Reference**: FR-002, FR-003, FR-003a (Classic Search Options)  
**User Story**: US1 - Cross-Treatise Search with Classic Options  
**Task**: T021 [US1]  
**File**: `src/components/SearchBar.tsx`

## Overview

The SearchBar component is the primary interface for searching treatises. It includes:
1. Text input field with placeholder
2. Toggle buttons for search options (Match Case, Match Whole Word, Regex)
3. Search execution button

## Wireframe ASCII

```
╔════════════════════════════════════════════════════════════════════════╗
║  ┌──────────────────────────────────────────────────────────────────┐  ║
║  │ 🔍 [Type search term...]                            Aa ab .*     │  ║
║  └──────────────────────────────────────────────────────────────────┘  ║
║                                                           --           ║
╚════════════════════════════════════════════════════════════════════════╝
```

## Component States

### 1. Empty Search (Initial State)

```
╔════════════════════════════════════════════════════════════════════════╗
║  [Type a word: e.g., "mandritto"]                    [Aa] [ab] [.*]    ║
║                                                            --          ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Behavior**:
- Placeholder text shows example search term
- Input field focused (cursor blinking)
- Options toggles are inactive (gray/outline)
- Clear button visible if input has text

---

### 2. User Typing with Options

```
╔════════════════════════════════════════════════════════════════════════╗
║  [Mandritto                                          [Aa] [ab] [.*]    ║
║                                                       ^    --          ║
║                                                     active             ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Behavior**:
- User types "Mandritto"
- User clicks "Aa" (Match Case) -> Button becomes active (highlighted/filled)
- Search is NOT executed automatically (wait for Enter or Search button)

---

### 3. Regex Search

```
╔════════════════════════════════════════════════════════════════════════╗
║  [mandr.*                                           [Aa] [ab] [.*]     ║
║                                                           --   ^       ║
║                                                              active    ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Behavior**:
- User types regex pattern "mandr.*"
- User activates ".*" (Regex) option
- System interprets input as regular expression

---

## Interaction Flow

### User Flow 1: Simple Search

```
1. User sees empty SearchBar
   ↓
2. Clicks input field (focus)
   ↓
3. Types "mandritto"
   ↓
4. Presses Enter
   ↓
5. SearchResults component displays results (T022)
```

### User Flow 2: Case Sensitive Search

```
1. Types "Mandritto"
   ↓
2. Clicks "Aa" toggle (Match Case)
   ↓
3. Presses Enter
   ↓
4. Search executes looking for exact case match
```

### User Flow 3: Keyboard Navigation

```
- Ctrl+F: Focus search bar
- Tab: Move between input and option toggles
- Space/Enter on toggle: Activate/Deactivate option
- Enter on input: Execute search
- Escape: Clear search / Blur input
```

---

## Technical Notes for Implementation

### Props

```typescript
interface SearchOptions {
  matchCase: boolean;
  matchWholeWord: boolean;
  useRegex: boolean;
}

interface SearchBarProps {
  onSearch: (query: string, options: SearchOptions) => void;
  placeholder?: string;
}
```

### State Management

- `query`: string (current input value)
- `options`: SearchOptions object
  - `matchCase`: boolean
  - `matchWholeWord`: boolean
  - `useRegex`: boolean

### Validation

- If `useRegex` is true, validate regex pattern before searching.
- If invalid regex, show error state (red border or tooltip).

---

## Design Specifications

### Colors & Styling

```css
/* Input field */
border: 2px solid #d1d5db;
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
width: 100%;

/* Option Toggles */
button.toggle {
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 4px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

button.toggle.active {
  background: #e0e7ff;  /* Light indigo */
  color: #3730a3;       /* Dark indigo */
  border-color: #3730a3;
}

/* Icons */
/* Use standard icons or text labels: "Aa", "|ab|", ".*" */
```

### Accessibility

- `aria-label` for each toggle button ("Match Case", "Match Whole Word", "Use Regular Expression")
- `aria-pressed` state for toggles
- Keyboard focus indicators

---

## Success Criteria (from spec.md)

✅ **SC-002**: Search respects "Match Case", "Match Whole Word", and "Regular Expression" settings correctly
- Verified: Toggles update state and pass correct options to search function

✅ **FR-002, FR-003, FR-003a**: System MUST provide options for Case, Whole Word, and Regex
- Verified: UI elements present and functional

✅ **FR-004a**: When user enters search term(s) and executes search, SearchBar triggers an update
- Verified: `onSearch` callback triggered on Enter

---

## Related Mockups

- SearchResults.md (T022) - Integrated into BolognesePlatform display
