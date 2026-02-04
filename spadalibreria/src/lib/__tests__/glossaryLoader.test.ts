/**
 * Tests for Glossary Loader Utility
 * 
 * Tests the loading and grouping of glossary terms from YAML data.
 * Following TDD: These tests are written before implementation.
 */

import { loadGlossaryTerms, groupGlossaryByCategory } from '../glossaryLoader';
import { GlossaryTerm, GroupedGlossary } from '@/types/glossary';
import type { GlossaryData } from '@/types/data';

// Mock glossary data
const mockGlossaryData: GlossaryData = {
  mandritto: {
    term: 'Mandritto',
    category: 'Coups et Techniques',
    type: 'Attaque / Frappe de taille',
    definition: {
      it: 'Colpo portato da destra a sinistra.',
      fr: 'Coup porté de la droite vers la gauche.',
      en: 'A cut delivered from right to left.'
    },
    translation: {
      it: 'Mandritto',
      fr: 'Coup droit',
      en: 'Forehand cut'
    }
  },
  fendente: {
    term: 'Fendente',
    category: 'Coups et Techniques',
    type: 'Attaque / Frappe de taille',
    definition: {
      fr: 'Coup vertical descendant.',
      en: 'Vertical descending cut.'
    },
    translation: {
      fr: 'Coup fendant',
      en: 'Cleaving cut'
    }
  },
  guardia_di_testa: {
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
  coda_longa_stretta: {
    term: 'Coda Longa e Stretta',
    category: 'Les Guardes',
    type: 'Garde',
    definition: {
      fr: 'Garde basse avec épée vers l\'arrière.',
      en: 'Low guard with sword to the rear.'
    },
    translation: {
      fr: 'Queue Longue et Étroite',
      en: 'Long and Narrow Tail'
    }
  }
};

describe('loadGlossaryTerms', () => {
  it('should convert glossary data object to array of terms', () => {
    const terms = loadGlossaryTerms(mockGlossaryData);
    
    expect(terms).toHaveLength(4);
    expect(terms.every(term => term.id)).toBe(true);
    expect(terms.every(term => term.term)).toBe(true);
    expect(terms.every(term => term.category)).toBe(true);
  });

  it('should include id (term key) for each term', () => {
    const terms = loadGlossaryTerms(mockGlossaryData);
    const ids = terms.map(t => t.id);
    
    expect(ids).toContain('mandritto');
    expect(ids).toContain('fendente');
    expect(ids).toContain('guardia_di_testa');
    expect(ids).toContain('coda_longa_stretta');
  });

  it('should preserve all required fields from GlossaryEntry', () => {
    const terms = loadGlossaryTerms(mockGlossaryData);
    const mandritto = terms.find(t => t.id === 'mandritto');
    
    expect(mandritto).toBeDefined();
    expect(mandritto?.term).toBe('Mandritto');
    expect(mandritto?.category).toBe('Coups et Techniques');
    expect(mandritto?.type).toBe('Attaque / Frappe de taille');
    expect(mandritto?.definition).toHaveProperty('fr');
    expect(mandritto?.definition).toHaveProperty('en');
    expect(mandritto?.translation).toHaveProperty('fr');
    expect(mandritto?.translation).toHaveProperty('en');
  });

  it('should handle optional Italian fields', () => {
    const terms = loadGlossaryTerms(mockGlossaryData);
    const withItalian = terms.find(t => t.definition?.it);
    const withoutItalian = terms.find(t => !t.definition?.it);
    
    // At least one term should have Italian
    expect(withItalian).toBeDefined();
    expect(withItalian?.definition?.it).toBeTruthy();
    
    // Terms without Italian should still be valid
    expect(withoutItalian).toBeDefined();
    expect(withoutItalian?.definition?.fr).toBeTruthy();
  });

  it('should return empty array if glossary is empty', () => {
    const emptyData: GlossaryData = {};
    const terms = loadGlossaryTerms(emptyData);
    expect(terms).toEqual([]);
  });
});

describe('groupGlossaryByCategory', () => {
  let sampleTerms: GlossaryTerm[];

  beforeEach(() => {
    sampleTerms = loadGlossaryTerms(mockGlossaryData);
  });

  it('should group terms by category', () => {
    const grouped = groupGlossaryByCategory(sampleTerms);
    
    expect(grouped).toHaveProperty('Coups et Techniques');
    expect(grouped).toHaveProperty('Les Guardes');
  });

  it('should sub-group terms by type within each category', () => {
    const grouped = groupGlossaryByCategory(sampleTerms);
    
    expect(grouped['Coups et Techniques']).toHaveProperty('Attaque / Frappe de taille');
    expect(grouped['Les Guardes']).toHaveProperty('Garde Haute');
    expect(grouped['Les Guardes']).toHaveProperty('Garde');
  });

  it('should preserve term order within each type group', () => {
    const grouped = groupGlossaryByCategory(sampleTerms);
    const coupsTerms = grouped['Coups et Techniques']['Attaque / Frappe de taille'];
    
    expect(coupsTerms).toHaveLength(2);
    expect(coupsTerms[0].id).toBe('mandritto');
    expect(coupsTerms[1].id).toBe('fendente');
  });

  it('should return correct structure for hierarchical display', () => {
    const grouped = groupGlossaryByCategory(sampleTerms);
    
    // Check structure: category -> type -> terms[]
    Object.entries(grouped).forEach(([category, types]) => {
      expect(typeof category).toBe('string');
      expect(types).toBeInstanceOf(Object);
      
      Object.entries(types).forEach(([type, terms]) => {
        expect(typeof type).toBe('string');
        expect(Array.isArray(terms)).toBe(true);
        expect(terms.every(t => t.category === category)).toBe(true);
        expect(terms.every(t => t.type === type)).toBe(true);
      });
    });
  });

  it('should handle empty array gracefully', () => {
    const grouped = groupGlossaryByCategory([]);
    expect(grouped).toEqual({});
  });

  it('should handle single term correctly', () => {
    const singleTerm: GlossaryTerm[] = [{
      id: 'test',
      term: 'Test',
      category: 'Test Category',
      type: 'Test Type',
      definition: { fr: 'Test', en: 'Test' },
      translation: { fr: 'Test', en: 'Test' }
    }];
    
    const grouped = groupGlossaryByCategory(singleTerm);
    
    expect(grouped['Test Category']['Test Type']).toHaveLength(1);
    expect(grouped['Test Category']['Test Type'][0].id).toBe('test');
  });

  it('should maintain all term properties after grouping', () => {
    const grouped = groupGlossaryByCategory(sampleTerms);
    const mandritto = grouped['Coups et Techniques']['Attaque / Frappe de taille']
      .find(t => t.id === 'mandritto');
    
    expect(mandritto).toBeDefined();
    expect(mandritto?.term).toBe('Mandritto');
    expect(mandritto?.definition.fr).toBeTruthy();
    expect(mandritto?.translation.en).toBeTruthy();
  });
});
