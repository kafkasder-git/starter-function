#!/usr/bin/env node

/**
 * Appwrite System Test Script
 * Tests all components and integration
 */

const { Client, Databases, ID, Query } = require('appwrite');
const fs = require('fs');

// Configuration
const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68e99f6c000183bafb39',
  databaseId: process.env.APPWRITE_DATABASE_ID || 'kafkasder_db',
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const databases = new Databases(client);

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  try {
    console.log(`🧪 Testing: ${testName}`);
    await testFunction();
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASSED', error: null });
    console.log(`✅ PASSED: ${testName}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
    console.log(`❌ FAILED: ${testName}: ${error.message}`);
  }
}

// Test functions
async function testDatabaseConnection() {
  const database = await databases.get(config.databaseId);
  if (!database) {
    throw new Error('Database not found');
  }
  console.log(`   Database: ${database.name} (${database.$id})`);
}

async function testCollectionsExist() {
  const expectedCollections = [
    'user_profiles',
    'beneficiaries', 
    'donations',
    'campaigns',
    'aid_applications',
    'notifications',
    'tasks',
    'finance_transactions',
    'legal_consultations',
    'events',
    'inventory_items',
    'backups'
  ];

  for (const collectionId of expectedCollections) {
    try {
      const collection = await databases.getCollection(config.databaseId, collectionId);
      console.log(`   Collection: ${collection.name} (${collection.$id})`);
    } catch (error) {
      throw new Error(`Collection ${collectionId} not found: ${error.message}`);
    }
  }
}

async function testUserProfilesCollection() {
  const collection = await databases.getCollection(config.databaseId, 'user_profiles');
  
  // Check attributes
  const attributes = await databases.listAttributes(config.databaseId, collection.$id);
  const requiredAttributes = ['user_id', 'email', 'name', 'role', 'status'];
  
  for (const attr of requiredAttributes) {
    const found = attributes.attributes.find(a => a.key === attr);
    if (!found) {
      throw new Error(`Required attribute ${attr} not found`);
    }
  }
  
  console.log(`   Attributes: ${attributes.attributes.length} found`);
  
  // Check indexes
  const indexes = await databases.listIndexes(config.databaseId, collection.$id);
  console.log(`   Indexes: ${indexes.indexes.length} found`);
}

async function testBeneficiariesCollection() {
  const collection = await databases.getCollection(config.databaseId, 'beneficiaries');
  
  // Check attributes
  const attributes = await databases.listAttributes(config.databaseId, collection.$id);
  const requiredAttributes = ['ad_soyad', 'telefon_no', 'sehri', 'status'];
  
  for (const attr of requiredAttributes) {
    const found = attributes.attributes.find(a => a.key === attr);
    if (!found) {
      throw new Error(`Required attribute ${attr} not found`);
    }
  }
  
  console.log(`   Attributes: ${attributes.attributes.length} found`);
  
  // Check indexes
  const indexes = await databases.listIndexes(config.databaseId, collection.$id);
  console.log(`   Indexes: ${indexes.indexes.length} found`);
}

async function testDonationsCollection() {
  const collection = await databases.getCollection(config.databaseId, 'donations');
  
  // Check attributes
  const attributes = await databases.listAttributes(config.databaseId, collection.$id);
  const requiredAttributes = ['donor_name', 'amount', 'status', 'donation_date'];
  
  for (const attr of requiredAttributes) {
    const found = attributes.attributes.find(a => a.key === attr);
    if (!found) {
      throw new Error(`Required attribute ${attr} not found`);
    }
  }
  
  console.log(`   Attributes: ${attributes.attributes.length} found`);
  
  // Check indexes
  const indexes = await databases.listIndexes(config.databaseId, collection.$id);
  console.log(`   Indexes: ${indexes.indexes.length} found`);
}

async function testSampleData() {
  // Test user profiles
  const users = await databases.listDocuments(
    config.databaseId,
    'user_profiles',
    [Query.limit(10)]
  );
  
  if (users.total === 0) {
    throw new Error('No user profiles found');
  }
  
  console.log(`   User profiles: ${users.total} found`);
  
  // Test beneficiaries
  const beneficiaries = await databases.listDocuments(
    config.databaseId,
    'beneficiaries',
    [Query.limit(10)]
  );
  
  console.log(`   Beneficiaries: ${beneficiaries.total} found`);
  
  // Test donations
  const donations = await databases.listDocuments(
    config.databaseId,
    'donations',
    [Query.limit(10)]
  );
  
  console.log(`   Donations: ${donations.total} found`);
}

async function testQueries() {
  // Test basic queries
  const beneficiaries = await databases.listDocuments(
    config.databaseId,
    'beneficiaries',
    [
      Query.equal('status', 'active'),
      Query.limit(5)
    ]
  );
  
  console.log(`   Active beneficiaries: ${beneficiaries.total} found`);
  
  const donations = await databases.listDocuments(
    config.databaseId,
    'donations',
    [
      Query.greaterThan('amount', 100),
      Query.limit(5)
    ]
  );
  
  console.log(`   Donations > 100: ${donations.total} found`);
}

async function testPermissions() {
  // Test that collections have document security enabled
  const collections = [
    'user_profiles',
    'beneficiaries',
    'donations',
    'campaigns',
    'aid_applications',
    'notifications',
    'tasks',
    'finance_transactions',
    'legal_consultations',
    'events',
    'inventory_items',
    'backups'
  ];
  
  for (const collectionId of collections) {
    const collection = await databases.getCollection(config.databaseId, collectionId);
    if (!collection.documentSecurity) {
      throw new Error(`Collection ${collectionId} does not have document security enabled`);
    }
  }
  
  console.log(`   Document security: Enabled on all ${collections.length} collections`);
}

async function testBackupSystem() {
  // Test backup collection
  const backups = await databases.listDocuments(
    config.databaseId,
    'backups',
    [Query.limit(5)]
  );
  
  console.log(`   Backup records: ${backups.total} found`);
  
  // Test backup schedule
  const schedules = await databases.listDocuments(
    config.databaseId,
    'backups',
    [
      Query.equal('cron_expression', '0 2 * * *'),
      Query.limit(1)
    ]
  );
  
  if (schedules.total === 0) {
    throw new Error('Backup schedule not found');
  }
  
  console.log(`   Backup schedule: Found`);
}

async function testEnvironmentFile() {
  if (!fs.existsSync('.env')) {
    throw new Error('.env file not found');
  }
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = [
    'VITE_APPWRITE_ENDPOINT',
    'VITE_APPWRITE_PROJECT_ID',
    'VITE_APPWRITE_DATABASE_ID'
  ];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      throw new Error(`Required environment variable ${varName} not found in .env`);
    }
  }
  
  console.log(`   Environment file: Valid`);
}

async function testMCPConfiguration() {
  if (!fs.existsSync('.cursorrules')) {
    throw new Error('.cursorrules file not found');
  }
  
  const cursorRules = fs.readFileSync('.cursorrules', 'utf8');
  const requiredConfig = [
    'mcpServers',
    'appwrite-api',
    'APPWRITE_PROJECT_ID',
    'APPWRITE_ENDPOINT'
  ];
  
  for (const config of requiredConfig) {
    if (!cursorRules.includes(config)) {
      throw new Error(`Required MCP configuration ${config} not found in .cursorrules`);
    }
  }
  
  console.log(`   MCP configuration: Valid`);
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Appwrite system tests...');
  console.log(`📍 Endpoint: ${config.endpoint}`);
  console.log(`🔑 Project ID: ${config.projectId}`);
  console.log(`🗄️  Database ID: ${config.databaseId}`);
  console.log('');

  // Run all tests
  await runTest('Database Connection', testDatabaseConnection);
  await runTest('Collections Exist', testCollectionsExist);
  await runTest('User Profiles Collection', testUserProfilesCollection);
  await runTest('Beneficiaries Collection', testBeneficiariesCollection);
  await runTest('Donations Collection', testDonationsCollection);
  await runTest('Sample Data', testSampleData);
  await runTest('Basic Queries', testQueries);
  await runTest('Permissions', testPermissions);
  await runTest('Backup System', testBackupSystem);
  await runTest('Environment File', testEnvironmentFile);
  await runTest('MCP Configuration', testMCPConfiguration);

  // Print results
  console.log('');
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log('');

  // Print failed tests
  if (testResults.failed > 0) {
    console.log('❌ Failed Tests:');
    testResults.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
    console.log('');
  }

  // Print summary
  if (testResults.failed === 0) {
    console.log('🎉 All tests passed! System is ready to use.');
    console.log('');
    console.log('🔐 Default Users:');
    console.log('   admin@kafkasder.org (Admin)');
    console.log('   manager@kafkasder.org (Manager)');
    console.log('   operator@kafkasder.org (Operator)');
    console.log('   viewer@kafkasder.org (Viewer)');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Create users in Appwrite Console');
    console.log('2. Test authentication in your application');
    console.log('3. Configure backup storage');
    console.log('4. Set up email notifications');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults };
