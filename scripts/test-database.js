#!/usr/bin/env node

/**
 * Test Database Script
 * Tests database operations and permissions
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

async function testDatabase() {
  try {
    console.log('🧪 Testing database operations...');
    
    // Test 1: List all collections
    console.log('\n📁 Testing collection listing...');
    const collections = await databases.listCollections(config.databaseId);
    console.log(`✅ Found ${collections.total} collections:`);
    if (collections.documents) {
      collections.documents.forEach(collection => {
        console.log(`  - ${collection.name} (${collection.$id})`);
      });
    }
    
    // Test 2: Test beneficiaries collection
    console.log('\n👥 Testing beneficiaries collection...');
    const beneficiaries = await databases.listDocuments(
      config.databaseId,
      'beneficiaries',
      [Query.limit(5)]
    );
    console.log(`✅ Found ${beneficiaries.total} beneficiaries:`);
    if (beneficiaries.documents) {
      beneficiaries.documents.forEach(beneficiary => {
        console.log(`  - ${beneficiary.ad_soyad} (${beneficiary.status})`);
      });
    }
    
    // Test 3: Test donations collection
    console.log('\n💰 Testing donations collection...');
    const donations = await databases.listDocuments(
      config.databaseId,
      'donations',
      [Query.limit(5)]
    );
    console.log(`✅ Found ${donations.total} donations:`);
    if (donations.documents) {
      donations.documents.forEach(donation => {
        console.log(`  - ${donation.donor_name}: ${donation.amount} ${donation.currency} (${donation.status})`);
      });
    }
    
    // Test 4: Test campaigns collection
    console.log('\n🎯 Testing campaigns collection...');
    const campaigns = await databases.listDocuments(
      config.databaseId,
      'campaigns',
      [Query.limit(5)]
    );
    console.log(`✅ Found ${campaigns.total} campaigns:`);
    if (campaigns.documents) {
      campaigns.documents.forEach(campaign => {
        console.log(`  - ${campaign.title}: ${campaign.current_amount}/${campaign.target_amount} ${campaign.currency}`);
      });
    }
    
    // Test 5: Test aid applications collection
    console.log('\n📋 Testing aid applications collection...');
    const aidApplications = await databases.listDocuments(
      config.databaseId,
      'aid_applications',
      [Query.limit(5)]
    );
    console.log(`✅ Found ${aidApplications.total} aid applications:`);
    if (aidApplications.documents) {
      aidApplications.documents.forEach(application => {
        console.log(`  - ${application.applicant_name}: ${application.aid_type} (${application.status})`);
      });
    }
    
    // Test 6: Test tasks collection
    console.log('\n✅ Testing tasks collection...');
    const tasks = await databases.listDocuments(
      config.databaseId,
      'tasks',
      [Query.limit(5)]
    );
    console.log(`✅ Found ${tasks.total} tasks:`);
    if (tasks.documents) {
      tasks.documents.forEach(task => {
        console.log(`  - ${task.title}: ${task.status} (assigned to: ${task.assigned_to})`);
      });
    }
    
    // Test 7: Test notifications collection
    console.log('\n🔔 Testing notifications collection...');
    const notifications = await databases.listDocuments(
      config.databaseId,
      'notifications',
      [Query.limit(5)]
    );
    console.log(`✅ Found ${notifications.total} notifications:`);
    if (notifications.documents) {
      notifications.documents.forEach(notification => {
        console.log(`  - ${notification.title}: ${notification.type} (read: ${notification.is_read})`);
      });
    }
    
    // Test 8: Test user profiles collection
    console.log('\n👤 Testing user profiles collection...');
    const userProfiles = await databases.listDocuments(
      config.databaseId,
      'user_profiles',
      [Query.limit(5)]
    );
    console.log(`✅ Found ${userProfiles.total} user profiles:`);
    if (userProfiles.documents) {
      userProfiles.documents.forEach(profile => {
        console.log(`  - ${profile.name} (${profile.email}): ${profile.role}`);
      });
    }
    
    console.log('\n🎉 Database test completed successfully!');
    
    // Summary
    console.log('\n📊 Database Summary:');
    console.log(`   Database ID: ${config.databaseId}`);
    console.log(`   Collections: ${collections.total}`);
    console.log(`   Beneficiaries: ${beneficiaries.total}`);
    console.log(`   Donations: ${donations.total}`);
    console.log(`   Campaigns: ${campaigns.total}`);
    console.log(`   Aid Applications: ${aidApplications.total}`);
    console.log(`   Tasks: ${tasks.total}`);
    console.log(`   Notifications: ${notifications.total}`);
    console.log(`   User Profiles: ${userProfiles.total}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase();
}

export { testDatabase };
