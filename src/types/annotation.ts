/**
 * Shared annotation types with sword condition support (FR-009).
 * Re-exported from lib to keep UI and server code aligned.
 */
import {
  Annotation as CoreAnnotation,
  WEAPONS,
  WEAPON_TYPES,
  GUARDS,
  MEASURES,
  STRATEGIES,
  type Weapon,
  type WeaponType,
  type Guard,
  type Measure,
  type Strategy,
} from '@/lib/annotation';

export type Annotation = CoreAnnotation;
export {
  WEAPONS,
  WEAPON_TYPES,
  GUARDS,
  MEASURES,
  STRATEGIES,
};
export type { Weapon, WeaponType, Guard, Measure, Strategy };
