/**
 * @fileoverview Appwrite Collection Creator Script
 * @description Bu script gerekli Appwrite collection'larını oluşturur
 */

import { databases, DATABASE_ID, ID } from '../lib/appwrite.js';

const PROJECT_ID = '68e99f6c000183bafb39';
const DATABASE_ID = 'kafkasder_db';

// Collection tanımları
const collections = [
  {
    id: 'users',
    name: 'Users',
    enabled: true,
    documentSecurity: true,
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true, array: false, default: null },
      { key: 'email', type: 'string', size: 255, required: true, array: false, default: null },
      { key: 'phone', type: 'string', size: 20, required: false, array: false, default: null },
      { key: 'role', type: 'string', size: 50, required: true, array: false, default: 'viewer' },
      { key: 'status', type: 'string', size: 50, required: true, array: false, default: 'active' },
      { key: 'department', type: 'string', size: 100, required: false, array: false, default: null },
      { key: 'permissions', type: 'string', size: 1000, required: false, array: true, default: null },
      { key: 'avatar', type: 'string', size: 500, required: false, array: false, default: null },
      { key: 'last_login', type: 'datetime', required: false, array: false, default: null },
      { key: 'created_by', type: 'string', size: 255, required: false, array: false, default: null },
      { key: 'deleted_at', type: 'datetime', required: false, array: false, default: null },
      { key: 'password_reset_required', type: 'boolean', required: false, array: false, default: false },
      { key: 'password_reset_token', type: 'string', size: 255, required: false, array: false, default: null }
    ],
    indexes: [
      { key: 'email_index', type: 'unique', attributes: ['email'] },
      { key: 'role_index', type: 'key', attributes: ['role'] },
      { key: 'status_index', type: 'key', attributes: ['status'] },
      { key: 'created_at_index', type: 'key', attributes: ['$createdAt'] }
    ]
  },
  {
    id: 'user_activities',
    name: 'User Activities',
    enabled: true,
    documentSecurity: true,
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true, array: false, default: null },
      { key: 'action', type: 'string', size: 100, required: true, array: false, default: null },
      { key: 'description', type: 'string', size: 500, required: false, array: false, default: null },
      { key: 'ip_address', type: 'string', size: 45, required: false, array: false, default: null },
      { key: 'user_agent', type: 'string', size: 1000, required: false, array: false, default: null },
      { key: 'metadata', type: 'string', size: 2000, required: false, array: false, default: '{}' }
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
      { key: 'action_index', type: 'key', attributes: ['action'] },
      { key: 'created_at_index', type: 'key', attributes: ['$createdAt'] }
    ]
  },
  {
    id: 'workflows',
    name: 'Workflows',
    enabled: true,
    documentSecurity: true,
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true, array: false, default: null },
      { key: 'description', type: 'string', size: 1000, required: false, array: false, default: null },
      { key: 'status', type: 'string', size: 50, required: true, array: false, default: 'inactive' },
      { key: 'trigger_type', type: 'string', size: 100, required: true, array: false, default: null },
      { key: 'trigger_conditions', type: 'string', size: 2000, required: false, array: false, default: '{}' },
      { key: 'steps', type: 'string', size: 5000, required: true, array: false, default: '[]' },
      { key: 'last_run', type: 'datetime', required: false, array: false, default: null },
      { key: 'next_run', type: 'datetime', required: false, array: false, default: null },
      { key: 'success_rate', type: 'integer', required: false, array: false, default: 0 },
      { key: 'created_by', type: 'string', size: 255, required: false, array: false, default: null }
    ],
    indexes: [
      { key: 'status_index', type: 'key', attributes: ['status'] },
      { key: 'trigger_type_index', type: 'key', attributes: ['trigger_type'] },
      { key: 'created_at_index', type: 'key', attributes: ['$createdAt'] }
    ]
  },
  {
    id: 'automation_rules',
    name: 'Automation Rules',
    enabled: true,
    documentSecurity: true,
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true, array: false, default: null },
      { key: 'description', type: 'string', size: 1000, required: false, array: false, default: null },
      { key: 'is_active', type: 'boolean', required: true, array: false, default: true },
      { key: 'rule_type', type: 'string', size: 100, required: true, array: false, default: null },
      { key: 'conditions', type: 'string', size: 2000, required: true, array: false, default: '{}' },
      { key: 'actions', type: 'string', size: 2000, required: true, array: false, default: '[]' },
      { key: 'priority', type: 'integer', required: false, array: false, default: 0 },
      { key: 'created_by', type: 'string', size: 255, required: false, array: false, default: null }
    ],
    indexes: [
      { key: 'is_active_index', type: 'key', attributes: ['is_active'] },
      { key: 'rule_type_index', type: 'key', attributes: ['rule_type'] },
      { key: 'priority_index', type: 'key', attributes: ['priority'] }
    ]
  }
];

async function createCollections() {
  console.log('🚀 Appwrite Collection'ları oluşturuluyor...');
  
  for (const collection of collections) {
    try {
      console.log(`📝 ${collection.name} collection'ı oluşturuluyor...`);
      
      // Collection oluştur
      const collectionResult = await databases.createCollection(
        PROJECT_ID,
        DATABASE_ID,
        collection.id,
        collection.name,
        collection.permissions,
        collection.documentSecurity,
        collection.enabled
      );
      
      console.log(`✅ Collection oluşturuldu: ${collection.id} (${collectionResult.$id})`);
      
      // Attributes ekle
      for (const attr of collection.attributes) {
        try {
          await databases.createStringAttribute(
            PROJECT_ID,
            DATABASE_ID,
            collection.id,
            attr.key,
            attr.size || 255,
            attr.required,
            attr.default,
            attr.array
          );
          console.log(`  ✓ String attribute: ${attr.key}`);
        } catch (attrError) {
          if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              PROJECT_ID,
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required,
              attr.default,
              attr.array
            );
            console.log(`  ✓ Datetime attribute: ${attr.key}`);
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              PROJECT_ID,
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required,
              attr.default,
              attr.array
            );
            console.log(`  ✓ Boolean attribute: ${attr.key}`);
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              PROJECT_ID,
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required,
              attr.min || null,
              attr.max || null,
              attr.default,
              attr.array
            );
            console.log(`  ✓ Integer attribute: ${attr.key}`);
          }
        }
      }
      
      // Indexes ekle
      for (const index of collection.indexes) {
        try {
          await databases.createIndex(
            PROJECT_ID,
            DATABASE_ID,
            collection.id,
            index.key,
            index.type,
            index.attributes,
            index.orders || []
          );
          console.log(`  ✓ Index: ${index.key} (${index.type})`);
        } catch (indexError) {
          console.log(`  ⚠️ Index oluşturulamadı: ${index.key}`, indexError.message);
        }
      }
      
      console.log(`🎉 ${collection.name} tamamlandı!\n`);
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`⚠️ ${collection.name} zaten mevcut, atlanıyor...`);
      } else {
        console.error(`❌ ${collection.name} oluşturulamadı:`, error.message);
      }
    }
  }
  
  console.log('🏁 Tüm collection'lar oluşturuldu!');
}

// Script'i çalıştır
createCollections().catch(console.error);
