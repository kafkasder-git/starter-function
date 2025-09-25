#!/usr/bin/env node

/**
 * JSDoc Generation Script
 * Automatically generates JSDoc documentation for TypeScript/JavaScript files
 */

const fs = require('fs');
const path = require('path');

// Files to document (excluding test files and node_modules)
const filesToDocument = [
  'services',
  'components',
  'hooks',
  'contexts',
  'lib',
  'utils',
  'middleware'
];

// JSDoc templates for different types of functions/components
const jsdocTemplates = {
  component: (name, description = '') => `/**
 * ${description || `${name} Component`}
 * 
 * @component
 * @returns {JSX.Element} The rendered component
 */`,

  function: (name, description = '', params = [], returns = 'void') => `/**
 * ${description || `${name} function`}
 * 
 * @param {Object} params - Function parameters
 * @returns {${returns}} ${returns === 'void' ? 'Nothing' : 'The result'}
 */`,

  service: (name, description = '') => `/**
 * ${description || `${name} Service`}
 * 
 * Service class for handling ${name.toLowerCase()} operations
 * 
 * @class ${name}
 */`,

  hook: (name, description = '') => `/**
 * ${description || `${name} Hook`}
 * 
 * Custom React hook for ${name.toLowerCase()} functionality
 * 
 * @returns {Object} Hook return value
 */`,

  interface: (name, description = '') => `/**
 * ${description || `${name} Interface`}
 * 
 * @interface ${name}
 */`,

  type: (name, description = '') => `/**
 * ${description || `${name} Type`}
 * 
 * @typedef {Object} ${name}
 */`
};

function shouldSkipFile(filePath) {
  return (
    filePath.includes('node_modules') ||
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('__tests__') ||
    filePath.includes('tests/') ||
    filePath.endsWith('.d.ts') ||
    filePath.includes('coverage/') ||
    filePath.includes('.git/')
  );
}

function generateJSDocForFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Add file-level JSDoc if missing
    if (!content.startsWith('/**') && !content.startsWith('/*')) {
      const fileName = path.basename(filePath, path.extname(filePath));
      const fileType = getFileType(filePath);
      const description = getFileDescription(fileName, fileType);
      
      const fileJSDoc = `/**
 * @fileoverview ${description}
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

`;
      
      newContent = fileJSDoc + content;
      hasChanges = true;
    }

    // Add JSDoc for classes
    newContent = addJSDocForClasses(newContent, filePath);
    
    // Add JSDoc for functions
    newContent = addJSDocForFunctions(newContent, filePath);
    
    // Add JSDoc for interfaces
    newContent = addJSDocForInterfaces(newContent, filePath);

    if (hasChanges || newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Documented: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error documenting ${filePath}:`, error.message);
    return false;
  }
}

function getFileType(filePath) {
  if (filePath.includes('components/')) return 'component';
  if (filePath.includes('services/')) return 'service';
  if (filePath.includes('hooks/')) return 'hook';
  if (filePath.includes('contexts/')) return 'context';
  if (filePath.includes('lib/')) return 'library';
  if (filePath.includes('utils/')) return 'utility';
  if (filePath.includes('middleware/')) return 'middleware';
  return 'module';
}

function getFileDescription(fileName, fileType) {
  const descriptions = {
    component: `${fileName} Component - React component for UI functionality`,
    service: `${fileName} Service - Business logic and data management`,
    hook: `${fileName} Hook - Custom React hook for state management`,
    context: `${fileName} Context - React context for global state`,
    library: `${fileName} Library - Utility functions and helpers`,
    utility: `${fileName} Utility - Helper functions and utilities`,
    middleware: `${fileName} Middleware - Request/response processing`,
    module: `${fileName} Module - Application module`
  };
  
  return descriptions[fileType] || `${fileName} - Application module`;
}

function addJSDocForClasses(content, filePath) {
  // Match class declarations
  const classRegex = /^export\s+(?:default\s+)?class\s+(\w+)/gm;
  let newContent = content;
  
  content.replace(classRegex, (match, className) => {
    const beforeClass = content.substring(0, content.indexOf(match));
    const linesBefore = beforeClass.split('\n');
    const lastLine = linesBefore[linesBefore.length - 1];
    
    // Check if JSDoc already exists
    if (!lastLine.trim().startsWith('/**')) {
      const jsdoc = jsdocTemplates.service(className);
      newContent = newContent.replace(match, `${jsdoc}\n${match}`);
    }
  });
  
  return newContent;
}

function addJSDocForFunctions(content, filePath) {
  // Match function declarations
  const functionRegex = /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/gm;
  let newContent = content;
  
  content.replace(functionRegex, (match, functionName) => {
    const beforeFunction = content.substring(0, content.indexOf(match));
    const linesBefore = beforeFunction.split('\n');
    const lastLine = linesBefore[linesBefore.length - 1];
    
    // Check if JSDoc already exists
    if (!lastLine.trim().startsWith('/**')) {
      const jsdoc = jsdocTemplates.function(functionName);
      newContent = newContent.replace(match, `${jsdoc}\n${match}`);
    }
  });
  
  return newContent;
}

function addJSDocForInterfaces(content, filePath) {
  // Match interface declarations
  const interfaceRegex = /^export\s+interface\s+(\w+)/gm;
  let newContent = content;
  
  content.replace(interfaceRegex, (match, interfaceName) => {
    const beforeInterface = content.substring(0, content.indexOf(match));
    const linesBefore = beforeInterface.split('\n');
    const lastLine = linesBefore[linesBefore.length - 1];
    
    // Check if JSDoc already exists
    if (!lastLine.trim().startsWith('/**')) {
      const jsdoc = jsdocTemplates.interface(interfaceName);
      newContent = newContent.replace(match, `${jsdoc}\n${match}`);
    }
  });
  
  return newContent;
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
  console.log('🚀 Starting JSDoc generation...\n');
  
  let totalFiles = 0;
  let documentedFiles = 0;
  
  for (const dir of filesToDocument) {
    if (fs.existsSync(dir)) {
      const files = findFiles(dir);
      totalFiles += files.length;
      
      console.log(`📁 Processing ${dir} (${files.length} files)...`);
      
      for (const file of files) {
        if (generateJSDocForFile(file)) {
          documentedFiles++;
        }
      }
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  }
  
  console.log(`\n🎉 JSDoc generation complete!`);
  console.log(`📊 Total files processed: ${totalFiles}`);
  console.log(`✅ Files documented: ${documentedFiles}`);
  console.log(`📝 Files unchanged: ${totalFiles - documentedFiles}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateJSDocForFile, findFiles };
