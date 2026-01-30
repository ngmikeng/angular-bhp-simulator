# CI/CD Pipeline & GitHub Pages Deployment

## Overview

This document provides comprehensive guidance for setting up Continuous Integration/Continuous Deployment (CI/CD) pipelines using GitHub Actions and deploying the Angular BHP Simulator to GitHub Pages.

## Repository Structure

```
angular-bhp-simulator/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Continuous Integration
│       ├── deploy.yml                # Deploy to GitHub Pages
│       └── release.yml               # Create releases
├── apps/
│   └── demo-app/
├── libs/
├── dist/                             # Build output (gitignored)
├── .gitignore
├── angular.json
├── package.json
└── README.md
```

## Continuous Integration Workflow

### CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Needed for Nx affected commands
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
        env:
          CI: true
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        if: matrix.node-version == '20.x'
        with:
          files: ./coverage/*/lcov.info
          flags: unittests
          name: codecov-umbrella
      
      - name: Build all projects
        run: npm run build:all
      
      - name: Archive build artifacts
        if: matrix.node-version == '20.x'
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/
          retention-days: 7

  # Check for security vulnerabilities
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Check code quality
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Prettier check
        run: npm run format:check
      
      - name: Check bundle size
        run: npm run build:analyze
        continue-on-error: true
```

## Deployment Workflow

### Deploy to GitHub Pages (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application for production
        run: npm run build:production
        env:
          NODE_ENV: production
      
      - name: Upload artifact for deployment
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/apps/demo-app

  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    needs: build
    
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Deployed to GitHub Pages: ${{ steps.deployment.outputs.page_url }}'
            })
```

### Alternative: Deploy using peaceiris/actions-gh-pages

```yaml
name: Deploy to GitHub Pages (Alternative)

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:production
        env:
          NODE_ENV: production
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/apps/demo-app
          cname: bhp-simulator.yourdomain.com  # Optional: custom domain
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
          commit_message: 'Deploy to GitHub Pages'
```

## Release Workflow

### Create Release (`.github/workflows/release.yml`)

```yaml
name: Create Release

on:
  push:
    tags:
      - 'v*.*.*'  # Triggered on version tags like v1.0.0

jobs:
  build:
    name: Build Release Artifacts
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:production
      
      - name: Create tarball
        run: |
          cd dist/apps/demo-app
          tar -czf ../../../bhp-simulator-${{ github.ref_name }}.tar.gz .
          cd ../../..
      
      - name: Upload Release Asset
        uses: actions/upload-artifact@v3
        with:
          name: release-artifacts
          path: bhp-simulator-*.tar.gz

  release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: release-artifacts
      
      - name: Extract version from tag
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
      
      - name: Generate Release Notes
        id: changelog
        uses: mikepenz/release-changelog-builder-action@v4
        with:
          configuration: ".github/release-changelog-config.json"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          name: Release v${{ steps.version.outputs.version }}
          body: ${{ steps.changelog.outputs.changelog }}
          files: |
            bhp-simulator-*.tar.gz
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Package.json Scripts

### Build Scripts

```json
{
  "scripts": {
    "start": "nx serve demo-app",
    "build": "nx build demo-app",
    "build:production": "nx build demo-app --configuration=production --base-href=/angular-bhp-simulator/",
    "build:all": "nx run-many --target=build --all",
    "build:analyze": "nx build demo-app --configuration=production --stats-json && webpack-bundle-analyzer dist/apps/demo-app/stats.json",
    
    "test": "nx test",
    "test:ci": "nx run-many --target=test --all --code-coverage --watch=false --browsers=ChromeHeadless",
    "test:watch": "nx test --watch",
    "test:coverage": "nx test --code-coverage",
    
    "lint": "nx run-many --target=lint --all",
    "lint:fix": "nx run-many --target=lint --all --fix",
    
    "format": "prettier --write \"**/*.{ts,html,scss,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,html,scss,json,md}\"",
    
    "affected:test": "nx affected --target=test",
    "affected:build": "nx affected --target=build",
    "affected:lint": "nx affected --target=lint"
  }
}
```

## Angular Build Configuration

### angular.json Production Configuration

```json
{
  "projects": {
    "demo-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "6kb",
                  "maximumError": "10kb"
                }
              ],
              "fileReplacements": [
                {
                  "replace": "apps/demo-app/src/environments/environment.ts",
                  "with": "apps/demo-app/src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

## Environment Configuration

### Development Environment

```typescript
// apps/demo-app/src/environments/environment.ts
export const environment = {
  production: false,
  name: 'development',
  version: '1.0.0-dev',
  apiUrl: 'http://localhost:4200',
  enableDebugMode: true,
  enableAnalytics: false,
};
```

### Production Environment

```typescript
// apps/demo-app/src/environments/environment.prod.ts
export const environment = {
  production: true,
  name: 'production',
  version: '1.0.0',
  apiUrl: 'https://yourusername.github.io/angular-bhp-simulator',
  enableDebugMode: false,
  enableAnalytics: true,
};
```

## GitHub Pages Configuration

### Repository Settings

1. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Source: GitHub Actions (recommended) or Deploy from branch (gh-pages)
   - Custom domain (optional): Configure CNAME

2. **Base HREF Configuration**
   
   For project pages (username.github.io/repo-name):
   ```json
   {
     "build:production": "nx build demo-app --configuration=production --base-href=/angular-bhp-simulator/"
   }
   ```
   
   For user/organization pages (username.github.io):
   ```json
   {
     "build:production": "nx build demo-app --configuration=production --base-href=/"
   }
   ```

3. **404 Handling for SPA**
   
   Create `404.html` in build output:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <title>BHP Simulator</title>
     <script>
       // Redirect to index.html for client-side routing
       var path = window.location.pathname.split('/').slice(1).join('/');
       var hash = window.location.hash;
       window.history.replaceState(null, null, 
         '/' + (path || '') + (hash || ''));
       window.location.replace('/');
     </script>
   </head>
   <body>
     <noscript>
       <h1>JavaScript Required</h1>
       <p>This application requires JavaScript to be enabled.</p>
     </noscript>
   </body>
   </html>
   ```

## Docker Support (Optional)

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:production

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist/apps/demo-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
  listen 80;
  server_name localhost;
  root /usr/share/nginx/html;
  index index.html;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  # SPA routing
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
}
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## Monitoring & Analytics

### Google Analytics Integration

```typescript
// apps/demo-app/src/app/app.config.ts
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideGoogleAnalytics } from '@angular/fire/compat/analytics';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
      withRouterConfig({ 
        onSameUrlNavigation: 'reload' 
      })
    ),
    provideGoogleAnalytics('G-XXXXXXXXXX'), // Your GA4 ID
  ]
};
```

### Performance Monitoring

```typescript
// apps/demo-app/src/app/services/performance.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  constructor() {
    if (environment.production) {
      this.measurePerformance();
    }
  }
  
  private measurePerformance(): void {
    // Measure and log performance metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log to analytics service
          console.log('Performance:', entry.name, entry.duration);
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }
}
```

## Status Badges

Add status badges to README.md:

```markdown
# Angular BHP Simulator

[![CI](https://github.com/username/angular-bhp-simulator/workflows/CI/badge.svg)](https://github.com/username/angular-bhp-simulator/actions)
[![Deploy](https://github.com/username/angular-bhp-simulator/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/username/angular-bhp-simulator/actions)
[![codecov](https://codecov.io/gh/username/angular-bhp-simulator/branch/main/graph/badge.svg)](https://codecov.io/gh/username/angular-bhp-simulator)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Linter checks passed
- [ ] Code coverage > 80%
- [ ] Build succeeds without warnings
- [ ] Bundle size within budget
- [ ] Security audit passed
- [ ] Environment variables configured
- [ ] Base HREF set correctly

### Post-Deployment

- [ ] Site loads successfully
- [ ] All routes working
- [ ] Charts rendering correctly
- [ ] Theme switching works
- [ ] Mobile responsive
- [ ] Analytics tracking
- [ ] Performance metrics acceptable
- [ ] No console errors

## Troubleshooting

### Common Issues

**Issue: Base HREF not set correctly**
```bash
# For project pages
ng build --base-href=/repo-name/

# For user pages
ng build --base-href=/
```

**Issue: Assets not loading**
```typescript
// Use relative paths in angular.json
"assets": [
  {
    "glob": "**/*",
    "input": "apps/demo-app/src/assets",
    "output": "/assets"
  }
]
```

**Issue: 404 on page refresh**
- Create 404.html that redirects to index.html
- Configure routing with `useHash: true` as fallback

**Issue: Large bundle size**
```bash
# Analyze bundle
npm run build:analyze

# Enable code splitting
ng build --optimization --build-optimizer
```

## Best Practices

### 1. **Semantic Versioning**
- Use tags like `v1.0.0`, `v1.1.0`, `v2.0.0`
- Follow semver.org guidelines
- Update version in package.json

### 2. **Commit Messages**
- Use conventional commits format
- Example: `feat: add BHP calculation`, `fix: chart rendering issue`

### 3. **Branch Strategy**
- `main` - production-ready code
- `develop` - development branch
- `feature/*` - feature branches
- `hotfix/*` - emergency fixes

### 4. **Security**
- Keep dependencies updated
- Run security audits regularly
- Use secrets for sensitive data
- Enable Dependabot

### 5. **Performance**
- Lazy load feature modules
- Use tree shaking
- Optimize images and assets
- Enable gzip compression
- Use CDN for static assets

## Conclusion

This CI/CD setup provides:

✅ **Automated Testing** - Tests run on every push/PR
✅ **Continuous Deployment** - Auto-deploy to GitHub Pages
✅ **Code Quality Checks** - Linting, formatting, coverage
✅ **Security Scanning** - Vulnerability detection
✅ **Release Automation** - Automated versioning and releases
✅ **Performance Monitoring** - Bundle size and metrics tracking
✅ **Production Ready** - Optimized builds with error handling

The pipeline is production-grade and follows industry best practices!
