// Mock window.matchMedia for Angular Material components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock window.CSS if needed
if (typeof window.CSS === 'undefined') {
  Object.defineProperty(window, 'CSS', {
    value: {
      supports: () => false,
    },
  });
}
