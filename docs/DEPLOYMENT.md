# Deployment Guide

This guide covers the deployment process for the BHP Real-Time Simulator application.

## 🚀 Automated Deployment

The application automatically deploys to GitHub Pages on every push to the `main` branch through GitHub Actions.

### Deployment Workflow

1. **Trigger**: Push to `main` branch or manual workflow dispatch
2. **Build**: Compile all libraries and the demo application
3. **Deploy**: Upload to GitHub Pages
4. **Live**: Available at https://ngmikeng.github.io/angular-bhp-simulator/

### GitHub Actions Workflows

Three workflows are configured for this project:

#### CI Workflow (`.github/workflows/ci.yml`)
- **Triggers**: Push to `main`/`develop` branches, PRs to `main`
- **Steps**:
  1. Checkout code
  2. Install dependencies
  3. Run linting
  4. Run tests with coverage
  5. Build libraries
  6. Build application
  7. Upload coverage to Codecov (optional)

#### Deploy Workflow (`.github/workflows/deploy.yml`)
- **Triggers**: Push to `main` branch, manual dispatch
- **Steps**:
  1. Checkout code
  2. Install dependencies
  3. Build libraries
  4. Build application with production configuration
  5. Upload to GitHub Pages
  6. Deploy

#### Release Workflow (`.github/workflows/release.yml`)
- **Triggers**: Push of version tags (e.g., `v1.0.0`)
- **Steps**:
  1. Checkout code
  2. Install dependencies
  3. Build all projects
  4. Create GitHub release with auto-generated notes

## 🛠️ Manual Deployment

### Prerequisites

- Node.js 22.x or later
- npm 10.x or later
- GitHub Pages enabled in repository settings

### Build for Production

```bash
# Build all libraries first
npx nx build bhp-calculator
npx nx build data-generator
npx nx build chart-components

# Build the demo application
npx nx build demo-app --configuration=production --base-href=/angular-bhp-simulator/
```

The production build will be output to `dist/apps/demo-app/browser/`.

### Deploy to GitHub Pages

#### Using angular-cli-ghpages

```bash
# Install the tool
npm install -g angular-cli-ghpages

# Deploy
npx angular-cli-ghpages --dir=dist/apps/demo-app/browser
```

#### Using GitHub Pages Action

The deployment is automated through the workflow, but you can trigger it manually:

```bash
# Via GitHub CLI
gh workflow run deploy.yml

# Or push to main branch
git push origin main
```

## ⚙️ Configuration

### Base Href

The application needs to be configured with the correct base href for GitHub Pages:

**In `apps/demo-app/project.json`:**

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

**Via Command Line:**

```bash
npx nx build demo-app --configuration=production --base-href=/angular-bhp-simulator/
```

### GitHub Pages Settings

1. Go to repository Settings
2. Navigate to Pages section
3. Set Source to "GitHub Actions"
4. Save settings

### Environment Variables

The demo application doesn't require environment variables. All configuration is done at build time.

## 📊 Monitoring Deployment

### Check Workflow Status

```bash
# List all workflows
gh workflow list

# View recent runs
gh run list --limit 10

# View specific run details
gh run view <run-id>
```

### View Logs

```bash
# View logs for a specific run
gh run view <run-id> --log

# View logs for a specific job
gh run view <run-id> --job=<job-id> --log
```

### Check Deployment

```bash
# Check if site is accessible
curl -I https://ngmikeng.github.io/angular-bhp-simulator/

# Expected response: HTTP/2 200
```

## 🔄 Rolling Back

### To Previous Version

```bash
# List recent deployments
gh api repos/:owner/:repo/pages/deployments

# Revert to previous commit
git revert HEAD
git push origin main

# Or redeploy from a specific commit
git checkout <commit-hash>
git push origin main -f
```

### Emergency Rollback

1. Go to GitHub Actions
2. Find last successful deployment
3. Re-run the workflow
4. Or manually revert the commit and push

## 🏷️ Creating Releases

### Using Git Tags

```bash
# Create a tag
git tag v1.0.0

# Push the tag
git push origin v1.0.0

# This will trigger the release workflow
```

### Release Workflow

The release workflow will:
1. Build all projects
2. Run tests
3. Create a GitHub release
4. Generate release notes automatically

### Semantic Versioning

Follow semantic versioning (semver):
- **Major** (v1.0.0): Breaking changes
- **Minor** (v0.1.0): New features, backwards compatible
- **Patch** (v0.0.1): Bug fixes

## 🧪 Testing Production Build Locally

```bash
# Build for production
npx nx build demo-app --configuration=production

# Serve the production build locally
npx http-server dist/apps/demo-app/browser -p 8080

# Or use the serve-static target
npx nx serve-static demo-app
```

Navigate to http://localhost:8080/angular-bhp-simulator/

## 🔍 Troubleshooting

### Build Fails

**Issue**: Build fails in CI but works locally

**Solutions**:
- Check Node.js version matches (22.x)
- Ensure `package-lock.json` is committed
- Clear cache: `npx nx reset`
- Check for TypeScript errors: `npx nx run-many --target=lint --all`

### Deployment Fails

**Issue**: Deployment workflow fails

**Solutions**:
- Check GitHub Pages is enabled
- Verify permissions in workflow (pages: write)
- Ensure artifact is being uploaded correctly
- Check base-href is set correctly

### 404 Errors After Deployment

**Issue**: Application shows 404 errors

**Solutions**:
- Verify base-href matches repository name
- Check all assets are included in build
- Ensure routing configuration is correct
- Add 404.html redirect for SPA routing

### Assets Not Loading

**Issue**: CSS/JS files return 404

**Solutions**:
- Check outputHashing is enabled in production config
- Verify assets are copied correctly
- Check base-href in index.html
- Inspect network tab in browser DevTools

### Slow Build Times

**Issue**: CI builds are taking too long

**Solutions**:
- Enable Nx caching in CI
- Use `npm ci` instead of `npm install`
- Parallelize tasks: `--parallel=3`
- Cache node_modules in workflow

## 📈 Performance Optimization

### Bundle Size

Current bundle size limits:
- Initial: 500KB (warning), 1MB (error)
- Component styles: 4KB (warning), 8KB (error)

Check bundle size:

```bash
npx nx build demo-app --configuration=production
npx source-map-explorer dist/apps/demo-app/browser/**/*.js
```

### Monitoring

Consider adding:
- **Google Analytics**: Track user behavior
- **Sentry**: Error tracking and monitoring
- **Lighthouse CI**: Automated performance testing

## 🔐 Security

### Secrets Management

No secrets are required for the demo application. If you need to add secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Add new secret
3. Reference in workflow: `${{ secrets.SECRET_NAME }}`

### Dependencies

Automated dependency updates via Dependabot:
- Weekly security updates
- Grouped by framework (Angular, Nx, etc.)
- Auto-merge patch updates (optional)

## 📝 Checklist

### Pre-Deployment

- [ ] All tests pass locally
- [ ] Linting passes
- [ ] Production build succeeds
- [ ] Test production build locally
- [ ] Update CHANGELOG.md
- [ ] Update version numbers

### Post-Deployment

- [ ] Verify deployment succeeded
- [ ] Check application loads correctly
- [ ] Test all features work
- [ ] Check browser console for errors
- [ ] Verify mobile responsiveness
- [ ] Test theme switching
- [ ] Verify all charts render correctly

## 🆘 Support

If you encounter issues:

1. Check [GitHub Actions logs](https://github.com/ngmikeng/angular-bhp-simulator/actions)
2. Review [Issues](https://github.com/ngmikeng/angular-bhp-simulator/issues)
3. Create a new issue with:
   - Error messages
   - Workflow logs
   - Steps to reproduce

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nx Documentation](https://nx.dev)
- [Angular Deployment Guide](https://angular.dev/tools/cli/deployment)

---

Last updated: January 30, 2026
