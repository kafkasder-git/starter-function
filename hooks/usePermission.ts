/**
 * @fileoverview Backward-compatible wrapper for permission hooks
 * @deprecated Use hooks/usePermissions instead
 */

export { usePermission, useRole, useUserRole } from './usePermissions';
import { usePermission as defaultUsePermission } from './usePermissions';
export default defaultUsePermission;
