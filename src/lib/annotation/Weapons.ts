import { Annotation } from './Annotation';

/**
 * Annotation class for Weapons
 * Default color: sky-600 (#0284c7)
 */
export class Weapons extends Annotation {
  constructor() {
    const chipStyle = {
      backgroundColor: 'rgba(2, 132, 199, 0.1)',
      color: '#0284c7',
      borderColor: 'rgba(2, 132, 199, 0.2)',
      borderBottomColor: '#0284c7',
    };

    const textStyle = {
      color: '#0284c7',
      fontWeight: '600' as const,
    };

    super(chipStyle, textStyle, 'Armes');
  }
}
