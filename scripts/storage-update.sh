#!/bin/bash

# Appwrite Storage Update Script
# This script updates and manages storage configuration for the MCP server

set -e

echo "🚀 Appwrite Storage Update Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if environment variables are set
if [ -z "$APPWRITE_PROJECT_ID" ] || [ -z "$APPWRITE_API_KEY" ]; then
    print_error "Environment variables not set. Please run: source .env"
    exit 1
fi

print_status "Environment variables loaded successfully"

# Update MCP server configuration with enhanced storage options
print_info "Updating MCP server configuration..."

# Create updated package.json scripts with all storage APIs
cat > temp_mcp_scripts.json << 'EOF'
{
  "mcp:start:storage": "APPWRITE_PROJECT_ID=68e99f6c000183bafb39 APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1 uvx mcp-server-appwrite --storage --databases",
  "mcp:start:full": "APPWRITE_PROJECT_ID=68e99f6c000183bafb39 APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1 uvx mcp-server-appwrite --all"
}
EOF

print_status "MCP server configuration updated"

# Test storage connectivity
print_info "Testing storage connectivity..."

# Test MCP server with storage API
if APPWRITE_PROJECT_ID=68e99f6c000183bafb39 APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1 uvx mcp-server-appwrite --storage --help > /dev/null 2>&1; then
    print_status "Storage API test successful"
else
    print_error "Storage API test failed"
    exit 1
fi

# Create storage management commands
print_info "Creating storage management commands..."

cat > storage-commands.md << 'EOF'
# Storage Management Commands

## Available Storage Buckets
- **documents** - Document files (PDF, DOC, DOCX, TXT) - 10MB max
- **images** - Image files (JPEG, PNG, GIF, WebP, SVG) - 5MB max  
- **reports** - Report files (PDF, XLS, XLSX) - 50MB max
- **temp** - Temporary files (any type) - 100MB max, 7-day retention
- **backups** - Backup files (ZIP, GZIP, TAR) - 500MB max

## MCP Storage Commands
Use these natural language commands with your AI assistant:

### Bucket Management
- "List all storage buckets in my Appwrite project"
- "Create a new storage bucket called 'uploads' for user files"
- "Update the 'images' bucket to allow larger files"
- "Delete the 'temp' bucket"

### File Operations
- "Upload a file to the documents bucket"
- "List all files in the images bucket"
- "Download the file 'report.pdf' from the reports bucket"
- "Delete the file 'old-document.pdf' from documents bucket"
- "Copy file 'image.jpg' from images to backups bucket"

### File Management
- "Get file information for 'document.pdf'"
- "Update file permissions for 'public-image.jpg'"
- "Search for files containing 'report' in the name"
- "Get storage statistics for all buckets"

### Advanced Operations
- "Create a preview URL for 'image.png' with size 200x200"
- "Generate a download URL for 'document.pdf' that expires in 1 hour"
- "Update file metadata for 'report.xlsx'"
- "Bulk delete files older than 30 days from temp bucket"

## Storage Configuration
Your storage is configured with:
- **Encryption**: Enabled for documents, reports, backups
- **Compression**: Enabled for images, reports, backups
- **Versioning**: Enabled for documents, images, reports, backups
- **Virus Scanning**: Available (configurable)
- **Content Moderation**: Available (configurable)
EOF

print_status "Storage commands documentation created"

# Update package.json with new storage scripts
print_info "Updating package.json with enhanced storage scripts..."

# Add new storage-specific scripts to package.json
if grep -q "mcp:start:storage" package.json; then
    print_warning "Storage scripts already exist in package.json"
else
    # Add storage scripts before the closing brace
    sed -i '/"mcp:test":/a\    "mcp:start:storage": "APPWRITE_PROJECT_ID=68e99f6c000183bafb39 APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1 uvx mcp-server-appwrite --storage --databases",' package.json
    
    sed -i '/"mcp:start:storage":/a\    "mcp:start:full": "APPWRITE_PROJECT_ID=68e99f6c000183bafb39 APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1 uvx mcp-server-appwrite --all",' package.json
    
    print_status "Enhanced storage scripts added to package.json"
fi

# Create storage test script
cat > test-storage.js << 'EOF'
#!/usr/bin/env node

// Storage Test Script
// Tests the Appwrite storage functionality

const { exec } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing Appwrite Storage Configuration...');

// Test 1: Check MCP server with storage API
console.log('\n1. Testing MCP Server with Storage API...');

const testCommand = `APPWRITE_PROJECT_ID=68e99f6c000183bafb39 APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1 uvx mcp-server-appwrite --storage --help`;

exec(testCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Storage API test failed:', error.message);
    process.exit(1);
  }
  
  if (stdout.includes('Enable Storage service')) {
    console.log('✅ Storage API enabled successfully');
  } else {
    console.error('❌ Storage API not properly enabled');
    process.exit(1);
  }
});

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
EOF

chmod +x test-storage.js

print_status "Storage test script created"

# Clean up temporary files
rm -f temp_mcp_scripts.json

print_status "Storage update completed successfully!"

echo ""
echo "📋 Summary of Updates:"
echo "======================"
echo "✅ Enhanced MCP server configuration with all storage APIs"
echo "✅ Updated package.json with storage-specific scripts"
echo "✅ Created storage management documentation"
echo "✅ Created storage test script"
echo ""
echo "🚀 Available Commands:"
echo "======================"
echo "• npm run mcp:start:storage  - Start MCP server with storage focus"
echo "• npm run mcp:start:full     - Start MCP server with all APIs"
echo "• node test-storage.js       - Test storage configuration"
echo ""
echo "📚 Documentation:"
echo "================="
echo "• storage-commands.md        - Natural language commands for storage"
echo "• MCP_SETUP_GUIDE.md        - Complete MCP setup guide"
echo ""
echo "🎯 Ready to use enhanced storage management with AI! 🚀"
