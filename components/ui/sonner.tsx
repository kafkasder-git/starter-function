/**
 * @fileoverview sonner Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

'use client';

import { useTheme } from 'next-themes';
interface ToasterProps {
  theme?: 'light' | 'dark' | 'system';
}
import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
