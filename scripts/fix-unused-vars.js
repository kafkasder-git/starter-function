#!/usr/bin/env node

/**
 * Script to fix unused variables by prefixing them with underscore
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'components/beneficiary/BeneficiaryAidHistory.tsx',
    replacements: [
      { from: 'const { beneficiaryId: _beneficiaryId }', to: 'const { beneficiaryId: _beneficiaryId }' }
    ]
  },
  {
    file: 'components/beneficiary/BeneficiaryDocuments.tsx',
    replacements: [
      { from: 'beneficiaryId,', to: '_beneficiaryId,' }
    ]
  },
  {
    file: 'components/beneficiary/BeneficiaryFamily.tsx',
    replacements: [
      { from: 'const { beneficiaryId: _beneficiaryId }', to: 'const { beneficiaryId: _beneficiaryId }' }
    ]
  },
  {
    file: 'components/data/ExportModal.tsx',
    replacements: [
      { from: 'const [_isExporting, setIsExporting]', to: 'const [, setIsExporting]' },
      { from: 'const [_progress, setProgress]', to: 'const [, setProgress]' },
      { from: 'progress,', to: '_progress,' }
    ]
  }
];

console.log('🔧 Fixing unused variables...\n');

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`⏭️  Skipped: ${file} (no changes needed)`);
  }
});

console.log('\n✨ Done!');
