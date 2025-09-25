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
  return {
    toast: sonnerToast,
  };
}
