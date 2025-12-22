# Spada Libreria

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

Sur linux il faut surment convertir les fins de ligne :
```bash
dos2unix start.sh
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

1. **Extraction du texte** : Utilisez le script `extract_book.py` pour extraire le texte depuis les PDF.
   ```bash
   uv run extract-book marozzo --pages "34-102"
   ```

2. **Annotation et Enrichissement** : Utilisez le script `yaml_annotate.py` pour ajouter les champs d'annotation et lier automatiquement les termes du glossaire dans le texte.
   ```bash
   uv run yaml-annotate data/treatises/votre_fichier.yaml
   ```

### Ajouter des termes au glossaire

Éditer `data/glossary.yaml` et ajouter de nouvelles entrées selon le format.