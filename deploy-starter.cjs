#!/usr/bin/env node

const { Client, Sites, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68e92f380024d5de7dfa')
    .setKey(process.env.APPWRITE_API_KEY || 'your-api-key-here');

const sites = new Sites(client);

async function deployStarterToAppwriteSites() {
    try {
        console.log('🚀 Starting Appwrite React Starter deployment...');
        
        // Check if starter dist folder exists
        const distPath = path.join(__dirname, 'appwrite-starter', 'dist');
        if (!fs.existsSync(distPath)) {
            console.error('❌ appwrite-starter/dist folder not found. Please run build first.');
            process.exit(1);
        }
        
        // Check if code.tar.gz exists
        const tarPath = path.join(distPath, 'code.tar.gz');
        if (!fs.existsSync(tarPath)) {
            console.error('❌ code.tar.gz not found in appwrite-starter/dist folder.');
            process.exit(1);
        }
        
        console.log('📦 Creating site...');
        
        // Create site with React starter configuration
        const site = await sites.create(
            ID.unique(),
            'kafkasder-react-starter',
            [], // domains will be auto-generated
            'react', // framework
            'node-20' // buildRuntime
        );
        
        console.log('✅ Site created successfully!');
        console.log('📄 Site ID:', site.$id);
        console.log('🔗 Site URL:', site.domain);
        
        console.log('📦 Creating deployment...');
        
        // Create deployment
        const deployment = await sites.createDeployment(
            site.$id,
            ID.unique(),
            fs.createReadStream(tarPath)
        );
        
        console.log('✅ Deployment created successfully!');
        console.log('📄 Deployment ID:', deployment.$id);
        console.log('🔗 Deployment URL:', deployment.url);
        
        console.log('🔄 Activating deployment...');
        
        // Activate deployment
        await sites.updateSiteDeployment(
            site.$id,
            deployment.$id
        );
        
        console.log('✅ Deployment activated successfully!');
        
        console.log('\n🎉 Appwrite React Starter deployed successfully!');
        console.log('🌐 Your site is now live at:', site.domain);
        console.log('📋 Next steps:');
        console.log('1. Test your site functionality');
        console.log('2. Add environment variables if needed');
        console.log('3. Set up custom domain if needed');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        if (error.code === 401) {
            console.error('🔑 Authentication failed. Please set your API key.');
            console.error('💡 Get your API key from: https://cloud.appwrite.io/console/api-keys');
        } else if (error.code === 404) {
            console.error('🔍 Resource not found. Please check your project ID.');
        }
        process.exit(1);
    }
}

deployStarterToAppwriteSites();
