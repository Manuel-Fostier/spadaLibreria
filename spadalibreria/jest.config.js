module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.ya?ml$': '<rootDir>/src/__mocks__/yamlMock.js',
      '^react-markdown$': '<rootDir>/src/__mocks__/react-markdown.js',
      '^remark-gfm$': '<rootDir>/src/__mocks__/remark-gfm.js',
    },
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/setupTests.js'],
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
