import { Annotation } from './Annotation';

/**
 * Annotation class for Techniques
 * Default color: purple-600 (#9333ea)
 */
export class Techniques extends Annotation {
  constructor() {
    const chipStyle = {
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      color: '#9333ea',
      borderColor: 'rgba(147, 51, 234, 0.2)',
      borderBottomColor: '#9333ea',
    };

    const textStyle = {
      color: '#9333ea',
      fontWeight: '600' as const,
    };

    super(chipStyle, textStyle, 'Techniques');
  }
}
