/**
 * @fileoverview roleMapping - Role name normalization utilities
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

/**
 * Role mapping between Turkish and English names
 */
export const ROLE_MAPPING = {
  // Turkish to English
  'süper_yönetici': 'super_admin',
  'yönetici': 'admin',
  'müdür': 'manager',
  'operatör': 'operator',
  'görüntüleyici': 'viewer',
  'gönüllü': 'volunteer',

  // English to Turkish
  'super_admin': 'süper_yönetici',
  'admin': 'yönetici',
  'manager': 'müdür',
  'operator': 'operatör',
  'viewer': 'görüntüleyici',
  'volunteer': 'gönüllü',
} as const;

/**
 * Normalize role name to English
 *
 * @param role - Role name in any format
 * @returns Normalized English role name
 *
 * @example
 * normalizeRoleToEnglish('yönetici') // returns 'admin'
 * normalizeRoleToEnglish('admin') // returns 'admin'
 */
export function normalizeRoleToEnglish(role: string): string {
  const normalized = role.toLowerCase();

  // Already English
  if (['super_admin', 'admin', 'manager', 'operator', 'viewer', 'volunteer'].includes(normalized)) {
    return normalized;
  }

  // Turkish to English
  if (normalized in ROLE_MAPPING) {
    const mapped = ROLE_MAPPING[normalized as keyof typeof ROLE_MAPPING];
    if (['super_admin', 'admin', 'manager', 'operator', 'viewer', 'volunteer'].includes(mapped)) {
      return mapped;
    }
  }

  return normalized;
}

/**
 * Normalize role name to Turkish
 *
 * @param role - Role name in any format
 * @returns Normalized Turkish role name
 *
 * @example
 * normalizeRoleToTurkish('admin') // returns 'yönetici'
 * normalizeRoleToTurkish('yönetici') // returns 'yönetici'
 */
export function normalizeRoleToTurkish(role: string): string {
  const normalized = role.toLowerCase();

  // Already Turkish
  if (['süper_yönetici', 'yönetici', 'müdür', 'operatör', 'görüntüleyici', 'gönüllü'].includes(normalized)) {
    return normalized;
  }

  // English to Turkish
  if (normalized in ROLE_MAPPING) {
    const mapped = ROLE_MAPPING[normalized as keyof typeof ROLE_MAPPING];
    if (['süper_yönetici', 'yönetici', 'müdür', 'operatör', 'görüntüleyici', 'gönüllü'].includes(mapped)) {
      return mapped;
    }
  }

  return normalized;
}

/**
 * Get display name for role
 *
 * @param role - Role name
 * @param language - Display language (tr or en)
 * @returns Display name
 */
export function getRoleDisplayName(role: string, language: 'tr' | 'en' = 'tr'): string {
  const displayNames: Record<string, { tr: string; en: string }> = {
    super_admin: { tr: 'Süper Yönetici', en: 'Super Administrator' },
    süper_yönetici: { tr: 'Süper Yönetici', en: 'Super Administrator' },
    admin: { tr: 'Yönetici', en: 'Administrator' },
    yönetici: { tr: 'Yönetici', en: 'Administrator' },
    manager: { tr: 'Müdür', en: 'Manager' },
    müdür: { tr: 'Müdür', en: 'Manager' },
    operator: { tr: 'Operatör', en: 'Operator' },
    operatör: { tr: 'Operatör', en: 'Operator' },
    viewer: { tr: 'Görüntüleyici', en: 'Viewer' },
    görüntüleyici: { tr: 'Görüntüleyici', en: 'Viewer' },
    volunteer: { tr: 'Gönüllü', en: 'Volunteer' },
    gönüllü: { tr: 'Gönüllü', en: 'Volunteer' },
  };

  const normalized = role.toLowerCase();
  return displayNames[normalized]?.[language] || role;
}

/**
 * Check if two roles are equivalent (different language versions of same role)
 *
 * @example
 * rolesAreEquivalent('admin', 'yönetici') // returns true
 * rolesAreEquivalent('manager', 'operatör') // returns false
 */
export function rolesAreEquivalent(role1: string, role2: string): boolean {
  const normalized1 = normalizeRoleToEnglish(role1);
  const normalized2 = normalizeRoleToEnglish(role2);
  return normalized1 === normalized2;
}

/**
 * Get all equivalent role names for a given role
 *
 * @example
 * getEquivalentRoles('admin') // returns ['admin', 'yönetici']
 */
export function getEquivalentRoles(role: string): string[] {
  const normalized = normalizeRoleToEnglish(role);
  const turkish = normalizeRoleToTurkish(role);

  return [normalized, turkish];
}

export default {
  ROLE_MAPPING,
  normalizeRoleToEnglish,
  normalizeRoleToTurkish,
  getRoleDisplayName,
  rolesAreEquivalent,
  getEquivalentRoles,
};
