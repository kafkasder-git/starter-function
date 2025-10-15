# Deployment Guide

## Overview

Bu rehber, Dernek Yönetim Sistemi'ni production ortamına deploy etmek için gerekli adımları detaylandırır. GitHub Actions CI/CD pipeline ve Appwrite deployment kullanılmaktadır.

## Prerequisites

- GitHub repository access
- Appwrite project setup
- Environment variables configured
- Domain/DNS access (optional)

## Environment Setup

### 1. GitHub Secrets Configuration

Repository: `https://github.com/kafkasder-git/starter-function`

**Required Secrets:**
```
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e99f6c000183bafb39
VITE_APPWRITE_DATABASE_ID=dernek_yonetim_db
APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e
```

**How to Set Secrets:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with exact name and value
4. Save all secrets

### 2. Appwrite Configuration

**Project Settings:**
- Project ID: `68e99f6c000183bafb39`
- Project Name: `KafkasPortal`
- Database ID: `dernek_yonetim_db`

**Collections Setup:**
```bash
# Required collections (already created)
- user_profiles
- beneficiaries
- donations
- aid_applications
- messages
- notifications
- partners
- kumbara
- events
- tasks
- legal_documents
- reports
- user_activities
- system_settings
```

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

**Trigger:** Push to `main` branch

**Process:**
1. Make changes to code
2. Commit and push to `main` branch
3. GitHub Actions automatically:
   - Runs tests
   - Builds the application
   - Deploys to Appwrite

**Workflow File:** `.github/workflows/ci-cd.yml`

```yaml
# Automatic deployment on main branch push
on:
  push:
    branches: [main]

jobs:
  test:
    # Run tests and quality checks
  deploy:
    # Build and deploy to Appwrite
    if: github.ref == 'refs/heads/main'
```

### Method 2: Manual Deployment

**Trigger:** Manual workflow dispatch

**Steps:**
1. Go to GitHub repository → Actions tab
2. Select "Manual Deploy" workflow
3. Click "Run workflow"
4. Choose environment (production/staging)
5. Click "Run workflow"

**Workflow File:** `.github/workflows/manual-deploy.yml`

## Build Process

### 1. Dependencies Installation
```bash
npm ci --legacy-peer-deps
```

### 2. Type Checking
```bash
npm run type-check
```

### 3. Linting
```bash
npm run lint
```

### 4. Production Build
```bash
npm run build
```

**Build Output:**
- `dist/` directory with optimized assets
- Bundle analysis report: `dist/bundle-analysis.html`
- Critical CSS inlined in `index.html`

### 5. Appwrite Deployment
```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login --endpoint $VITE_APPWRITE_ENDPOINT --key $APPWRITE_API_KEY

# Deploy functions (if exists)
appwrite deploy function --yes
```

## Environment Variables

### Development Environment
```bash
# .env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e99f6c000183bafb39
VITE_APPWRITE_DATABASE_ID=dernek_yonetim_db
APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e
NODE_ENV=development
VITE_NODE_ENV=development
```

### Production Environment
```bash
# .env.production
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e99f6c000183bafb39
VITE_APPWRITE_DATABASE_ID=dernek_yonetim_db
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NODE_ENV=production
VITE_NODE_ENV=production
```

## Performance Optimization

### Bundle Analysis
```bash
# Generate bundle analysis
npm run build
open dist/bundle-analysis.html
```

**Target Metrics:**
- Initial bundle size: < 2MB
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s
- Lighthouse Performance Score: > 90

### Critical CSS
```bash
# Extract and inline critical CSS
node scripts/extract-critical-css.js
```

### Image Optimization
```bash
# Optimize images (if using custom images)
node scripts/optimize-images.js
```

## Monitoring & Health Checks

### 1. Application Health
**Endpoint:** `https://app.dernekys.com/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": "connected",
  "appwrite": "connected"
}
```

### 2. Performance Monitoring
- **Lighthouse CI**: Automated performance testing
- **Bundle Analysis**: Size monitoring
- **Error Tracking**: Sentry integration (optional)

### 3. Logs
**GitHub Actions Logs:**
- Repository → Actions → Latest workflow run
- View build logs, test results, deployment status

## Rollback Procedure

### 1. Automatic Rollback (GitHub)
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### 2. Manual Rollback (Appwrite)
```bash
# Deploy previous version
git checkout <previous-commit-hash>
npm run build
appwrite deploy function --yes
```

### 3. Database Rollback
```bash
# If database changes were made
# Restore from backup or revert schema changes
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
**Error:** TypeScript compilation errors
**Solution:**
```bash
# Fix TypeScript errors
npm run type-check
# Fix linting errors
npm run lint --fix
```

#### 2. Deployment Failures
**Error:** Appwrite API connection failed
**Solution:**
- Check API key validity
- Verify endpoint URL
- Check network connectivity

#### 3. Environment Variable Issues
**Error:** Environment variables not loaded
**Solution:**
- Verify GitHub Secrets are set correctly
- Check variable names match exactly
- Ensure no extra spaces or characters

#### 4. Bundle Size Issues
**Error:** Bundle size exceeds limits
**Solution:**
```bash
# Analyze bundle
npm run build
# Check bundle-analysis.html
# Remove unused dependencies
npm prune
```

### Debug Commands

```bash
# Check build locally
npm run build

# Test Appwrite connection
npm run test:appwrite

# List collections
npm run list:collections

# Check environment variables
npm run env:check
```

## Security Considerations

### 1. API Key Security
- ✅ API keys stored as GitHub Secrets
- ✅ Never commit API keys to repository
- ✅ Use different keys for different environments

### 2. Database Security
- ✅ Database access restricted to specific IPs
- ✅ User permissions properly configured
- ✅ Sensitive data encrypted

### 3. Application Security
- ✅ HTTPS enforced
- ✅ CSP headers configured
- ✅ Input validation implemented
- ✅ XSS protection enabled

## Scaling Considerations

### 1. Database Scaling
- **Appwrite Cloud**: Automatic scaling
- **Custom Database**: Consider read replicas for high traffic

### 2. CDN Configuration
- **Static Assets**: Serve from CDN
- **Images**: Use image optimization service
- **API Calls**: Cache frequently accessed data

### 3. Monitoring Scaling
- **Performance Monitoring**: Set up alerts
- **Error Tracking**: Monitor error rates
- **User Analytics**: Track usage patterns

## Maintenance

### 1. Regular Updates
```bash
# Update dependencies
npm update
# Update Appwrite SDK
npm update appwrite
# Test after updates
npm test
```

### 2. Backup Strategy
- **Database**: Daily automated backups
- **Code**: Git repository serves as backup
- **Configuration**: Environment variables documented

### 3. Performance Monitoring
- **Weekly**: Check bundle size trends
- **Monthly**: Review performance metrics
- **Quarterly**: Update dependencies

## Support & Resources

### Documentation
- [Appwrite Documentation](https://appwrite.io/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)

### Community
- [GitHub Issues](https://github.com/kafkasder-git/starter-function/issues)
- [Appwrite Discord](https://discord.gg/appwrite)
- [React Community](https://react.dev/community)

### Emergency Contacts
- **Technical Issues**: api-support@dernekys.com
- **Security Issues**: security@dernekys.com
- **General Support**: support@dernekys.com
