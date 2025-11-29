# Ars Dimicatoria v2.0

Plateforme d'étude des traités d'escrime bolonaise.

## Caractéristiques

- **Données externalisées** : Tous les contenus (glossaire, traités) sont stockés en YAML
- **Multi-traductions** : Support de plusieurs traductions anglaises pour un même texte
- **Glossaire interactif** : Tooltips riches avec définitions FR/EN
- **Interface trilingue** : Italien (original), Français, Anglais
- **Filtrage dynamique** : Par type d'armes et maître d'escrime
- **Architecture moderne** : Next.js 15, React 18, TypeScript, Tailwind CSS

## Utilisation

### Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé :

1. **Node.js** (version 18.x ou supérieure)
   - Télécharger depuis [nodejs.org](https://nodejs.org/)
   - Vérifier l'installation : `node --version`

2. **npm** (inclus avec Node.js)
   - Vérifier l'installation : `npm --version`

### Démarrage rapide avec le script

Le projet inclut un script de démarrage automatisé pour les environnements Unix/Linux/macOS :

```bash
# Rendre le script exécutable (première fois uniquement)
chmod +x start.sh

# Lancer le script
./start.sh
```

Le script `start.sh` effectue automatiquement :
- ✅ Vérification de l'installation de Node.js
- 📦 Installation automatique de Node.js via nvm (si nécessaire)
- 📦 Installation des dépendances npm (si nécessaire)
- 🚀 Démarrage du serveur de développement

L'application sera accessible sur **http://localhost:3000**
``` shell
start http://localhost:3000
``` 

### Démarrage manuel

Si vous préférez un contrôle manuel ou si vous êtes sous Windows :

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

### Commandes disponibles

```bash
npm run dev      # Démarre le serveur de développement (http://localhost:3000)
npm run build    # Compile l'application pour la production
npm run start    # Lance l'application en mode production
npm run lint     # Vérifie la qualité du code
```

## Format des Données

### Glossaire (`data/glossary.yaml`)

```yaml
mandritto:
  term: Mandritto
  type: Attaque / Frappe de taille
  definition:
    fr: |
      Coup porté de la droite vers la gauche...  
```

### Traités (`data/treatises/*.yaml`)

```yaml
- id: marozzo_l1_c1
  title: Capitolo 1 - Della guardia di Coda Longa
  metadata:
    master: achille_marozzo
    work: Opera Nova
    weapons: [spada_brocchiero]
  content:
    it: |
      Texte italien avec {termes_glossaire}...
    fr: |
      Traduction française...
    en_versions:
      - translator: "Jherek Swanger"
        text: |
          English translation...
```

## Personnalisation

### Ajouter un nouveau traité

Pour importer du texte depuis un PDF et générer un fichier YAML de traité, utilisez le script `ragu_alla_bolognese.js` :

```bash
node scripts/ragu_alla_bolognese.js <fichier_pdf> [options]
```

#### Arguments

| Argument | Description |
|----------|-------------|
| `<fichier_pdf>` | Chemin vers le fichier PDF à lire |

#### Options

| Option | Description | Exemple |
|--------|-------------|---------|
| `--lang` | Code de la langue (it, fr, en). Par défaut: fr | `--lang fr` |
| `--pages` | Page ou plage de pages à lire | `--pages 27` ou `--pages 27-30` ou `--pages 27,28,30` |
| `--master` | Nom du maître d'armes | `--master achille_marozzo` |
| `--work` | Titre de l'œuvre | `--work "Opera Nova"` |
| `--book` | Numéro du livre | `--book 2` |
| `--year` | Année de publication | `--year 1536` |

#### Exemple d'utilisation

```bash
# Extraire les pages 27 à 30 du PDF de Marozzo
node scripts/ragu_alla_bolognese.js "Achille Marozzo - opéra nova.pdf" \
  --lang fr \
  --pages 27-30 \
  --master achille_marozzo \
  --work "Opera Nova" \
  --book 2 \
  --year 1536 \
  > data/treatises/nouveau_traite.yaml
```

#### Fonctionnalités du script

- **Détection automatique des chapitres** : Le script détecte les numéros de chapitre (formats: "Chap. X", "Chapitre X", "Chapter X", "Capitolo X")
- **Préservation des retours à la ligne** : Le texte extrait conserve sa structure originale
- **Annotation automatique du glossaire** : Les termes du glossaire sont automatiquement annotés avec des accolades `{terme}` et catégorisés dans les annotations (gardes, techniques, etc.)

### Ajouter des termes au glossaire

Éditer `data/glossary.yaml` et ajouter de nouvelles entrées selon le format.