/**
 * @fileoverview Common Types
 * @description Shared types and interfaces used throughout the application
 */

/**
 * Generic ID type
 */
export type ID = string;

/**
 * Generic timestamp type
 */
export type Timestamp = string;

/**
 * Generic status type
 */
export type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'suspended';

/**
 * Generic priority type
 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Generic role type
 */
export type Role = 'admin' | 'manager' | 'user' | 'viewer';

/**
 * Generic permission type
 */
export type Permission = 'read' | 'write' | 'delete' | 'admin';

/**
 * Generic language type
 */
export type Language = 'tr' | 'en' | 'ar' | 'ku';

/**
 * Generic currency type
 */
export type Currency = 'TRY' | 'USD' | 'EUR';

/**
 * Generic file type
 */
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other';

/**
 * Generic gender type
 */
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

/**
 * Generic marital status type
 */
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other';

/**
 * Generic education level type
 */
export type EducationLevel =
  | 'primary'
  | 'secondary'
  | 'high-school'
  | 'university'
  | 'graduate'
  | 'other';

/**
 * Generic employment status type
 */
export type EmploymentStatus =
  | 'employed'
  | 'unemployed'
  | 'student'
  | 'retired'
  | 'disabled'
  | 'other';

/**
 * Generic contact type
 */
export type ContactType = 'phone' | 'email' | 'address' | 'social';

/**
 * Generic notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Generic theme type
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Generic size type
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Generic color type
 */
export type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Generic variant type
 */
export type Variant = 'default' | 'outline' | 'ghost' | 'link' | 'destructive';

/**
 * Generic position type
 */
export type Position = 'top' | 'right' | 'bottom' | 'left';

/**
 * Generic alignment type
 */
export type Alignment = 'start' | 'center' | 'end' | 'stretch';

/**
 * Generic orientation type
 */
export type Orientation = 'horizontal' | 'vertical';

/**
 * Generic direction type
 */
export type Direction = 'ltr' | 'rtl';

/**
 * Generic breakpoint type
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
