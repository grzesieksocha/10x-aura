import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
vi.stubEnv("SUPABASE_URL", "http://localhost:54321");
vi.stubEnv("SUPABASE_KEY", "test-key");

// Mock Astro global
vi.stubGlobal("Astro", {
  locals: {
    user: null,
  },
  url: new URL("http://localhost:3000"),
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    reload: vi.fn(),
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
