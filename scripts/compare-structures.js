#!/usr/bin/env node

/**
 * Compare Project Structure with Database Schema
 * Checks if project types and database collections match
 */

import { Client, Databases, Query } from 'node-appwrite';

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

// Project collections from lib/database.ts
const projectCollections = {
  USER_PROFILES: 'user_profiles',
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
};

// Expected field mappings for beneficiaries (Turkish DB fields)
const expectedBeneficiaryFields = {
  'ad_soyad': 'string',
  'telefon_no': 'string',
  'sehri': 'string',
  'yerlesimi': 'string',
  'mahalle': 'string',
  'adres': 'string',
  'uyruk': 'string',
  'ulkesi': 'string',
  'iban': 'string',
  'ailedeki_kisi_sayisi': 'integer',
  'toplam_tutar': 'double',
  'kategori': 'string',
  'tur': 'string',
  'kayit_tarihi': 'datetime',
  'kimlik_no': 'string',
  'status': 'string',
  'created_at': 'datetime',
  'updated_at': 'datetime',
  'created_by': 'string',
  'updated_by': 'string',
};

// Expected fields for other collections (English fields)
const expectedFields = {
  user_profiles: {
    'user_id': 'string',
    'email': 'string',
    'name': 'string',
    'role': 'string',
    'permissions': 'string',
    'status': 'string',
    'last_login': 'datetime',
    'profile_data': 'string',
    'created_at': 'datetime',
    'updated_at': 'datetime',
  },
  donations: {
    'donor_name': 'string',
    'donor_email': 'string',
    'donor_phone': 'string',
    'amount': 'double',
    'currency': 'string',
    'payment_method': 'string',
    'donation_type': 'string',
    'campaign_id': 'string',
    'beneficiary_id': 'string',
    'status': 'string',
    'notes': 'string',
    'donation_date': 'datetime',
    'created_at': 'datetime',
    'updated_at': 'datetime',
    'created_by': 'string',
    'updated_by': 'string',
  },
  campaigns: {
    'title': 'string',
    'description': 'string',
    'target_amount': 'double',
    'current_amount': 'double',
    'currency': 'string',
    'start_date': 'datetime',
    'end_date': 'datetime',
    'status': 'string',
    'category': 'string',
    'tags': 'string',
    'image_url': 'string',
    'created_at': 'datetime',
    'updated_at': 'datetime',
    'created_by': 'string',
    'updated_by': 'string',
  },
  aid_applications: {
    'applicant_name': 'string',
    'applicant_phone': 'string',
    'applicant_email': 'string',
    'aid_type': 'string',
    'description': 'string',
    'urgency_level': 'string',
    'requested_amount': 'double',
    'status': 'string',
    'reviewer_notes': 'string',
    'application_date': 'datetime',
    'review_date': 'datetime',
    'created_at': 'datetime',
    'updated_at': 'datetime',
    'created_by': 'string',
    'updated_by': 'string',
  },
  notifications: {
    'title': 'string',
    'message': 'string',
    'type': 'string',
    'priority': 'string',
    'target_user_id': 'string',
    'target_role': 'string',
    'is_read': 'boolean',
    'read_at': 'datetime',
    'expires_at': 'datetime',
    'action_url': 'string',
    'created_at': 'datetime',
    'updated_at': 'datetime',
    'created_by': 'string',
  },
  tasks: {
    'title': 'string',
    'description': 'string',
    'priority': 'string',
    'status': 'string',
    'assigned_to': 'string',
    'assigned_by': 'string',
    'due_date': 'datetime',
    'completed_at': 'datetime',
    'tags': 'string',
    'created_at': 'datetime',
    'updated_at': 'datetime',
  },
  finance_transactions: {
    'transaction_type': 'string',
    'amount': 'double',
    'currency': 'string',
    'description': 'string',
    'category': 'string',
    'payment_method': 'string',
    'reference_id': 'string',
    'related_document_id': 'string',
    'related_document_type': 'string',
    'status': 'string',
    'transaction_date': 'datetime',
    'created_at': 'datetime',
    'updated_at': 'datetime',
    'created_by': 'string',
    'updated_by': 'string',
  },
  legal_consultations: {
    'client_name': 'string',
    'client_phone': 'string',
    'client_email': 'string',
    'case_type': 'string',
    'description': 'string',
    'urgency': 'string',
    'status': 'string',
    'lawyer_notes': 'string',
    'appointment_date': 'datetime',
    'consultation_date': 'datetime',
    'created_at': 'datetime',
    'updated_at': 'datetime',
    'created_by': 'string',
    'updated_by': 'string',
  },
  events: {
    'title': 'string',
    'description': 'string',
    'event_type': 'string',
    'start_date': 'datetime',
    'end_date': 'datetime',
    'location': 'string',
    'max_attendees': 'integer',
    'current_attendees': 'integer',
    'status': 'string',
    'registration_required': 'boolean',
    'created_at': 'datetime',
    'updated_at': 'datetime',
    'created_by': 'string',
    'updated_by': 'string',
  },
  inventory_items: {
    'item_name': 'string',
    'description': 'string',
    'category': 'string',
    'quantity': 'integer',
    'unit': 'string',
    'unit_price': 'double',
    'total_value': 'double',
    'supplier': 'string',
    'purchase_date': 'datetime',
    'expiry_date': 'datetime',
    'location': 'string',
    'status': 'string',
    'created_at': 'datetime',
    'updated_at': 'datetime',
    'created_by': 'string',
    'updated_by': 'string',
  },
  backups: {
    'backup_id': 'string',
    'name': 'string',
    'description': 'string',
    'timestamp': 'datetime',
    'total_documents': 'integer',
    'total_collections': 'integer',
    'version': 'string',
    'app_version': 'string',
    'collections': 'string',
    'created_at': 'datetime',
    'cron_expression': 'string',
    'is_active': 'boolean',
  }
};

async function compareStructures() {
  try {
    console.log('🔍 Comparing project structure with database schema...\n');
    
    // Get all collections from database
    const dbCollections = await databases.listCollections(config.databaseId);
    console.log(`📁 Found ${dbCollections.total} collections in database\n`);
    
    // Check if all project collections exist in database
    console.log('✅ Checking collection existence:');
    const missingCollections = [];
    const extraCollections = [];
    
    // Check project collections against database
    for (const [key, collectionId] of Object.entries(projectCollections)) {
      const exists = dbCollections.collections?.find(col => col.$id === collectionId);
      if (exists) {
        console.log(`  ✅ ${key} (${collectionId}) - EXISTS`);
      } else {
        console.log(`  ❌ ${key} (${collectionId}) - MISSING`);
        missingCollections.push(collectionId);
      }
    }
    
    // Check for extra collections in database
    if (dbCollections.collections) {
      for (const dbCol of dbCollections.collections) {
        const exists = Object.values(projectCollections).includes(dbCol.$id);
        if (!exists) {
          console.log(`  ⚠️  ${dbCol.$id} - EXTRA (not in project)`);
          extraCollections.push(dbCol.$id);
        }
      }
    }
    
    console.log('\n🔍 Checking field structures:');
    
    // Check field structures for each collection
    for (const [key, collectionId] of Object.entries(projectCollections)) {
      console.log(`\n📋 ${key} (${collectionId}):`);
      
      try {
        const collection = await databases.getCollection(config.databaseId, collectionId);
        const dbAttributes = collection.attributes || [];
        
        // Get expected fields for this collection
        let expectedFieldsForCollection;
        if (collectionId === 'beneficiaries') {
          expectedFieldsForCollection = expectedBeneficiaryFields;
        } else {
          expectedFieldsForCollection = expectedFields[collectionId] || {};
        }
        
        // Check for missing fields
        const missingFields = [];
        for (const [fieldName, fieldType] of Object.entries(expectedFieldsForCollection)) {
          const exists = dbAttributes.find(attr => attr.key === fieldName);
          if (exists) {
            console.log(`    ✅ ${fieldName} (${fieldType}) - EXISTS`);
          } else {
            console.log(`    ❌ ${fieldName} (${fieldType}) - MISSING`);
            missingFields.push(fieldName);
          }
        }
        
        // Check for extra fields
        const extraFields = [];
        for (const dbAttr of dbAttributes) {
          const expected = expectedFieldsForCollection[dbAttr.key];
          if (!expected) {
            console.log(`    ⚠️  ${dbAttr.key} (${dbAttr.type}) - EXTRA`);
            extraFields.push(dbAttr.key);
          }
        }
        
        if (missingFields.length === 0 && extraFields.length === 0) {
          console.log(`    🎉 Perfect match!`);
        }
        
      } catch (error) {
        console.log(`    ❌ Error checking collection: ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n📊 COMPARISON SUMMARY:');
    console.log(`   Project Collections: ${Object.keys(projectCollections).length}`);
    console.log(`   Database Collections: ${dbCollections.total}`);
    console.log(`   Missing Collections: ${missingCollections.length}`);
    console.log(`   Extra Collections: ${extraCollections.length}`);
    
    if (missingCollections.length > 0) {
      console.log(`\n❌ Missing Collections:`);
      missingCollections.forEach(col => console.log(`   - ${col}`));
    }
    
    if (extraCollections.length > 0) {
      console.log(`\n⚠️  Extra Collections:`);
      extraCollections.forEach(col => console.log(`   - ${col}`));
    }
    
    // Check user creation
    console.log('\n👤 Checking user creation:');
    try {
      const users = await databases.listDocuments(
        config.databaseId,
        'user_profiles',
        [Query.limit(10)]
      );
      console.log(`   ✅ User profiles collection accessible`);
      console.log(`   📊 Found ${users.total} user profiles`);
      
      if (users.documents) {
        users.documents.forEach(user => {
          console.log(`     - ${user.name} (${user.email}) - ${user.role || 'no role'}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error accessing user profiles: ${error.message}`);
    }
    
    // Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');
    if (missingCollections.length === 0 && extraCollections.length === 0) {
      console.log('   ✅ PERFECT MATCH: Project structure and database schema are identical!');
    } else if (missingCollections.length === 0) {
      console.log('   ✅ GOOD MATCH: All project collections exist, some extra collections in database');
    } else {
      console.log('   ⚠️  MISMATCH: Some project collections are missing from database');
    }
    
  } catch (error) {
    console.error('❌ Error comparing structures:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  compareStructures();
}

export { compareStructures };
