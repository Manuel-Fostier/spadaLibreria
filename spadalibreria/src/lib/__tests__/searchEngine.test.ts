import { createSearchQuery, executeSearch } from '../searchEngine';
import { buildSearchIndex } from '../searchIndex';
import { SearchIndex, SearchOptions } from '@/types/search';
import { TreatiseSection, GlossaryData } from '@/types/data';

// Mock treatise data for testing
const mockTreatises: TreatiseSection[] = [
  {
    id: 'test_section_1',
    title: 'Test Chapter 1',
    metadata: {
      master: 'Test Master',
      work: 'Test Work',
      book: 1,
      chapter: 1,
      year: 1536
    },
    content: {
      it: 'La guardia di coda lunga e stretta è molto importante. Il mandritto fendente colpisce la testa.',
      fr: 'La garde de queue longue et étroite est très importante. Le coup droit fendant frappe la tête.',
      en_versions: [
        {
          translator: 'Test Translator',
          text: 'The long and narrow tail guard is very important. The forehand descending cut strikes the head.'
        }
      ]
    }
  },
  {
    id: 'test_section_2',
    title: 'Test Chapter 2',
    metadata: {
      master: 'Test Master',
      work: 'Test Work',
      book: 1,
      chapter: 2,
      year: 1536
    },
    content: {
      it: 'La coda longa alta deve essere usata con attenzione. Il mandritti sono colpi potenti.',
      fr: 'La queue longue haute doit être utilisée avec attention. Les coups droits sont des frappes puissantes.',
      en_versions: [
        {
          translator: 'Test Translator',
          text: 'The high long tail must be used with care. The forehand cuts are powerful strikes.'
        }
      ]
    }
  },
  {
    id: 'test_section_3',
    title: 'Test Chapter 3',
    metadata: {
      master: 'Test Master',
      work: 'Test Work',
      book: 1,
      chapter: 3,
      year: 1536
    },
    content: {
      it: 'Il taglio riverso protegge il fianco.',
      fr: 'La coupe revers protège le flanc.',
      en_versions: [
        {
          translator: 'Test Translator',
          text: 'The backhand cut protects the flank.'
        }
      ]
    }
  }
];

const mockGlossary: GlossaryData = {
  coda_lunga: {
    term: 'Coda Lunga',
    type: 'Guards',
    definition: {
      fr: 'Garde de queue longue',
      en: 'Long tail guard'
    },
    translation: {
      fr: 'queue longue',
      en: 'long tail'
    }
  },
  mandritto: {
    term: 'Mandritto',
    type: 'Strikes',
    definition: {
      fr: 'Coup droit',
      en: 'Forehand cut'
    },
    translation: {
      fr: 'coup droit',
      en: 'forehand'
    }
  }
};

describe('performSearch (executeSearch + createSearchQuery)', () => {
  let searchIndex: SearchIndex;

  beforeAll(() => {
    searchIndex = buildSearchIndex(mockTreatises, mockGlossary);
  });

  describe('Basic text search', () => {
    it('should find basic text matches in Italian', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('coda', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      expect(results.totalMatches).toBeGreaterThan(0);
      expect(results.results[0].preview).toContain('coda');
    });

    it('should be case-insensitive by default', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('CODA', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      expect(results.totalMatches).toBeGreaterThan(0);
    });

    it('should respect case-sensitive search', () => {
      const options: SearchOptions = {
        matchCase: true,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const queryLower = createSearchQuery('coda', options, searchIndex);
      const resultsLower = executeSearch(searchIndex, queryLower);
      expect(resultsLower.results.length).toBeGreaterThan(0);

      const queryUpper = createSearchQuery('CODA', options, searchIndex);
      const resultsUpper = executeSearch(searchIndex, queryUpper);
      expect(resultsUpper.results.length).toBe(0);
    });

    it('should match whole words when enabled', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: true,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('coda', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      // Should match "coda" but not partial words
      results.results.forEach(result => {
        expect(result.preview).toMatch(/\bcoda\b/i);
      });
    });
  });

  describe('Regex search', () => {
    it('should support basic regex patterns', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: true,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('coda.*lunga', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      expect(results.results[0].preview.toLowerCase()).toMatch(/coda.*lunga/);
    });

    it('should match "coda lunga" OR "coda longa" with character class [ou]', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: true,
        includeVariants: false,
        includeCrossLanguage: false
      };

      // Regex to match both "lunga" and "longa"
      const query = createSearchQuery('coda l[ou]nga', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      
      // Should match both variations
      const allPreviews = results.results.map(r => r.preview.toLowerCase()).join(' ');
      const hasLunga = allPreviews.includes('lunga');
      const hasLonga = allPreviews.includes('longa');
      
      expect(hasLunga || hasLonga).toBe(true);
    });

    it('should support alternation with | operator', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: true,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('lunga|longa', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
    });

    it('should support word boundaries in regex', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: true,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('\\bcoda\\b', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
    });

    it('should handle invalid regex gracefully', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: true,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('[invalid(regex', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      // Should not throw error and return empty results
      expect(results.results.length).toBe(0);
    });
  });

  describe('Variant search', () => {
    it('should find variants when enabled', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: true,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('mandritto', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      expect(query.variants).toContain('mandritti'); // Plural form
    });

    it('should not include variants when disabled', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('mandritto', options, searchIndex);
      
      expect(query.variants.length).toBe(0);
    });
  });

  describe('Cross-language search', () => {
    it('should find cross-language matches when enabled', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: true,
        languages: ['it', 'fr', 'en']
      };

      // Search for Italian term, should also find French/English equivalents
      const query = createSearchQuery('coda_lunga', options, searchIndex);
      
      expect(query.languageMappings.fr.length).toBeGreaterThan(0);
      expect(query.languageMappings.en.length).toBeGreaterThan(0);
    });

    it('should not include cross-language when disabled', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('coda_lunga', options, searchIndex);
      
      expect(query.languageMappings.fr.length).toBe(0);
      expect(query.languageMappings.en.length).toBe(0);
    });
  });

  describe('Language filtering', () => {
    it('should filter by specific languages', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false,
        languages: ['it'] // Only Italian
      };

      const query = createSearchQuery('coda', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      results.results.forEach(result => {
        expect(result.languages).toContain('it');
        expect(result.languages.length).toBe(1);
      });
    });

    it('should search all languages when not specified', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('guard', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      // "guard" appears in English
      const hasEnglish = results.results.some(r => r.languages.includes('en'));
      expect(hasEnglish).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty search text', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBe(0);
      expect(results.totalMatches).toBe(0);
    });

    it('should handle non-existent terms', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('xyznonexistent', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBe(0);
      expect(results.totalMatches).toBe(0);
    });

    it('should measure execution time', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('coda', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.executionTimeMs).toBeGreaterThan(0);
      expect(results.executionTimeMs).toBeLessThan(1000); // Should be fast
    });
  });

  describe('Result structure', () => {
    it('should include all required fields in results', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('coda', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      
      const firstResult = results.results[0];
      expect(firstResult).toHaveProperty('chapterReference');
      expect(firstResult).toHaveProperty('treatiseTitle');
      expect(firstResult).toHaveProperty('chapterTitle');
      expect(firstResult).toHaveProperty('matchCount');
      expect(firstResult).toHaveProperty('languages');
      expect(firstResult).toHaveProperty('preview');
      expect(firstResult).toHaveProperty('highlightPositions');
      
      expect(firstResult.matchCount).toBeGreaterThan(0);
      expect(Array.isArray(firstResult.languages)).toBe(true);
      expect(Array.isArray(firstResult.highlightPositions)).toBe(true);
    });

    it('should generate meaningful preview text', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: false,
        includeVariants: false,
        includeCrossLanguage: false
      };

      const query = createSearchQuery('coda lunga', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      
      const firstResult = results.results[0];
      expect(firstResult.preview).toBeTruthy();
      expect(firstResult.preview.length).toBeGreaterThan(0);
      expect(firstResult.preview.toLowerCase()).toContain('coda');
    });
  });
});
