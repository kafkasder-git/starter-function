/**
 * @fileoverview dialog Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from './utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ ...props }, ref) => (
  <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />
));
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ ...props }, ref) => <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />);
DialogClose.displayName = DialogPrimitive.Close.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-slot="dialog-content"
      className={cn(
        'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-border/20 p-4 sm:p-6 shadow-lg duration-200 sm:max-w-lg md:max-w-xl lg:max-w-2xl',
        'max-h-[90vh] overflow-y-auto',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-3 right-3 sm:top-4 sm:right-4 rounded-sm opacity-70 transition-all duration-200 hover:opacity-100 hover:bg-secondary focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 min-h-[44px] min-w-[44px] flex items-center justify-center">
        <XIcon />
        <span className="sr-only">Kapat</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn(
        'flex flex-col gap-2 text-center sm:text-left pb-2 border-b border-border/10',
        className,
      )}
      {...props}
    />
  ),
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4 border-t border-border/10',
        className,
      )}
      {...props}
    />
  ),
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn('text-lg leading-none font-semibold text-foreground', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
