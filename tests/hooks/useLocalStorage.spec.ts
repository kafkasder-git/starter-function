import { renderHook } from '@testing-library/react';
import { useUserPreferences } from '../../hooks/useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useUserPreferences', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should return a default value for a preference that is not in localStorage', () => {
    // Simulate a situation where a new preference has been added to the app
    // but the user's localStorage only has old preferences.
    const oldPreferences = {
      theme: 'dark',
      sidebarCollapsed: true,
    };
    window.localStorage.setItem('userPreferences', JSON.stringify(oldPreferences));

    const { result } = renderHook(() => useUserPreferences());

    // In the current buggy implementation, this will be undefined.
    // After the fix, it should fall back to the initialValue.
    expect(result.current.preferences.tablePageSize).toBe(10);
  });
});
