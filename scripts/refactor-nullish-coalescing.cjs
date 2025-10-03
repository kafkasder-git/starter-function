/**
 * Nullish Coalescing Refactoring Script
 * Replaces || with ?? for better null/undefined handling
 */

const fs = require('fs');
const path = require('path');

// Files to refactor
const filesToRefactor = [
  'services',
  'components',
  'hooks',
  'contexts',
  'lib',
  'utils',
  'middleware',
];

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

function refactorNullishCoalescing(content) {
  let newContent = content;
  let hasChanges = false;

  // Common patterns to replace || with ??
  const patterns = [
    // Simple variable assignments
    { from: /(\w+)\s*\|\|\s*(\w+)/g, to: '$1 ?? $2' },
    // Object property access
    { from: /(\w+\.\w+)\s*\|\|\s*(\w+)/g, to: '$1 ?? $2' },
    // Array access
    { from: /(\w+\[\w+\])\s*\|\|\s*(\w+)/g, to: '$1 ?? $2' },
    // Function calls
    { from: /(\w+\(\))\s*\|\|\s*(\w+)/g, to: '$1 ?? $2' },
    // String literals
    { from: /(\w+)\s*\|\|\s*['"]([^'"]*)['"]/g, to: "$1 ?? '$2'" },
    // Numbers
    { from: /(\w+)\s*\|\|\s*(\d+)/g, to: '$1 ?? $2' },
    // Boolean values
    { from: /(\w+)\s*\|\|\s*(true|false)/g, to: '$1 ?? $2' },
    // Null/undefined
    { from: /(\w+)\s*\|\|\s*(null|undefined)/g, to: '$1 ?? $2' },
  ];

  for (const pattern of patterns) {
    const originalContent = newContent;
    newContent = newContent.replace(pattern.from, pattern.to);
    if (newContent !== originalContent) {
      hasChanges = true;
    }
  }

  return { content: newContent, hasChanges };
}

function refactorFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, hasChanges } = refactorNullishCoalescing(content);

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
      } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
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
  console.log('🚀 Starting nullish coalescing refactoring...\n');

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

  console.log('\n🎉 Refactoring complete!');
  console.log(`📊 Total files processed: ${totalFiles}`);
  console.log(`✅ Files refactored: ${refactoredFiles}`);
  console.log(`📝 Files unchanged: ${totalFiles - refactoredFiles}`);
}

if (require.main === module) {
  main();
}

module.exports = { refactorFile, findFiles };
