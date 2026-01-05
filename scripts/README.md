# Scripts Python pour Spada Libreria

Ce dossier contient les scripts Python utilisés pour extraire et enrichir les traités d'escrime bolonaise.

## Prérequis

- Python 3.13+
- `uv` (gestionnaire de dépendances Python)

Installation des dépendances :
```bash
uv sync
```

## Scripts Disponibles

### 1. `extract_book.py` - Extraction de Texte depuis PDF

Extrait le texte d'un traité d'escrime depuis un fichier PDF et génère un fichier YAML structuré.

#### Usage

```bash
uv run extract-book <author_key> --pages "<range>"
```

#### Arguments

- **`<author_key>`** : Clé identifiant l'auteur/livre (voir mapping ci-dessous)
- **`--pages "<range>"`** : Plage de pages à extraire (format : "début-fin" ou "page")

#### Mapping des Auteurs/Livres

| Clé | Auteur | Œuvre | Livre | Année | Fichier PDF |
|-----|--------|-------|-------|-------|-------------|
| `marozzo` | Achille Marozzo | Opera Nova | 1 | 1536 | `Achille Marozzo - opéra nova.pdf` |
| `marozzo_l2` | Achille Marozzo | Opera Nova | 2 | 1536 | `Achille Marozzo - opéra nova - livre 2.pdf` |
| `manciolino` | Antonio Manciolino | Opera Nova | 4 | 1531 | `Antonio Manciolino - opéra nova.pdf` |

#### Exemples

```bash
# Extraire les chapitres 34 à 102 de Marozzo Livre 1
uv run extract-book marozzo --pages "34-102"

# Extraire les pages 1 à 50 de Manciolino
uv run extract-book manciolino --pages "1-50"

# Extraire une seule page de Marozzo Livre 2
uv run extract-book marozzo_l2 --pages "20"
```

#### Comportement

Le script effectue les étapes suivantes :

1. **Lecture du PDF** : Utilise `pdfplumber` pour extraire le texte avec les métadonnées de taille de police
2. **Détection de la Structure** :
   - **Titres** (Title) : Texte avec taille de police ≥ 80
   - **Sous-titres** (Title1) : Texte avec taille de police ≥ 25
   - **Chapitres** (Chapter) : Texte avec taille de police ≥ 20
   - **Paragraphes** (Paragraph) : Texte restant
3. **Hiérarchisation** : Construit une hiérarchie Title → Title1 → Chapter → Paragraphs
4. **Génération YAML** : Crée une section YAML pour chaque chapitre avec :
   - `id` : Identifiant unique généré (format : `{master_id}_l{book}_c{chapter}`)
   - `title` : Titre du chapitre
   - `metadata` : Métadonnées bibliographiques (master, work, book, chapter, year)
   - `content.it` : Texte italien original

#### Format de Sortie

```yaml
- id: achille_marozzo_opera_nova_livre2_capitolo_94
  title: "Capitolo 94 - Della Spada Sola"
  metadata:
    master: Achille Marozzo
    work: Opera Nova
    book: 2
    chapter: 94
    year: 1536
  content:
    it: |
      Texte italien original du chapitre...
```

**Note Importante** : Le script génère **uniquement** la section `content.it` (texte italien original). Il **ne génère PAS** :
- Les traductions françaises (`content.fr`)
- Les traductions anglaises (`content.en_versions`)
- Les champs d'annotation (`annotation`)

Ces éléments doivent être ajoutés manuellement ou via d'autres scripts.

#### Fichier de Sortie

Le fichier YAML est sauvegardé dans :
```
data/treatises/{master_id}_{work}_{book}.yaml
```

Exemple : `data/treatises/achille_marozzo_opera_nova_livre2.yaml`

---

### 2. `yaml_annotate.py` - Enrichissement et Annotations

Ajoute les champs d'annotation et enrichit le texte avec des liens vers le glossaire dans les fichiers YAML de traités.

#### Usage

```bash
uv run yaml-annotate <input_file> [--glossary <glossary_path>]
```

#### Arguments

- **`<input_file>`** : Chemin vers le fichier YAML de traité à traiter (obligatoire)
- **`--glossary <glossary_path>`** : Chemin vers le fichier glossaire (défaut : `data/glossary.yaml`)

#### Exemples

```bash
# Enrichir un traité avec le glossaire par défaut
uv run yaml-annotate data/treatises/achille_marozzo_opera_nova_livre2.yaml

# Enrichir avec un glossaire personnalisé
uv run yaml-annotate data/treatises/manciolino.yaml --glossary custom_glossary.yaml
```

#### Comportement

Le script effectue les opérations suivantes :

##### 1. Chargement du Glossaire

- Lit le fichier `glossary.yaml`
- Construit un mapping : terme (display) → clé (key)
- Catégorise automatiquement les termes par type :
  - **Guards** : Termes contenant "Garde"
  - **Strikes** : Termes contenant "Attaque", "Frappe", "Coup d'estoc"
  - **Techniques** : Termes contenant "Technique", "Mouvement", "Tactique"
  - **Targets** : Termes contenant "Cible"

##### 2. Enrichissement du Texte

Pour chaque section du traité :

- **Détection des Termes** : Utilise une expression régulière pour trouver les termes du glossaire dans le texte
- **Algorithme de Remplacement** :
  ```python
  # 1. Tri des termes par longueur (décroissant) pour gérer les sous-chaînes
  # Exemple : "Coda Longa e Stretta" avant "Coda Longa"
  
  # 2. Construction du pattern regex : \b(terme1|terme2|...)\b
  # - \b : Word boundary (limite de mot)
  # - Insensible à la casse (re.IGNORECASE)
  
  # 3. Remplacement : "Mandritto" → "{mandritto}"
  ```
- **Protection des Tags Existants** : Ne remplace pas les termes déjà entre accolades `{...}`
- **Préservation de la Casse** : Maintient la casse originale du texte
- **Sections Enrichies** :
  - `content.it` : Texte italien
  - `content.fr` : Texte français (si présent)
  - `content.en_versions[].text` : Textes anglais (si présents)

##### 3. Ajout des Champs d'Annotation

Si une section n'a pas de champ `annotation`, le script en crée un avec la structure suivante :

```yaml
annotation:
  id: anno_{timestamp}_{random}  # ID unique généré
  note: ""
  weapons: []
  weapon_type: null
  guards_mentioned: []
  techniques: []
  measures: []
  strategy: []
  strikes: []
  targets: []
  guards_count: null
  techniques_count: null
  strikes_count: null
  targets_count: null
```

**Important** : Les listes sont initialisées vides. Les compteurs (`*_count`) sont à `null`. Ces champs doivent être remplis manuellement ou via un processus d'annotation ultérieur.

##### 4. Sauvegarde

- Écrit le fichier YAML mis à jour en préservant :
  - La structure originale
  - Les commentaires existants
  - Les guillemets et formatage

#### Algorithme de Catégorisation

La catégorisation des termes se base sur le champ `type` du glossaire :

| Type dans Glossaire | Catégorie Assignée | Exemples |
|---------------------|-------------------|----------|
| Contient "Garde" | `guard` | Coda Longa, Porta di Ferro |
| Contient "Attaque", "Frappe", "Coup d'estoc" | `strike` | Mandritto, Fendente, Stoccata |
| Contient "Technique", "Mouvement", "Tactique" | `technique` | Stringere, Ligare, Passare |
| Contient "Cible" | `target` | Tête, Bras, Jambe |

#### Gestion des Conflits

**Termes Déjà Liés** : Si un terme est déjà entre accolades `{terme}`, le script ne le modifie pas.

**Sous-Chaînes** : Les termes sont triés par longueur décroissante pour éviter les remplacements partiels. Exemple :
```
"Coda Longa e Stretta" est traité avant "Coda Longa"
→ Évite "{coda_longa} e Stretta" au lieu de "{coda_longa_e_stretta}"
```

**Expressions Régulières** : Les caractères spéciaux dans les termes sont échappés (`re.escape`) pour éviter les interprétations incorrectes.

#### Limitations

1. **Ne Catégorise PAS Automatiquement** : Le script ajoute des champs d'annotation vides mais ne les remplit pas automatiquement. La catégorisation sémantique (identifier que "passare sotto" est une technique dans un contexte spécifique) nécessite une analyse manuelle ou un traitement plus avancé.

2. **Langue Unique pour la Catégorisation** : La catégorisation se base sur le champ `type` en français du glossaire. Si le glossaire est dans une autre langue, il faut adapter les mots-clés.

3. **Pas de Validation Contextuelle** : Le script ne valide pas si un terme a du sens dans son contexte (ex: "filo" comme "fil d'épée" vs "filo" comme mot courant).

---

## Workflow Recommandé

Pour ajouter un nouveau traité complet :

### Étape 1 : Extraction depuis PDF

```bash
uv run extract-book marozzo --pages "1-100"
```

**Résultat** : Fichier YAML avec structure de base et texte italien.

### Étape 2 : Ajout des Traductions

**Manuel** : Éditer le fichier YAML pour ajouter :
- `content.fr` : Traduction française
- `content.en_versions` : Une ou plusieurs traductions anglaises

### Étape 3 : Enrichissement avec Glossaire

```bash
uv run yaml-annotate data/treatises/achille_marozzo_opera_nova_livre1.yaml
```

**Résultat** : 
- Termes du glossaire liés dans tous les textes (`{terme}`)
- Champs d'annotation ajoutés (vides)

### Étape 4 : Annotation Manuelle

**Interface Web** : Utiliser l'application Next.js pour :
- Remplir les champs d'annotation par section
- Ajouter des notes et commentaires
- Configurer les compteurs de fréquence

---

## Dépendances Python

Les scripts utilisent les bibliothèques suivantes (gérées par `uv`) :

| Bibliothèque | Usage |
|--------------|-------|
| `pdfplumber` | Extraction de texte depuis PDF avec métadonnées |
| `ruamel.yaml` | Parsing et écriture YAML avec préservation du format |
| `argparse` | Parsing des arguments de ligne de commande |

Pour ajouter une nouvelle dépendance :

```bash
# ✅ Correct
uv add <package-name>

# ❌ Incorrect : Ne jamais éditer pyproject.toml manuellement
```

---

## Dépannage

### Erreur : "Glossary file not found"

**Cause** : Le fichier glossaire n'existe pas au chemin spécifié.

**Solution** :
```bash
# Vérifier l'existence du fichier
ls data/glossary.yaml

# Ou spécifier un chemin personnalisé
uv run yaml-annotate mon_fichier.yaml --glossary chemin/vers/glossary.yaml
```

### Erreur : "Input file not found"

**Cause** : Le fichier YAML de traité n'existe pas.

**Solution** :
```bash
# Vérifier le chemin
ls data/treatises/mon_fichier.yaml
```

### Extraction PDF : Texte Mal Structuré

**Cause** : Les seuils de taille de police ne correspondent pas au PDF.

**Solution** : Modifier les constantes `SIZE` dans les classes `Title`, `Title1`, `Chapter` dans `extract_book.py` :

```python
class Title(TextElement):
    SIZE = 80  # Ajuster cette valeur

class Title1(TextElement):
    SIZE = 25  # Ajuster cette valeur

class Chapter(TextElement):
    SIZE = 20  # Ajuster cette valeur
```

### Termes Non Liés par yaml_annotate

**Cause** : Le terme n'est pas dans le glossaire, ou la casse/orthographe diffère.

**Solution** :
1. Vérifier que le terme existe dans `data/glossary.yaml`
2. Vérifier l'orthographe exacte (le script est insensible à la casse)
3. Ajouter le terme manquant au glossaire si nécessaire

---

## Développement Futur

Améliorations potentielles des scripts :

- [ ] **Extraction Multilingue** : Extraire directement les traductions si présentes dans le PDF
- [ ] **Auto-Catégorisation Sémantique** : Utiliser un LLM pour catégoriser automatiquement les annotations
- [ ] **Validation des Annotations** : Vérifier la cohérence des annotations avec les termes du glossaire
- [ ] **Export Multi-Format** : Supporter JSON, Markdown, HTML en plus de YAML
- [ ] **Traduction Automatique** : Intégration d'APIs de traduction (DeepL, GPT) pour les ébauches
- [ ] **OCR Amélioré** : Support de PDFs scannés avec reconnaissance optique de caractères

---

## Licence

Ces scripts font partie du projet Spada Libreria, un projet académique pour l'étude des traités d'escrime historique européenne.
