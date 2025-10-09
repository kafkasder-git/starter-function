# 🚀 Deployment Guide

Complete deployment guide for Kafkasder Management System.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Netlify](#netlify-deployment)
  - [Docker](#docker-deployment)
  - [Cloudflare Pages](#cloudflare-pages)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- Node.js 20+ and npm
- Supabase account and project
- Git

### Optional

- Docker and Docker Compose (for containerized deployment)
- Netlify CLI or Cloudflare Wrangler
- Domain name with SSL certificate

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/kafkasder/panel.git
cd panel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Application
VITE_APP_NAME=Kafkasder Management System
VITE_APP_VERSION=1.0.0

# Security
VITE_CSRF_SECRET=your_secret_key_here

# Sentry (Optional)
VITE_SENTRY_DSN=your_sentry_dsn_here
```

---

## Deployment Options

### Netlify Deployment

#### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

#### Option 2: Git Integration

1. Push code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables in Netlify dashboard
7. Deploy!

#### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Docker Deployment

#### Build and Run

```bash
# Build image
docker build -t kafkasder-panel .

# Run container
docker run -d \
  -p 3000:3000 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  --name kafkasder-panel \
  kafkasder-panel
```

#### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### With Nginx

```bash
# Start with nginx reverse proxy
docker-compose --profile with-nginx up -d
```

---

### Cloudflare Pages

#### Using Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=kafkasder-panel
```

#### Git Integration

1. Push to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Create new project
4. Connect repository
5. Configure:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
6. Add environment variables
7. Deploy!

---

## Database Setup

### 1. Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Run files in order:
# 1. supabase/migrations/20250107000001_initial_schema.sql
# 2. supabase/migrations/20250107000002_rls_policies.sql
# 3. supabase/migrations/20250107000003_seed_data.sql
```

### 2. Verify Tables

Check that all tables are created:

- users
- members
- donations
- beneficiaries
- aid_requests
- campaigns
- financial_transactions
- kumbaras
- kumbara_collections
- documents
- audit_logs
- notifications

### 3. Enable RLS

Ensure Row Level Security is enabled on all tables.

### 4. Create Admin User

```sql
-- In Supabase SQL Editor
INSERT INTO public.users (email, full_name, role, is_active)
VALUES ('admin@kafkasder.com', 'System Administrator', 'admin', true);
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://your-domain.com/health

# Check application
open https://your-domain.com
```

### 2. Test Authentication

- Login with admin credentials
- Verify dashboard loads
- Test navigation

### 3. Configure DNS

Point your domain to deployment:

**Netlify:**
- Add custom domain in Netlify dashboard
- Update DNS records

**Cloudflare:**
- Automatic DNS configuration

### 4. Enable SSL

**Netlify:** Automatic Let's Encrypt SSL

**Docker/Nginx:** Use Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

---

## Monitoring

### Sentry Setup

1. Create Sentry project
2. Add DSN to environment variables
3. Deploy with Sentry enabled

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

### Performance Monitoring

- Lighthouse CI
- Web Vitals
- Sentry Performance

---

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

### Environment Variables Not Working

- Verify variables start with `VITE_`
- Check deployment platform environment settings
- Rebuild after adding variables

### Database Connection Issues

- Verify Supabase URL and keys
- Check RLS policies
- Ensure tables exist

### 404 Errors on Refresh

Add redirect rules for SPA:

**Netlify:** Already configured in `netlify.toml`

**Nginx:** Already configured in `nginx.conf`

### Performance Issues

```bash
# Analyze bundle
npm run analyze

# Check lighthouse score
npm run lighthouse
```

---

## Rollback

### Netlify

```bash
# List deployments
netlify deploy:list

# Rollback to specific deployment
netlify rollback
```

### Docker

```bash
# Use previous image
docker run previous-image-tag
```

---

## Security Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Security headers enabled
- [ ] RLS policies active
- [ ] Admin user created
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking enabled

---

## Support

For deployment issues:
- GitHub Issues: https://github.com/kafkasder/panel/issues
- Email: dev@kafkasder.com

---

**Last Updated:** 2025-01-07
