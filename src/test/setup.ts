import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_APPWRITE_ENDPOINT: 'https://fra.cloud.appwrite.io/v1',
    VITE_APPWRITE_PROJECT_ID: '68e99f6c000183bafb39',
    VITE_APPWRITE_DATABASE_ID: 'dernek_yonetim_db',
    VITE_APP_NAME: 'Kafkasder Test App',
    MODE: 'test',
  },
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock console methods in tests to reduce noise
// eslint-disable-next-line no-console
const originalError = console.error;
// eslint-disable-next-line no-console
const originalWarn = console.warn;

beforeEach(() => {
  // eslint-disable-next-line no-console
  console.error = vi.fn();
  // eslint-disable-next-line no-console
  console.warn = vi.fn();
});

afterEach(() => {
  // eslint-disable-next-line no-console
  console.error = originalError;
  // eslint-disable-next-line no-console
  console.warn = originalWarn;
});

// Mock fetch
global.fetch = vi.fn();

// Mock crypto for Appwrite
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => arr.map(() => Math.floor(Math.random() * 256))),
    randomUUID: vi.fn(() => 'test-uuid'),
  },
});

// Mock process for Node.js compatibility
Object.defineProperty(global, 'process', {
  value: {
    env: {
      NODE_ENV: 'test',
    },
    versions: {
      node: '18.0.0',
    },
    nextTick: (fn: Function) => setTimeout(fn, 0),
  },
});

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock structuredClone
global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));

// Mock URL constructor
global.URL = vi.fn().mockImplementation((url) => ({
  href: url,
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  searchParams: new Map(),
  hash: '',
  toString: () => url,
})) as any;

// Mock URLSearchParams
global.URLSearchParams = vi.fn().mockImplementation(() => ({
  get: vi.fn(),
  set: vi.fn(),
  has: vi.fn(),
  delete: vi.fn(),
  toString: vi.fn(() => ''),
})) as any;