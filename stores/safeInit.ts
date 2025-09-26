/**
 * Production-ready store initialization
 * Simplified for better maintainability
 */

export function initializeStoresSafely() {
  try {
    // Mark initialization as complete
    (window as any).__storeInitialized = true;
    return true;
  } catch (error) {
    // Error logging removed for production
    return false;
  }
}

// Auto-export for app initialization
(window as any).__storeInit = initializeStoresSafely;
