/**
 * @fileoverview useKeyboard Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  description?: string;
}

/**
 * useKeyboardShortcuts function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Exception: Allow Ctrl+K for search even in input fields
        if (!(event.key === 'k' && (event.ctrlKey ?? event.metaKey))) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const metaMatches = !shortcut.metaKey ?? event.metaKey;
        const ctrlMatches = !shortcut.ctrlKey ?? event.ctrlKey;
        const shiftMatches = !shortcut.shiftKey ?? event.shiftKey;
        const altMatches = !shortcut.altKey ?? event.altKey;

        // Ensure exact modifier match
        const exactMetaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const exactCtrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const exactShiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const exactAltMatch = shortcut.altKey ? event.altKey : !event.altKey;

        if (keyMatches && exactMetaMatch && exactCtrlMatch && exactShiftMatch && exactAltMatch) {
          event.preventDefault();
          shortcut.callback(event);
          break;
        }
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Global keyboard shortcuts
/**
 * useGlobalShortcuts function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useGlobalShortcuts({
  onSearch,
  onNewItem,
  onHelp,
  onRefresh,
}: {
  onSearch?: () => void;
  onNewItem?: () => void;
  onHelp?: () => void;
  onRefresh?: () => void;
}) {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => onSearch?.(),
      description: 'Global search',
    },
    {
      key: 'k',
      metaKey: true,
      callback: () => onSearch?.(),
      description: 'Global search (Mac)',
    },
    {
      key: 'n',
      ctrlKey: true,
      callback: () => onNewItem?.(),
      description: 'Create new item',
    },
    {
      key: 'n',
      metaKey: true,
      callback: () => onNewItem?.(),
      description: 'Create new item (Mac)',
    },
    {
      key: '?',
      shiftKey: true,
      callback: () => onHelp?.(),
      description: 'Show help',
    },
    {
      key: 'r',
      ctrlKey: true,
      callback: (e) => {
        e.preventDefault();
        onRefresh?.();
      },
      description: 'Refresh page',
    },
    {
      key: 'r',
      metaKey: true,
      callback: (e) => {
        e.preventDefault();
        onRefresh?.();
      },
      description: 'Refresh page (Mac)',
    },
  ]);
}

// Navigation shortcuts
/**
 * useNavigationShortcuts function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useNavigationShortcuts({
  onGoHome,
  onGoBack,
  onGoForward,
}: {
  onGoHome?: () => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
}) {
  useKeyboardShortcuts([
    {
      key: 'h',
      altKey: true,
      callback: () => onGoHome?.(),
      description: 'Go to home',
    },
    {
      key: 'ArrowLeft',
      altKey: true,
      callback: () => onGoBack?.(),
      description: 'Go back',
    },
    {
      key: 'ArrowRight',
      altKey: true,
      callback: () => onGoForward?.(),
      description: 'Go forward',
    },
  ]);
}

// Table shortcuts
/**
 * useTableShortcuts function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useTableShortcuts({
  onSelectAll,
  onDelete,
  onEdit,
  onExport,
}: {
  onSelectAll?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onExport?: () => void;
}) {
  useKeyboardShortcuts([
    {
      key: 'a',
      ctrlKey: true,
      callback: () => onSelectAll?.(),
      description: 'Select all',
    },
    {
      key: 'a',
      metaKey: true,
      callback: () => onSelectAll?.(),
      description: 'Select all (Mac)',
    },
    {
      key: 'Delete',
      callback: () => onDelete?.(),
      description: 'Delete selected',
    },
    {
      key: 'e',
      ctrlKey: true,
      callback: () => onEdit?.(),
      description: 'Edit selected',
    },
    {
      key: 'e',
      metaKey: true,
      callback: () => onEdit?.(),
      description: 'Edit selected (Mac)',
    },
    {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      callback: (e) => {
        e.preventDefault();
        onExport?.();
      },
      description: 'Export data',
    },
    {
      key: 's',
      metaKey: true,
      shiftKey: true,
      callback: (e) => {
        e.preventDefault();
        onExport?.();
      },
      description: 'Export data (Mac)',
    },
  ]);
}

export default useKeyboardShortcuts;
