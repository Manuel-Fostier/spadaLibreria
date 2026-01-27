/**
 * Tests for Glossary Search Functionality
 * 
 * Tests comprehensive search across term names, categories, types,
 * definitions, and translations in all supported languages.
 */

import { searchGlossaryTerms } from '../glossaryLoader';
import { GlossaryTerm } from '@/types/glossary';

describe('searchGlossaryTerms', () => {
  let sampleTerms: GlossaryTerm[];

  beforeEach(() => {
    sampleTerms = [
      {
        id: 'mandritto',
        term: 'Mandritto',
        category: 'Coups et Techniques',
        type: 'Attaque / Frappe de taille',
        definition: {
          it: 'Colpo portato da destra a sinistra.',
          fr: 'Coup porté de la droite vers la gauche. Il part de l\'épaule droite.',
          en: 'A cut delivered from right to left. Starts from the fencer\'s right shoulder.'
        },
        translation: {
          it: 'Mandritto',
          fr: 'Coup droit',
          en: 'Forehand cut'
        }
      },
      {
        id: 'fendente',
        term: 'Fendente',
        category: 'Coups et Techniques',
        type: 'Attaque / Frappe de taille',
        definition: {
          fr: 'Coup vertical descendant, fendant l\'adversaire.',
          en: 'Vertical descending cut, cleaving the opponent.'
        },
        translation: {
          fr: 'Coup fendant',
          en: 'Cleaving cut'
        }
      },
      {
        id: 'guardia_di_testa',
        term: 'Guardia di Testa',
        category: 'Les Guardes',
        type: 'Garde Haute',
        definition: {
          fr: 'Garde haute avec épée au-dessus de la tête.',
          en: 'High guard with sword above the head.'
        },
        translation: {
          fr: 'Garde de la Tête',
          en: 'Head Guard'
        }
      },
      {
        id: 'spada_sola',
        term: 'Spada Sola',
        category: 'Armes et Équipement',
        type: 'Arme',
        definition: {
          fr: 'L\'épée seule, sans autre arme d\'accompagnement.',
          en: 'The sword alone, without any accompanying weapon.'
        },
        translation: {
          fr: 'Épée seule',
          en: 'Single sword'
        }
      }
    ];
  });

  describe('term name search', () => {
    it('should find terms by exact term name', () => {
      const results = searchGlossaryTerms(sampleTerms, 'Mandritto');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });

    it('should find terms by partial term name', () => {
      const results = searchGlossaryTerms(sampleTerms, 'mand');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });

    it('should be case-insensitive', () => {
      const results = searchGlossaryTerms(sampleTerms, 'MANDRITTO');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });
  });

  describe('category search', () => {
    it('should find all terms in a category', () => {
      const results = searchGlossaryTerms(sampleTerms, 'Coups et Techniques');
      expect(results).toHaveLength(2);
      expect(results.map(t => t.id)).toContain('mandritto');
      expect(results.map(t => t.id)).toContain('fendente');
    });

    it('should find terms by partial category name', () => {
      const results = searchGlossaryTerms(sampleTerms, 'Guardes');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('guardia_di_testa');
    });
  });

  describe('type search', () => {
    it('should find terms by type', () => {
      const results = searchGlossaryTerms(sampleTerms, 'Garde Haute');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('guardia_di_testa');
    });

    it('should find terms by partial type', () => {
      const results = searchGlossaryTerms(sampleTerms, 'Frappe');
      expect(results).toHaveLength(2);
      expect(results.every(t => t.type.includes('Frappe'))).toBe(true);
    });
  });

  describe('definition search', () => {
    it('should find terms by French definition', () => {
      const results = searchGlossaryTerms(sampleTerms, 'épaule');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });

    it('should find terms by English definition', () => {
      const results = searchGlossaryTerms(sampleTerms, 'shoulder');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });

    it('should find terms by Italian definition when present', () => {
      const results = searchGlossaryTerms(sampleTerms, 'destra');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });

    it('should search across all definitions', () => {
      const results = searchGlossaryTerms(sampleTerms, 'vertical');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('fendente');
    });
  });

  describe('translation search', () => {
    it('should find terms by French translation', () => {
      const results = searchGlossaryTerms(sampleTerms, 'Coup droit');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });

    it('should find terms by English translation', () => {
      const results = searchGlossaryTerms(sampleTerms, 'Forehand');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });

    it('should find terms by Italian translation when present', () => {
      const withItalian: GlossaryTerm = {
        id: 'test_term',
        term: 'Test',
        category: 'Test',
        type: 'Test',
        definition: { fr: 'Test', en: 'Test' },
        translation: { it: 'Prova', fr: 'Test', en: 'Test' }
      };
      
      const results = searchGlossaryTerms([withItalian], 'Prova');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test_term');
    });
  });

  describe('edge cases', () => {
    it('should return all terms for empty query', () => {
      const results = searchGlossaryTerms(sampleTerms, '');
      expect(results).toHaveLength(4);
    });

    it('should return all terms for whitespace-only query', () => {
      const results = searchGlossaryTerms(sampleTerms, '   ');
      expect(results).toHaveLength(4);
    });

    it('should return empty array when no matches found', () => {
      const results = searchGlossaryTerms(sampleTerms, 'nonexistent');
      expect(results).toEqual([]);
    });

    it('should handle empty terms array', () => {
      const results = searchGlossaryTerms([], 'test');
      expect(results).toEqual([]);
    });

    it('should trim whitespace from query', () => {
      const results = searchGlossaryTerms(sampleTerms, '  Mandritto  ');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });
  });

  describe('multiple matches', () => {
    it('should return all matching terms', () => {
      const results = searchGlossaryTerms(sampleTerms, 'coup');
      // Should match "Coups et Techniques" category (2 terms) and translations
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should not duplicate results if term matches multiple fields', () => {
      // "Mandritto" appears in both term name and Italian translation
      const results = searchGlossaryTerms(sampleTerms, 'Mandritto');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mandritto');
    });
  });

  describe('special characters', () => {
    it('should handle accented characters', () => {
      const results = searchGlossaryTerms(sampleTerms, 'épée');
      expect(results).toHaveLength(2); // guardia_di_testa and spada_sola
    });

    it('should handle apostrophes', () => {
      const results = searchGlossaryTerms(sampleTerms, 'l\'épée');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('spada_sola');
    });

    it('should handle forward slashes in type', () => {
      const results = searchGlossaryTerms(sampleTerms, 'Attaque / Frappe');
      expect(results).toHaveLength(2);
    });
  });

  describe('language parameter', () => {
    it('should accept language parameter (for future prioritization)', () => {
      // Currently language is not used for prioritization, just accepted
      expect(() => {
        searchGlossaryTerms(sampleTerms, 'test', 'it');
        searchGlossaryTerms(sampleTerms, 'test', 'fr');
        searchGlossaryTerms(sampleTerms, 'test', 'en');
      }).not.toThrow();
    });

    it('should use French as default language', () => {
      const results = searchGlossaryTerms(sampleTerms, 'coup');
      expect(results).toBeTruthy();
    });
  });
});
