/// <reference types="vitest/globals" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }

  interface Window {
    __DISABLE_SUPABASE_DEPLOYMENT__?: boolean;
    __PURE_FRONTEND_DEV__?: boolean;
  }
}

export {};
