Spécifications Techniques : Architecture des Données & Externalisation

Ce document définit la nouvelle structure de données pour la plateforme "Spada Libreria". L'objectif est de séparer totalement le contenu du code pour faciliter la maintenance par des non-développeurs.

1. Choix du Format : YAML

Le format YAML est retenu pour stocker les traités et le glossaire.
Pourquoi ? Contrairement au JSON (trop strict sur la syntaxe) ou au Markdown pur (difficile à structurer pour des données complexes), le YAML gère parfaitement les blocs de texte multi-lignes, les listes imbriquées et reste très lisible visuellement.

2. Schéma du Glossaire (Fichier Externe)

Fichier : `data/glossary.yaml`

Le glossaire est centralisé. La clé est le terme italien (invariable). Il n'y a plus de champ "traduction italienne".

Structure YAML
```
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

coda_lunga:
  term: Coda Lunga
  type: Garde
  definition:
    fr: |
      Garde où l'épée est tenue à l'extérieur droit, la pointe dirigée vers le sol ou vers l'arrière.
    en: |
      Guard where the sword is held to the outside right, point directed towards the ground or to the rear.
  translation:
    fr: Queue longue
    en: Long tail
```

3. Schéma des Traités (Fichiers Externes)

Fichier : `data/treatises/marozzo_book1.yaml`

Chaque livre ou chapitre est un fichier. La structure supporte désormais plusieurs traductions anglaises pour une même section (ex: Swanger vs. Jherek).

Structure YAML
```
- id: marozzo_l1_c1
  title: Capitolo 1 : Della guardia di Coda Longa
  metadata:
    master: marozzo
    weapons: [spada_brocchiero]
  content:
    it: |
      Et nota che in questo mio principio io ti voglio mettere in guardia di {coda_lunga} stretta...
    fr: |
      Et note qu'en ce début, je veux te placer en garde de {coda_lunga} étroite...
    en_versions:
      - translator: "Jherek Swanger"
        text: |
          And note that in this beginning of mine, I want to put you in the guard of narrow {coda_lunga}...
      - translator: "W. Gauthier"
        text: |
          Note that to start, I wish to place you in the strait {coda_lunga} guard...
```

4. Pipeline d'Importation (Logique Back-End)

Dans l'application réelle (ex: Next.js ou Node.js), le processus sera le suivant :

Lecture : Le serveur lit les fichiers .yaml dans le dossier /data.

Parsing : Une librairie comme js-yaml convertit le YAML en objets JSON.

Enrichissement : Le moteur croise les textes avec les clés du glossaire pour préparer les tooltips.

API : Le Frontend reçoit un JSON propre et structuré.