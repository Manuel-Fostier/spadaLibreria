import { Annotation } from './Annotation';

/**
 * Annotation class for Measures/Distance
 * Default color: blue-600 (#3b82f6)
 */
export class Measures extends Annotation {
  constructor() {
    const chipStyle = {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      color: '#3b82f6',
      borderColor: 'rgba(59, 130, 246, 0.2)',
      borderBottomColor: '#3b82f6',
    };

    const textStyle = {
      color: '#3b82f6',
      fontWeight: '600' as const,
    };

    super(chipStyle, textStyle, 'Mesures / Distance');
  }
}
