#!/usr/bin/env node

/**
 * Console.log to Logger Refactoring Script
 * Replaces console.log/error/warn with logger equivalents
 */

const fs = require('fs');
const path = require('path');

// Files to refactor (excluding test files and node_modules)
const filesToRefactor = [
  'services',
  'components',
  'hooks',
  'contexts',
  'lib',
  'utils',
  'middleware'
];

// Console methods to replace
const consoleReplacements = {
  'console.log': 'logger.info',
  'console.error': 'logger.error',
  'console.warn': 'logger.warn',
  'console.debug': 'logger.debug'
};

function shouldSkipFile(filePath) {
  return (
    filePath.includes('node_modules') ||
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('__tests__') ||
    filePath.includes('tests/') ||
    filePath.endsWith('.d.ts') ||
    filePath.includes('coverage/')
  );
}

function addLoggerImport(content) {
  // Check if logger is already imported
  if (content.includes("import { logger }")) {
    return content;
  }

  // Find the last import statement
  const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;
    
    const loggerImport = "\nimport { logger } from '../lib/logging/logger';";
    return content.slice(0, insertIndex) + loggerImport + content.slice(insertIndex);
  }
  
  // If no imports found, add at the beginning
  return "import { logger } from '../lib/logging/logger';\n" + content;
}

function refactorFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Replace console methods
    for (const [consoleMethod, loggerMethod] of Object.entries(consoleReplacements)) {
      const regex = new RegExp(consoleMethod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (newContent.includes(consoleMethod)) {
        newContent = newContent.replace(regex, loggerMethod);
        hasChanges = true;
      }
    }

    // Add logger import if needed
    if (hasChanges && !newContent.includes("import { logger }")) {
      newContent = addLoggerImport(newContent);
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Refactored: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error refactoring ${filePath}:`, error.message);
    return false;
  }
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !shouldSkipFile(fullPath)) {
        files.push(...findFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        if (!shouldSkipFile(fullPath)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

function main() {
  console.log('🚀 Starting console.log to logger refactoring...\n');
  
  let totalFiles = 0;
  let refactoredFiles = 0;
  
  for (const dir of filesToRefactor) {
    if (fs.existsSync(dir)) {
      const files = findFiles(dir);
      totalFiles += files.length;
      
      console.log(`📁 Processing ${dir} (${files.length} files)...`);
      
      for (const file of files) {
        if (refactorFile(file)) {
          refactoredFiles++;
        }
      }
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  }
  
  console.log(`\n🎉 Refactoring complete!`);
  console.log(`📊 Total files processed: ${totalFiles}`);
  console.log(`✅ Files refactored: ${refactoredFiles}`);
  console.log(`📝 Files unchanged: ${totalFiles - refactoredFiles}`);
}

if (require.main === module) {
  main();
}

module.exports = { refactorFile, findFiles };
