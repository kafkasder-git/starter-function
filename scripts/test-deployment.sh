#!/bin/bash

# ============================================================================
# Deployment Test Script - Kafkasder Management System
# ============================================================================
# This script validates deployment prerequisites and runs tests before deploy

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ============================================================================
# Step 1: Check Prerequisites
# ============================================================================

print_header "Step 1: Checking Prerequisites"

# Check Node.js version
print_status "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version must be 20 or higher. Current: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"

# Check npm
print_status "Checking npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi
print_success "npm version: $(npm -v)"

# Check if we're in the right directory
print_status "Checking project directory..."
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Are you in the project root?"
    exit 1
fi
print_success "Project directory verified"

# ============================================================================
# Step 2: Check Environment Variables
# ============================================================================

print_header "Step 2: Checking Environment Variables"

# Check for Cloudflare API token
print_status "Checking Cloudflare API token..."
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    print_warning "CLOUDFLARE_API_TOKEN not set!"
    print_warning "Set it with: export CLOUDFLARE_API_TOKEN=\"your_token\""
    print_warning "Deployment will fail without this token."
else
    print_success "CLOUDFLARE_API_TOKEN is set"
fi

# Check for .env.production (optional for local builds)
print_status "Checking .env.production..."
if [ -f ".env.production" ]; then
    print_success ".env.production exists"
    
    # Validate required variables
    REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env.production; then
            print_success "$var found in .env.production"
        else
            print_warning "$var not found in .env.production"
        fi
    done
else
    print_warning ".env.production not found"
    print_warning "Make sure environment variables are set in Cloudflare Dashboard"
fi

# ============================================================================
# Step 3: Check Dependencies
# ============================================================================

print_header "Step 3: Checking Dependencies"

print_status "Checking if node_modules exists..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Running npm install..."
    npm install
    print_success "Dependencies installed"
else
    print_success "node_modules exists"
fi

# Check for critical dependencies
print_status "Checking critical dependencies..."
CRITICAL_DEPS=("vite" "@supabase/supabase-js" "react" "wrangler")
for dep in "${CRITICAL_DEPS[@]}"; do
    if npm list "$dep" &> /dev/null; then
        print_success "$dep installed"
    else
        print_error "$dep not installed!"
        exit 1
    fi
done

# ============================================================================
# Step 4: Run Build Test
# ============================================================================

print_header "Step 4: Testing Build"

print_status "Cleaning previous build..."
if [ -d "dist" ]; then
    rm -rf dist
    print_success "Previous build cleaned"
fi

print_status "Running production build..."
if npm run build; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Check if dist folder was created
print_status "Verifying build output..."
if [ ! -d "dist" ]; then
    print_error "dist folder not created!"
    exit 1
fi

# Check for index.html
if [ ! -f "dist/index.html" ]; then
    print_error "dist/index.html not found!"
    exit 1
fi
print_success "Build output verified"

# Get build size
DIST_SIZE=$(du -sh dist | cut -f1)
print_success "Build size: $DIST_SIZE"

# ============================================================================
# Step 5: Validate Build Content
# ============================================================================

print_header "Step 5: Validating Build Content"

# Check for critical files
CRITICAL_FILES=("index.html" "manifest.webmanifest")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "dist/$file" ]; then
        print_success "$file exists"
    else
        print_warning "$file not found"
    fi
done

# Check for assets
if [ -d "dist/assets" ]; then
    ASSET_COUNT=$(find dist/assets -type f | wc -l)
    print_success "Assets folder contains $ASSET_COUNT files"
else
    print_warning "Assets folder not found"
fi

# ============================================================================
# Step 6: Configuration Validation
# ============================================================================

print_header "Step 6: Validating Configuration"

# Check wrangler.toml
print_status "Checking wrangler.toml..."
if [ -f "wrangler.toml" ]; then
    print_success "wrangler.toml exists"
    
    # Extract project name
    PROJECT_NAME=$(grep '^name = ' wrangler.toml | cut -d'"' -f2)
    if [ -n "$PROJECT_NAME" ]; then
        print_success "Project name: $PROJECT_NAME"
    else
        print_warning "Project name not found in wrangler.toml"
    fi
else
    print_error "wrangler.toml not found!"
    exit 1
fi

# ============================================================================
# Step 7: Security Check
# ============================================================================

print_header "Step 7: Security Check"

print_status "Checking for sensitive files in dist..."
SENSITIVE_PATTERNS=(".env" "*.key" "*.pem")
FOUND_SENSITIVE=0

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if find dist -name "$pattern" 2>/dev/null | grep -q .; then
        print_error "Sensitive file found matching: $pattern"
        FOUND_SENSITIVE=1
    fi
done

if [ $FOUND_SENSITIVE -eq 0 ]; then
    print_success "No sensitive files found in build"
fi

# Check .gitignore
print_status "Checking .gitignore..."
GITIGNORE_ENTRIES=("dist/" ".env" ".env.production" "node_modules/")
for entry in "${GITIGNORE_ENTRIES[@]}"; do
    if grep -q "$entry" .gitignore; then
        print_success "$entry is in .gitignore"
    else
        print_warning "$entry not found in .gitignore"
    fi
done

# ============================================================================
# Final Summary
# ============================================================================

print_header "Deployment Readiness Summary"

echo ""
echo -e "${GREEN}✓ Prerequisites: OK${NC}"
echo -e "${GREEN}✓ Dependencies: OK${NC}"
echo -e "${GREEN}✓ Build: OK${NC}"
echo -e "${GREEN}✓ Configuration: OK${NC}"
echo ""

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠ Warning: CLOUDFLARE_API_TOKEN not set${NC}"
    echo -e "${YELLOW}  Set it before deploying:${NC}"
    echo -e "${YELLOW}  export CLOUDFLARE_API_TOKEN=\"your_token\"${NC}"
    echo ""
fi

echo -e "${BLUE}Ready to deploy!${NC}"
echo ""
echo -e "To deploy to production, run:"
echo -e "${GREEN}npm run deploy:prod${NC}"
echo ""
echo -e "To test locally, run:"
echo -e "${GREEN}npm run preview${NC}"
echo ""

exit 0

