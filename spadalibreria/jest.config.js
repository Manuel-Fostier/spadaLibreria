module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.ya?ml$': '<rootDir>/src/__mocks__/yamlMock.js',
    },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};
