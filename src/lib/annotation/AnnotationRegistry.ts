import { Annotation } from './Annotation';
import { Weapons } from './Weapons';
import { WeaponType } from './WeaponType';
import { Guards } from './Guards';
import { Techniques } from './Techniques';
import { Measures } from './Measures';
import { Strategy } from './Strategy';
import { Strikes } from './Strikes';
import { Targets } from './Targets';

export type AnnotationKey = 
  | 'weapons'
  | 'weapon_type'
  | 'guards'
  | 'techniques'
  | 'measures'
  | 'strategy'
  | 'strikes'
  | 'targets';

/**
 * Registry/factory for annotation instances
 * Provides centralized access to all annotation types
 * Maintains singleton instances for consistency
 */
export class AnnotationRegistry {
  private static instances: Map<AnnotationKey, Annotation> = new Map();

  static {
    // Initialize all annotation instances
    AnnotationRegistry.instances.set('weapons', new Weapons());
    AnnotationRegistry.instances.set('weapon_type', new WeaponType());
    AnnotationRegistry.instances.set('guards', new Guards());
    AnnotationRegistry.instances.set('techniques', new Techniques());
    AnnotationRegistry.instances.set('measures', new Measures());
    AnnotationRegistry.instances.set('strategy', new Strategy());
    AnnotationRegistry.instances.set('strikes', new Strikes());
    AnnotationRegistry.instances.set('targets', new Targets());
  }

  /**
   * Get an annotation instance by key
   */
  static getAnnotation(key: AnnotationKey): Annotation {
    const annotation = AnnotationRegistry.instances.get(key);
    if (!annotation) {
      throw new Error(`Unknown annotation type: ${key}`);
    }
    return annotation;
  }

  /**
   * Get all annotation instances as a map
   */
  static getAllAnnotations(): Map<AnnotationKey, Annotation> {
    return new Map(AnnotationRegistry.instances);
  }

  /**
   * Get all annotation instances as an array
   */
  static getAllAnnotationsArray(): Array<{ key: AnnotationKey; annotation: Annotation }> {
    return Array.from(AnnotationRegistry.instances.entries()).map(([key, annotation]) => ({
      key,
      annotation,
    }));
  }

  /**
   * Update an annotation instance's visibility (typically used by context)
   */
  static updateAnnotationVisibility(key: AnnotationKey, visible: boolean): void {
    const annotation = AnnotationRegistry.getAnnotation(key);
    annotation.setVisibility(visible);
  }

  /**
   * Update an annotation instance's color (typically called by color picker)
   */
  static updateAnnotationColor(key: AnnotationKey, colorValue: string): void {
    const annotation = AnnotationRegistry.getAnnotation(key);
    annotation.setStyle(colorValue);
  }

  /**
   * Check if a key is a valid annotation type
   */
  static isValidKey(key: unknown): key is AnnotationKey {
    return AnnotationRegistry.instances.has(key as AnnotationKey);
  }

  /**
   * Get colors from all annotation instances
   * Single source of truth for colors
   */
  static getColors(): Record<AnnotationKey, string> {
    const colors: Record<AnnotationKey, string> = {} as Record<AnnotationKey, string>;
    
    AnnotationRegistry.instances.forEach((annotation, key) => {
      const chipStyle = annotation.getChipStyle();
      colors[key] = chipStyle.color as string;
    });
    
    console.log('🎨 AnnotationRegistry.getColors():', colors);
    return colors;
  }

  /**
   * Get chip style for an annotation by key
   * Returns the annotation's chip style or a fallback indigo style
   */
  static getChipStyle(annotationKey: AnnotationKey) {
    const annotation = AnnotationRegistry.instances.get(annotationKey);
    return annotation ? annotation.getChipStyle() : { color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)' };
  }

  /**
   * Get active toggle style for an annotation by key
   * Returns the annotation's color in active state or a fallback indigo style
   * Remarks: This one is used for buttons in the edit annotation panel.
   */
  static getActiveToggleStyle(annotationKey: AnnotationKey) {
    const annotation = AnnotationRegistry.instances.get(annotationKey);
    if (!annotation) return { backgroundColor: '#6366f1', color: 'white', borderColor: '#6366f1' };
    const chipStyle = annotation.getChipStyle();
    return {
      backgroundColor: chipStyle.color as string,
      color: 'white',
      borderColor: chipStyle.color as string,
    };
  }
}
