# Phase 5: CI/CD & Deployment

**Duration**: 3-5 days  
**Priority**: High  
**Dependencies**: Phase 4 (Demo Application)  

## Overview

Set up continuous integration and deployment pipeline using GitHub Actions. Deploy the demo application to GitHub Pages for public access.

## Objectives

- ✅ Set up GitHub repository
- ✅ Configure CI workflow
- ✅ Configure deployment workflow
- ✅ Set up GitHub Pages
- ✅ Add status badges
- ✅ Configure release automation
- ✅ Document deployment process

## Tasks

### Task 6.1: Initialize Git Repository
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: Phase 4

**Steps**:
1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create GitHub repository:
   - Go to GitHub and create new repository
   - Name: `angular-bhp-simulator`
   - Description: "Real-time Bottomhole Pressure calculator with Angular and ECharts"
   - Public repository

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/ngmikeng/angular-bhp-simulator.git
   git branch -M main
   git push -u origin main
   ```

4. Configure repository settings:
   - Enable Issues
   - Enable Discussions (optional)
   - Set up repository topics: `angular`, `echarts`, `typescript`, `realtime`, `bhp`

**Acceptance Criteria**:
- [ ] Repository created on GitHub
- [ ] Code pushed successfully
- [ ] Repository configured

---

### Task 6.2: Create CI Workflow
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 6.1

**Steps**:
1. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build-and-test:
       runs-on: ubuntu-latest
       
       steps:
         - name: Checkout code
           uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '22'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Lint
           run: npx nx run-many --target=lint --all --parallel=3
         
         - name: Test
           run: npx nx run-many --target=test --all --parallel=3 --coverage
         
         - name: Build libraries
           run: |
             npx nx build bhp-calculator
             npx nx build data-generator
             npx nx build chart-components
         
         - name: Build application
           run: npx nx build demo-app --configuration=production
         
         - name: Upload coverage
           uses: codecov/codecov-action@v3
           with:
             files: ./coverage/**/lcov.info
   ```

2. Test the workflow locally (optional):
   ```bash
   npm install -g act
   act -j build-and-test
   ```

3. Push and verify workflow runs

**Acceptance Criteria**:
- [ ] CI workflow created
- [ ] Workflow runs on push/PR
- [ ] All checks pass
- [ ] Coverage uploaded

**Verification**:
```bash
git add .github/workflows/ci.yml
git commit -m "Add CI workflow"
git push
# Check Actions tab on GitHub
```

---

### Task 6.3: Create Deployment Workflow
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 6.2

**Steps**:
1. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
     workflow_dispatch:
   
   permissions:
     contents: read
     pages: write
     id-token: write
   
   concurrency:
     group: "pages"
     cancel-in-progress: false
   
   jobs:
     build:
       runs-on: ubuntu-latest
       
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '22'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build
           run: npx nx build demo-app --configuration=production --base-href=/angular-bhp-simulator/
         
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v2
           with:
             path: ./dist/demo-app/browser
     
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v3
   ```

2. Configure base href in `project.json`:
   ```json
   {
     "targets": {
       "build": {
         "configurations": {
           "production": {
             "baseHref": "/angular-bhp-simulator/"
           }
         }
       }
     }
   }
   ```

3. Test production build locally:
   ```bash
   npx nx build demo-app --configuration=production
   npx http-server dist/demo-app/browser -p 8080
   ```

**Acceptance Criteria**:
- [ ] Deployment workflow created
- [ ] Production build successful
- [ ] Base href configured correctly
- [ ] Workflow tested

---

### Task 6.4: Configure GitHub Pages
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: Task 6.3

**Steps**:
1. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Source: GitHub Actions
   - Save settings

2. Trigger deployment:
   ```bash
   git push origin main
   ```

3. Wait for deployment to complete

4. Verify site is live:
   - URL: `https://ngmikeng.github.io/angular-bhp-simulator/`

5. Test all functionality on deployed site

**Acceptance Criteria**:
- [ ] GitHub Pages enabled
- [ ] Site deployed successfully
- [ ] All features working
- [ ] No console errors

**Verification**:
- Visit the deployed URL
- Test simulation controls
- Test theme switching
- Check all charts

---

### Task 6.5: Add Status Badges
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: Tasks 6.2, 6.4

**Steps**:
1. Update `README.md` with badges:
   ```markdown
   # BHP Real-Time Simulator
   
   [![CI](https://github.com/ngmikeng/angular-bhp-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/ngmikeng/angular-bhp-simulator/actions/workflows/ci.yml)
   [![Deploy](https://github.com/ngmikeng/angular-bhp-simulator/actions/workflows/deploy.yml/badge.svg)](https://github.com/ngmikeng/angular-bhp-simulator/actions/workflows/deploy.yml)
   [![codecov](https://codecov.io/gh/ngmikeng/angular-bhp-simulator/branch/main/graph/badge.svg)](https://codecov.io/gh/ngmikeng/angular-bhp-simulator)
   [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
   
   [Live Demo](https://ngmikeng.github.io/angular-bhp-simulator/) | [Documentation](./docs)
   ```

2. Add project description and features

3. Add screenshots/GIFs of the application

**Acceptance Criteria**:
- [ ] Badges added to README
- [ ] Badges display correctly
- [ ] Links work
- [ ] Documentation updated

---

### Task 6.6: Create Release Workflow
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 6.2

**Steps**:
1. Create `.github/workflows/release.yml`:
   ```yaml
   name: Release
   
   on:
     push:
       tags:
         - 'v*'
   
   jobs:
     release:
       runs-on: ubuntu-latest
       
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '22'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build all
           run: |
             npx nx run-many --target=build --all --parallel=3
         
         - name: Create Release
           uses: actions/create-release@v1
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
           with:
             tag_name: ${{ github.ref }}
             release_name: Release ${{ github.ref }}
             draft: false
             prerelease: false
   ```

2. Test release creation:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

**Acceptance Criteria**:
- [ ] Release workflow created
- [ ] Tag triggers release
- [ ] Release created on GitHub
- [ ] Workflow tested

---

### Task 6.7: Add Dependabot Configuration
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: Task 6.1

**Steps**:
1. Create `.github/dependabot.yml`:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
       groups:
         angular:
           patterns:
             - "@angular/*"
         nx:
           patterns:
             - "@nx/*"
             - "nx"
   ```

2. Enable Dependabot alerts in repository settings

**Acceptance Criteria**:
- [ ] Dependabot configured
- [ ] Dependency updates automated
- [ ] Grouped updates

---

### Task 6.8: Set Up Code Quality Checks
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 6.2

**Steps**:
1. Add SonarCloud (optional):
   - Sign up at sonarcloud.io
   - Add project
   - Configure sonar-project.properties

2. Add bundle size checking:
   ```yaml
   # Add to ci.yml
   - name: Check bundle size
     run: |
       npx nx build demo-app --configuration=production
       SIZE=$(du -sh dist/demo-app/browser | cut -f1)
       echo "Bundle size: $SIZE"
       # Add size limit check
   ```

3. Add Lighthouse CI:
   ```yaml
   - name: Run Lighthouse CI
     uses: treosh/lighthouse-ci-action@v9
     with:
       urls: |
         https://ngmikeng.github.io/angular-bhp-simulator/
       uploadArtifacts: true
   ```

**Acceptance Criteria**:
- [ ] Code quality checks added
- [ ] Bundle size monitored
- [ ] Lighthouse CI configured
- [ ] All checks pass

---

### Task 6.9: Create Deployment Documentation
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Create `docs/DEPLOYMENT.md`:
   ```markdown
   # Deployment Guide
   
   ## Automated Deployment
   
   The application automatically deploys to GitHub Pages on every push to the `main` branch.
   
   ## Manual Deployment
   
   ```bash
   # Build for production
   npx nx build demo-app --configuration=production
   
   # Deploy to GitHub Pages
   npx angular-cli-ghpages --dir=dist/demo-app/browser
   ```
   
   ## Environment Variables
   
   No environment variables required for the demo application.
   
   ## Troubleshooting
   
   ...
   ```

2. Add deployment troubleshooting guide

3. Document manual deployment steps

4. Add rollback procedure

**Acceptance Criteria**:
- [ ] Deployment documentation complete
- [ ] Troubleshooting guide included
- [ ] Manual steps documented
- [ ] Rollback procedure documented

---

### Task 6.10: Final Verification and Monitoring
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Verify all workflows:
   - CI workflow passes
   - Deployment workflow passes
   - Release workflow works

2. Test deployed application:
   - All features functional
   - Performance acceptable
   - No console errors
   - Mobile responsive

3. Set up monitoring (optional):
   - Google Analytics
   - Error tracking (Sentry)
   - Performance monitoring

4. Create deployment checklist

**Acceptance Criteria**:
- [ ] All workflows verified
- [ ] Deployed app tested
- [ ] Monitoring set up (optional)
- [ ] Checklist created

**Verification**:
```bash
# Check all workflows
gh workflow list
gh run list

# Test deployment
curl -I https://ngmikeng.github.io/angular-bhp-simulator/
```

---

## Deliverables

1. ✅ GitHub repository configured
2. ✅ CI workflow (build, test, lint)
3. ✅ Deployment workflow (GitHub Pages)
4. ✅ GitHub Pages enabled and configured
5. ✅ Status badges in README
6. ✅ Release workflow
7. ✅ Dependabot configuration
8. ✅ Code quality checks
9. ✅ Deployment documentation
10. ✅ Monitoring (optional)

## Success Criteria

- [ ] All workflows running successfully
- [ ] Application deployed to GitHub Pages
- [ ] CI runs on every PR
- [ ] Deployment automatic on main branch
- [ ] Status badges showing passing
- [ ] Dependencies automatically updated
- [ ] Documentation complete
- [ ] No deployment errors

## Verification Checklist

```bash
# Check workflows
gh workflow list
gh run list --limit 5

# Check deployment
curl https://ngmikeng.github.io/angular-bhp-simulator/

# Test CI
git checkout -b test-ci
# Make a change
git push origin test-ci
# Create PR and check CI runs

# Test release
git tag v1.0.0
git push origin v1.0.0
# Check release created
```

## Next Steps

After Phase 5 completion, proceed to:
- **Phase 6**: Documentation & Polish
- Final documentation
- Performance optimization
- Final testing

## Notes

- Use GitHub Actions for free hosting and CI/CD
- Monitor GitHub Actions usage (free tier limits)
- Set up branch protection rules for main branch
- Consider setting up preview deployments for PRs
- Document the deployment process thoroughly
- Keep workflows simple and maintainable
- Use caching to speed up builds
- Monitor bundle size to keep it reasonable
- Set up automated dependency updates
- Consider adding semantic-release for automated versioning
