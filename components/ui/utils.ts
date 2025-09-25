/**
 * @fileoverview utils Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
