#!/usr/bin/env node

/**
 * @fileoverview Critical CSS Extraction Script
 * @description Above-the-fold CSS extraction for performance optimization
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Critical CSS selectors (above-the-fold elements)
const CRITICAL_SELECTORS = [
  // Layout
  'html', 'body', 'main', 'header', 'nav', 'footer',
  
  // Navigation
  '.navbar', '.sidebar', '.menu', '.breadcrumb',
  
  // UI Components
  '.btn', '.button', '.card', '.modal', '.dropdown',
  '.form-control', '.input', '.select', '.textarea',
  
  // Typography
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a',
  
  // Layout utilities
  '.container', '.row', '.col', '.grid', '.flex',
  '.d-flex', '.d-block', '.d-none', '.w-100', '.h-100',
  
  // Spacing
  '.m-0', '.m-1', '.m-2', '.m-3', '.m-4', '.m-5',
  '.p-0', '.p-1', '.p-2', '.p-3', '.p-4', '.p-5',
  '.mt-0', '.mt-1', '.mt-2', '.mt-3', '.mt-4', '.mt-5',
  '.mb-0', '.mb-1', '.mb-2', '.mb-3', '.mb-4', '.mb-5',
  '.ml-0', '.ml-1', '.ml-2', '.ml-3', '.ml-4', '.ml-5',
  '.mr-0', '.mr-1', '.mr-2', '.mr-3', '.mr-4', '.mr-5',
  
  // Colors
  '.text-primary', '.text-secondary', '.text-success',
  '.text-danger', '.text-warning', '.text-info',
  '.bg-primary', '.bg-secondary', '.bg-success',
  '.bg-danger', '.bg-warning', '.bg-info',
  
  // Loading states
  '.loading', '.skeleton', '.spinner',
  
  // App-specific
  '.app-header', '.app-sidebar', '.app-content',
  '.dashboard', '.page-header', '.quick-stats'
];

/**
 * Extract CSS rules for critical selectors
 */
function extractCriticalCSS(cssContent, selectors = CRITICAL_SELECTORS) {
  const rules = [];
  const lines = cssContent.split('\n');
  
  let currentRule = '';
  let inRule = false;
  let braceCount = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!inRule) {
      // Check if line contains critical selectors
      const hasCriticalSelector = selectors.some(selector => 
        trimmedLine.includes(selector) || 
        trimmedLine.match(new RegExp(`\\b${selector.replace('.', '\\.')}\\b`))
      );
      
      if (hasCriticalSelector) {
        currentRule = trimmedLine;
        inRule = true;
        braceCount = (trimmedLine.match(/\{/g) || []).length - (trimmedLine.match(/\}/g) || []).length;
        
        if (braceCount === 0) {
          rules.push(currentRule);
          currentRule = '';
          inRule = false;
        }
      }
    } else {
      currentRule += '\n' + line;
      braceCount += (trimmedLine.match(/\{/g) || []).length - (trimmedLine.match(/\}/g) || []).length;
      
      if (braceCount === 0) {
        rules.push(currentRule);
        currentRule = '';
        inRule = false;
      }
    }
  }
  
  return rules.join('\n');
}

/**
 * Generate critical CSS for common Tailwind utilities
 */
function generateTailwindCriticalCSS() {
  return `
/* Critical Tailwind CSS - Above the fold */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.row { display: flex; flex-wrap: wrap; }
.col { flex: 1; }

/* Flexbox utilities */
.d-flex { display: flex; }
.d-block { display: block; }
.d-none { display: none; }
.flex-column { flex-direction: column; }
.justify-center { justify-content: center; }
.align-center { align-items: center; }

/* Spacing utilities */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 1rem; }
.m-4 { margin: 1.5rem; }
.m-5 { margin: 3rem; }
.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 1rem; }
.p-4 { padding: 1.5rem; }
.p-5 { padding: 3rem; }

/* Width/Height utilities */
.w-100 { width: 100%; }
.h-100 { height: 100%; }

/* Typography */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Colors */
.text-primary { color: #3b82f6; }
.text-secondary { color: #6b7280; }
.text-success { color: #10b981; }
.text-danger { color: #ef4444; }
.text-warning { color: #f59e0b; }
.text-info { color: #06b6d4; }

.bg-primary { background-color: #3b82f6; }
.bg-secondary { background-color: #6b7280; }
.bg-success { background-color: #10b981; }
.bg-danger { background-color: #ef4444; }
.bg-warning { background-color: #f59e0b; }
.bg-info { background-color: #06b6d4; }

/* Loading states */
.loading { opacity: 0.6; pointer-events: none; }
.skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
@keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* App-specific */
.app-header { background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
.app-sidebar { background: #f9fafb; border-right: 1px solid #e5e7eb; }
.app-content { padding: 2rem; }
.dashboard { background: white; }
.page-header { margin-bottom: 2rem; }
.quick-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
`;
}

/**
 * Inline critical CSS in HTML
 */
function inlineCriticalCSS(htmlContent, criticalCSS) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  
  // Create style element with critical CSS
  const styleElement = document.createElement('style');
  styleElement.textContent = criticalCSS;
  styleElement.setAttribute('data-critical', 'true');
  
  // Insert in head
  const head = document.head;
  head.insertBefore(styleElement, head.firstChild);
  
  // Add preload link for main CSS
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.href = '/assets/css/main.css';
  preloadLink.as = 'style';
  preloadLink.onload = "this.onload=null;this.rel='stylesheet'";
  head.appendChild(preloadLink);
  
  return dom.serialize();
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || 'dist/index.html';
  const outputFile = args[1] || 'dist/index.html';
  const cssFile = args[2] || 'dist/assets/css/main.css';
  
  console.log('🔍 Extracting critical CSS...');
  
  try {
    // Read input files
    const htmlContent = fs.readFileSync(inputFile, 'utf8');
    let criticalCSS = '';
    
    // Try to read main CSS file
    if (fs.existsSync(cssFile)) {
      const cssContent = fs.readFileSync(cssFile, 'utf8');
      criticalCSS = extractCriticalCSS(cssContent);
      console.log(`✅ Extracted critical CSS from ${cssFile}`);
    } else {
      console.log('⚠️  Main CSS file not found, using generated critical CSS');
      criticalCSS = generateTailwindCriticalCSS();
    }
    
    // Generate critical CSS if extraction failed
    if (!criticalCSS.trim()) {
      criticalCSS = generateTailwindCriticalCSS();
      console.log('📝 Using generated Tailwind critical CSS');
    }
    
    // Inline critical CSS in HTML
    const optimizedHTML = inlineCriticalCSS(htmlContent, criticalCSS);
    
    // Write output
    fs.writeFileSync(outputFile, optimizedHTML);
    
    console.log(`✅ Critical CSS inlined successfully`);
    console.log(`📊 Critical CSS size: ${(criticalCSS.length / 1024).toFixed(2)} KB`);
    console.log(`📁 Output: ${outputFile}`);
    
    // Generate critical CSS file for reference
    const criticalCSSFile = path.join(path.dirname(outputFile), 'critical.css');
    fs.writeFileSync(criticalCSSFile, criticalCSS);
    console.log(`📄 Critical CSS saved to: ${criticalCSSFile}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  extractCriticalCSS,
  generateTailwindCriticalCSS,
  inlineCriticalCSS
};
