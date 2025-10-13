/**
 * @fileoverview form Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

'use client';

import * as React from 'react';
import type * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  FormProvider,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from './utils';
import { Label } from './label';
import { helperTextVariants } from '../../lib/design-system/variants';
import { FormFieldContext, FormItemContext } from '../../contexts/FormContexts';
import { useFormField } from '../../hooks/use-form-field';

const Form = FormProvider;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={Boolean(error)}
      className={cn('data-[error=true]:text-error-600', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function FormHelperText({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'p'> & { variant?: 'default' | 'error' | 'success' | 'warning' }) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      data-slot="form-helper-text"
      id={`${formDescriptionId}-helper`}
      className={cn(helperTextVariants({ variant }), className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  variant,
  ...props
}: React.ComponentProps<'p'> & { variant?: 'error' | 'success' | 'warning' }) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : props.children;
  const messageVariant = variant || (error ? 'error' : 'default');

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn(
        messageVariant === 'error' && 'text-error-600',
        messageVariant === 'success' && 'text-success-600',
        messageVariant === 'warning' && 'text-warning-600',
        'text-sm',
        className
      )}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormHelperText,
  FormMessage,
  FormField,
};
