/**
 * @fileoverview ToastProvider Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Toaster } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

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
      expand={true}
      richColors={true}
      closeButton={true}
      duration={4000}
      visibleToasts={5}
      toastOptions={{
        style: {
          background: 'rgb(255, 255, 255)',
          border: '1px solid rgb(229, 231, 235)',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontSize: '14px',
          padding: '12px 16px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        className: 'toast-custom',
      }}
      icons={{
        success: <CheckCircle className="w-5 h-5 text-green-600" />,
        error: <XCircle className="w-5 h-5 text-red-600" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        info: <Info className="w-5 h-5 text-blue-600" />,
      }}
    />
  );
}
