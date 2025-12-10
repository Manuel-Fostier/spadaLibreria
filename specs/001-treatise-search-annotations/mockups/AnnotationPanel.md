# Panneau d’annotations (AnnotationPanel)
> Aperçu navigateur : `specs/001-treatise-search-annotations/mockups/pages/AnnotationPanel.html`

**Références spec**: FR-012 (ouverture par défaut), FR-012a (bouton mis en avant), FR-012b + SC-012 (défilement intelligent), FR-009 (condition d’épée), FR-021 (config affichage)
**User story**: US3 - Filtrer et enrichir les annotations
**Tâches**: T003 (US3), T037-T039 (implémentation)

## Aperçu
Le panneau d’annotations reste visible côté droit dès l’ouverture d’un chapitre et suit les lectures :
- panel ouvert par défaut (FR-012)
- bouton 📌 mis en forme quand le panneau est actif (FR-012a)
- suivi automatique du paragraphe centré dans la colonne de texte (FR-012b / SC-012)
- formulaire d’ajout avec nouvelle propriété « condition d’épée » (FR-009)
- menu de configuration d’affichage (FR-021)

## Maquette ASCII (Vue desktop)
```
┌────────────────────────────┬─────────────────────────────────┐
│ Chapitre texte (gauche)    │ │ 📌 Annotations (panel ouvert) │
│                            │ │ ───────────────────────────── │
│ ¶1  « ...guardia di coda...│ │ 🟢 Paragraphe centré           │
│ ¶2  « ...attacca con... »   │ │ ┌──────────────────────────── │
│ ¶3  « ...spada davanti... » │ │ │ Note : attaque de tête       │
│ ¶4  « ...corps sinistre... »│ │ │ Tag : [débutant] [solo]      │
│                            │ │ │ Arme : spada                 │
│ ↓ scroll ...               │ │ │ Condition : coupant (FR009)  │
│ ¶5  « ...pressa... »        │ │ │ [Modifier] [Supprimer]        │
│                            │ │ └──────────────────────────── │
│                            │ │ ⚙️ [Config]  ➕ [Ajouter]  ×   │
└────────────────────────────┴─────────────────────────────────┘
```

Bouton 📌 : fond bleu (active), fond gris translucide (inactif). Paragraphe en cours encadré en vert clair.

## États détaillés
1. **Ouverture par défaut (FR-012)**
   - Panel visible dès le chargement.
   - Bouton 📌 actif et surligné (#2563eb / text-white).
   - L’utilisateur peut réduire avec ×, mais la valeur par défaut reste ouverte.
2. **Bouton mis en avant (FR-012a)**
   - Classe `active` = `bg-sky-600 text-white font-semibold`.
   - Classe `inactive` = `bg-transparent border border-gray-300 text-gray-700`.
   - Indicatif visuel (iconographie + couleur) pour l’état.
3. **Défilement intelligent (FR-012b / SC-012)**
   - IntersectionObserver détecte le paragraphe à 55 % de la hauteur de viewport.
   - Panel rafraîchit son contenu (<100 ms) grâce à un `requestAnimationFrame`.
   - L’animation CSS (`transition: transform 200ms ease`) évite les sauts.
4. **Formulaire d’ajout (FR-009)**
   - Champs : note, tags, arme, condition d’épée, gardes, mesures, stratégie.
   - Condition d’épée (enum) : `coupant`, `mat`, `inconnu` via boutons radio.
   - Sauvegarde enrichit `annotation.weapon_type` dans la base.
5. **Configuration d’affichage (FR-021)**
   - Menu modale activé par ⚙️.
   - Options `showWeapons`, `showWeaponType`, `showGuards`, etc.
   - Valeurs persistées dans `localStorage` et context `AnnotationDisplayContext`.

## Variantes responsive
- **Desktop**: panel fixe à droite, 360 px, barre de défilement interne.
- **Tablette**: panel bascule en overlay avec bouton ancré en bas droite.
- **Mobile**: panel collapsé derrière un onglet `📌 Annotations ▼`, expansible en swipe / tap.

## Flux utilisateur
1. Chargement chapitre → panel ouvert, bouton 📌 actif.
2. Lecture → scroll : IntersectionObserver aligne le paragraphe central et affiche ses annotations.
3. Ajout rapide : bouton ➕ ouvre le formulaire, coche condition d’épée puis Enregistrer.
4. Config : clic sur ⚙️ → toggles pour afficher condition d’épée, note, arme, etc.
5. Sauvegarde : données stockées localement + appel `onAnnotationChange` pour rafraîchir la vue.

## Implémentation technique
### Props principales
```ts
interface AnnotationPanelProps {
  chapterId: string;
  annotations: Annotation[];
  isOpen?: boolean; // default true (FR-012)
  onToggle?: (open: boolean) => void;
  onSubmit?: (annotation: AnnotationInput) => Promise<void>;
}
```

### Scroll intelligent
```ts
const panelRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    const center = entries.find((entry) => entry.intersectionRatio > 0.5);
    if (center) {
      const id = center.target.getAttribute('data-paragraph-id');
      setActiveParagraph(id);
    }
  }, { threshold: [0.25, 0.5, 0.75], root: null });

  document.querySelectorAll('p[data-paragraph-id]').forEach((p) => observer.observe(p));
  return () => observer.disconnect();
}, []);
```
- Utilise `useTransition` pour garantir mise à jour <100 ms (SC-012).

## Styles Tailwind (alignés au site)
```css
.annotation-panel {
  @apply bg-white border-l border-gray-200 p-4 h-full overflow-y-auto;
}
.annotation-panel .current-paragraph {
  @apply bg-emerald-50 border border-emerald-400 rounded-lg p-3 mb-4;
}
.annotation-button.active {
  @apply bg-sky-600 text-white shadow-md;
}
.annotation-button.inactive {
  @apply bg-transparent border border-gray-300 text-gray-600;
}
```

## Accessibilité
- `aria-expanded` reflète l’état du panel.
- `aria-live="polite"` pour annoncer la mise à jour du paragraphe actif.
- Tab order clair : bouton 📌 → ⚙️ → liste → formulaire.
- Contrastes conformes WCAG AA (texte sur fond bleu/vert).

## Interactions associées
- `SearchResults.md` (T022) déclenche l’ouverture du panel via `onSelectChapter`.
- `AnnotationDisplay.md` (T004) documente le menu ⚙️ (FR-021).

## Critères de succès
- ✅ FR-012 : panel visible par défaut pour tout chapitre.
- ✅ FR-012a : bouton 📌 donne un retour visuel clair.
- ✅ FR-012b / SC-012 : suivi du paragraphe central en <100 ms.
- ✅ FR-009 : champ condition d’épée dans le formulaire.
- ✅ FR-021 : configuration persistante des champs visibles.
- ✅ SC-009 : annotation complète (tags + condition) en moins de 30 s.
