/**
 * Annotation display configuration (7 fields per FR-021)
 * Controls which annotation sections are visible in UI components.
 */
export interface AnnotationDisplay {
  note: boolean;
  weapons: boolean;
  weapon_type: boolean;
  guards: boolean;
  techniques: boolean;
  measures: boolean;
  strategy: boolean;
  colors: AnnotationColors;
}

/**
 * Color configuration for each annotation type
 */
export interface AnnotationColors {
  note: string;
  weapons: string;
  weapon_type: string;
  guards: string;
  techniques: string;
  measures: string;
  strategy: string;
}
