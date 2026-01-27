import { Annotation } from './Annotation';

/**
 * Annotation class for Strategy/Context
 * Default color: indigo-600 (#6366f1)
 */
export class Strategy extends Annotation {
  constructor() {
    const chipStyle = {
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      color: '#6366f1',
      borderColor: 'rgba(99, 102, 241, 0.2)',
      borderBottomColor: '#6366f1',
    };

    const textStyle = {
      color: '#6366f1',
      fontWeight: '600' as const,
    };

    super(chipStyle, textStyle, 'Stratégie / Contexte');
  }
}
