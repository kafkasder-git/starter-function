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
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useToast() {
  const toast = (options: {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => {
    const { title, description, variant = 'default' } = options;
    
    if (variant === 'destructive') {
      sonnerToast.error(title || 'Hata', {
        description: description,
      });
    } else {
      sonnerToast.success(title || 'Başarılı', {
        description: description,
      });
    }
  };

  return {
    toast,
  };
}
