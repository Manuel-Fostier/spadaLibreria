# Diagrammes de Structure - Avant/Après

## 📊 Structure Actuelle (Confuse)

```
spadalibreria/src/
│
├── lib/
│   ├── annotation.ts                    ❌ CONFUSION : même nom "annotation"
│   │   └── Contenu : Types, constantes, interface
│   │
│   └── annotation/                      ❌ CONFUSION : même nom "annotation"
│       ├── Annotation.ts                   (Classe abstraite)
│       ├── AnnotationRegistry.ts           (Factory/Registry)
│       ├── Guards.ts, Measures.ts, ...     (Classes concrètes)
│       └── index.ts
│
├── types/
│   └── annotation.ts                    ⚠️ REDONDANT : ré-exporte lib/annotation.ts
│
└── components/
    └── MarkdownRenderer.tsx.bkp         ⚠️ BACKUP : ne devrait pas être versionné
```

### Problèmes

1. **Collision de noms** : `annotation.ts` et `annotation/` au même niveau
2. **Ambiguïté sémantique** : Deux concepts différents avec le même nom
3. **Redondance** : `types/annotation.ts` duplique `lib/annotation.ts`
4. **Pollution** : Fichier backup versionné

---

## ✅ Structure Proposée (Claire)

```
spadalibreria/src/
│
├── lib/
│   ├── annotationTypes.ts               ✅ CLAIR : Types et constantes
│   │   ├── Constantes : MEASURES, STRATEGIES, WEAPONS, etc.
│   │   ├── Types : Measure, Strategy, Weapon, etc.
│   │   ├── Interface : Annotation
│   │   └── Groupes : HIGH_GUARDS, LOW_GUARDS
│   │
│   └── annotationClasses/               ✅ CLAIR : Classes OOP
│       ├── Annotation.ts                   (Classe abstraite de base)
│       ├── AnnotationRegistry.ts           (Factory/Registry singleton)
│       ├── Guards.ts                       (Classe concrète)
│       ├── Measures.ts                     (Classe concrète)
│       ├── Strategy.ts                     (Classe concrète)
│       ├── Strikes.ts                      (Classe concrète)
│       ├── Targets.ts                      (Classe concrète)
│       ├── Techniques.ts                   (Classe concrète)
│       ├── WeaponType.ts                   (Classe concrète)
│       ├── Weapons.ts                      (Classe concrète)
│       └── index.ts                        (Exports publics)
│
├── types/
│   ├── annotationDisplay.ts             ✅ RESTE : Configuration d'affichage
│   ├── data.ts
│   ├── llm.ts
│   └── search.ts
│   └── ❌ SUPPRIMÉ : annotation.ts
│
└── components/
    └── ❌ SUPPRIMÉ : MarkdownRenderer.tsx.bkp
```

### Avantages

1. ✅ **Noms distincts** : Plus de collision entre fichier et dossier
2. ✅ **Sémantique claire** : "Types" vs "Classes" explicite
3. ✅ **Pas de redondance** : Un seul endroit pour les types
4. ✅ **Codebase propre** : Pas de fichiers backup versionnés

---

## 🔄 Mapping des Imports

### Avant → Après

```typescript
// AVANT (confus)
import { Annotation, WEAPONS } from '@/lib/annotation';
import { Annotation as AnnotationClass } from '@/lib/annotation/Annotation';
import { AnnotationRegistry } from '@/lib/annotation/AnnotationRegistry';

// APRÈS (clair)
import { Annotation, WEAPONS } from '@/lib/annotationTypes';
import { Annotation as AnnotationClass } from '@/lib/annotationClasses/Annotation';
import { AnnotationRegistry } from '@/lib/annotationClasses/AnnotationRegistry';
```

### Fichiers Impactés (14 au total)

| Fichier | Import Avant | Import Après |
|---------|--------------|--------------|
| `lib/dataLoader.ts` | `@/lib/annotation` | `@/lib/annotationTypes` |
| `components/BolognesePlatform.tsx` | `@/lib/annotation` | `@/lib/annotationTypes` |
| `components/StatisticsModal.tsx` | `@/lib/annotation` | `@/lib/annotationTypes` |
| `components/MeasureProgressBar.tsx` | `@/lib/annotation` | `@/lib/annotationTypes` |
| `components/ColorPicker.tsx` | `@/lib/annotation/Annotation` | `@/lib/annotationClasses/Annotation` |
| `components/AnnotationPanel.tsx` | `@/lib/annotation/AnnotationRegistry` | `@/lib/annotationClasses/AnnotationRegistry` |
| `api/annotations/route.ts` | `@/lib/annotation` | `@/lib/annotationTypes` |

---

## 🎯 Séparation des Responsabilités

### `annotationTypes.ts` (Données)

```typescript
// Types TypeScript purs
export type Weapon = typeof WEAPONS[number];
export type Guard = typeof GUARDS[number];

// Constantes (données brutes)
export const WEAPONS = ['Spada sola', ...] as const;
export const GUARDS = ['Coda Longa', ...] as const;

// Structure de données (interface)
export interface Annotation {
  id: string;
  weapons: Weapon[] | null;
  guards_mentioned: Record<string, number> | null;
  // ...
}
```

**Rôle** : Définir les types et constantes (données)

---

### `annotationClasses/` (Logique)

```typescript
// Classe abstraite (comportement)
export abstract class Annotation {
  abstract getChipStyle(): React.CSSProperties;
  abstract getTextStyle(): React.CSSProperties;
  // ...
}

// Classes concrètes (implémentation)
export class Weapons extends Annotation {
  getChipStyle() { return { backgroundColor: '#...' }; }
  getTextStyle() { return { color: '#...' }; }
}

// Registry (gestion)
export class AnnotationRegistry {
  private static instances = new Map<string, Annotation>();
  static get(type: string): Annotation { /* ... */ }
}
```

**Rôle** : Encapsuler la logique d'affichage et de comportement

---

## 📈 Architecture en Couches

```
┌─────────────────────────────────────────┐
│   UI Components                         │
│   (BolognesePlatform, AnnotationPanel)  │
└────────────┬────────────────────────────┘
             │
             ├─────────────────────────────┐
             ▼                             ▼
┌────────────────────────┐    ┌───────────────────────┐
│  annotationClasses/    │    │  annotationTypes.ts   │
│  (Logique affichage)   │    │  (Structure données)  │
│                        │    │                       │
│  - Annotation.ts       │◄───│  - Annotation (type)  │
│  - AnnotationRegistry  │    │  - WEAPONS, GUARDS    │
│  - Guards, Weapons...  │    │  - Types TS           │
└────────────────────────┘    └───────────────────────┘
             │                             │
             └─────────────┬───────────────┘
                           ▼
                 ┌─────────────────────┐
                 │  YAML Data Files    │
                 │  (data/treatises/)  │
                 └─────────────────────┘
```

### Flux de Données

1. **YAML** → chargé par `dataLoader.ts`
2. **annotationTypes.ts** → valide la structure
3. **annotationClasses/** → stylise pour l'affichage
4. **UI Components** → rend à l'écran

---

## 🔍 Comparaison Visuelle

### Option Rejetée : Garder tel quel

```
❌ annotation.ts        ← Quoi : Types ? Classes ? Données ?
❌ annotation/          ← Même nom = confusion
```

### Option A : Renommage Minimal (CHOISIE)

```
✅ annotationTypes.ts   ← Évident : Types et constantes
✅ annotationClasses/   ← Évident : Classes OOP
```

### Option B : Renommage Sémantique (Alternative)

```
✅ annotationSchema.ts  ← Clair mais moins standard
✅ annotationDisplay/   ← Clair mais restreint (pas que du display)
```

### Option C : Par Domaine (Alternative complexe)

```
✅ annotations/
   ├── types.ts         ← Sur-ingénierie pour ce projet
   ├── schema.ts
   └── classes/
```

---

**Recommandation** : **Option A** - Meilleur équilibre clarté/simplicité
