import { TreatiseSection, GlossaryData } from '@/types/data';
import { SearchIndex, IndexedChapter, CrossLanguageTerms, Language } from '@/types/search';

/**
 * Expands glossary term syntax {term_key} to display text from glossary
 * Example: "{coda_longa_stretta}" → "Coda Longa e Stretta"
 * 
 * This ensures the search index contains the same text that users see in the UI.
 */
function expandGlossaryTerms(text: string, glossary: GlossaryData): string {
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const entry = glossary[key];
    // If glossary entry exists, replace with display term; otherwise keep original
    return entry && entry.term ? entry.term : match;
  });
}

/**
 * Builds an in-memory search index from treatise data and glossary
 * This is a synchronous operation that should be run once on app load
 * 
 * @param treatises List of all treatise sections
 * @param glossary Glossary data for cross-language mapping
 * @returns Complete SearchIndex
 */
export function buildSearchIndex(treatises: TreatiseSection[], glossary: GlossaryData): SearchIndex {
  const chapters = new Map<string, IndexedChapter>();
  const termIndex = new Map<string, Set<string>>();
  const glossaryIndex = new Map<string, CrossLanguageTerms>();

  // 1. Index Glossary for cross-language lookups
  Object.entries(glossary).forEach(([key, entry]) => {
    const equivalents: Record<Language, string[]> = {
      it: [entry.term], // The key is usually the Italian term ID, but entry.term is the display term
      fr: entry.translation.fr ? [entry.translation.fr] : [],
      en: entry.translation.en ? [entry.translation.en] : []
    };
    
    // Add definition text to equivalents? No, usually we search for terms.
    // But maybe we want to find the term if the user searches for a word in the definition?
    // For now, let's stick to the term and translations.

    glossaryIndex.set(key.toLowerCase(), {
      source: key,
      equivalents
    });
  });

  // 2. Index Treatises
  treatises.forEach(section => {
    // Create stable reference
    // We need the filename. But TreatiseSection doesn't have filename directly?
    // It has metadata.work, metadata.master.
    // The ID is unique per treatise usually.
    // Wait, ChapterReference needs `treatiseFile`.
    // The `loadAllTreatises` function in dataLoader reads from files but returns a flat array of sections.
    // It doesn't seem to preserve the filename in the section object explicitly unless `id` contains it or we change dataLoader.
    // Let's check dataLoader again.
    
    // In dataLoader.ts:
    // const sections = yaml.load(fileContents) as TreatiseSection[];
    // It doesn't add filename to the section.
    // However, the ID usually looks like "marozzo_l1_c1".
    // Maybe we can use a derived ID or we need to update dataLoader to include filename.
    // For now, let's assume we can derive a unique ID or use the section ID as the key.
    // The `ChapterReference` interface has `treatiseFile` and `chapterId`.
    // If we can't get `treatiseFile`, we might need to adjust `ChapterReference` or `dataLoader`.
    
    // Let's look at `dataLoader.ts` again.
    // It reads files and concatenates sections.
    // It does NOT inject the filename.
    
    // I should probably update `dataLoader.ts` to inject the filename or some identifier.
    // Or I can just use the section `id` as the unique key if it is globally unique.
    // The `ChapterReference` requires `treatiseFile`.
    
    // Let's assume for now I can use a placeholder or modify dataLoader.
    // Modifying dataLoader is safer.
    
    // But wait, I am in `src/lib/searchIndex.ts`.
    // I will assume `treatiseFile` is available or I will use `metadata.work` as a proxy if unique enough.
    // Actually, `id` should be unique.
    // Let's check `ChapterReference` definition again.
    // export interface ChapterReference { treatiseFile: string; chapterId: string; }
    
    // If I can't change dataLoader right now (I can, but I want to minimize changes), 
    // I will use `metadata.work` or `metadata.master` to construct a "virtual" filename or just use the ID.
    // But `ChapterReference` is used to link back.
    
    // Let's update `dataLoader.ts` to include `fileName` in `TreatiseSection`.
    // This is a small change and very useful.
    
    // But first, let's write the indexer assuming the property exists or using a fallback.
    
    const treatiseFile = section.metadata.work || 'unknown'; // Fallback
    const chapterId = section.id;
    const refKey = `${treatiseFile}:${chapterId}`; // Internal key for the map

    // Expand glossary terms in content before indexing
    const content: Record<Language, string> = {
      it: expandGlossaryTerms(section.content.it || '', glossary),
      fr: expandGlossaryTerms(section.content.fr || '', glossary),
      en: expandGlossaryTerms(section.content.en_versions?.map(v => v.text).join(' ') || '', glossary)
    };

    const fullText = [content.it, content.fr, content.en].join(' ').toLowerCase();

    const indexedChapter: IndexedChapter = {
      reference: {
        treatiseFile,
        chapterId
      },
      title: section.title,
      treatiseTitle: section.metadata.work,
      content,
      fullText
    };

    chapters.set(refKey, indexedChapter);

    // Simple term indexing (naive split by space)
    // For a real search we might want a better tokenizer, but for now:
    const words = fullText.split(/\W+/).filter(w => w.length > 2);
    words.forEach(word => {
      if (!termIndex.has(word)) {
        termIndex.set(word, new Set());
      }
      termIndex.get(word)?.add(refKey);
    });
  });

  return {
    chapters,
    termIndex,
    glossaryIndex,
    builtAt: new Date()
  };
}
