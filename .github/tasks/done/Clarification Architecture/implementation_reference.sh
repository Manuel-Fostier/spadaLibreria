#!/bin/bash
# Script d'implémentation - Clarification Architecture
# Ce script est fourni à titre de référence UNIQUEMENT
# NE PAS EXÉCUTER directement sans avoir vérifié chaque étape
# Suivre plutôt la CHECKLIST.md pour une approche contrôlée

set -e  # Arrêter en cas d'erreur

echo "=================================================="
echo "  Clarification Architecture - Script de Référence"
echo "=================================================="
echo ""
echo "⚠️  ATTENTION : Ce script est fourni à titre de RÉFÉRENCE"
echo "    Veuillez suivre CHECKLIST.md pour une implémentation contrôlée"
echo ""
echo "Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer..."
read

# Variables
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/spadalibreria/src"

echo ""
echo "🔍 Vérification de la structure actuelle..."

# Vérifier que les fichiers/dossiers existent
if [ ! -f "$SRC_DIR/lib/annotation.ts" ]; then
    echo "❌ Erreur : $SRC_DIR/lib/annotation.ts n'existe pas"
    exit 1
fi

if [ ! -d "$SRC_DIR/lib/annotation" ]; then
    echo "❌ Erreur : $SRC_DIR/lib/annotation/ n'existe pas"
    exit 1
fi

echo "✅ Structure actuelle vérifiée"

echo ""
echo "📝 Phase 1 : Sauvegarde (au cas où)"
echo "--------------------------------"
BACKUP_DIR="$REPO_ROOT/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$SRC_DIR/lib/annotation.ts" "$BACKUP_DIR/"
cp -r "$SRC_DIR/lib/annotation" "$BACKUP_DIR/"
cp -r "$SRC_DIR/types/annotation.ts" "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Sauvegarde créée dans : $BACKUP_DIR"

echo ""
echo "📝 Phase 2 : Renommages"
echo "--------------------------------"

echo "Renommage : annotation.ts → annotationTypes.ts"
git mv "$SRC_DIR/lib/annotation.ts" "$SRC_DIR/lib/annotationTypes.ts"

echo "Renommage : annotation/ → annotationClasses/"
git mv "$SRC_DIR/lib/annotation" "$SRC_DIR/lib/annotationClasses"

echo "✅ Renommages effectués"

echo ""
echo "📝 Phase 3 : Mise à jour des imports"
echo "--------------------------------"

# Liste des fichiers à modifier
FILES_TO_UPDATE=(
    "$SRC_DIR/types/data.ts"
    "$SRC_DIR/components/StatisticsModal.tsx"
    "$SRC_DIR/components/BolognesePlatform.tsx"
    "$SRC_DIR/components/AnnotationBadge.tsx"
    "$SRC_DIR/components/MeasureProgressBar.tsx"
    "$SRC_DIR/lib/dataLoader.ts"
    "$SRC_DIR/app/api/annotations/route.ts"
    "$SRC_DIR/components/ColorPicker.tsx"
    "$SRC_DIR/components/AnnotationDisplaySettings.tsx"
    "$SRC_DIR/components/AnnotationPanel.tsx"
    "$SRC_DIR/components/__tests__/ColorPicker.test.tsx"
)

for file in "${FILES_TO_UPDATE[@]}"; do
    if [ -f "$file" ]; then
        echo "  Mise à jour : $file"
        # Remplacer @/lib/annotation' par @/lib/annotationTypes'
        sed -i "s|@/lib/annotation'|@/lib/annotationTypes'|g" "$file"
        sed -i 's|@/lib/annotation"|@/lib/annotationTypes"|g' "$file"
        
        # Remplacer @/lib/annotation/ par @/lib/annotationClasses/
        sed -i 's|@/lib/annotation/|@/lib/annotationClasses/|g' "$file"
    else
        echo "  ⚠️  Fichier non trouvé : $file"
    fi
done

echo "✅ Imports mis à jour"

echo ""
echo "📝 Phase 4 : Suppression des fichiers redondants"
echo "--------------------------------"

if [ -f "$SRC_DIR/types/annotation.ts" ]; then
    echo "Suppression : types/annotation.ts"
    git rm "$SRC_DIR/types/annotation.ts"
fi

if [ -f "$SRC_DIR/components/MarkdownRenderer.tsx.bkp" ]; then
    echo "Suppression : MarkdownRenderer.tsx.bkp"
    git rm "$SRC_DIR/components/MarkdownRenderer.tsx.bkp"
fi

echo "✅ Fichiers redondants supprimés"

echo ""
echo "📝 Phase 5 : Vérifications"
echo "--------------------------------"

echo "Recherche d'imports manqués..."
MISSED_IMPORTS=$(grep -r "from '@/lib/annotation[^CT]" "$SRC_DIR" 2>/dev/null | grep -v "annotationClasses" | grep -v "annotationTypes" || true)

if [ -n "$MISSED_IMPORTS" ]; then
    echo "⚠️  Imports manqués détectés :"
    echo "$MISSED_IMPORTS"
    echo ""
    echo "Veuillez corriger ces imports manuellement"
else
    echo "✅ Aucun import manqué détecté"
fi

echo ""
echo "📝 Phase 6 : Compilation (vérification)"
echo "--------------------------------"

cd "$REPO_ROOT/spadalibreria"

echo "Installation des dépendances (si nécessaire)..."
npm install

echo "Compilation TypeScript..."
if npm run build; then
    echo "✅ Compilation réussie"
else
    echo "❌ Erreur de compilation"
    echo "Veuillez corriger les erreurs avant de continuer"
    exit 1
fi

echo ""
echo "=================================================="
echo "  ✅ Implémentation terminée avec succès !"
echo "=================================================="
echo ""
echo "Prochaines étapes :"
echo "1. Lancer les tests : npm run test"
echo "2. Lancer le linter : npm run lint"
echo "3. Vérifier manuellement : npm run dev"
echo "4. Mettre à jour la documentation"
echo "5. Créer les commits"
echo ""
echo "Sauvegarde disponible dans : $BACKUP_DIR"
echo ""
