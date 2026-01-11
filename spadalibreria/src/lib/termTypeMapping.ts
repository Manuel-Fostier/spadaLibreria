/**
 * Maps glossary term types to annotation display categories
 */

export type AnnotationType = 'weapons' | 'weapon_type' | 'guards' | 'techniques' | 'measures' | 'strategy' | 'strikes' | 'targets';

/**
 * Maps a glossary term type to an annotation category
 * Returns 'techniques' as default for unmapped types
 */
export function mapTermTypeToAnnotation(termType: string): AnnotationType {
  const type = termType.toLowerCase();
  
  // Weapons mapping
  if (type.includes('arme') || type.includes('weapon')) {
    return 'weapons';
  }
  
  // Guards mapping
  if (type.includes('garde') || type.includes('guard') || type.includes('postura')) {
    return 'guards';
  }
  
  // Measures mapping
  if (type.includes('mesure') || type.includes('measure') || type.includes('distance')) {
    return 'measures';
  }
  
  // Strategy mapping
  if (type.includes('stratégie') || type.includes('strategy') || type.includes('tactique') || type.includes('contexte')) {
    return 'strategy';
  }
  
  // Strikes mapping
  if (type.includes('coup') || type.includes('strike') || type.includes('attaque') || type.includes('attack')) {
    return 'strikes';
  }
  
  // Targets mapping
  if (type.includes('cible') || type.includes('target') || type.includes('partie du corps')) {
    return 'targets';
  }
  
  // Techniques (attacks, defenses, movements, etc.) - default
  return 'techniques';
}
