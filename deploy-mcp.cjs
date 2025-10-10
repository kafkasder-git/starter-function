#!/usr/bin/env node

const { Client, Sites, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68e92f380024d5de7dfa')
    .setKey(process.env.APPWRITE_API_KEY || 'your-api-key-here'); // Set your API key

const sites = new Sites(client);

async function deployToAppwriteSites() {
    try {
        console.log('🚀 Starting MCP-based deployment to Appwrite Sites...');
        
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
        
        console.log('📦 Creating site with MCP configuration...');
        
        // Create site with required parameters
        const site = await sites.create(
            ID.unique(),
            'kafkasder-panel',
            [], // domains
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
        
        console.log('\n🎉 MCP-based deployment completed successfully!');
        console.log('🌐 Your site is now live at:', site.domain);
        console.log('📋 Next steps:');
        console.log('1. Add environment variables in Appwrite Console');
        console.log('2. Test your site functionality');
        console.log('3. Set up custom domain if needed');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        if (error.code === 401) {
            console.error('🔑 Authentication failed. Please set your API key in the script.');
            console.error('💡 Get your API key from: https://cloud.appwrite.io/console/api-keys');
        } else if (error.code === 404) {
            console.error('🔍 Resource not found. Please check your project ID.');
        }
        process.exit(1);
    }
}

deployToAppwriteSites();
