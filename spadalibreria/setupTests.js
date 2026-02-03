/* eslint-disable @typescript-eslint/no-require-imports */
require('@testing-library/jest-dom/extend-expect');
require('jest-localstorage-mock');

// Mock window.location.reload
delete window.location;
window.location = { reload: jest.fn() };

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  // Reset reload mock
  window.location.reload = jest.fn();
});

