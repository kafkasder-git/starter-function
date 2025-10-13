/**
 * @fileoverview ToastProvider Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Toaster } from 'sonner';

/**
 * ToastProvider function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  );
}
