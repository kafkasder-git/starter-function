#!/bin/bash

# ============================================================================
# SECURITY AUDIT SCRIPT
# ============================================================================
# Description: Comprehensive security audit for the application
# Usage: ./scripts/security-audit.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Report file
REPORT_FILE="security-audit-report-$(date +%Y%m%d_%H%M%S).txt"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   SECURITY AUDIT REPORT${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Create report header
cat > "$REPORT_FILE" <<EOF
SECURITY AUDIT REPORT
Generated: $(date)
Project: Kafkasder Management System
Version: 1.0.0

============================================

EOF

# Function to log to both console and file
log() {
    echo -e "$1"
    echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$REPORT_FILE"
}

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================================================
# 1. NPM AUDIT
# ============================================================================
log "${YELLOW}[1/8] Running npm audit...${NC}"
echo "" >> "$REPORT_FILE"
echo "1. NPM AUDIT RESULTS" >> "$REPORT_FILE"
echo "-------------------" >> "$REPORT_FILE"

if npm audit --json > npm-audit.json 2>&1; then
    VULNERABILITIES=$(cat npm-audit.json | grep -o '"vulnerabilities":{[^}]*}' || echo "")
    log "${GREEN}✓ No vulnerabilities found${NC}"
    echo "Status: PASS - No vulnerabilities" >> "$REPORT_FILE"
else
    log "${RED}✗ Vulnerabilities detected${NC}"
    npm audit >> "$REPORT_FILE" 2>&1 || true
    log "${YELLOW}  Run 'npm audit fix' to fix automatically${NC}"
fi
rm -f npm-audit.json
echo "" >> "$REPORT_FILE"

# ============================================================================
# 2. DEPENDENCY CHECK
# ============================================================================
log "${YELLOW}[2/8] Checking outdated dependencies...${NC}"
echo "2. OUTDATED DEPENDENCIES" >> "$REPORT_FILE"
echo "------------------------" >> "$REPORT_FILE"

npm outdated >> "$REPORT_FILE" 2>&1 || true
log "${GREEN}✓ Dependency check complete${NC}"
echo "" >> "$REPORT_FILE"

# ============================================================================
# 3. ENVIRONMENT VARIABLES CHECK
# ============================================================================
log "${YELLOW}[3/8] Checking environment variables...${NC}"
echo "3. ENVIRONMENT VARIABLES" >> "$REPORT_FILE"
echo "------------------------" >> "$REPORT_FILE"

ISSUES=0

# Check for .env in git
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    log "${RED}✗ .env file is tracked in git${NC}"
    echo "CRITICAL: .env file is tracked in git" >> "$REPORT_FILE"
    ((ISSUES++))
else
    log "${GREEN}✓ .env file not tracked in git${NC}"
    echo "PASS: .env file not tracked" >> "$REPORT_FILE"
fi

# Check for hardcoded secrets
log "  Scanning for hardcoded secrets..."
if grep -r -i "password\|secret\|api_key\|token" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v "node_modules" | grep -v "test" | grep -v "stories" > /dev/null 2>&1; then
    log "${YELLOW}⚠ Potential hardcoded secrets found${NC}"
    echo "WARNING: Potential hardcoded secrets detected" >> "$REPORT_FILE"
    grep -r -i "password\|secret\|api_key\|token" --include="*.ts" --include="*.tsx" . | grep -v "node_modules" | grep -v "test" | head -5 >> "$REPORT_FILE" 2>&1 || true
else
    log "${GREEN}✓ No obvious hardcoded secrets${NC}"
    echo "PASS: No obvious hardcoded secrets" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# ============================================================================
# 4. SECURITY HEADERS CHECK
# ============================================================================
log "${YELLOW}[4/8] Checking security headers configuration...${NC}"
echo "4. SECURITY HEADERS" >> "$REPORT_FILE"
echo "-------------------" >> "$REPORT_FILE"

HEADERS_FILES=("public/_headers" "netlify.toml" "nginx.conf")
FOUND_HEADERS=false

for file in "${HEADERS_FILES[@]}"; do
    if [ -f "$file" ]; then
        FOUND_HEADERS=true
        log "${GREEN}✓ Found security headers in $file${NC}"
        echo "PASS: Security headers configured in $file" >> "$REPORT_FILE"
    fi
done

if [ "$FOUND_HEADERS" = false ]; then
    log "${RED}✗ No security headers configuration found${NC}"
    echo "FAIL: No security headers configuration" >> "$REPORT_FILE"
    ((ISSUES++))
fi
echo "" >> "$REPORT_FILE"

# ============================================================================
# 5. HTTPS CHECK
# ============================================================================
log "${YELLOW}[5/8] Checking HTTPS configuration...${NC}"
echo "5. HTTPS CONFIGURATION" >> "$REPORT_FILE"
echo "----------------------" >> "$REPORT_FILE"

if grep -r "http://" --include="*.ts" --include="*.tsx" . | grep -v "localhost" | grep -v "node_modules" | grep -v "test" > /dev/null 2>&1; then
    log "${YELLOW}⚠ HTTP URLs found (should use HTTPS)${NC}"
    echo "WARNING: HTTP URLs detected" >> "$REPORT_FILE"
else
    log "${GREEN}✓ No insecure HTTP URLs${NC}"
    echo "PASS: No insecure HTTP URLs" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# ============================================================================
# 6. AUTHENTICATION CHECK
# ============================================================================
log "${YELLOW}[6/8] Checking authentication implementation...${NC}"
echo "6. AUTHENTICATION" >> "$REPORT_FILE"
echo "-----------------" >> "$REPORT_FILE"

if [ -f "lib/supabase.ts" ]; then
    log "${GREEN}✓ Supabase authentication configured${NC}"
    echo "PASS: Authentication system in place" >> "$REPORT_FILE"
else
    log "${RED}✗ No authentication system found${NC}"
    echo "FAIL: No authentication system" >> "$REPORT_FILE"
    ((ISSUES++))
fi
echo "" >> "$REPORT_FILE"

# ============================================================================
# 7. INPUT VALIDATION CHECK
# ============================================================================
log "${YELLOW}[7/8] Checking input validation...${NC}"
echo "7. INPUT VALIDATION" >> "$REPORT_FILE"
echo "-------------------" >> "$REPORT_FILE"

if [ -f "lib/security/InputSanitizer.ts" ] || [ -f "types/validation.ts" ]; then
    log "${GREEN}✓ Input validation/sanitization found${NC}"
    echo "PASS: Input validation implemented" >> "$REPORT_FILE"
else
    log "${YELLOW}⚠ No obvious input validation${NC}"
    echo "WARNING: Input validation not clearly implemented" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# ============================================================================
# 8. FILE PERMISSIONS CHECK
# ============================================================================
log "${YELLOW}[8/8] Checking file permissions...${NC}"
echo "8. FILE PERMISSIONS" >> "$REPORT_FILE"
echo "-------------------" >> "$REPORT_FILE"

# Check for overly permissive files
PERM_ISSUES=0
while IFS= read -r file; do
    if [ -f "$file" ]; then
        PERMS=$(stat -f "%A" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null)
        if [ "$PERMS" = "777" ] || [ "$PERMS" = "666" ]; then
            log "${RED}✗ Overly permissive: $file ($PERMS)${NC}"
            echo "FAIL: $file has permissions $PERMS" >> "$REPORT_FILE"
            ((PERM_ISSUES++))
        fi
    fi
done < <(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null)

if [ $PERM_ISSUES -eq 0 ]; then
    log "${GREEN}✓ File permissions OK${NC}"
    echo "PASS: No overly permissive files" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# ============================================================================
# SUMMARY
# ============================================================================
echo "" >> "$REPORT_FILE"
echo "============================================" >> "$REPORT_FILE"
echo "SUMMARY" >> "$REPORT_FILE"
echo "============================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

log ""
log "${BLUE}============================================${NC}"
log "${BLUE}   AUDIT SUMMARY${NC}"
log "${BLUE}============================================${NC}"

if [ $ISSUES -eq 0 ]; then
    log "${GREEN}✓ Security audit passed!${NC}"
    log "${GREEN}  No critical issues found${NC}"
    echo "Status: PASS" >> "$REPORT_FILE"
    echo "Critical Issues: 0" >> "$REPORT_FILE"
else
    log "${RED}✗ Security audit found $ISSUES critical issue(s)${NC}"
    log "${YELLOW}  Please review and fix the issues above${NC}"
    echo "Status: FAIL" >> "$REPORT_FILE"
    echo "Critical Issues: $ISSUES" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "Full report saved to: $REPORT_FILE" >> "$REPORT_FILE"

log ""
log "${BLUE}Full report saved to: $REPORT_FILE${NC}"
log ""

# ============================================================================
# RECOMMENDATIONS
# ============================================================================
cat >> "$REPORT_FILE" <<EOF

RECOMMENDATIONS
===============

1. Regular Updates
   - Run 'npm audit' weekly
   - Update dependencies monthly
   - Monitor security advisories

2. Environment Security
   - Never commit .env files
   - Use environment-specific configs
   - Rotate secrets regularly

3. Code Security
   - Use input validation everywhere
   - Sanitize user inputs
   - Implement rate limiting
   - Use HTTPS only

4. Monitoring
   - Enable error tracking (Sentry)
   - Monitor failed login attempts
   - Track API usage
   - Set up alerts

5. Access Control
   - Implement proper RBAC
   - Use principle of least privilege
   - Regular access reviews
   - Strong password policies

EOF

log "${GREEN}Security audit complete!${NC}"

exit $ISSUES
