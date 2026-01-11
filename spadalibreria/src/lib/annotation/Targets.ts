import { Annotation } from './Annotation';

/**
 * Annotation class for Targets/Body Parts
 * Default color: pink-600 (#ec4899)
 */
export class Targets extends Annotation {
  constructor() {
    const chipStyle = {
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      color: '#ec4899',
      borderColor: 'rgba(236, 72, 153, 0.2)',
      borderBottomColor: '#ec4899',
    };

    const textStyle = {
      color: '#ec4899',
      fontWeight: '600' as const,
    };

    super(chipStyle, textStyle, 'Cibles');
  }
}
