/**
 * @fileoverview use-toast Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { toast as sonnerToast } from 'sonner';

/**
 * useToast function
 *
 * @returns {Object} Toast functions
 */
export function useToast() {
  return {
    toast: sonnerToast,
    success: (title: string, description?: string) => {
      sonnerToast.success(title, { description });
    },
    error: (title: string, description?: string) => {
      sonnerToast.error(title, { description });
    },
    warning: (title: string, description?: string) => {
      sonnerToast.warning(title, { description });
    },
    info: (title: string, description?: string) => {
      sonnerToast.info(title, { description });
    }
  };
}
