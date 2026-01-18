import { getTermTypeStyle } from '@/lib/termTypeMapping';

// Mock getTermTypeStyle to just return color from displaySettings for test simplicity
jest.mock('@/lib/termTypeMapping', () => ({
  getTermTypeStyle: (type: string, displaySettings: any) => ({ color: displaySettings.colors[type] })
}));
