import { Annotation } from './Annotation';

/**
 * Annotation class for Weapon Type/State
 * Default color: amber-600 (#d97706)
 */
export class WeaponType extends Annotation {
  constructor() {
    const chipStyle = {
      backgroundColor: 'rgba(217, 119, 6, 0.1)',
      color: '#d97706',
      borderColor: 'rgba(217, 119, 6, 0.2)',
      borderBottomColor: '#d97706',
    };

    const textStyle = {
      color: '#d97706',
      fontWeight: '600' as const,
    };

    super(chipStyle, textStyle, 'État de l\'arme');
  }
}
