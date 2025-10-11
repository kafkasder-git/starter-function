#!/bin/bash

# Appwrite Sites Deployment Script
# This script helps deploy your React panel to Appwrite Sites

echo "🚀 Appwrite Sites Deployment Script"
echo "=================================="

# Check if appwrite.yaml exists
if [ ! -f "appwrite.yaml" ]; then
    echo "❌ appwrite.yaml not found. Please create it first."
    exit 1
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found. Build might have failed."
    exit 1
fi

echo "📁 Build output found in dist/ directory"

# Instructions for manual deployment
echo ""
echo "📋 Manual Deployment Instructions:"
echo "1. Go to https://cloud.appwrite.io/console"
echo "2. Select your project"
echo "3. Navigate to 'Sites' in the left sidebar"
echo "4. Create a new site or select existing one"
echo "5. Configure build settings:"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Environment Variables: (see appwrite.yaml)"
echo "6. Deploy by uploading the dist/ folder contents"
echo ""
echo "🔧 CLI Deployment (if logged in):"
echo "npx appwrite deploy site --project-id=68ea4704000d41e50bb0 --site-id=YOUR_SITE_ID"
echo ""
echo "📚 For more info: https://appwrite.io/docs/products/sites"
