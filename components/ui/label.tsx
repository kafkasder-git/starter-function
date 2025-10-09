/**
 * @fileoverview label Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from './utils';

export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  required?: boolean;
  helperText?: string;
}

function Label({ className, required, helperText, children, ...props }: LabelProps) {
  return (
    <div className="space-y-1">
      <LabelPrimitive.Root
        data-slot="label"
        className={cn(
          'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          required && "after:content-['*'] after:text-red-500 after:ml-1 after:font-semibold",
          className,
        )}
        {...props}
      >
        {children}
      </LabelPrimitive.Root>
      {helperText && (
        <p className="text-xs text-muted-foreground leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Label };
