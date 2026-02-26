import '@testing-library/jest-dom';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    readText: jest.fn(),
    writeText: jest.fn(),
  },
});

// Mock URL.createObjectURL
URL.createObjectURL = jest.fn(() => 'blob:mock-url');
URL.revokeObjectURL = jest.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppress console errors in tests (optional)
// global.console = {
//   ...console,
//   error: jest.fn(),
// };
