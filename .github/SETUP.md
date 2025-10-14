# GitHub Actions CI/CD Setup Guide

## 🔧 Repository Configuration

### 1. GitHub Pages Setup

#### Enable GitHub Pages
1. Go to Repository Settings > Pages
2. Source: "GitHub Actions"
3. Save

### 2. GitHub Secrets Setup

Go to Repository Settings > Secrets and variables > Actions and add:

#### Required Secrets
```
# Appwrite Configuration (KafkasPortal)
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=68e99f6c000183bafb39
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=dernek_yonetim_db
```

#### Optional Secrets (for alternative deployments)
```
# S3 Deployment
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name

# FTP Deployment
FTP_SERVER=your_ftp_server
FTP_USERNAME=your_ftp_username
FTP_PASSWORD=your_ftp_password

# Other services
SNYK_TOKEN=your_snyk_token (for security scanning)
CODECOV_TOKEN=your_codecov_token (for coverage reporting)
SLACK_WEBHOOK_URL=your_slack_webhook (for notifications)
```

### 2. Environment Protection Rules

#### Staging Environment
- **Name**: `staging`
- **Protection Rules**: None (auto-deploy)
- **URL**: `https://fra.cloud.appwrite.io/v1/functions/68e99f6c000183bafb39/dernekys-staging`

#### Production Environment
- **Name**: `production`
- **Protection Rules**:
  - ✅ Required reviewers: 2
  - ✅ Restrict to branches: `main` only
  - ✅ Wait timer: 0 minutes
- **URL**: `https://fra.cloud.appwrite.io/v1/functions/68e99f6c000183bafb39/dernekys-production`

### 3. Branch Protection Rules

#### Main Branch
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - ✅ CI Pipeline
  - ✅ CD Pipeline
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Include administrators

#### Develop Branch
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - ✅ CI Pipeline
- ✅ Require branches to be up to date before merging

## 🌐 Deployment Options

### 1. Appwrite Functions + Storage (Recommended)
- **Pros**: Full-stack solution, real-time, scalable, integrated database
- **Cons**: Requires Appwrite account, learning curve
- **URL**: `https://fra.cloud.appwrite.io/v1/functions/68e99f6c000183bafb39/[function-id]`

### 2. AWS S3 + CloudFront
- **Pros**: Scalable, custom domain, CDN
- **Cons**: Requires AWS account, costs money
- **Setup**: Configure AWS secrets

### 3. FTP Upload
- **Pros**: Works with any web hosting
- **Cons**: Manual setup, no automatic scaling
- **Setup**: Configure FTP secrets

### 4. Docker Build
- **Pros**: Containerized, deployable anywhere
- **Cons**: Requires container hosting
- **Output**: Docker image artifact

## 🚀 Workflow Triggers

### CI Pipeline
- **Trigger**: Pull requests to `main` or `develop`
- **Trigger**: Push to `main` or `develop`
- **Jobs**: Lint, Type Check, Tests, Build, Security

### CD Pipeline
- **Trigger**: Push to `main` (staging auto-deploy)
- **Trigger**: Manual dispatch (production deploy)
- **Jobs**: Build, Deploy, Health Check

### Release Pipeline
- **Trigger**: Git tags matching `v*` pattern
- **Jobs**: Changelog, Release, Deploy, Health Check

## 📊 Quality Gates

### CI Quality Gates
- ✅ All tests must pass (100% pass rate)
- ✅ No lint errors
- ✅ No TypeScript errors
- ✅ Build must succeed
- ✅ Security audit: Critical = 0, High < 5

### CD Quality Gates
- ✅ Staging deployment must succeed
- ✅ Smoke tests must pass
- ✅ Health check must pass
- ✅ Production requires manual approval

## 🔍 Monitoring & Alerts

### GitHub Actions
- View workflow runs in Actions tab
- Check logs for debugging
- Monitor workflow performance

### Vercel Dashboard
- Monitor deployment status
- Check build logs
- View performance metrics

### Notifications
- GitHub commit status checks
- Slack/Discord notifications (if configured)
- Email notifications for failures

## 📋 Deployment Usage Examples

### Appwrite Deployment
```bash
# Automatic deployment on main branch push
git push origin main

# Manual deployment via GitHub Actions
# Go to Actions > Appwrite Deployment > Run workflow
# Select environment: staging/production
# Select deploy type: functions-only/storage-only/full-deployment
```

### S3 Deployment
```bash
# Configure AWS secrets first, then:
# Go to Actions > Deploy Static Options > Run workflow
# Select "s3-bucket" as deployment type
```

### FTP Deployment
```bash
# Configure FTP secrets first, then:
# Go to Actions > Deploy Static Options > Run workflow
# Select "ftp-upload" as deployment type
```

### Docker Build
```bash
# Build Docker image
# Go to Actions > Deploy Static Options > Run workflow
# Select "docker-build" as deployment type
# Download artifact from Actions tab
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Check for lint errors
npm run lint
```

#### 2. Test Failures
```bash
# Run tests locally
npm run test

# Run with coverage
npm run test:coverage
```

#### 3. Deployment Failures
- Check Vercel logs
- Verify secrets are correct
- Check environment variables

#### 4. Security Scan Failures
```bash
# Run security audit locally
npm audit

# Fix vulnerabilities
npm audit fix
```

### Debug Commands

```bash
# Install dependencies
npm ci

# Run all checks locally
npm run lint && npm run type-check && npm run test && npm run build

# Check bundle size
npm run bundlesize

# Run Lighthouse CI locally
npm run lighthouse
```

## 📈 Performance Optimization

### Caching Strategy
- Node modules cached between runs
- Build artifacts cached
- Test results cached

### Parallel Jobs
- Lint, Type Check, Tests run in parallel
- Matrix testing for multiple Node versions
- OS matrix testing

### Conditional Workflows
- Only run on changed files for PRs
- Full test suite for main branch
- Performance tests for releases

## 🔒 Security Best Practices

### Secrets Management
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly
- Use least privilege principle

### Code Security
- Dependency vulnerability scanning
- SAST/DAST scanning
- Secret scanning

### Deployment Security
- Environment protection rules
- Manual approval for production
- Health checks before deployment

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Bundle Size Documentation](https://github.com/siddharthkp/bundlesize)

## 🆘 Support

If you encounter issues:

1. Check the workflow logs in GitHub Actions
2. Verify all secrets are correctly set
3. Test locally with the same commands
4. Check the troubleshooting section above
5. Create an issue in the repository
