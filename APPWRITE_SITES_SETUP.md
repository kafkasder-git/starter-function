# 🚀 Appwrite Sites Setup Guide

This guide will help you deploy your React panel application to Appwrite Sites.

## 📋 Prerequisites

- ✅ Appwrite CLI installed locally (`npx appwrite --version`)
- ✅ Node.js project with build script
- ✅ Appwrite Cloud account (free at https://cloud.appwrite.io)

## 🏗️ Step 1: Create Appwrite Project

1. **Go to Appwrite Console**
   - Visit: https://cloud.appwrite.io/console
   - Sign up or log in to your account

2. **Create New Project**
   - Click "Create Project"
   - Name: "Kafkasder Management Panel"
   - Choose your preferred region

3. **Add Web Platform**
   - In your project dashboard, click "Add Platform"
   - Select "Web App"
   - Hostname: `localhost` (for development)
   - Save the Project ID for later use

## 🌐 Step 2: Configure Sites

1. **Navigate to Sites**
   - In your project sidebar, click "Sites"

2. **Create New Site**
   - Click "Create Site"
   - Name: "Panel App"
   - Domain: Auto-generated or custom

3. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: dist
   Node Version: 18 (or your preferred version)
   ```

4. **Set Environment Variables**
   ```
   VITE_APPWRITE_ENDPOINT=https://your-region.cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id
   ```

## 🔧 Step 3: Deployment Options

### Option A: Manual Deployment (Easiest)

1. **Build Your Project**
   ```bash
   npm run build
   ```

2. **Upload to Sites**
   - In Sites dashboard, click "Deploy"
   - Upload the contents of your `dist/` folder
   - Wait for deployment to complete

### Option B: CLI Deployment

1. **Login to Appwrite CLI**
   ```bash
   npx appwrite login
   ```

2. **Deploy with CLI**
   ```bash
   npx appwrite deploy site \
     --project-id=YOUR_PROJECT_ID \
     --site-id=YOUR_SITE_ID
   ```

### Option C: Git Integration (Recommended for Production)

1. **Connect Repository**
   - In Sites settings, go to "Git Integration"
   - Connect your GitHub/GitLab repository
   - Set up automatic deployments on push

2. **Configure Branch**
   - Main branch: `main` or `master`
   - Auto-deploy on push: Enabled

## 🎯 Step 4: Configure Your React App

Update your `vite.config.ts` to ensure proper build output:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
```

## 🔐 Step 5: Environment Variables

Create a `.env.local` file (don't commit this):

```env
VITE_APPWRITE_ENDPOINT=https://your-region.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
```

Update your `appwrite.yaml` with actual values:

```yaml
projectId: 'your-actual-project-id'

sites:
  - id: 'panel-app'
    name: 'Kafkasder Management Panel'
    buildCommand: 'npm run build'
    outputDirectory: 'dist'
    environmentVariables:
      - VITE_APPWRITE_ENDPOINT: 'https://your-region.cloud.appwrite.io/v1'
      - VITE_APPWRITE_PROJECT_ID: 'your-actual-project-id'
```

## 🚀 Step 6: Deploy

Run the deployment script:

```bash
./deploy-sites.sh
```

Or manually:

```bash
npm run build
# Then upload dist/ contents to Sites dashboard
```

## 🌟 Features You Get

- **Global CDN**: Fast content delivery worldwide
- **SSL Certificates**: Automatic HTTPS
- **Custom Domains**: Use your own domain
- **Preview Deployments**: Test before going live
- **Automatic Scaling**: Handles traffic spikes
- **Build Logs**: Monitor deployment process
- **Environment Management**: Secure variable storage

## 🔍 Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Verify build command in package.json

### Environment Variables Not Working
- Make sure variables start with `VITE_`
- Check variable names match exactly
- Redeploy after changing variables

### Domain Issues
- Verify DNS settings for custom domains
- Check SSL certificate status
- Ensure domain is properly configured

## 📚 Additional Resources

- [Appwrite Sites Documentation](https://appwrite.io/docs/products/sites)
- [React Deployment Guide](https://appwrite.io/docs/products/sites/quick-start/react)
- [Environment Variables Guide](https://appwrite.io/docs/products/sites/environment-variables)
- [Custom Domains Guide](https://appwrite.io/docs/products/sites/domains)

## 🆘 Support

- [Appwrite Discord](https://discord.gg/appwrite)
- [GitHub Issues](https://github.com/appwrite/appwrite/issues)
- [Documentation](https://appwrite.io/docs)

---

**Happy Deploying! 🎉**
