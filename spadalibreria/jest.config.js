module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.ya?ml$': '<rootDir>/src/__mocks__/yamlMock.js',
    },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/__mocks__/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|remark-gfm|micromark|decode-named-character-references|character-entities|unist-|unified|ccount|escape-string-regexp|markdown-table)/)',
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
};
