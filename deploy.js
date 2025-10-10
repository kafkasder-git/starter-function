#!/usr/bin/env node

const { Client, Storage, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68e92f380024d5de7dfa');

const storage = new Storage(client);

async function deployToAppwriteSites() {
    try {
        console.log('🚀 Starting deployment to Appwrite Sites...');
        
        // Check if dist folder exists
        const distPath = path.join(__dirname, 'dist');
        if (!fs.existsSync(distPath)) {
            console.error('❌ dist folder not found. Please run "npm run build" first.');
            process.exit(1);
        }
        
        // Check if code.tar.gz exists
        const tarPath = path.join(__dirname, 'dist', 'code.tar.gz');
        if (!fs.existsSync(tarPath)) {
            console.error('❌ code.tar.gz not found in dist folder.');
            process.exit(1);
        }
        
        console.log('📦 Uploading code.tar.gz to Appwrite Storage...');
        
        // Upload the tar file to Appwrite Storage
        const file = await storage.createFile(
            'default', // bucketId - you may need to create a bucket first
            ID.unique(),
            fs.createReadStream(tarPath)
        );
        
        console.log('✅ File uploaded successfully!');
        console.log('📄 File ID:', file.$id);
        console.log('🔗 File URL:', `https://fra.cloud.appwrite.io/v1/storage/buckets/default/files/${file.$id}/view?project=68e92f380024d5de7dfa`);
        
        console.log('\n📋 Next steps:');
        console.log('1. Go to Appwrite Console: https://cloud.appwrite.io');
        console.log('2. Navigate to Sites');
        console.log('3. Create a new site or select existing site');
        console.log('4. Go to Deployments');
        console.log('5. Create new deployment');
        console.log('6. Select Manual deployment');
        console.log('7. Use the file URL above or upload the code.tar.gz manually');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

deployToAppwriteSites();
