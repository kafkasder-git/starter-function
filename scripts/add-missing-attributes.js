#!/usr/bin/env node

/**
 * Add Missing Attributes Script
 * Adds missing attributes to existing collections
 */

import { Client, Databases, ID } from 'node-appwrite';
import fs from 'fs';

// Configuration
const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68e99f6c000183bafb39',
  databaseId: 'kafkasder_db',
  apiKey: 'standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e',
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Missing attributes to add
const missingAttributes = {
  user_profiles: [
    { key: 'status', type: 'string', size: 20, required: false },
  ],
  beneficiaries: [
    { key: 'status', type: 'string', size: 20, required: false },
  ],
  donations: [
    { key: 'status', type: 'string', size: 20, required: false },
    { key: 'currency', type: 'string', size: 3, required: false },
  ],
  campaigns: [
    { key: 'status', type: 'string', size: 20, required: false },
    { key: 'currency', type: 'string', size: 3, required: false },
  ],
  aid_applications: [
    { key: 'status', type: 'string', size: 20, required: false },
  ],
  notifications: [
    { key: 'status', type: 'string', size: 20, required: false },
    { key: 'priority', type: 'string', size: 20, required: false },
    { key: 'is_read', type: 'boolean', required: false },
  ],
  tasks: [
    { key: 'status', type: 'string', size: 20, required: false },
    { key: 'priority', type: 'string', size: 20, required: false },
  ],
  finance_transactions: [
    { key: 'status', type: 'string', size: 20, required: false },
    { key: 'currency', type: 'string', size: 3, required: false },
  ],
  legal_consultations: [
    { key: 'status', type: 'string', size: 20, required: false },
  ],
  events: [
    { key: 'status', type: 'string', size: 20, required: false },
    { key: 'current_attendees', type: 'integer', required: false },
    { key: 'registration_required', type: 'boolean', required: false },
  ],
  inventory_items: [
    { key: 'status', type: 'string', size: 20, required: false },
  ],
  backups: [
    { key: 'cron_expression', type: 'string', size: 50, required: false },
    { key: 'is_active', type: 'boolean', required: false },
  ]
};

async function addMissingAttributes() {
  try {
    console.log('🔧 Adding missing attributes to collections...');
    
    for (const [collectionId, attributes] of Object.entries(missingAttributes)) {
      console.log(`\n📁 Processing collection: ${collectionId}`);
      
      for (const attr of attributes) {
        try {
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.size,
              attr.required
            );
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.required
            );
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.required
            );
          }
          console.log(`  ✅ Attribute added: ${attr.key} (${attr.type})`);
        } catch (error) {
          if (error.code === 409) {
            console.log(`  ⚠️  Attribute already exists: ${attr.key}`);
          } else {
            console.error(`  ❌ Error adding attribute ${attr.key}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n🎉 Missing attributes added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding missing attributes:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addMissingAttributes();
}

export { addMissingAttributes };
