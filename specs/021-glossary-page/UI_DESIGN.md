# Glossary Page - UI Design Specification

## Page Layout (Matching BolognesePlatform Structure)

```
┌─────────────────────────────────────────────────────────────────────────┐
| SPADA LIBRERIA     |                |                                   |
| platform v1.0      |  GLOSSAIRE     |  ← (Back / Platform Navigation)   | (Top Bar ~60px)
├─────────────────────────────────────────────────────────────────────────┤
│  [Search Bar with clear button]                                         │ (Search Bar ~50px)
├─────────────────────────────────────────────────────────────────────────┤
│ Les Guardes                                                             │ (Sticky Header - Line 1)
│ Garde haute                                                             │ (Sticky Header - Line 2)
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Guardia di Testa                                                        │ (Term Name )
│                                                                         │
│ Anonimo : Il y a une garde qui plus que les autres protège la tête ;   │ (French Definition)
│ de là vient le nom de guardia di testa, et vous pouvez faire cette     │
│ garde en ayant le pied droit ou gauche en avant...                      │
│                                                                         │ (NO background, NO border,
│ ─────────────────────────────────────────────────────────────────────── │  NO highlight on hover)
│                                                                         │
│ Guardia di Faccia                                                       │
│                                                                         │
│ Anonimo : Se placer en guardia di faccia sera similaire à la guardia   │
│ di lioncorno, en ce sens que l'un ou l'autre des pieds peut mener...   │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ [Scroll to next section...]                                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ Coups et Techniques                                                     │ (Sticky Header - Line 1)
│ Attaque / Frappe de taille                                              │ (Sticky Header - Line 2)
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Mandritto                                                               │
│                                                                         │
│ Coup porté de la droite vers la gauche. Il part de l'épaule droite      │
│ de l'escrimeur.                                                         │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ [More terms...]                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy (Matching BolognesePlatform Architecture)

```
<main className="flex-1 flex flex-col h-screen bg-white">
  
  {/* Top Bar: Navigation + Title */}
  <header className="h-20 bg-white flex items-center px-8 justify-start gap-8 border-b border-gray-100">
    
    {/* Left Section: Logo + Subtitle */}
    <div className="flex flex-col justify-center">
      <h1 className="text-sm font-bold tracking-tight">SPADA LIBRERIA</h1>
      <p className="text-xs text-gray-600">platform v1.0</p>
    </div>
    
    {/* Center Section: Page Title */}
    <div className="flex-1 text-center">
      <h2 className="text-lg font-semibold">GLOSSAIRE</h2>
    </div>
    
    {/* Right Section: Navigation */}
    <div className="flex items-center gap-4">
      <button className="text-gray-600 hover:text-gray-900">← Back</button>
    </div>
    
  </header>
  
  {/* Search Bar Section */}
  <div className="px-8 py-3 bg-white border-b border-gray-100">
    <GlossarySearchBar />
  </div>
  
  {/* Sticky Category/Type Header */}
  <StickyHeader 
    category={currentCategory}
    type={currentType}
  />
  
  {/* Scrollable Content Area */}
  <div className="flex-1 overflow-y-auto bg-white">
    <div className="max-w-full mx-auto p-8 lg:p-12 space-y-8">
      
      {/* Map through grouped categories */}
      {Object.entries(groupedTerms).map(([category, typeGroup]) => (
        <section key={category}>
          {/* Terms in this category/type */}
          {Object.entries(typeGroup).map(([type, terms]) => (
            <div key={`${category}-${type}`}>
              {terms.map(term => (
                <TermEntry 
                  key={term.id}
                  term={term}
                  onTypeChange={(newType) => updateCurrentType(category, newType)}
                />
              ))}
            </div>
          ))}
        </section>
      ))}
      
    </div>
  </div>
  
</main>
```

## Styling Requirements

### Top Bar Header
- Position: Fixed at top (`h-20` ~80px)
- Background: White with subtle bottom border
- Layout: flexbox with `justify-start` and `gap-8`
- Sections:
  - **Left**: SPADA LIBRERIA (bold, small) + platform v1.0 (lighter, smaller) stacked
  - **Center**: GLOSSAIRE (page title, font-semibold)
  - **Right**: Back button with arrow (← Back)
- Responsive: On mobile, consider stacking or simplifying

### Search Bar Container
- Full width under header
- Padding: Moderate (py-3, px-8)
- Border-bottom: Subtle divider
- Component: Reuse existing `<GlossarySearchBar />`

### Sticky Header
- Position: `sticky; top-20` (below the fixed header)
- Z-index: z-10
- Height: 2 lines (~60px)
- Background: White (to float above scrolling content)
- Border-bottom: Subtle divider (text-gray-300)
- Padding: Minimal (px-8 py-3)
- Line 1 (Category): font-bold, text-base, uppercase tracking-wider
- Line 2 (Type): font-normal, text-sm, text-gray-600

### Term Entry
- Container: space-y-6 between terms (prose-like spacing)
- No background color
- No border (except subtle divider between terms)
- No hover highlight/background
- **Term Display Content**:
  - Display: Italian term name only (e.g., "Guardia di Testa")
  - Do NOT display English translation
  - Do NOT display term category or type (shown in sticky header only)
  - Do NOT show Italian definition (French only)
- French translation: text-sm, text-gray-600, lighter weight
- Definition: Prose text (French only), inherit font from parent, line-height-7 for readability
- Divider: Thin line (border-t, border-gray-200) between entries, 80% width centered
- Spacing: py-4 between term name and definition, py-6 between entries

### Search Bar
- Reuse existing `GlossarySearchBar` component styling
- Minimal, consistent with BolognesePlatform aesthetic

## Text Styling Consistency

**Match BolognesePlatform prose classes:**
- Use `prose` class where applicable
- Line-height: Generous for readability (line-height-7 minimum)
- Letter-spacing: Normal
- Colors: Match BolognesePlatform text hierarchy
- **Language**: Display ONLY French content
  - French definitions: Full text displayed
  - Italian terms: Used as labels only (not definitions)
  - English content: Not displayed in glossary page
  - Multi-translator English: Not applicable (French-only display)

## Responsive Behavior

- **Mobile (< 768px)**: Single column, full width
- **Tablet/Desktop**: Full width prose layout
- Sticky header: Works on all screen sizes
- Search bar: Full width, minimal on mobile

## Dark Mode (Future)

- Sticky header background: Adapt to dark background
- Text colors: Adapt to dark theme
- Divider lines: Adapt contrast

## Accessibility

- Sufficient color contrast (WCAG AA minimum)
- Semantic HTML (h1, h2, section tags)
- Focus indicators on search input
- Skip navigation link to main content (if needed)

