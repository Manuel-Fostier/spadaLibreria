# UI Design Spec Compliance Check

## Spec Requirements (from Session 2025-01-29 Clarifications)

| Requirement | Status | UI_DESIGN.md Coverage | Notes |
|---|---|---|---|
| **Text Display Style**: No background, no border, no highlight on hover | ✅ | Page 6: "NO background, NO border, NO highlight on hover" + Styling section covers this | Fully reflected |
| **Sticky Header 2-line**: Line 1 = Category, Line 2 = Type | ✅ | Page 1 (layout) + Styling section | Clearly specified |
| **Don't repeat category/type below term** | ✅ | Page 1 layout shows only term name | Implied visually, should add explicit note |
| **Don't display English translation next to term** | ⚠️ | **MISSING** - Not mentioned in UI_DESIGN.md | Need to add: "Term display shows Italian name only, no English translation shown" |
| **Display format**: Term Name (Italian) → French definition only | ⚠️ | Page 1 shows this but **not clearly documented** in styling section | Need explicit bullet point in Term Entry styling |
| **Page Title**: "SPADA LIBRERIA, platform v1.0" | ✅ | Page 1 layout + Component hierarchy | Clearly shown in both top bar sections |
| **Matches BolognesePlatform header style** | ✅ | Component hierarchy specifies Tailwind classes | Matched |
| **Reuse GlossarySearchBar** | ✅ | Component hierarchy + Search Bar styling section | Explicitly mentioned |
| **Create StickyHeader component** | ✅ | Component hierarchy + Sticky Header styling | Component name specified |
| **Reuse Typography/prose classes** | ✅ | Text Styling Consistency section | Mentioned but could be more specific |

## Gaps to Fix

1. **MISSING**: Explicit line stating "English translation NOT shown next to term name"
2. **MISSING**: Clarification that only **French definition is displayed** (not Italian, not English)
3. **UNCLEAR**: Term display format needs explicit description in Term Entry styling
4. **ADD**: Reference to what "Term Name (Italian)" means - showing the Italian term is the display label

## Recommendation

Add a new subsection under "Term Entry" titled "Term Display Content" that explicitly states what content is and is NOT displayed.

