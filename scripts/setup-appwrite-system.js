#!/usr/bin/env node

/**
 * Complete Appwrite System Setup Script
 * Sets up database, collections, RLS policies, initial users, and backup system
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

// Configuration
const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68e99f6c000183bafb39',
  projectName: 'KafkasPortal',
  databaseId: process.env.APPWRITE_DATABASE_ID || 'kafkasder_db',
  apiKey: process.env.APPWRITE_API_KEY || 'standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e',
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Collection schemas with proper attributes
const collections = {
  user_profiles: {
    name: 'User Profiles',
    documentSecurity: true,
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 50, required: true },
      { key: 'permissions', type: 'string', size: 1000, required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'last_login', type: 'datetime', required: false },
      { key: 'profile_data', type: 'string', size: 2000, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'user_id_idx', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'email_idx', type: 'key', attributes: ['email'], orders: ['ASC'] },
      { key: 'role_idx', type: 'key', attributes: ['role'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ]
  },

  beneficiaries: {
    name: 'Beneficiaries',
    documentSecurity: true,
    attributes: [
      { key: 'ad_soyad', type: 'string', size: 255, required: true },
      { key: 'telefon_no', type: 'string', size: 20, required: true },
      { key: 'sehri', type: 'string', size: 100, required: true },
      { key: 'yerlesimi', type: 'string', size: 100, required: true },
      { key: 'mahalle', type: 'string', size: 100, required: false },
      { key: 'adres', type: 'string', size: 500, required: false },
      { key: 'uyruk', type: 'string', size: 50, required: true },
      { key: 'ulkesi', type: 'string', size: 100, required: true },
      { key: 'iban', type: 'string', size: 34, required: false },
      { key: 'ailedeki_kisi_sayisi', type: 'integer', required: true },
      { key: 'toplam_tutar', type: 'double', required: true },
      { key: 'kategori', type: 'string', size: 200, required: false },
      { key: 'tur', type: 'string', size: 200, required: false },
      { key: 'kayit_tarihi', type: 'datetime', required: true },
      { key: 'kimlik_no', type: 'string', size: 20, required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'ad_soyad_idx', type: 'key', attributes: ['ad_soyad'], orders: ['ASC'] },
      { key: 'telefon_idx', type: 'key', attributes: ['telefon_no'], orders: ['ASC'] },
      { key: 'sehri_idx', type: 'key', attributes: ['sehri'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'kayit_tarihi_idx', type: 'key', attributes: ['kayit_tarihi'], orders: ['DESC'] },
    ]
  },

  donations: {
    name: 'Donations',
    documentSecurity: true,
    attributes: [
      { key: 'donor_name', type: 'string', size: 255, required: true },
      { key: 'donor_email', type: 'string', size: 255, required: false },
      { key: 'donor_phone', type: 'string', size: 20, required: false },
      { key: 'amount', type: 'double', required: true },
      { key: 'currency', type: 'string', size: 3, required: false },
      { key: 'payment_method', type: 'string', size: 50, required: true },
      { key: 'donation_type', type: 'string', size: 50, required: true },
      { key: 'campaign_id', type: 'string', size: 255, required: false },
      { key: 'beneficiary_id', type: 'string', size: 255, required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'notes', type: 'string', size: 1000, required: false },
      { key: 'donation_date', type: 'datetime', required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'donor_name_idx', type: 'key', attributes: ['donor_name'], orders: ['ASC'] },
      { key: 'amount_idx', type: 'key', attributes: ['amount'], orders: ['DESC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'donation_date_idx', type: 'key', attributes: ['donation_date'], orders: ['DESC'] },
      { key: 'campaign_idx', type: 'key', attributes: ['campaign_id'], orders: ['ASC'] },
    ]
  },

  campaigns: {
    name: 'Campaigns',
    documentSecurity: true,
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'target_amount', type: 'double', required: true },
      { key: 'current_amount', type: 'double', required: false },
      { key: 'currency', type: 'string', size: 3, required: false },
      { key: 'start_date', type: 'datetime', required: true },
      { key: 'end_date', type: 'datetime', required: true },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'image_url', type: 'string', size: 500, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'title_idx', type: 'key', attributes: ['title'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'start_date_idx', type: 'key', attributes: ['start_date'], orders: ['DESC'] },
      { key: 'target_amount_idx', type: 'key', attributes: ['target_amount'], orders: ['DESC'] },
    ]
  },

  aid_applications: {
    name: 'Aid Applications',
    documentSecurity: true,
    attributes: [
      { key: 'applicant_name', type: 'string', size: 255, required: true },
      { key: 'applicant_phone', type: 'string', size: 20, required: true },
      { key: 'applicant_email', type: 'string', size: 255, required: false },
      { key: 'aid_type', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'urgency_level', type: 'string', size: 20, required: true },
      { key: 'requested_amount', type: 'double', required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'reviewer_notes', type: 'string', size: 1000, required: false },
      { key: 'application_date', type: 'datetime', required: true },
      { key: 'review_date', type: 'datetime', required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'applicant_name_idx', type: 'key', attributes: ['applicant_name'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'urgency_idx', type: 'key', attributes: ['urgency_level'], orders: ['ASC'] },
      { key: 'application_date_idx', type: 'key', attributes: ['application_date'], orders: ['DESC'] },
    ]
  },

  notifications: {
    name: 'Notifications',
    documentSecurity: true,
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'priority', type: 'string', size: 20, required: false },
      { key: 'target_user_id', type: 'string', size: 255, required: false },
      { key: 'target_role', type: 'string', size: 50, required: false },
      { key: 'is_read', type: 'boolean', required: false },
      { key: 'read_at', type: 'datetime', required: false },
      { key: 'expires_at', type: 'datetime', required: false },
      { key: 'action_url', type: 'string', size: 500, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
    ],
    indexes: [
      { key: 'target_user_idx', type: 'key', attributes: ['target_user_id'], orders: ['ASC'] },
      { key: 'type_idx', type: 'key', attributes: ['type'], orders: ['ASC'] },
      { key: 'is_read_idx', type: 'key', attributes: ['is_read'], orders: ['ASC'] },
      { key: 'created_at_idx', type: 'key', attributes: ['created_at'], orders: ['DESC'] },
    ]
  },

  tasks: {
    name: 'Tasks',
    documentSecurity: true,
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'priority', type: 'string', size: 20, required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'assigned_to', type: 'string', size: 255, required: false },
      { key: 'assigned_by', type: 'string', size: 255, required: true },
      { key: 'due_date', type: 'datetime', required: false },
      { key: 'completed_at', type: 'datetime', required: false },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'assigned_to_idx', type: 'key', attributes: ['assigned_to'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'priority_idx', type: 'key', attributes: ['priority'], orders: ['ASC'] },
      { key: 'due_date_idx', type: 'key', attributes: ['due_date'], orders: ['ASC'] },
    ]
  },

  finance_transactions: {
    name: 'Finance Transactions',
    documentSecurity: true,
    attributes: [
      { key: 'transaction_type', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'currency', type: 'string', size: 3, required: false },
      { key: 'description', type: 'string', size: 500, required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'payment_method', type: 'string', size: 50, required: true },
      { key: 'reference_id', type: 'string', size: 255, required: false },
      { key: 'related_document_id', type: 'string', size: 255, required: false },
      { key: 'related_document_type', type: 'string', size: 50, required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'transaction_date', type: 'datetime', required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'transaction_type_idx', type: 'key', attributes: ['transaction_type'], orders: ['ASC'] },
      { key: 'amount_idx', type: 'key', attributes: ['amount'], orders: ['DESC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'transaction_date_idx', type: 'key', attributes: ['transaction_date'], orders: ['DESC'] },
      { key: 'category_idx', type: 'key', attributes: ['category'], orders: ['ASC'] },
    ]
  },

  legal_consultations: {
    name: 'Legal Consultations',
    documentSecurity: true,
    attributes: [
      { key: 'client_name', type: 'string', size: 255, required: true },
      { key: 'client_phone', type: 'string', size: 20, required: true },
      { key: 'client_email', type: 'string', size: 255, required: false },
      { key: 'case_type', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'urgency', type: 'string', size: 20, required: true },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'lawyer_notes', type: 'string', size: 2000, required: false },
      { key: 'appointment_date', type: 'datetime', required: false },
      { key: 'consultation_date', type: 'datetime', required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'client_name_idx', type: 'key', attributes: ['client_name'], orders: ['ASC'] },
      { key: 'case_type_idx', type: 'key', attributes: ['case_type'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'consultation_date_idx', type: 'key', attributes: ['consultation_date'], orders: ['DESC'] },
    ]
  },

  events: {
    name: 'Events',
    documentSecurity: true,
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'event_type', type: 'string', size: 50, required: true },
      { key: 'start_date', type: 'datetime', required: true },
      { key: 'end_date', type: 'datetime', required: true },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'max_attendees', type: 'integer', required: false },
      { key: 'current_attendees', type: 'integer', required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'registration_required', type: 'boolean', required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'title_idx', type: 'key', attributes: ['title'], orders: ['ASC'] },
      { key: 'event_type_idx', type: 'key', attributes: ['event_type'], orders: ['ASC'] },
      { key: 'start_date_idx', type: 'key', attributes: ['start_date'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ]
  },

  inventory_items: {
    name: 'Inventory Items',
    documentSecurity: true,
    attributes: [
      { key: 'item_name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'quantity', type: 'integer', required: true },
      { key: 'unit', type: 'string', size: 20, required: true },
      { key: 'unit_price', type: 'double', required: false },
      { key: 'total_value', type: 'double', required: false },
      { key: 'supplier', type: 'string', size: 255, required: false },
      { key: 'purchase_date', type: 'datetime', required: false },
      { key: 'expiry_date', type: 'datetime', required: false },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'item_name_idx', type: 'key', attributes: ['item_name'], orders: ['ASC'] },
      { key: 'category_idx', type: 'key', attributes: ['category'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'quantity_idx', type: 'key', attributes: ['quantity'], orders: ['DESC'] },
    ]
  },

  backups: {
    name: 'Backups',
    documentSecurity: true,
    attributes: [
      { key: 'backup_id', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'timestamp', type: 'datetime', required: true },
      { key: 'total_documents', type: 'integer', required: true },
      { key: 'total_collections', type: 'integer', required: true },
      { key: 'version', type: 'string', size: 20, required: true },
      { key: 'app_version', type: 'string', size: 20, required: true },
      { key: 'collections', type: 'string', size: 1000, required: false },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'backup_id_idx', type: 'key', attributes: ['backup_id'], orders: ['ASC'] },
      { key: 'timestamp_idx', type: 'key', attributes: ['timestamp'], orders: ['DESC'] },
      { key: 'name_idx', type: 'key', attributes: ['name'], orders: ['ASC'] },
    ]
  }
};

// Helper functions
async function createDatabase() {
  try {
    console.log('Creating database...');
    const database = await databases.create(
      config.databaseId,
      'Kafkasder Database',
      true
    );
    console.log(`✅ Database created: ${database.$id}`);
    return database.$id;
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  Database already exists, using existing database...');
      return config.databaseId;
    }
    throw error;
  }
}

async function createCollection(collectionId, schema) {
  try {
    console.log(`📁 Creating collection: ${collectionId}`);
    const collection = await databases.createCollection(
      config.databaseId,
      collectionId,
      schema.name,
      ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      schema.documentSecurity,
      true
    );
    console.log(`✅ Collection created: ${collection.$id}`);

    // Create attributes
    for (const attr of schema.attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            config.databaseId,
            collection.$id,
            attr.key,
            attr.size,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            config.databaseId,
            collection.$id,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            config.databaseId,
            collection.$id,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            config.databaseId,
            collection.$id,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            config.databaseId,
            collection.$id,
            attr.key,
            attr.required
          );
        }
        console.log(`  ✅ Attribute created: ${attr.key} (${attr.type})`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ⚠️  Attribute already exists: ${attr.key}`);
        } else {
          console.error(`  ❌ Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }

    // Create indexes
    for (const index of schema.indexes) {
      try {
        await databases.createIndex(
          config.databaseId,
          collection.$id,
          index.key,
          index.type,
          index.attributes,
          index.orders
        );
        console.log(`  ✅ Index created: ${index.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ⚠️  Index already exists: ${index.key}`);
        } else {
          console.error(`  ❌ Error creating index ${index.key}:`, error.message);
        }
      }
    }

    return collection.$id;
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Collection already exists: ${collectionId}`);
      return collectionId;
    }
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log('👤 Creating initial users...');
    
    const initialUsers = [
      {
        user_id: 'admin-user',
        email: 'admin@kafkasder.org',
        name: 'System Administrator',
        role: 'admin',
        status: 'active'
      },
      {
        user_id: 'manager-user',
        email: 'manager@kafkasder.org',
        name: 'Manager User',
        role: 'manager',
        status: 'active'
      },
      {
        user_id: 'operator-user',
        email: 'operator@kafkasder.org',
        name: 'Operator User',
        role: 'operator',
        status: 'active'
      },
      {
        user_id: 'viewer-user',
        email: 'viewer@kafkasder.org',
        name: 'Viewer User',
        role: 'viewer',
        status: 'active'
      }
    ];

    for (const userData of initialUsers) {
      try {
        const permissions = getRolePermissions(userData.role);
        const user = await databases.createDocument(
          config.databaseId,
          'user_profiles',
          ID.unique(),
          {
            user_id: userData.user_id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            permissions: JSON.stringify(permissions),
            status: userData.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(userData.user_id)),
            Permission.delete(Role.user(userData.user_id)),
          ]
        );
        console.log(`  ✅ User created: ${userData.email} (${userData.role})`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ⚠️  User already exists: ${userData.email}`);
        } else {
          console.error(`  ❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error creating initial users:', error);
  }
}

function getRolePermissions(role) {
  const permissions = {
    admin: [
      'create_user', 'read_user', 'update_user', 'delete_user',
      'create_beneficiary', 'read_beneficiary', 'update_beneficiary', 'delete_beneficiary',
      'create_donation', 'read_donation', 'update_donation', 'delete_donation',
      'create_campaign', 'read_campaign', 'update_campaign', 'delete_campaign',
      'create_aid_application', 'read_aid_application', 'update_aid_application', 'delete_aid_application',
      'create_finance_transaction', 'read_finance_transaction', 'update_finance_transaction', 'delete_finance_transaction',
      'create_legal_consultation', 'read_legal_consultation', 'update_legal_consultation', 'delete_legal_consultation',
      'create_event', 'read_event', 'update_event', 'delete_event',
      'create_inventory_item', 'read_inventory_item', 'update_inventory_item', 'delete_inventory_item',
      'create_task', 'read_task', 'update_task', 'delete_task',
      'create_notification', 'read_notification', 'update_notification', 'delete_notification',
      'read_system_settings', 'update_system_settings', 'read_audit_logs', 'export_data', 'import_data'
    ],
    manager: [
      'read_user', 'update_user',
      'create_beneficiary', 'read_beneficiary', 'update_beneficiary',
      'create_donation', 'read_donation', 'update_donation',
      'create_campaign', 'read_campaign', 'update_campaign',
      'create_aid_application', 'read_aid_application', 'update_aid_application',
      'create_finance_transaction', 'read_finance_transaction', 'update_finance_transaction',
      'create_legal_consultation', 'read_legal_consultation', 'update_legal_consultation',
      'create_event', 'read_event', 'update_event',
      'create_inventory_item', 'read_inventory_item', 'update_inventory_item',
      'create_task', 'read_task', 'update_task',
      'create_notification', 'read_notification', 'update_notification',
      'read_system_settings', 'export_data'
    ],
    operator: [
      'read_user',
      'read_beneficiary', 'update_beneficiary',
      'create_donation', 'read_donation', 'update_donation',
      'read_campaign',
      'create_aid_application', 'read_aid_application', 'update_aid_application',
      'read_finance_transaction',
      'create_legal_consultation', 'read_legal_consultation',
      'read_event',
      'read_inventory_item', 'update_inventory_item',
      'read_task', 'update_task',
      'read_notification', 'update_notification'
    ],
    viewer: [
      'read_user', 'read_beneficiary', 'read_donation', 'read_campaign',
      'read_aid_application', 'read_finance_transaction', 'read_legal_consultation',
      'read_event', 'read_inventory_item', 'read_task', 'read_notification'
    ]
  };

  return permissions[role] || [];
}

async function createSampleData() {
  try {
    console.log('📊 Creating sample data...');
    
    // Sample beneficiaries
    const sampleBeneficiaries = [
      {
        ad_soyad: 'Ahmet Yılmaz',
        telefon_no: '+905551234567',
        sehri: 'İstanbul',
        yerlesimi: 'Kadıköy',
        mahalle: 'Moda',
        adres: 'Moda Mahallesi, Kadıköy/İstanbul',
        uyruk: 'Türk',
        ulkesi: 'Türkiye',
        iban: 'TR1234567890123456789012345',
        ailedeki_kisi_sayisi: 4,
        toplam_tutar: 5000,
        kategori: 'Yardım',
        tur: 'Nakit',
        kayit_tarihi: new Date().toISOString(),
        kimlik_no: '12345678901',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      },
      {
        ad_soyad: 'Fatma Demir',
        telefon_no: '+905559876543',
        sehri: 'Ankara',
        yerlesimi: 'Çankaya',
        mahalle: 'Kızılay',
        adres: 'Kızılay Mahallesi, Çankaya/Ankara',
        uyruk: 'Türk',
        ulkesi: 'Türkiye',
        iban: 'TR9876543210987654321098765',
        ailedeki_kisi_sayisi: 3,
        toplam_tutar: 3000,
        kategori: 'Yardım',
        tur: 'Nakit',
        kayit_tarihi: new Date().toISOString(),
        kimlik_no: '98765432109',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      }
    ];

    for (const beneficiary of sampleBeneficiaries) {
      try {
        await databases.createDocument(
          config.databaseId,
          'beneficiaries',
          ID.unique(),
          beneficiary,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user('admin-user')),
            Permission.delete(Role.user('admin-user')),
          ]
        );
        console.log(`  ✅ Sample beneficiary created: ${beneficiary.ad_soyad}`);
      } catch (error) {
        console.error(`  ❌ Error creating sample beneficiary:`, error.message);
      }
    }

    // Sample donations
    const sampleDonations = [
      {
        donor_name: 'Mehmet Kaya',
        donor_email: 'mehmet@example.com',
        donor_phone: '+905551112233',
        amount: 1000,
        currency: 'TRY',
        payment_method: 'Bank Transfer',
        donation_type: 'Regular',
        status: 'completed',
        notes: 'Monthly donation',
        donation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      },
      {
        donor_name: 'Ayşe Özkan',
        donor_email: 'ayse@example.com',
        donor_phone: '+905554445566',
        amount: 500,
        currency: 'TRY',
        payment_method: 'Credit Card',
        donation_type: 'One-time',
        status: 'completed',
        notes: 'Emergency donation',
        donation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      }
    ];

    for (const donation of sampleDonations) {
      try {
        await databases.createDocument(
          config.databaseId,
          'donations',
          ID.unique(),
          donation,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user('admin-user')),
            Permission.delete(Role.user('admin-user')),
          ]
        );
        console.log(`  ✅ Sample donation created: ${donation.donor_name}`);
      } catch (error) {
        console.error(`  ❌ Error creating sample donation:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

async function createBackupSchedule() {
  try {
    console.log('🔄 Setting up backup schedule...');
    
    const backupSchedule = {
      cron_expression: '0 2 * * *', // Daily at 2 AM
      is_active: true,
      description: 'Daily automatic backup',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await databases.createDocument(
      config.databaseId,
      'backups',
      ID.unique(),
      backupSchedule,
      [
        Permission.read(Role.any()),
        Permission.update(Role.user('admin-user')),
        Permission.delete(Role.user('admin-user')),
      ]
    );

    console.log('✅ Backup schedule created');
  } catch (error) {
    console.error('❌ Error creating backup schedule:', error);
  }
}

// Main setup function
async function setupCompleteSystem() {
  try {
    console.log('🚀 Starting complete Appwrite system setup...');
    console.log(`📍 Endpoint: ${config.endpoint}`);
    console.log(`🔑 Project ID: ${config.projectId}`);
    console.log(`🗄️  Database ID: ${config.databaseId}`);
    console.log('');

    // Step 1: Create database
    const databaseId = await createDatabase();
    config.databaseId = databaseId;
    console.log('');

    // Step 2: Create collections
    console.log('📁 Creating collections...');
    for (const [collectionId, schema] of Object.entries(collections)) {
      await createCollection(collectionId, schema);
    }
    console.log('');

    // Step 3: Create initial users
    await createInitialUsers();
    console.log('');

    // Step 4: Create sample data
    await createSampleData();
    console.log('');

    // Step 5: Setup backup schedule
    await createBackupSchedule();
    console.log('');

    // Step 6: Create environment file
    await createEnvironmentFile();
    console.log('');

    console.log('🎉 Complete system setup finished successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Database ID: ${config.databaseId}`);
    console.log(`   Collections: ${Object.keys(collections).length}`);
    console.log(`   Initial Users: 4 (admin, manager, operator, viewer)`);
    console.log(`   Sample Data: 2 beneficiaries, 2 donations`);
    console.log(`   Backup Schedule: Daily at 2 AM`);
    console.log('');
    console.log('🔐 Default Users:');
    console.log('   admin@kafkasder.org (Admin)');
    console.log('   manager@kafkasder.org (Manager)');
    console.log('   operator@kafkasder.org (Operator)');
    console.log('   viewer@kafkasder.org (Viewer)');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Update your .env file with the database ID');
    console.log('2. Set up Appwrite API key for MCP server');
    console.log('3. Test the application with different user roles');
    console.log('4. Configure backup storage location');
    console.log('5. Set up email notifications');

  } catch (error) {
    console.error('❌ System setup failed:', error);
    process.exit(1);
  }
}

async function createEnvironmentFile() {
  try {
    const envContent = `# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=${config.endpoint}
VITE_APPWRITE_PROJECT_ID=${config.projectId}
VITE_APPWRITE_PROJECT_NAME=KafkasPortal
VITE_APPWRITE_DATABASE_ID=${config.databaseId}

# Appwrite API Key (for MCP server)
APPWRITE_API_KEY=${config.apiKey}

# Application Configuration
VITE_APP_NAME=Kafkasder Management System
VITE_APP_VERSION=1.0.0
VITE_APP_DEBUG=true

# Features
VITE_ENABLE_OCR=true
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_OFFLINE_MODE=true

# Security
VITE_CSRF_SECRET=your-csrf-secret-here
VITE_SESSION_TIMEOUT=3600
VITE_RATE_LIMIT=100

# Sentry (optional)
VITE_SENTRY_DSN=your-sentry-dsn-here
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Environment file created: .env');
  } catch (error) {
    console.error('❌ Error creating environment file:', error);
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCompleteSystem();
}

export { setupCompleteSystem, config, collections };
