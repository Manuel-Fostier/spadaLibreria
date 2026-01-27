# Analyse des Fichiers Inutilisés - Spadalibreria

**Date d'analyse:** 2026-01-22  
**Branche:** current working branch  
**Analyseur:** GitHub Copilot Agent

---

## Résumé Exécutif

Cette analyse identifie les fichiers source qui ne sont pas utilisés dans le codebase actuel. Au total, **3 fichiers** ont été identifiés comme potentiellement inutilisés ou sous-utilisés.

---

## Fichiers Définitivement Inutilisés

### 1. `/spadalibreria/src/components/ComparisonModal.tsx` ⚠️

**Statut:** NON IMPORTÉ - Code mort

**Description:**  
Composant modal pour comparer les versions de texte (italien, français, anglais) avec segmentation intelligente.

**Raison:**
- Aucun fichier n'importe ce composant
- Le composant est complet et fonctionnel mais jamais utilisé
- Probablement développé pour une fonctionnalité qui n'a pas été intégrée

**Dépendances:**
- Importe `TextParser` (qui est utilisé ailleurs)
- Importe `Section` de `@/types/data`

**Recommandation:** **SUPPRIMER** sauf si réservé pour une fonctionnalité future

---

### 2. `/spadalibreria/src/types/llm.ts` ⚠️

**Statut:** NON IMPORTÉ - Infrastructure non utilisée

**Description:**  
Définitions de types TypeScript pour l'intégration d'un modèle de langage local (LLM).

**Types définis:**
- `LLMConfig`: Configuration du modèle LLM
- `LLMRequest`: Requêtes vers le LLM
- `LLMResponse`: Réponses du LLM
- `LLMConversation`: Historique de conversation
- `LLMError`: Gestion d'erreurs

**Raison:**
- Aucun service ou composant n'importe ces types
- Semble être une infrastructure préparée pour une fonctionnalité P4 planifiée (assistant LLM local)
- Code propre et bien structuré mais sans implémentation associée

**Recommandation:** **CONSERVER** si fonctionnalité LLM planifiée, sinon **SUPPRIMER**

---

## Fichiers Sous-Utilisés

### 3. `/spadalibreria/src/lib/localStorage.ts` ⚠️

**Statut:** DÉFINI MAIS NON UTILISÉ

**Description:**  
Utilitaire wrapper pour `localStorage` avec gestion d'erreurs, monitoring de quota, et logging.

**Fonctionnalités:**
- Gestion sécurisée des erreurs
- Monitoring de l'espace de stockage utilisé
- Support JSON automatique
- Logging détaillé des opérations

**Problème:**  
Le codebase utilise directement l'API `localStorage` du navigateur au lieu de cet utilitaire:
- Voir `BolognesePlatform.tsx` lignes 79-97
- Appels directs: `localStorage.getItem()`, `localStorage.setItem()`

**Avantages de l'utilitaire:**
- Meilleure gestion d'erreurs (quota exceeded, parse errors)
- Monitoring de l'utilisation du stockage
- Code plus maintenable

**Recommandation:** **REFACTORISER** - Remplacer les appels directs à `localStorage` par cet utilitaire

---

## Fichiers Actuellement Utilisés ✅

Les fichiers suivants sont **actifs et nécessaires:**

### Système d'annotations (ancien)
- ✅ `/src/lib/annotation.ts` - Point d'export principal pour types et constantes
  - Importé par: AnnotationContext, dataLoader, API routes, components

### Système d'annotations (nouveau - Architecture orientée objet)
- ✅ `/src/lib/annotation/Annotation.ts` - Classe de base abstraite
- ✅ `/src/lib/annotation/AnnotationRegistry.ts` - Pattern Factory/Registry
- ✅ `/src/lib/annotation/Weapons.ts` - Classe annotations armes
- ✅ `/src/lib/annotation/WeaponType.ts` - Classe type d'arme
- ✅ `/src/lib/annotation/Guards.ts` - Classe annotations gardes
- ✅ `/src/lib/annotation/Techniques.ts` - Classe annotations techniques
- ✅ `/src/lib/annotation/Measures.ts` - Classe annotations mesures
- ✅ `/src/lib/annotation/Strategy.ts` - Classe annotations stratégies
- ✅ `/src/lib/annotation/Strikes.ts` - Classe annotations frappes
- ✅ `/src/lib/annotation/Targets.ts` - Classe annotations cibles
- ✅ `/src/lib/annotation/index.ts` - Exports publics
  - Importé par: AnnotationDisplayContext, AnnotationPanel, ColorPicker, tests

### Contextes React
- ✅ `/src/contexts/AnnotationContext.tsx` - État des annotations
- ✅ `/src/contexts/AnnotationDisplayContext.tsx` - Configuration d'affichage
- ✅ `/src/contexts/SearchContext.tsx` - État de recherche

### Bibliothèques principales
- ✅ `/src/lib/searchEngine.ts` - Moteur de recherche
- ✅ `/src/lib/searchIndex.ts` - Index de recherche
- ✅ `/src/lib/dataLoader.ts` - Chargement données YAML
- ✅ `/src/lib/highlighter.ts` - Surlignage termes de recherche
- ✅ `/src/lib/termTypeMapping.ts` - Mapping types de termes

### Types TypeScript
- ✅ `/src/types/data.ts` - Types de données principales
- ✅ `/src/types/annotation.ts` - Types d'annotations
- ✅ `/src/types/search.ts` - Types de recherche
- ✅ `/src/types/annotationDisplay.ts` - Types d'affichage annotations

### Composants
- ✅ Tous les composants dans `/src/components/` sont utilisés SAUF `ComparisonModal.tsx`

---

## Actions Recommandées

### Priorité Haute
1. **Supprimer** `ComparisonModal.tsx` - Code mort confirmé
2. **Décider** pour `llm.ts` - Conserver si LLM prévu, sinon supprimer

### Priorité Moyenne
3. **Refactoriser** pour utiliser `localStorage.ts` au lieu d'appels directs

### Maintenance
4. Mettre à jour la documentation si des fichiers sont supprimés
5. Vérifier les imports dans `package.json` pour dépendances non utilisées

---

## Notes Méthodologiques

**Méthodologie d'analyse:**
1. Recherche de tous fichiers `.ts` et `.tsx` dans `/src`
2. Analyse des imports via `grep` pour identifier les dépendances
3. Vérification croisée des imports/exports
4. Examen du contexte d'utilisation dans le codebase

**Exclusions:**
- Fichiers de test (`__tests__/`, `*.test.ts`)
- Fichiers mock (`__mocks__/`)
- Fichiers de configuration (jest.config, setupTests)

**Limites:**
- L'analyse est basée sur les imports statiques
- Les imports dynamiques (ex: `import()`) peuvent ne pas être détectés
- Certains fichiers peuvent être réservés pour des fonctionnalités futures

---

## Conclusion

Le codebase est globalement bien entretenu. Les fichiers inutilisés identifiés sont:
- **1 composant** jamais intégré (ComparisonModal)
- **1 fichier de types** pour fonctionnalité non implémentée (llm.ts)  
- **1 utilitaire** défini mais contourné (localStorage.ts)

La suppression de ces fichiers réduira la dette technique et clarifiera le codebase sans impact sur les fonctionnalités actuelles.
