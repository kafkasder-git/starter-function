/**
 * @fileoverview Appwrite Database Helper
 * @description Centralized database operations with type safety
 */

import { databases, DATABASE_ID, ID, Query } from './appwrite';
import { logger } from './logging/logger';
import type { Models } from 'appwrite';

/**
 * Appwrite Collection IDs
 *
 * Collections with active services:
 * - USER_PROFILES: User account data (authStore, rolesService)
 * - BENEFICIARIES: Beneficiary management (beneficiariesService)
 * - DONATIONS: Donation tracking (donationsService)
 * - AID_APPLICATIONS: Aid request management (aidRequestsService)
 * - CAMPAIGNS: Campaign management (campaignsService)
 * - NOTIFICATIONS: Notification system (notificationService)
 *
 * Collections pending service implementation:
 * - FINANCE_TRANSACTIONS: Financial transaction tracking
 * - LEGAL_CONSULTATIONS: Legal case management
 * - EVENTS: Event management
 * - INVENTORY_ITEMS: Inventory tracking
 * - TASKS: Task management
 *
 * Note: Before removing any collection, search codebase for references.
 */
export const collections = {
  USER_PROFILES: 'user_profiles',
  USERS: 'users', // Yeni eklenen - kullanıcı yönetimi için
  USER_ACTIVITIES: 'user_activities', // Yeni eklenen - kullanıcı aktiviteleri için
  BENEFICIARIES: 'beneficiaries',
  DONATIONS: 'donations',
  AID_APPLICATIONS: 'aid_applications',
  FINANCE_TRANSACTIONS: 'finance_transactions',
  CAMPAIGNS: 'campaigns',
  LEGAL_CONSULTATIONS: 'legal_consultations',
  EVENTS: 'events',
  INVENTORY_ITEMS: 'inventory_items',
  NOTIFICATIONS: 'notifications',
  TASKS: 'tasks',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  SYSTEM_SETTINGS: 'system_settings',
  // Messaging collections
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  CONVERSATION_PARTICIPANTS: 'conversation_participants',
  MESSAGE_ATTACHMENTS: 'message_attachments',
  MESSAGE_READ_STATUS: 'message_read_status',
  USER_PRESENCE: 'user_presence',
  TYPING_INDICATORS: 'typing_indicators',
} as const;

// Export for backward compatibility with existing code
export const TABLES = collections;

/**
 * Storage buckets for messaging
 */
export const STORAGE_BUCKETS = {
  MESSAGE_ATTACHMENTS: 'message_attachments',
  VOICE_MESSAGES: 'voice_messages',
} as const;

/**
 * Field mapping for database collections
 *
 * IMPORTANT: Only add mappings for collections that genuinely have different
 * field names in the database vs. application code.
 *
 * Currently:
 * - beneficiaries: Uses Turkish DB fields (ad_soyad, sehri, etc.) mapped to English app fields
 * - All other collections: Use English field names directly (no mapping needed)
 *
 * Before adding a new mapping:
 * 1. Verify the actual Appwrite collection schema
 * 2. Check if the service already uses English field names
 * 3. Only add mapping if there's a genuine mismatch
 */
export const FIELD_MAPPING = {
  beneficiaries: {
    full_name: 'ad_soyad',
    phone: 'telefon_no',
    city: 'sehri',
    district: 'yerlesimi',
    neighborhood: 'mahalle',
    address: 'adres',
    nationality: 'uyruk',
    country: 'ulkesi',
    settlement: 'yerlesimi',
    iban: 'iban',
    family_members_count: 'ailedeki_kisi_sayisi',
    monthly_income: 'toplam_tutar',
    description: 'kategori',
    notes: 'tur',
    application_date: 'kayit_tarihi',
    identity_number: 'kimlik_no',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    created_by: 'created_by',
    updated_by: 'updated_by',
  },
} as const;

/**
 * Get mapped field name for a collection
 * @param collection - Collection name
 * @param field - English field name
 * @returns Turkish database field name or original field name if not mapped
 * Note: If no mapping exists for the collection or field, returns the original field name.
 */
export function getMappedField(collection: keyof typeof FIELD_MAPPING, field: string): string {
  const mapping = FIELD_MAPPING[collection];
  return mapping?.[field as keyof typeof mapping] || field;
}

/**
 * Get reverse mapped field name (Turkish to English)
 * @param collection - Collection name
 * @param field - Turkish database field name
 * @returns English field name or original field name if not mapped
 * Useful for converting database field names back to application field names when reading data from the database.
 */
export function getReverseMappedField(
  collection: keyof typeof FIELD_MAPPING,
  field: string
): string {
  const mapping = FIELD_MAPPING[collection];
  if (!mapping) return field;

  const reverseMapping = Object.fromEntries(
    Object.entries(mapping).map(([key, value]) => [value, key])
  );

  return reverseMapping[field] || field;
}

// Database operation response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface ListResponse<T> extends Models.DocumentList<T & Models.Document> {}

/**
 * Database operations wrapper
 */
export const db = {
  /**
   * List documents from a collection
   */
  list: async <T = any>(
    collectionId: string,
    queries: string[] = []
  ): Promise<DatabaseResponse<ListResponse<T>>> => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, collectionId, queries);
      return { data: response as ListResponse<T>, error: null };
    } catch (error) {
      logger.error(`Error listing documents from ${collectionId}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get a single document
   */
  get: async <T = any>(
    collectionId: string,
    documentId: string
  ): Promise<DatabaseResponse<T & Models.Document>> => {
    try {
      const response = await databases.getDocument(DATABASE_ID, collectionId, documentId);
      return { data: response as T & Models.Document, error: null };
    } catch (error) {
      logger.error(`Error getting document ${documentId} from ${collectionId}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Create a new document
   */
  create: async <T = any>(
    collectionId: string,
    data: Omit<T, keyof Models.Document>,
    documentId: string = ID.unique(),
    permissions?: string[]
  ): Promise<DatabaseResponse<T & Models.Document>> => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        collectionId,
        documentId,
        data,
        permissions
      );
      return { data: response as T & Models.Document, error: null };
    } catch (error) {
      logger.error(`Error creating document in ${collectionId}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update an existing document
   */
  update: async <T = any>(
    collectionId: string,
    documentId: string,
    data: Partial<Omit<T, keyof Models.Document>>,
    permissions?: string[]
  ): Promise<DatabaseResponse<T & Models.Document>> => {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        collectionId,
        documentId,
        data,
        permissions
      );
      return { data: response as T & Models.Document, error: null };
    } catch (error) {
      logger.error(`Error updating document ${documentId} in ${collectionId}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Delete a document
   */
  delete: async (collectionId: string, documentId: string): Promise<DatabaseResponse<void>> => {
    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
      return { data: null, error: null };
    } catch (error) {
      logger.error(`Error deleting document ${documentId} from ${collectionId}:`, error);
      return { data: null, error: error as Error };
    }
  },
};

/**
 * Query helpers for common database operations
 *
 * These helpers wrap Appwrite Query methods and provide:
 * - Automatic field mapping for collections with Turkish DB fields
 * - Type-safe query building
 * - Consistent query syntax across the application
 *
 * @example Basic Usage (No Field Mapping)
 * ```typescript
 * // For collections with English field names (donations, campaigns, etc.)
 * const queries = [
 *   queryHelpers.equal('status', 'active'),
 *   queryHelpers.greaterThan('amount', 100),
 *   queryHelpers.orderDesc('created_at'),
 *   queryHelpers.limit(10)
 * ];
 * const { data } = await db.list(collections.DONATIONS, queries);
 * ```
 *
 * @example With Field Mapping (Beneficiaries)
 * ```typescript
 * // For beneficiaries with Turkish DB fields
 * const queries = [
 *   queryHelpers.equal('city', 'Istanbul', 'beneficiaries'), // Maps to 'sehri'
 *   queryHelpers.equal('status', 'active', 'beneficiaries'),
 *   queryHelpers.orderDesc('created_at', 'beneficiaries')
 * ];
 * const { data } = await db.list(collections.BENEFICIARIES, queries);
 * ```
 *
 * @example Pagination
 * ```typescript
 * const page = 2;
 * const pageSize = 20;
 * const queries = [
 *   queryHelpers.offset((page - 1) * pageSize),
 *   queryHelpers.limit(pageSize),
 *   queryHelpers.orderDesc('created_at')
 * ];
 * ```
 *
 * @example Complex Filtering
 * ```typescript
 * const queries = [
 *   queryHelpers.equal('status', 'pending'),
 *   queryHelpers.greaterThanEqual('amount', 1000),
 *   queryHelpers.lessThanEqual('amount', 5000),
 *   queryHelpers.greaterThanEqualDate('created_at', '2024-01-01'),
 *   queryHelpers.search('donor_name', 'John'),
 *   queryHelpers.orderAsc('donor_name')
 * ];
 * ```
 *
 * @example Select Specific Fields
 * ```typescript
 * const queries = [
 *   queryHelpers.select(['id', 'name', 'amount', 'status']),
 *   queryHelpers.equal('status', 'completed')
 * ];
 * ```
 */
export const queryHelpers = {
  /**
   * Equal comparison with field mapping
   * @param attribute - The field name to compare
   * @param value - The value to compare against
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for equal comparison
   */
  equal: (
    attribute: string,
    value: string | number | boolean,
    collection?: keyof typeof FIELD_MAPPING
  ) => Query.equal(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Not equal comparison with field mapping
   * @param attribute - The field name to compare
   * @param value - The value to compare against
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for not equal comparison
   */
  notEqual: (
    attribute: string,
    value: string | number | boolean,
    collection?: keyof typeof FIELD_MAPPING
  ) => Query.notEqual(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Less than comparison with field mapping
   * @param attribute - The field name to compare
   * @param value - The value to compare against
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for less than comparison
   */
  lessThan: (attribute: string, value: number, collection?: keyof typeof FIELD_MAPPING) =>
    Query.lessThan(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Less than or equal comparison with field mapping
   * @param attribute - The field name to compare
   * @param value - The value to compare against
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for less than or equal comparison
   */
  lessThanEqual: (attribute: string, value: number, collection?: keyof typeof FIELD_MAPPING) =>
    Query.lessThanEqual(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Less than or equal comparison for dates with field mapping
   * @param attribute - The field name to compare
   * @param value - The date value in ISO format
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for less than or equal date comparison
   */
  lessThanEqualDate: (attribute: string, value: string, collection?: keyof typeof FIELD_MAPPING) =>
    Query.lessThanEqual(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Greater than comparison with field mapping
   * @param attribute - The field name to compare
   * @param value - The value to compare against
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for greater than comparison
   */
  greaterThan: (attribute: string, value: number, collection?: keyof typeof FIELD_MAPPING) =>
    Query.greaterThan(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Greater than or equal comparison with field mapping
   * @param attribute - The field name to compare
   * @param value - The value to compare against
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for greater than or equal comparison
   */
  greaterThanEqual: (attribute: string, value: number, collection?: keyof typeof FIELD_MAPPING) =>
    Query.greaterThanEqual(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Greater than or equal comparison for dates with field mapping
   * @param attribute - The field name to compare
   * @param value - The date value in ISO format
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for greater than or equal date comparison
   */
  greaterThanEqualDate: (
    attribute: string,
    value: string,
    collection?: keyof typeof FIELD_MAPPING
  ) =>
    Query.greaterThanEqual(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Search query with field mapping
   * @param attribute - The field name to search in
   * @param value - The search term
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for search
   * @example
   * ```typescript
   * const query = queryHelpers.search('name', 'John', 'beneficiaries');
   * // Searches for 'John' in the mapped field for 'name'
   * ```
   */
  search: (attribute: string, value: string, collection?: keyof typeof FIELD_MAPPING) =>
    Query.search(collection ? getMappedField(collection, attribute) : attribute, value),

  /**
   * Order by ascending with field mapping
   * @param attribute - The field name to order by
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for ascending order
   */
  orderAsc: (attribute: string, collection?: keyof typeof FIELD_MAPPING) =>
    Query.orderAsc(collection ? getMappedField(collection, attribute) : attribute),

  /**
   * Order by descending with field mapping
   * @param attribute - The field name to order by
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for descending order
   */
  orderDesc: (attribute: string, collection?: keyof typeof FIELD_MAPPING) =>
    Query.orderDesc(collection ? getMappedField(collection, attribute) : attribute),

  /**
   * Limit results
   * @param count - Maximum number of results to return
   * @returns Appwrite Query object for limit
   */
  limit: (count: number) => Query.limit(count),

  /**
   * Offset results
   * @param count - Number of results to skip
   * @returns Appwrite Query object for offset
   */
  offset: (count: number) => Query.offset(count),

  /**
   * Select specific attributes with field mapping
   * @param attributes - Array of field names to select
   * @param collection - Optional collection name for field mapping
   * @returns Appwrite Query object for select
   * @example
   * ```typescript
   * const query = queryHelpers.select(['name', 'city'], 'beneficiaries');
   * // Selects the mapped fields for 'name' and 'city'
   * ```
   */
  select: (attributes: string[], collection?: keyof typeof FIELD_MAPPING) =>
    Query.select(attributes.map((attr) => (collection ? getMappedField(collection, attr) : attr))),
};

/**
 * USAGE NOTES:
 *
 * 1. Field Mapping:
 *    - Only pass the 'collection' parameter for collections with field mappings
 *    - Currently only 'beneficiaries' has field mapping
 *    - For all other collections, omit the collection parameter
 *
 * 2. Query Combination:
 *    - All query helpers return Appwrite Query strings
 *    - Combine multiple queries in an array
 *    - Queries are applied with AND logic
 *
 * 3. Performance:
 *    - Use select() to fetch only needed fields
 *    - Always add limit() to prevent fetching all records
 *    - Use offset() with limit() for pagination
 *
 * 4. Date Queries:
 *    - Use greaterThanEqualDate/lessThanEqualDate for date comparisons
 *    - Date format: ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
 *
 * 5. Search:
 *    - search() performs full-text search on specified field
 *    - Not all fields support search (check Appwrite collection indexes)
 */

/**
 * TESTING QUERY HELPERS
 *
 * To verify query helpers work correctly:
 *
 * 1. Test Field Mapping (Beneficiaries):
 *    ```typescript
 *    const mapped = getMappedField('beneficiaries', 'city');
 *    console.assert(mapped === 'sehri', 'City should map to sehri');
 *
 *    const reverse = getReverseMappedField('beneficiaries', 'sehri');
 *    console.assert(reverse === 'city', 'Sehri should reverse map to city');
 *    ```
 *
 * 2. Test Query Building:
 *    ```typescript
 *    const query = queryHelpers.equal('city', 'Istanbul', 'beneficiaries');
 *    // Should generate: Query.equal('sehri', 'Istanbul')
 *    ```
 *
 * 3. Test No Mapping (Other Collections):
 *    ```typescript
 *    const query = queryHelpers.equal('status', 'active');
 *    // Should generate: Query.equal('status', 'active')
 *    ```
 *
 * 4. Integration Test:
 *    ```typescript
 *    const { data } = await db.list(collections.BENEFICIARIES, [
 *      queryHelpers.equal('city', 'Istanbul', 'beneficiaries'),
 *      queryHelpers.limit(5)
 *    ]);
 *    // Should fetch beneficiaries from Istanbul
 *    ```
 */

/**
 * Validate that a collection has field mapping
 * Useful for debugging and ensuring correct usage
 */
export function hasFieldMapping(collection: string): boolean {
  return collection in FIELD_MAPPING;
}

/**
 * Get all mapped fields for a collection
 * Returns empty object if no mapping exists
 */
export function getCollectionMapping(collection: keyof typeof FIELD_MAPPING) {
  return FIELD_MAPPING[collection] || {};
}

/**
 * Debug helper to log field mapping information
 * Only runs in development mode
 */
export function debugFieldMapping(collection: string, field: string) {
  if (import.meta.env.DEV) {
    const mapped = getMappedField(collection as keyof typeof FIELD_MAPPING, field);
    logger.debug(`Field Mapping: ${collection}.${field} -> ${mapped}`);
  }
}

export default db;
