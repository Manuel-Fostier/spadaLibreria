// Mock getTermTypeStyle to just return color from displaySettings for test simplicity
jest.mock('@/lib/termTypeMapping', () => ({
  getTermTypeStyle: (type: string, displaySettings: { colors: Record<string, string> }) => ({
    color: displaySettings.colors[type],
  }),
}));
