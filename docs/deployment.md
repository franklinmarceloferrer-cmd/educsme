# EduCMS Deployment Guide

## 🚀 **Deployment Overview**

### Current Status
- **Development**: Local Vite dev server (port 8080)
- **Production**: Not yet deployed
- **Backend**: Supabase cloud instance (configured)

### Recommended Deployment Stack
- **Frontend Hosting**: Vercel or Netlify
- **Backend**: Supabase (already configured)
- **Domain**: Custom domain with SSL
- **CDN**: Automatic via hosting provider

## 🏗️ **Production Architecture**

```
Users → CDN → Frontend (Vercel/Netlify) → Supabase → PostgreSQL
  ↓        ↓           ↓                    ↓         ↓
Browser → Cache → React App → API → Database
```

## 📋 **Pre-Deployment Checklist**

### Code Quality
- [ ] All features implemented and tested
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful
- [ ] ESLint passes without errors
- [ ] Build process completes successfully

### Environment Configuration
- [ ] Environment variables configured
- [ ] Supabase project settings verified
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] File storage buckets created

### Performance Optimization
- [ ] Bundle size optimized
- [ ] Images optimized and compressed
- [ ] Unused dependencies removed
- [ ] Code splitting implemented
- [ ] Lazy loading configured

## 🔧 **Environment Configuration**

### Environment Variables
```env
# Production Environment Variables
VITE_SUPABASE_URL=https://rttarliasydfffldayui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Analytics and monitoring
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Build Configuration
```typescript
// vite.config.ts - Production optimizations
export default defineConfig(({ mode }) => ({
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: mode === 'production' ? 80 : 8080
  }
}));
```

## 🌐 **Vercel Deployment**

### Step 1: Prepare Repository
```bash
# Ensure clean build
npm run build
npm run preview  # Test production build locally

# Commit all changes
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Step 3: Deploy to Vercel
```bash
# Option 1: Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: GitHub Integration
# 1. Connect GitHub repo to Vercel
# 2. Configure environment variables
# 3. Deploy automatically on push
```

### Step 4: Configure Environment Variables in Vercel
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add production environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🌍 **Netlify Deployment**

### Step 1: Build Configuration
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Step 2: Deploy to Netlify
```bash
# Option 1: Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Option 2: Git Integration
# 1. Connect GitHub repo to Netlify
# 2. Configure build settings
# 3. Add environment variables
```

## 🗄️ **Supabase Production Setup**

### Database Configuration
```sql
-- Ensure all migrations are applied
-- Check RLS policies are active
-- Verify user roles and permissions

-- Production optimizations
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
```

### Storage Configuration
```typescript
// Create storage buckets for production
const buckets = [
  { name: 'documents', public: false },
  { name: 'avatars', public: true },
  { name: 'announcements', public: false }
];

// Set up storage policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

### Security Configuration
1. **Enable RLS on all tables**
2. **Configure CORS for your domain**
3. **Set up proper JWT settings**
4. **Enable audit logging**
5. **Configure backup schedules**

## 📊 **Monitoring & Analytics**

### Performance Monitoring
```typescript
// Add performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Tracking
```typescript
// Add Sentry for error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Analytics Integration
```typescript
// Add Google Analytics or similar
import { gtag } from 'ga-gtag';

gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
```

## 🔒 **Security Considerations**

### HTTPS Configuration
- ✅ Automatic HTTPS via Vercel/Netlify
- ✅ HSTS headers configured
- ✅ Secure cookie settings

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co;">
```

### Environment Security
- ✅ No sensitive data in client-side code
- ✅ API keys properly scoped
- ✅ Database access via RLS policies
- ✅ File upload restrictions in place

## 🚦 **CI/CD Pipeline**

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 **Performance Optimization**

### Build Optimizations
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images
npm install -D @squoosh/lib
# Add image optimization to build process
```

### Runtime Optimizations
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Announcements = lazy(() => import('./pages/Announcements'));

// Preload critical resources
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

## 🔄 **Deployment Workflow**

### Development → Staging → Production
```bash
# 1. Development
git checkout develop
# Make changes, test locally

# 2. Staging (optional)
git checkout staging
git merge develop
# Deploy to staging environment

# 3. Production
git checkout main
git merge staging
git push origin main
# Automatic deployment via CI/CD
```

### Rollback Strategy
```bash
# Quick rollback via Vercel
vercel rollback

# Or via Git
git revert HEAD
git push origin main
```

## 📋 **Post-Deployment Checklist**

### Functionality Testing
- [ ] User authentication works
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] File uploads work (when implemented)
- [ ] Data displays correctly
- [ ] Theme switching works
- [ ] Mobile responsiveness verified

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Images load properly
- [ ] Fonts load without flash

### Security Testing
- [ ] HTTPS enforced
- [ ] No sensitive data exposed
- [ ] API endpoints secured
- [ ] File uploads restricted
- [ ] XSS protection active

## 🆘 **Troubleshooting**

### Common Issues
1. **Build Failures**
   - Check TypeScript errors
   - Verify environment variables
   - Clear node_modules and reinstall

2. **Runtime Errors**
   - Check browser console
   - Verify API endpoints
   - Check network requests

3. **Performance Issues**
   - Analyze bundle size
   - Check for memory leaks
   - Optimize images and assets

### Support Resources
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
