
/**
 * Import cleanup script for Kafkasder Management Panel
 * Removes unused imports and optimizes import statements
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// File extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to scan
const SCAN_DIRS = [
  'components',
  'hooks',
  'services',
  'stores',
  'contexts',
  'lib',
  'utils',
  'types'
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  /\.test\./,
  /\.spec\./,
  /\.stories\./,
  /node_modules/,
  /dist/,
  /build/
];

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return false;
  
  return !EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Get all files to process
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Clean up imports using ESLint
 */
function cleanupImports() {
  console.log('🧹 Starting import cleanup...');
  
  try {
    // Get all files to process
    const allFiles = [];
    SCAN_DIRS.forEach(dir => {
      if (fs.existsSync(dir)) {
        allFiles.push(...getAllFiles(dir));
      }
    });
    
    // Also check root files
    const rootFiles = fs.readdirSync('.')
      .filter(file => shouldProcessFile(file))
      .map(file => path.join('.', file));
    
    allFiles.push(...rootFiles);
    
    console.log(`📁 Found ${allFiles.length} files to process`);
    
    if (allFiles.length === 0) {
      console.log('✅ No files to process');
      return;
    }
    
    // Run ESLint with unused-imports plugin
    const filesToProcess = allFiles.join(' ');
    const command = `npx eslint ${filesToProcess} --fix --ext .ts,.tsx,.js,.jsx`;
    
    console.log('🔧 Running ESLint to fix unused imports...');
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ Import cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during import cleanup:', error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Kafkasder Management Panel - Import Cleanup');
  console.log('===============================================');
  
  cleanupImports();
  
  console.log('🎉 All done! Your imports are now clean and optimized.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { cleanupImports, shouldProcessFile, getAllFiles };
