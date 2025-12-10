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
}
