import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom does not implement matchMedia; provide a minimal stub for components
// that rely on it (e.g. useMediaQuery).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
