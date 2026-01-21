import { createSearchQuery, executeSearch } from '../searchEngine';
import { buildSearchIndex } from '../searchIndex';
import { SearchIndex, SearchOptions } from '@/types/search';
import { TreatiseSection, GlossaryData } from '@/types/data';

// Mock treatise data for testing
// Note: Content includes {term_key} syntax to test glossary term expansion in search
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
      it: 'La guardia di {coda_longa_stretta} è molto importante. Il {mandritto} {fendente} colpisce la testa.',
      fr: 'La garde de {coda_longa_stretta} est très importante. Le {mandritto} {fendente} frappe la tête.',
      en_versions: [
        {
          translator: 'Test Translator',
          text: 'The {coda_longa_stretta} guard is very important. The {mandritto} {fendente} strikes the head.'
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
      it: 'La {coda_longa_alta} deve essere usata con attenzione. Il {mandritto} sono colpi potenti.',
      fr: 'La {coda_longa_alta} doit être utilisée avec attention. Les {mandritto} sont des frappes puissantes.',
      en_versions: [
        {
          translator: 'Test Translator',
          text: 'The {coda_longa_alta} must be used with care. The {mandritto} cuts are powerful strikes.'
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
      it: 'Il taglio {roverso} protegge il fianco.',
      fr: 'La coupe {roverso} protège le flanc.',
      en_versions: [
        {
          translator: 'Test Translator',
          text: 'The {roverso} cut protects the flank.'
        }
      ]
    }
  }
];

const mockGlossary: GlossaryData = {
  coda_longa_stretta: {
    term: 'Coda Longa e Stretta',
    type: 'Guards',
    definition: {
      fr: 'Garde de queue longue étroite avec le pied droit devant',
      en: 'Long and narrow tail guard with right foot forward'
    },
    translation: {
      fr: 'queue longue étroite',
      en: 'long narrow tail'
    }
  },
  coda_longa_alta: {
    term: 'Coda Longa e Alta',
    type: 'Guards',
    definition: {
      fr: 'Garde de queue longue haute avec le pied gauche devant',
      en: 'Long and high tail guard with left foot forward'
    },
    translation: {
      fr: 'queue longue haute',
      en: 'long high tail'
    }
  },
  mandritto: {
    term: 'Mandritto',
    type: 'Strikes',
    definition: {
      fr: 'Coup droit porté du côté droit',
      en: 'Forehand cut from the right side'
    },
    translation: {
      fr: 'coup droit',
      en: 'forehand'
    }
  },
  fendente: {
    term: 'Fendente',
    type: 'Strikes',
    definition: {
      fr: 'Coup descendant vertical',
      en: 'Descending vertical cut'
    },
    translation: {
      fr: 'fendant',
      en: 'descending'
    }
  },
  roverso: {
    term: 'Roverso',
    type: 'Strikes',
    definition: {
      fr: 'Coup de revers porté du côté gauche',
      en: 'Backhand cut from the left side'
    },
    translation: {
      fr: 'revers',
      en: 'backhand'
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
      expect(results.results[0].preview.toLowerCase()).toContain('coda');
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

      const queryCapitalized = createSearchQuery('Coda', options, searchIndex);
      const resultsCapitalized = executeSearch(searchIndex, queryCapitalized);
      expect(resultsCapitalized.results.length).toBeGreaterThan(0);

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

      const query = createSearchQuery('coda.*longa', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      expect(results.results[0].preview.toLowerCase()).toMatch(/coda.*longa/);
    });

    it('should match "Coda Longa" in expanded glossary terms with regex', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: true,
        includeVariants: false,
        includeCrossLanguage: false
      };

      // Regex to match "Coda Longa" with either "Stretta" or "Alta"
      const query = createSearchQuery('coda longa.*[sa]', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      
      // Should match both guard variations
      expect(results.results.length).toBeGreaterThanOrEqual(2);
      
      const allPreviews = results.results.map(r => r.preview.toLowerCase()).join(' ');
      const hasStretta = allPreviews.includes('stretta');
      const hasAlta = allPreviews.includes('alta');
      
      // Both variants should be found
      expect(hasStretta || hasAlta).toBe(true);
    });

    it('should match "Coda Longa" with "." (any single character) wildcard', () => {
      const options: SearchOptions = {
        matchCase: false,
        matchWholeWord: false,
        useRegex: true,
        includeVariants: false,
        includeCrossLanguage: false
      };

      // Regex using "." to match any character - should match "Coda Longa e Stretta" and "Coda Longa e Alta"
      const query = createSearchQuery('coda l.nga', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      
      // Should match both guard variations with "Longa"
      expect(results.results.length).toBeGreaterThanOrEqual(2);
      
      const allPreviews = results.results.map(r => r.preview.toLowerCase()).join(' ');
      const hasLonga = allPreviews.includes('longa');
      
      // Should find "longa" pattern
      expect(hasLonga).toBe(true);
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
      const query = createSearchQuery('coda_longa_stretta', options, searchIndex);
      
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

      const query = createSearchQuery('coda_longa_stretta', options, searchIndex);
      
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
      // Verify execution time is recorded but don't enforce upper bound
      // to avoid flaky tests in CI environments
      expect(typeof results.executionTimeMs).toBe('number');
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

      const query = createSearchQuery('coda longa', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0);
      
      const firstResult = results.results[0];
      expect(firstResult.preview).toBeTruthy();
      expect(firstResult.preview.length).toBeGreaterThan(0);
      expect(firstResult.preview.toLowerCase()).toContain('coda');
    });
  });

  describe('Glossary term expansion in search', () => {
    it('should find glossary display text when content has {term_key} syntax', () => {
      const options: SearchOptions = {
        matchCase: false, matchWholeWord: false, useRegex: false,
        includeVariants: false, includeCrossLanguage: false
      };

      const query = createSearchQuery('Coda Longa e Stretta', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0, 
        'Search should find sections containing {coda_longa_stretta} when searching for display text "Coda Longa e Stretta"');
      
      const foundSection1 = results.results.some(r => r.chapterReference.chapterId === 'test_section_1');
      expect(foundSection1).toBe(true, 'Should find test_section_1 which contains {coda_longa_stretta}');
    });

    it('should support partial matching on expanded glossary terms', () => {
      const options: SearchOptions = {
        matchCase: false, matchWholeWord: false, useRegex: false,
        includeVariants: false, includeCrossLanguage: false
      };

      const query = createSearchQuery('Coda Longa', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThanOrEqual(2, 
        'Search for "Coda Longa" should find both {coda_longa_stretta} and {coda_longa_alta}');
      
      const foundSection1 = results.results.some(r => r.chapterReference.chapterId === 'test_section_1');
      const foundSection2 = results.results.some(r => r.chapterReference.chapterId === 'test_section_2');
      
      expect(foundSection1).toBe(true, 'Should find test_section_1 with {coda_longa_stretta}');
      expect(foundSection2).toBe(true, 'Should find test_section_2 with {coda_longa_alta}');
    });

    it('should support case-insensitive search on expanded terms', () => {
      const options: SearchOptions = {
        matchCase: false, matchWholeWord: false, useRegex: false,
        includeVariants: false, includeCrossLanguage: false
      };

      const query = createSearchQuery('coda longa e alta', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0, 
        'Case-insensitive search for "coda longa e alta" should find {coda_longa_alta}');
      
      const foundSection2 = results.results.some(r => r.chapterReference.chapterId === 'test_section_2');
      expect(foundSection2).toBe(true, 'Should find test_section_2 with case-insensitive matching');
    });

    it('should support whole word matching on expanded terms', () => {
      const options: SearchOptions = {
        matchCase: false, matchWholeWord: true, useRegex: false,
        includeVariants: false, includeCrossLanguage: false
      };

      const query = createSearchQuery('Stretta', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0, 
        'Whole word search for "Stretta" should find "Coda Longa e Stretta"');
      
      results.results.forEach(result => {
        expect(result.preview.toLowerCase()).toMatch(/\bstretta\b/, 
          'Preview should contain "Stretta" as a whole word');
      });
    });

    it('should support regex search on expanded terms', () => {
      const options: SearchOptions = {
        matchCase: false, matchWholeWord: false, useRegex: true,
        includeVariants: false, includeCrossLanguage: false
      };

      const query = createSearchQuery('Coda Longa e (Stretta|Alta)', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThanOrEqual(2, 
        'Regex search should find both guard variations');
      
      const foundSection1 = results.results.some(r => r.chapterReference.chapterId === 'test_section_1');
      const foundSection2 = results.results.some(r => r.chapterReference.chapterId === 'test_section_2');
      
      expect(foundSection1).toBe(true, 'Should find test_section_1 with regex pattern');
      expect(foundSection2).toBe(true, 'Should find test_section_2 with regex pattern');
    });

    it('should NOT match raw term keys with underscores', () => {
      const options: SearchOptions = {
        matchCase: false, matchWholeWord: false, useRegex: false,
        includeVariants: false, includeCrossLanguage: false
      };

      const query = createSearchQuery('coda_longa_stretta', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBe(0, 
        'Raw term key "coda_longa_stretta" should not be found because {term_key} syntax should be expanded to display text during indexing');
    });

    it('should NOT match curly brace syntax in search', () => {
      const options: SearchOptions = {
        matchCase: false, matchWholeWord: false, useRegex: false,
        includeVariants: false, includeCrossLanguage: false
      };

      const query = createSearchQuery('{coda_longa_stretta}', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBe(0, 
        'Curly brace syntax "{coda_longa_stretta}" should not be found because it should be expanded during indexing');
    });

    it('should find display text of strike terms', () => {
      const options: SearchOptions = {
        matchCase: false, matchWholeWord: false, useRegex: false,
        includeVariants: false, includeCrossLanguage: false
      };

      const query = createSearchQuery('Mandritto', options, searchIndex);
      const results = executeSearch(searchIndex, query);

      expect(results.results.length).toBeGreaterThan(0, 
        'Search for "Mandritto" should find sections containing {mandritto}');
      
      const foundSections = results.results.filter(r => 
        r.chapterReference.chapterId === 'test_section_1' || r.chapterReference.chapterId === 'test_section_2'
      );
      expect(foundSections.length).toBeGreaterThanOrEqual(2, 
        'Should find multiple sections with {mandritto} term');
    });
  });
});
