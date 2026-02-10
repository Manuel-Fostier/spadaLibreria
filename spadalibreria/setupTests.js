/* eslint-disable @typescript-eslint/no-require-imports */
require('@testing-library/jest-dom');
require('jest-localstorage-mock');

// Mock window.location.reload (avoid jsdom navigation errors)
if (typeof window !== 'undefined' && window.Location && window.location) {
  try {
    Object.defineProperty(window.Location.prototype, 'reload', {
      configurable: true,
      value: jest.fn(),
    });
  } catch (error) {
    try {
      window.location.reload = jest.fn();
    } catch (innerError) {
      // no-op
    }
  }
}

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  if (typeof window !== 'undefined' && window.Location?.prototype?.reload) {
    try {
      window.Location.prototype.reload = jest.fn();
    } catch (error) {
      // no-op
    }
  }
});

