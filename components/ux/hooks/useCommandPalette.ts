/**
 * @fileoverview useCommandPalette Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

interface UseCommandPaletteOptions {
  shortcut?: string;
  onOpen?: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

/**
 * useCommandPalette function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useCommandPalette({
  shortcut = 'cmd+k',
  onOpen,
  onClose,
  disabled = false,
}: UseCommandPaletteOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    onOpen?.();
  }, [disabled, onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Keyboard shortcut handler
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey ?? e.ctrlKey;
      const key = e.key.toLowerCase();

      // Parse shortcut (e.g., "cmd+k", "ctrl+/")
      const parts = shortcut.toLowerCase().split('+');
      const hasModifier = parts.some((part) => ['cmd', 'ctrl', 'meta'].includes(part));
      const targetKey = parts[parts.length - 1];

      if (hasModifier && isCmd && key === targetKey) {
        e.preventDefault();
        toggle();
      } else if (!hasModifier && key === targetKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // For shortcuts without modifiers, check if not in input
        const target = e.target as HTMLElement;
        const isInInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.contentEditable === 'true';

        if (!isInInput) {
          e.preventDefault();
          toggle();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcut, toggle, disabled]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export default useCommandPalette;
