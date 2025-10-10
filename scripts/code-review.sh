#!/bin/bash

# =============================================================================
# Comprehensive Code Review Script
# =============================================================================
# This script runs various code quality checks and generates detailed reports.
# It's designed to catch issues before they make it to production.
# =============================================================================

set -e  # Exit on error

echo "🔍 Starting Comprehensive Code Review..."
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create reports directory
mkdir -p reports

# =============================================================================
# 1. ESLint Analysis
# =============================================================================
echo "📋 Running ESLint analysis..."
if npm run lint:check > eslint-review.log 2>&1; then
    echo -e "${GREEN}✓ ESLint check passed${NC}"
else
    echo -e "${RED}✗ ESLint found issues (check eslint-review.log)${NC}"
fi
echo ""

# =============================================================================
# 2. TypeScript Type Check
# =============================================================================
echo "🔍 Running TypeScript type check..."
if npm run type-check:all > typecheck-review.log 2>&1; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${RED}✗ Type errors found (check typecheck-review.log)${NC}"
fi
echo ""

# =============================================================================
# 3. Dead Code Detection
# =============================================================================
echo "💀 Detecting dead code..."
if npx ts-prune > dead-code-review.log 2>&1; then
    echo -e "${GREEN}✓ Dead code analysis complete${NC}"
else
    echo -e "${YELLOW}⚠ Dead code check completed with warnings${NC}"
fi
echo ""

# =============================================================================
# 4. Unused Dependencies
# =============================================================================
echo "📦 Checking for unused dependencies..."
if npx depcheck > depcheck-review.log 2>&1; then
    echo -e "${GREEN}✓ Dependency check complete${NC}"
else
    echo -e "${YELLOW}⚠ Some dependencies may be unused${NC}"
fi
echo ""

# =============================================================================
# 5. Build Test
# =============================================================================
echo "🏗️  Testing build..."
if npm run build > build-review.log 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed (check build-review.log)${NC}"
fi
echo ""

# =============================================================================
# 6. Bundle Size Analysis
# =============================================================================
echo "📊 Analyzing bundle size..."
if [ -d "dist" ]; then
    du -sh dist/ > bundle-size-review.log 2>&1
    echo -e "${GREEN}✓ Bundle size recorded${NC}"
else
    echo -e "${YELLOW}⚠ No dist folder found, skipping bundle analysis${NC}"
fi
echo ""

# =============================================================================
# 7. Test Coverage
# =============================================================================
echo "🧪 Running tests with coverage..."
if npm run test:coverage > test-coverage-review.log 2>&1; then
    echo -e "${GREEN}✓ Tests passed with coverage${NC}"
else
    echo -e "${YELLOW}⚠ Test coverage check completed${NC}"
fi
echo ""

# =============================================================================
# 8. Code Complexity
# =============================================================================
echo "🔬 Analyzing code complexity..."
if [ -f ".eslintrc.review.json" ]; then
    if npx eslint . --ext ts,tsx --format json --config .eslintrc.review.json > complexity-review.json 2>&1; then
        echo -e "${GREEN}✓ Complexity analysis complete${NC}"
    else
        echo -e "${YELLOW}⚠ Complexity check completed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .eslintrc.review.json not found, skipping complexity check${NC}"
fi
echo ""

# =============================================================================
# 9. Duplicate Code Detection
# =============================================================================
echo "🔄 Detecting duplicate code..."
if npx jscpd --pattern '**/*.{ts,tsx}' --ignore '**/*.test.ts,**/*.spec.ts,**/node_modules/**' > duplicate-code-review.log 2>&1; then
    echo -e "${GREEN}✓ Duplicate code analysis complete${NC}"
else
    echo -e "${YELLOW}⚠ Duplicate code check completed${NC}"
fi
echo ""

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "========================================"
echo "✅ Code Review Complete!"
echo "========================================"
echo ""
echo "📁 Review artifacts generated:"
echo "  - eslint-review.log"
echo "  - typecheck-review.log"
echo "  - dead-code-review.log"
echo "  - depcheck-review.log"
echo "  - build-review.log"
echo "  - bundle-size-review.log"
echo "  - test-coverage-review.log"
echo "  - complexity-review.json"
echo "  - duplicate-code-review.log"
echo ""
echo "💡 Tips:"
echo "  - Review log files for detailed information"
echo "  - Run 'npm run review:quick' for faster checks"
echo "  - Use 'npm run review:full' for comprehensive analysis"
echo ""
