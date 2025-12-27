/**
 * Shared annotation types with sword condition support (FR-009).
 * Re-exported from lib to keep UI and server code aligned.
 */
import {
  Annotation as CoreAnnotation,
  WEAPONS,
  WEAPON_TYPES,
  GUARDS,
  HIGH_GUARDS,
  LOW_GUARDS,
  MEASURES,
  STRATEGIES,
  ENGAGEMENT_DISTANCES,
  STRIKES,
  TARGETS,
  type Weapon,
  type WeaponType,
  type Guard,
  type Measure,
  type Strategy,
  type EngagementDistance,
  type Strike,
  type Target,
} from '@/lib/annotation';

export type Annotation = CoreAnnotation;
export {
  WEAPONS,
  WEAPON_TYPES,
  GUARDS,
  HIGH_GUARDS,
  LOW_GUARDS,
  MEASURES,
  STRATEGIES,
  ENGAGEMENT_DISTANCES,
  STRIKES,
  TARGETS,
};
export type { Weapon, WeaponType, Guard, Measure, Strategy, EngagementDistance, Strike, Target };
