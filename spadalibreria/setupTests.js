/* eslint-disable @typescript-eslint/no-require-imports */
require('@testing-library/jest-dom/extend-expect');
require('jest-localstorage-mock');

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
