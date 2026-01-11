/**
 * Annotation display configuration
 * Controls which annotation sections are visible in UI components.
 */
export interface AnnotationDisplay {
  weapons: boolean;
  weapon_type: boolean;
  guards: boolean;
  techniques: boolean;
  measures: boolean;
  strategy: boolean;
  strikes: boolean;
  targets: boolean;
  colors: AnnotationColors;
}

/**
 * Color configuration for each annotation type
 */
export interface AnnotationColors {
  weapons: string;
  weapon_type: string;
  guards: string;
  techniques: string;
  measures: string;
  strategy: string;
  strikes: string;
  targets: string;
}
