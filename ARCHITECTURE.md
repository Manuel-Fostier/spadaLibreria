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

Format de sections avec support multi-traductions :

```yaml
- id: identifiant_unique
  title: Titre du chapitre
  metadata:
    master: nom_du_maitre
    work: Nom de l'œuvre
    book: 1
    chapter: 1
    year: 1536
    weapons: [spada_brocchiero, spada_sola]
    guards_mentioned: [coda_longa, porta_di_ferro]
    techniques: [mandritto, fendente]
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
```

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

### 4. Composants Clés

#### `Term.tsx` - Tooltip de Glossaire
- Affiche les termes avec survol interactif
- Tooltip riche : terme, type, définitions FR/EN, traductions
- Gestion des termes manquants (affichage en rouge)

#### `TextParser.tsx` - Parser de Texte
- Détecte les patterns `{terme}` dans le texte
- Remplace par des composants `<Term>` interactifs
- Préserve le texte normal entre les termes

#### `BolognesePlatform.tsx` - Composant Principal
- Interface à 3 colonnes (Italien, Français, Anglais)
- Filtrage par arme
- Sélecteur de traducteur (dropdown) pour traductions multiples
- Navigation sidebar

### 5. Fonctionnalités Avancées

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
