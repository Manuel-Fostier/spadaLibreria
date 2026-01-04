# Spada Libreria

## 📖 Vue d'ensemble du Projet

Ce document explique l'architecture complète du projet basée sur les spécifications techniques. L'objectif est de séparer totalement le contenu du code pour faciliter la maintenance par des non-développeurs.

## 🏗️ Architecture Complète

### 1. Séparation Contenu/Code

**Principe** : Toutes les données (traités, glossaire) sont stockées dans des fichiers YAML externes dans le dossier `data/`. Le code de l'application ne contient que la logique d'affichage et de traitement.

**Avantages** :
- ✅ Maintenance simplifiée pour les non-développeurs
- ✅ Pas besoin de toucher au code pour ajouter du contenu
- ✅ Versionning Git facilité (changements de contenu isolés)
- ✅ Format YAML lisible et structuré

### 2. Structure des Données

#### Glossaire (`data/glossary.yaml`)

Format centralisé avec clés italiennes :

```yaml
terme_italien:
  term: Terme Italien Formaté
  type: Catégorie (Attaque, Garde, Tactique...)
  definition:
    fr: |
      Définition en français (multi-lignes supportées)
    en: |
      English definition (multi-line supported)
  translation:
    fr: Traduction française courte
    en: Short English translation
```

**Exemple réel** :
```yaml
mandritto:
  term: Mandritto
  type: Attaque / Frappe de taille
  definition:
    fr: |
      Coup porté de la droite vers la gauche. Il part de l'épaule droite de l'escrimeur.
    en: |
      A cut delivered from right to left. Starts from the fencer's right shoulder.
  translation:
    fr: Coup droit
    en: Forehand cut
```

#### Traités (`data/treatises/*.yaml`)

Format de sections avec support multi-traductions et annotations :

```yaml
- id: identifiant_unique
  title: Titre du chapitre
  metadata:
    master: nom_du_maitre
    work: Nom de l'œuvre
    book: 1
    chapter: 1
    year: 1536
  content:
    it: |
      Texte italien original avec {references_glossaire}
    fr: |
      Traduction française avec {references_glossaire}
    en_versions:
      - translator: "Nom du Traducteur"
        text: |
          English text with {glossary_references}
      - translator: "Autre Traducteur"
        text: |
          Alternative translation
  annotation:
    id: anno_1234567890_unique    
    weapons: [Spada sola, Spada e brocchiero]
    weapon_type: Épée aiguisée  # ou "Épée émoussée"
    guards_mentioned: [Coda Longa e Stretta, Porta di Ferro Larga]
    techniques: [Stringere, Ligare di Spada]
    measures: [Largo, Mezzo, Stretto di Mezza Spada]
    strategy: [provocation, invitation, tempo]
    strikes: [Mandritto, Fendente, Falso]
    targets: [Tête, Bras, Jambe, Main]
    # Compteurs de fréquence (générés automatiquement)
    guards_count:
      "Coda Longa e Stretta": 3
      "Porta di Ferro Larga": 1
    techniques_count:
      "Stringere": 2
      "Ligare di Spada": 1
    strikes_count:
      "Mandritto": 5
      "Fendente": 2
    targets_count:
      "Tête": 3
      "Bras": 2
```

**Note Importante** : Les champs `weapons`, `guards_mentioned`, `techniques`, `measures`, `strategy`, `strikes`, `targets` sont dans la section `annotation`, **PAS dans `metadata`**. La section `metadata` contient uniquement les informations bibliographiques (master, work, book, chapter, year).

**Usage des références** :
- Dans le texte, entourer les termes du glossaire avec `{terme_italien}`
- Exemple : `{mandritto}`, `{coda_longa}`
- Le parser automatique créera les liens interactifs

### 3. Pipeline de Traitement

```
YAML Files → Parser (js-yaml) → TypeScript Interfaces → React Components → UI
```

**Étapes** :
1. **Lecture** : `dataLoader.ts` lit les fichiers YAML
2. **Parsing** : `js-yaml` convertit en objets JavaScript typés
3. **Enrichissement** : `TextParser` détecte les `{termes}` et crée les liens
4. **Affichage** : Les composants React affichent avec tooltips interactifs

### 4. Contextes React

L'application utilise plusieurs contextes React pour gérer l'état global :

#### `AnnotationContext.tsx` - Gestion des Annotations
- Chargement des annotations depuis les fichiers YAML
- Sauvegarde des annotations (localStorage + API)
- Filtrage des annotations par critères multiples
- État des annotations de toutes les sections

#### `AnnotationDisplayContext.tsx` - Configuration de l'Affichage
- Gestion de la visibilité des champs d'annotation
- Configuration des couleurs et styles
- Architecture basée sur les classes d'annotation
- Persistance des préférences utilisateur

#### `SearchContext.tsx` - Gestion de la Recherche
- Construction et maintenance de l'index de recherche
- État de la recherche (query, options, résultats)
- Gestion des options (Match Case, Match Whole Word, Regex)
- Navigation dans les résultats de recherche

### 5. Composants Clés

#### Composants de Contenu

**`Term.tsx`** - Tooltip de Glossaire
- Affiche les termes avec survol interactif
- Tooltip riche : terme, type, définitions FR/EN, traductions
- Gestion des termes manquants (affichage en rouge)

**`TextParser.tsx`** - Parser de Texte
- Détecte les patterns `{terme}` dans le texte
- Remplace par des composants `<Term>` interactifs
- Préserve le texte normal entre les termes
- Support de la surbrillance des résultats de recherche

**`BolognesePlatform.tsx`** - Composant Principal
- Interface à 3 colonnes (Italien, Français, Anglais)
- Filtrage par arme et maître d'escrime
- Sélecteur de traducteur (dropdown) pour traductions multiples
- Navigation sidebar avec sections
- Intégration de la recherche et des annotations

#### Composants de Recherche

**`SearchBar.tsx`** - Barre de Recherche
- Interface de recherche avec champ de texte
- Options avancées : Match Case, Match Whole Word, Regex
- Navigation dans les résultats (précédent/suivant)
- Affichage du compteur de résultats
- Bouton d'effacement de la recherche

#### Composants d'Annotation

**`AnnotationPanel.tsx`** - Panneau d'Annotations
- Panneau latéral redimensionnable
- Affichage des annotations de la section courante
- Édition des annotations (9 types de champs)
- Sauvegarde automatique des modifications
- Architecture basée sur les classes d'annotation

**`AnnotationBadge.tsx`** - Badge d'Annotation
- Affichage visuel des tags d'annotation
- Styles cohérents avec AnnotationRegistry
- Gestion des couleurs par type d'annotation

**`AnnotationDisplaySettings.tsx`** - Configuration de l'Affichage
- Panneau de configuration des annotations
- Activation/désactivation des champs d'annotation
- Configuration des couleurs et styles
- Utilisation des classes d'annotation

**`TagFilter.tsx`** - Filtrage par Tags
- Filtrage dynamique des sections par annotations
- Sélection multiple de tags
- Compteurs de sections par tag
- Filtres combinables (ET/OU)

**`ColorPicker.tsx`** - Sélecteur de Couleur
- Interface de sélection de couleur
- Utilisé pour personnaliser les styles d'annotation
- Intégration avec AnnotationRegistry

#### Composants Utilitaires

**`MeasureProgressBar.tsx`** - Barre de Progression des Mesures
- Visualisation graphique de la progression des mesures
- Affichage de Largo, Mezzo, Stretto
- Indicateur visuel de l'évolution tactique

**`TextEditor.tsx`** - Éditeur de Texte
- Composant d'édition de texte enrichi
- Utilisé pour les notes et commentaires
- Support du formatage de base

**`StatisticsModal.tsx`** - Modal de Statistiques
- Affichage des statistiques sur les annotations
- Graphiques et compteurs
- Analyse par type d'annotation
- Export des données statistiques

**`ComparisonModal.tsx`** - Modal de Comparaison
- Comparaison côte à côte des traductions
- Affichage des différences entre traducteurs
- Navigation synchronisée entre versions

### 6. Architecture du Système de Recherche

Le système de recherche permet une recherche cross-treatise avec options avancées.

#### Construction de l'Index (`searchIndex.ts`)

```typescript
// Index construit au chargement de l'application
interface SearchIndex {
  sectionId: string;
  master: string;
  work: string;
  language: 'it' | 'fr' | 'en';
  text: string;
  translatorId?: string;
}
```

- Index construit depuis toutes les sections de tous les traités
- Inclut les textes italien, français, et toutes les versions anglaises
- Métadonnées conservées pour le filtrage

#### Moteur de Recherche (`searchEngine.ts`)

**Options de Recherche** :
- **Match Case** : Recherche sensible à la casse
- **Match Whole Word** : Recherche de mots entiers uniquement
- **Regex** : Recherche par expression régulière

**Fonctionnalités** :
- Recherche dans tous les traités simultanément
- Filtrage par langue et traducteur
- Retour des résultats avec contexte
- Navigation résultat par résultat

#### Surbrillance (`highlighter.ts`)

- Surbrillance en temps réel des termes recherchés
- Gestion des patterns regex et mots entiers
- Préservation de la casse originale du texte
- Intégration avec TextParser

#### Flux de Recherche

```
Utilisateur → SearchBar → SearchContext → SearchEngine
                                ↓
                          SearchIndex
                                ↓
                    Résultats + Métadonnées
                                ↓
                    TextParser (surbrillance)
                                ↓
                        Affichage UI
```

### 7. Architecture des Annotations (Classes)

Le système d'annotation utilise une architecture orientée objet avec classes.

#### Classe de Base Abstraite (`Annotation.ts`)

```typescript
abstract class Annotation {
  abstract getChipStyle(): ChipStyle;
  abstract getTextStyle(): TextStyle;
  abstract validate(value: any): boolean;
  // Méthodes communes pour toutes les annotations
}
```

#### Registry Pattern (`AnnotationRegistry.ts`)

**Factory/Registry centralisé** :
```typescript
class AnnotationRegistry {
  private static instances = new Map<AnnotationType, Annotation>();
  
  static get(type: AnnotationType): Annotation {
    // Singleton pattern pour chaque type
  }
  
  static getAll(): Annotation[] {
    // Retourne toutes les instances
  }
}
```

#### Classes Concrètes (9 types)

1. **`Weapons.ts`** - Armes utilisées (Spada sola, Spada e brocchiero, etc.)
2. **`WeaponType.ts`** - Condition de l'arme (Épée aiguisée / émoussée)
3. **`Guards.ts`** - Gardes mentionnées (Coda Longa, Porta di Ferro, etc.)
4. **`Techniques.ts`** - Techniques utilisées (Stringere, Ligare, etc.)
5. **`Measures.ts`** - Mesures (Largo, Mezzo, Stretto)
6. **`Strategy.ts`** - Stratégies (Provocation, Invitation, etc.)
7. **`Strikes.ts`** - Coups portés (Mandritto, Fendente, etc.)
8. **`Targets.ts`** - Cibles visées (Tête, Bras, Jambe, etc.)
9. **Note** - Notes textuelles libres

#### Avantages de l'Architecture Classes

- ✅ **Extensibilité** : Ajouter un nouveau type = créer une nouvelle classe
- ✅ **Encapsulation** : Chaque type gère son style et validation
- ✅ **Réutilisabilité** : Méthodes communes héritées de la classe de base
- ✅ **Type Safety** : TypeScript garantit la cohérence
- ✅ **Maintenabilité** : Logique centralisée dans AnnotationRegistry

#### Intégration avec les Composants

```typescript
// Dans ColorPicker.tsx et AnnotationPanel.tsx
const annotation = AnnotationRegistry.get('weapons');
const chipStyle = annotation.getChipStyle();
const textStyle = annotation.getTextStyle();
```

### 8. Routes API

L'application expose des routes API pour la persistance des données.

#### `/api/annotations` (GET)

**Fonctionnalité** : Charger toutes les annotations depuis les fichiers YAML

**Réponse** :
```typescript
{
  sectionId: {
    id: string;    
    weapons: string[];
    weapon_type: string;
    guards_mentioned: string[];
    techniques: string[];
    measures: string[];
    strategy: string[];
    strikes: string[];
    targets: string[];
    // Compteurs de fréquence
    guards_count: Record<string, number>;
    techniques_count: Record<string, number>;
    strikes_count: Record<string, number>;
    targets_count: Record<string, number>;
  }
}
```

#### `/api/annotations` (POST)

**Fonctionnalité** : Sauvegarder les annotations dans les fichiers YAML

**Corps de la Requête** :
```typescript
{
  treatiseFile: string; // Nom du fichier YAML
  annotations: AnnotationData[]; // Annotations à sauvegarder
}
```

**Comportement** :
1. Lit le fichier YAML existant
2. Fusionne les annotations (conservation des autres métadonnées)
3. Écrit le fichier YAML mis à jour
4. Retourne le statut de succès

### 9. Fonctionnalités Avancées

#### Multi-Traductions Anglaises
L'application supporte plusieurs traductions d'un même texte :

```yaml
en_versions:
  - translator: "Jherek Swanger"
    text: "..."
  - translator: "Tom Leoni"
    text: "..."
```

Un dropdown permet de basculer entre traducteurs au niveau de chaque section.

#### Filtrage Dynamique
- Par type d'arme (spada_brocchiero, spada_sola, etc.)
- Extensible aux maîtres, périodes, contextes...

#### Métadonnées Riches
Les sections incluent :
- Armes utilisées
- Gardes mentionnées
- Techniques présentes
- Contexte d'utilisation

→ Permet des recherches et analyses futures

## 🔧 Guide de Maintenance

### Ajouter un Nouveau Terme au Glossaire

1. Ouvrir `data/glossary.yaml`
2. Ajouter une nouvelle entrée :
```yaml
nouveau_terme:
  term: Nouveau Terme
  type: Type approprié
  definition:
    fr: |
      Définition française
    en: |
      English definition
  translation:
    fr: Traduction courte
    en: Short translation
```
3. Utiliser dans les traités avec `{nouveau_terme}`

### Ajouter un Nouveau Traité

1. Créer `data/treatises/nouveau_traite.yaml`
2. Suivre le format de structure ci-dessus
3. Modifier `src/app/page.tsx` pour charger le nouveau fichier (ou créer une nouvelle page)

### Ajouter un Chapitre à un Traité Existant

1. Ouvrir le fichier YAML du traité
2. Ajouter une nouvelle section à la liste YAML :
```yaml
- id: nouveau_chapitre_id
  title: Nouveau Chapitre
  metadata: {...}
  content: {...}
```

## 🚀 Démarrage Rapide

```bash
# Rendre le script exécutable (une seule fois)
chmod +x start.sh

# Lancer l'application
./start.sh
```

Le script :
- Vérifie/installe Node.js si nécessaire
- Installe les dépendances npm
- Lance le serveur de développement
- Ouvre l'application sur http://localhost:3000

## 📊 Technologies & Justifications

| Technologie | Justification |
|------------|---------------|
| **YAML** | Format lisible, multi-lignes, moins strict que JSON |
| **Next.js 15** | SSR, routing automatique, API routes, performance |
| **TypeScript** | Typage statique, IntelliSense, détection d'erreurs |
| **Tailwind CSS** | Styling rapide, consistant, responsive facile |
| **js-yaml** | Parser YAML standard et fiable |
| **Lucide React** | Icônes modernes, légères, cohérentes |

## 🎯 Cas d'Usage

### Éditeur de Contenu (Non-Développeur)
1. Ouvrir `data/glossary.yaml` ou `data/treatises/*.yaml`
2. Éditer en suivant la structure existante
3. Commit & push les changements
4. Redémarrage automatique en dev, rebuild en production

### Développeur
1. Code dans `src/` (components, lib, app)
2. Les données YAML sont chargées automatiquement
3. Types TypeScript assurent la cohérence
4. Pas de manipulation de contenu dans le code

### Chercheur/Historien
1. Consulter les traités avec glossaire interactif
2. Comparer plusieurs traductions anglaises
3. Filtrer par arme, maître, technique
4. Export/analyse futures possibles via les métadonnées

## 📝 Roadmap Potentielle

- [ ] Recherche full-text dans les traités
- [ ] Export PDF avec glossaire
- [ ] Mode comparaison (2 traités côte à côte)
- [ ] Annotations utilisateur (avec authentification)
- [ ] API publique pour chercheurs
- [ ] Base de données pour performance (PostgreSQL)
- [ ] Support d'images/diagrammes dans les traités
- [ ] Système de citations croisées entre traités

## 📄 Licence & Crédits

Projet académique pour l'étude des traités d'escrime historique européenne (Bologne, XVIe siècle).

Traductions existantes citées avec attribution complète aux traducteurs.
