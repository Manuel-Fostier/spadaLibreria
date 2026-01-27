import { Annotation } from './Annotation';

/**
 * Annotation class for Guards (Postures)
 * Default color: emerald-600 (#059669)
 */
export class Guards extends Annotation {
  constructor() {
    const chipStyle = {
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      color: '#059669',
      borderColor: 'rgba(5, 150, 105, 0.2)',
      borderBottomColor: '#059669',
    };

    const textStyle = {
      color: '#059669',
      fontWeight: '600' as const,
    };

    super(chipStyle, textStyle, 'Gardes mentionnées');
  }
}
