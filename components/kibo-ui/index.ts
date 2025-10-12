/**
 * @fileoverview Kibo UI Components Index
 * Modern, accessible UI components library
 * 
 * @author Kibo UI Team
 * @version 2.0.0
 */

// Core Components
export { Button, MemoizedButton, buttonVariants } from './button';
export { Input, MemoizedInput } from './input';
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from './card';
export { Badge, MemoizedBadge, badgeVariants } from './badge';
export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider 
} from './tooltip';
export { Label } from './label';

// Data Components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

// Form Components
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './form';

// Gantt Component (available separately)
// export * from './gantt';

// Re-export types
export type { ButtonProps } from './button';
export type { InputProps } from './input';
export type { BadgeProps } from './badge';
