# Spada Libreria

Plateforme d'étude des traités d'escrime bolonaise avec données externalisées en YAML.

## 🎯 Caractéristiques

- **Données externalisées** : Tous les contenus (glossaire, traités) sont stockés en YAML
- **Multi-traductions** : Support de plusieurs traductions anglaises pour un même texte
- **Glossaire interactif** : Tooltips riches avec définitions FR/EN
- **Interface trilingue** : Italien (original), Français, Anglais
- **Filtrage dynamique** : Par type d'armes et maître d'escrime
- **Architecture moderne** : Next.js 15, React 18, TypeScript, Tailwind CSS

## 📁 Structure du Projet

```
spadaLibreria/
├── data/
│   ├── glossary.yaml              # Glossaire centralisé
│   └── treatises/
│       └── marozzo_opera_nova.yaml
├── src/
│   ├── app/
│   │   ├── api/                   # API Routes Next.js
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Term.tsx               # Composant tooltip glossaire
│   │   ├── TextParser.tsx         # Parser de texte avec termes
│   │   └── BolognesePlatform.tsx  # Composant principal
│   └── lib/
│       └── dataLoader.ts          # Utilitaires pour charger les YAML
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build
npm start
```

## 📖 Utilisation

### Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé :

1. **Node.js** (version 18.x ou supérieure)
   - Télécharger depuis [nodejs.org](https://nodejs.org/)
   - Vérifier l'installation : `node --version`

2. **npm** (inclus avec Node.js)
   - Vérifier l'installation : `npm --version`

3. **Git** (optionnel, pour cloner le projet)
   - Télécharger depuis [git-scm.com](https://git-scm.com/)

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

## 📝 Format des Données

### Glossaire (`data/glossary.yaml`)

```yaml
mandritto:
  term: Mandritto
  type: Attaque / Frappe de taille
  definition:
    fr: |
      Coup porté de la droite vers la gauche...
    en: |
      A cut delivered from right to left...
  translation:
    fr: Coup droit
    en: Forehand cut
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

## 🔧 Personnalisation

### Ajouter un nouveau traité

1. Créer un fichier YAML dans `data/treatises/`
2. Suivre le schéma défini ci-dessus
3. Le système chargera automatiquement les données

### Ajouter des termes au glossaire

Éditer `data/glossary.yaml` et ajouter de nouvelles entrées selon le format.

## 📚 Technologies Utilisées

- **Next.js 15** - Framework React avec SSR
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **js-yaml** - Parser YAML
- **Lucide React** - Icônes modernes

## 📄 Licence

Projet académique pour l'étude des traités d'escrime historique.
