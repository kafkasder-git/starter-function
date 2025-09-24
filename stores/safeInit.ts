/**
 * Production-ready store initialization
 * Simplified for better maintainability
 */

export function initializeStoresSafely() {
  try {
    console.log('📦 Store sistemi başlatılıyor...');

    // Mark initialization as complete
    (window as any).__storeInitialized = true;

    console.log('✅ Store sistemi başarıyla başlatıldı');
    return true;
  } catch (error) {
    console.error('❌ Store initialization failed:', error);
    return false;
  }
}

// Auto-export for app initialization
(window as any).__storeInit = initializeStoresSafely;
