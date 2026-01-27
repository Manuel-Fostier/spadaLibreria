# Checklist d'Implémentation - Clarification Architecture

## Phase 1 : Préparation ✅

- [x] Analyser l'architecture actuelle
- [x] Identifier les confusions
- [x] Créer le document d'analyse
- [ ] Valider l'approche avec l'équipe
- [ ] Créer une issue/branche dédiée si nécessaire

## Phase 2 : Renommages

### 2.1 Renommer le Fichier de Types

- [x] Vérifier que le fichier existe : `src/lib/annotation.ts`
- [x] Renommer : `git mv spadalibreria/src/lib/annotation.ts spadalibreria/src/lib/annotationTypes.ts`
- [x] Vérifier le renommage : `git status`

### 2.2 Renommer le Dossier de Classes

- [x] Vérifier que le dossier existe : `src/lib/annotation/`
- [x] Renommer : `git mv spadalibreria/src/lib/annotation spadalibreria/src/lib/annotationClasses`
- [x] Vérifier le renommage : `git status`

### 2.3 Mettre à Jour les Imports

#### Imports depuis `@/lib/annotation` → `@/lib/annotationTypes`

- [x] `src/types/data.ts`
- [x] `src/components/StatisticsModal.tsx`
- [x] `src/components/BolognesePlatform.tsx`
- [x] `src/components/AnnotationBadge.tsx`
- [x] `src/components/MeasureProgressBar.tsx`
- [x] `src/lib/dataLoader.ts`
- [x] `src/app/api/annotations/route.ts`

#### Imports depuis `@/lib/annotation/` → `@/lib/annotationClasses/`

- [x] `src/components/ColorPicker.tsx`
- [x] `src/components/AnnotationDisplaySettings.tsx`
- [x] `src/components/AnnotationPanel.tsx`
- [x] `src/components/__tests__/ColorPicker.test.tsx`

#### Vérification Exhaustive

- [x] Rechercher tous les imports restants : `grep -r "from '@/lib/annotation'" src/`
- [x] Vérifier qu'il n'y a plus de références à l'ancien chemin

### 2.4 Supprimer le Fichier Redondant

- [x] Vérifier le contenu de `src/types/annotation.ts` (doit être juste un ré-export)
- [x] Supprimer : `git rm spadalibreria/src/types/annotation.ts`
- [x] Mettre à jour les imports qui utilisaient ce fichier (si nécessaire)

### 2.5 Nettoyer les Fichiers de Backup

- [x] Vérifier : `src/components/MarkdownRenderer.tsx.bkp`
- [x] **Option A** : Supprimer définitivement
  - [x] `git rm spadalibreria/src/components/MarkdownRenderer.tsx.bkp`
- [ ] **Option B** : Ignorer dans Git
  - [ ] Ajouter `*.bkp` à `.gitignore`
  - [ ] `git rm --cached spadalibreria/src/components/MarkdownRenderer.tsx.bkp`

## Phase 3 : Mise à Jour Documentation

### 3.1 Mettre à Jour `docs/ARCHITECTURE.md`

- [ ] Section "Architecture des Annotations (Classes)" : Mettre à jour les chemins
  - `lib/annotation.ts` → `lib/annotationTypes.ts`
  - `lib/annotation/` → `lib/annotationClasses/`
- [ ] Section "Contextes React" : Vérifier les références
- [ ] Section "Routes API" : Vérifier les exemples de code
- [ ] Rechercher toutes les occurrences : `grep -n "lib/annotation" docs/ARCHITECTURE.md`

### 3.2 Mettre à Jour Autres Documentations

- [ ] Vérifier `README.md` (si nécessaire)
- [ ] Vérifier les fichiers dans `specs/` (si des références existent)
- [ ] Mettre à jour les commentaires dans le code source

### 3.3 Mettre à Jour l'Instruction Copilot

- [ ] Ouvrir `.github/copilot-instructions.md` (s'il existe)
- [ ] Mettre à jour les références aux chemins
- [ ] Documenter la nouvelle structure

## Phase 4 : Vérifications

### 4.1 Compilation TypeScript

- [ ] Nettoyer le build : `cd spadalibreria && npm run clean` (si disponible)
- [x] Compiler : `cd spadalibreria && npm run build`
- [x] Vérifier qu'il n'y a **aucune erreur** de compilation
- [x] Noter toute erreur trouvée et la corriger

### 4.2 Linting

- [x] Lancer ESLint : `cd spadalibreria && npm run lint`
- [x] Corriger les erreurs de linting si nécessaire (erreurs pré-existantes, aucune nouvelle)

### 4.3 Tests Unitaires

- [x] Lancer les tests : `cd spadalibreria && npm run test`
- [x] Vérifier que tous les tests passent (36 tests, 4 test suites)
- [x] Corriger les tests cassés (chemins d'import, mocks, etc.) - aucun cassé

### 4.4 Vérification Manuelle

- [x] Démarrer le serveur : `cd spadalibreria && npm run dev`
- [x] Ouvrir l'application : http://localhost:3000
- [ ] Tester les fonctionnalités d'annotation :
  - [x] Affichage des annotations dans les sections
  - [x] Édition d'une annotation
  - [x] Sauvegarde d'une annotation
  - [x] Filtrage par annotations
- [x] Tester les tooltips de glossaire
- [x] Tester la recherche
- [ ] Vérifier la console du navigateur (pas d'erreurs)

### 4.5 Vérification des Imports

- [x] Rechercher les anciens chemins : `grep -r "@/lib/annotation[^CT]" src/`
  (le `[^CT]` exclut annotationClasses et annotationTypes)
- [x] S'assurer qu'aucun résultat n'est trouvé (0 résultats)

## Phase 5 : Finalisation

### 5.1 Revue du Code

- [ ] Vérifier tous les fichiers modifiés : `git status`
- [ ] Vérifier les diff : `git diff`
- [ ] S'assurer qu'aucun changement non intentionnel n'a été fait

### 5.2 Commits

- [ ] Commit 1 : Renommage des fichiers/dossiers
  ```bash
  git add -A
  git commit -m "refactor: renommer annotation.ts → annotationTypes.ts et annotation/ → annotationClasses/"
  ```
- [ ] Commit 2 : Mise à jour des imports
  ```bash
  git add -A
  git commit -m "refactor: mettre à jour les imports après renommage annotation"
  ```
- [ ] Commit 3 : Suppression des fichiers redondants
  ```bash
  git add -A
  git commit -m "chore: supprimer types/annotation.ts redondant et fichiers backup"
  ```
- [ ] Commit 4 : Mise à jour documentation
  ```bash
  git add -A
  git commit -m "docs: mettre à jour la documentation après clarification architecture"
  ```

### 5.3 Tests Finaux

- [ ] Pull request / Merge request créée
- [ ] CI/CD passe (si configuré)
- [ ] Review du code par un autre développeur (si applicable)
- [ ] Tests d'intégration (si disponibles)

### 5.4 Merge et Déploiement

- [ ] Merge dans la branche principale
- [ ] Tag de version (si applicable)
- [ ] Déploiement (si applicable)
- [ ] Notification aux contributeurs

## 📝 Notes et Observations

_Utiliser cette section pour noter tout problème, question ou observation pendant l'implémentation._

---

**Début** : ___________  
**Fin** : ___________  
**Responsable** : ___________

## ⚠️ Problèmes Rencontrés

_Documenter ici tout problème rencontré et sa résolution._

| Problème | Solution | Statut |
|----------|----------|--------|
|          |          |        |
