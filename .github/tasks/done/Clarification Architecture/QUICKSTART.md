# Guide de Démarrage Rapide - Clarification Architecture

## 🎯 En 30 Secondes

**Problème** : Confusion entre `annotation.ts` (fichier) et `annotation/` (dossier)  
**Solution** : Renommer en `annotationTypes.ts` et `annotationClasses/`  
**Documents** : Tous dans le dossier `analysed/`

## 📚 Par Où Commencer ?

### 1️⃣ Vous êtes décideur (5 min)
→ Lire `analysed/RESUME.md`  
→ Valider l'approche

### 2️⃣ Vous êtes développeur qui va implémenter (30 min)
→ Lire `analysed/ARCHITECTURE_CLARIFICATION.md`  
→ Consulter `analysed/DIAGRAMS.md`  
→ Préparer l'implémentation avec `analysed/CHECKLIST.md`

### 3️⃣ Vous voulez juste comprendre la structure (10 min)
→ Voir `analysed/DIAGRAMS.md`  
→ Lire `analysed/RESUME.md`

## 🚀 Implémentation en 5 Étapes

### Étape 1 : Préparation
```bash
# Créer une branche (si pas déjà fait)
git checkout -b clarify-annotations-structure

# Sauvegarder (optionnel mais recommandé)
cp -r spadalibreria/src/lib/annotation.ts backup/
cp -r spadalibreria/src/lib/annotation backup/
```

### Étape 2 : Renommages
```bash
cd spadalibreria/src

# Renommer le fichier
git mv lib/annotation.ts lib/annotationTypes.ts

# Renommer le dossier
git mv lib/annotation lib/annotationClasses
```

### Étape 3 : Imports (~14 fichiers)
Suivre la liste détaillée dans `CHECKLIST.md`

Ou utiliser sed/find-replace :
```bash
# Dans tous les fichiers .ts/.tsx
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|@/lib/annotation|@/lib/annotationTypes|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|@/lib/annotation/|@/lib/annotationClasses/|g' {} +
```

### Étape 4 : Nettoyage
```bash
# Supprimer fichier redondant
git rm src/types/annotation.ts

# Supprimer backup
git rm src/components/MarkdownRenderer.tsx.bkp
```

### Étape 5 : Vérification
```bash
cd spadalibreria

# Compiler
npm run build

# Tests
npm run test

# Linter
npm run lint

# Vérif manuelle
npm run dev
# Ouvrir http://localhost:3000 et tester les annotations
```

## ✅ Checklist Rapide

- [ ] Renommer `annotation.ts` → `annotationTypes.ts`
- [ ] Renommer `annotation/` → `annotationClasses/`
- [ ] Mettre à jour ~14 imports
- [ ] Supprimer `types/annotation.ts`
- [ ] Supprimer `*.bkp`
- [ ] Compiler sans erreur
- [ ] Tests passent
- [ ] Linter OK
- [ ] Test manuel OK
- [ ] Mettre à jour `docs/ARCHITECTURE.md`
- [ ] Commit et push

## ⚠️ Pièges à Éviter

1. **Ne pas oublier** les imports dans les tests (`__tests__/`)
2. **Vérifier** que l'IDE n'a pas laissé d'anciens imports cachés
3. **Ne pas confondre** `annotationTypes` et `annotationClasses`
4. **Tester manuellement** les annotations après changements
5. **Mettre à jour** la doc (`docs/ARCHITECTURE.md`)

## 🔧 En Cas de Problème

### Erreur de compilation
→ Vérifier qu'il n'y a pas d'imports manqués :
```bash
grep -r "from '@/lib/annotation[^CT]" src/
```

### Tests cassés
→ Vérifier les mocks dans `__tests__/__mocks__/`

### Application ne démarre pas
→ Nettoyer et rebuilder :
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Revenir en arrière
```bash
git reset --hard HEAD~N  # N = nombre de commits à annuler
```

## 📖 Documentation Complète

Pour tous les détails, voir :

| Document | Contenu | Temps |
|----------|---------|-------|
| `RESUME.md` | Vue d'ensemble | 5 min |
| `ARCHITECTURE_CLARIFICATION.md` | Analyse complète | 20 min |
| `DIAGRAMS.md` | Diagrammes visuels | 5 min |
| `CHECKLIST.md` | Guide étape par étape | Variable |
| `implementation_reference.sh` | Script automatique | - |

## 💡 Astuce

Utiliser l'IDE pour aider :
1. Renommer avec `git mv` (pas dans l'IDE)
2. Ouvrir le projet dans l'IDE
3. L'IDE détectera les imports cassés
4. Utiliser "Fix all imports" automatiquement

## ✨ Après l'Implémentation

1. Mettre à jour cette issue avec les résultats
2. Documenter tout problème rencontré
3. Améliorer la checklist si nécessaire
4. Célébrer une architecture plus claire ! 🎉

---

**Créé** : 2026-01-22  
**Status** : Prêt pour implémentation
