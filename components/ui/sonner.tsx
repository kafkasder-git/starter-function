'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        duration: 4000,
        closeButton: true,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'hsl(var(--success-50))',
          '--success-border': 'hsl(var(--success-200))',
          '--success-text': 'hsl(var(--success-900))',
          '--error-bg': 'hsl(var(--error-50))',
          '--error-border': 'hsl(var(--error-200))',
          '--error-text': 'hsl(var(--error-900))',
          '--warning-bg': 'hsl(var(--warning-50))',
          '--warning-border': 'hsl(var(--warning-200))',
          '--warning-text': 'hsl(var(--warning-900))',
          '--info-bg': 'hsl(var(--info-50))',
          '--info-border': 'hsl(var(--info-200))',
          '--info-text': 'hsl(var(--info-900))',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
