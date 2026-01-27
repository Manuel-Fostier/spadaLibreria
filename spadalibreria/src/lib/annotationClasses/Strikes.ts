import { Annotation } from './Annotation';

/**
 * Annotation class for Strikes/Attacks
 * Default color: red-600 (#ef4444)
 */
export class Strikes extends Annotation {
  constructor() {
    const chipStyle = {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      borderColor: 'rgba(239, 68, 68, 0.2)',
      borderBottomColor: '#ef4444',
    };

    const textStyle = {
      color: '#ef4444',
      fontWeight: '600' as const,
    };

    super(chipStyle, textStyle, 'Coups');
  }
}
