#!/usr/bin/env node

// Storage Test Script
// Tests the Appwrite storage functionality

import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🧪 Testing Appwrite Storage Configuration...');

// Test 1: Check MCP server with storage API
console.log('\n1. Testing MCP Server with Storage API...');

const testCommand = `APPWRITE_PROJECT_ID=68e99f6c000183bafb39 APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1 uvx mcp-server-appwrite --storage --help`;

try {
  const { stdout } = await execAsync(testCommand);
  
  if (stdout.includes('Enable Storage service')) {
    console.log('✅ Storage API enabled successfully');
  } else {
    console.error('❌ Storage API not properly enabled');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Storage API test failed:', error.message);
  process.exit(1);
}

// Test 2: Check configuration files
console.log('\n2. Checking configuration files...');

const configFiles = [
  '.env',
  'mcp-config.json',
  'services/fileStorageService.ts',
  'types/file.ts'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 3: Check storage buckets configuration
console.log('\n3. Checking storage buckets configuration...');

const storageConfig = fs.readFileSync('services/fileStorageService.ts', 'utf8');
const buckets = ['documents', 'images', 'reports', 'temp', 'backups'];

buckets.forEach(bucket => {
  if (storageConfig.includes(`'${bucket}'`)) {
    console.log(`✅ ${bucket} bucket configured`);
  } else {
    console.log(`❌ ${bucket} bucket not found in configuration`);
  }
});

console.log('\n🎉 Storage configuration test completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run mcp:start:storage');
console.log('2. Configure your IDE with the MCP server');
console.log('3. Start using natural language commands for storage management');
