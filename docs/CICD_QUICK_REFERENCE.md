# CI/CD Quick Reference Guide

## 🚀 Quick Start

### Initial Setup

```bash
# 1. Initialize Git (if not done)
git init

# 2. Create .gitattributes (optional, for consistent line endings)
echo "* text=auto" > .gitattributes

# 3. Make initial commit
git add .
git commit -m "Initial commit with CI/CD setup"

# 4. Create GitHub repository
# Go to https://github.com/new
# Repository name: angular-bhp-simulator
# Public repository

# 5. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/angular-bhp-simulator.git
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Select "GitHub Actions"
3. Save

The deployment will run automatically on the next push to `main`.

## 📋 Available Commands

```bash
# Development
npm start                  # Start dev server
npm run build             # Build for development
npm run build:prod        # Build for production

# Testing
npm test                  # Test demo app
npm run test:all          # Test all projects
npm run test:coverage     # Test with coverage
npm run test:watch        # Test in watch mode

# Code Quality
npm run lint              # Lint all projects
npm run lint:fix          # Lint and auto-fix
npm run format            # Format all files
npm run format:check      # Check formatting

# Verification
npm run verify:cicd       # Verify CI/CD setup
```

## 🔄 GitHub Actions Workflows

### CI Workflow

**Trigger**: Push to `main`/`develop`, PRs to `main`

**Steps**:
1. Checkout code
2. Install dependencies
3. Lint
4. Test with coverage
5. Build libraries
6. Build application
7. Upload coverage

### Deploy Workflow

**Trigger**: Push to `main`, manual dispatch

**Steps**:
1. Checkout code
2. Install dependencies
3. Build libraries
4. Build application (with base-href)
5. Upload to GitHub Pages
6. Deploy

**URL**: https://YOUR_USERNAME.github.io/angular-bhp-simulator/

### Release Workflow

**Trigger**: Push version tag (e.g., `v1.0.0`)

**Steps**:
1. Checkout code
2. Install dependencies
3. Build all projects
4. Create GitHub release

**Usage**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### CodeQL Workflow

**Trigger**: Push, PR, weekly schedule

**Steps**:
1. Initialize CodeQL
2. Autobuild
3. Analyze for security vulnerabilities

## 🤖 Dependabot

Automatically updates dependencies weekly:
- Angular packages (grouped)
- Nx packages (grouped)
- TypeScript packages (grouped)
- Testing packages (grouped)
- ECharts packages (grouped)

PRs are created automatically. Review and merge as needed.

## 📦 Creating a Release

### Semantic Versioning

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features
- **Patch** (0.0.1): Bug fixes

### Release Process

```bash
# 1. Update version in package.json
npm version major|minor|patch

# 2. Update CHANGELOG.md
# Add release notes under new version

# 3. Commit changes
git add .
git commit -m "chore: release v1.0.0"

# 4. Create and push tag
git tag v1.0.0
git push origin main
git push origin v1.0.0

# 5. GitHub Actions will create the release automatically
```

## 🔧 Troubleshooting

### Build Fails

```bash
# Clear Nx cache
npx nx reset

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build:prod
```

### Tests Fail

```bash
# Run tests with verbose output
npx nx test demo-app --verbose

# Run specific test file
npx nx test demo-app --testFile=app.spec.ts
```

### Deployment Fails

1. Check GitHub Actions logs
2. Verify GitHub Pages is enabled
3. Check base-href is correct
4. Ensure permissions are set in workflow

### Lint Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Format code
npm run format
```

## 📊 Monitoring

### Check Workflow Status

```bash
# Install GitHub CLI
brew install gh

# List workflows
gh workflow list

# View recent runs
gh run list --limit 10

# View specific run
gh run view <run-id> --log
```

### Check Deployment

```bash
# Test local production build
npm run build:prod
npx http-server dist/apps/demo-app/browser -p 8080

# Test deployed site
curl -I https://YOUR_USERNAME.github.io/angular-bhp-simulator/
```

## 🎯 Best Practices

### Before Committing

1. Run tests: `npm run test:all`
2. Run linting: `npm run lint`
3. Check formatting: `npm run format:check`
4. Verify build: `npm run build:prod`

### Before Creating PR

1. Update from main: `git pull origin main`
2. Resolve conflicts
3. Run full CI locally
4. Update documentation if needed
5. Add tests for new features

### Before Releasing

1. Update CHANGELOG.md
2. Test deployment locally
3. Verify all CI checks pass
4. Create release notes
5. Tag version correctly

## 🔐 Security

### Enable Branch Protection

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request before merging
   - Require status checks to pass
   - Require conversation resolution
   - Include administrators

### Enable Security Alerts

1. Settings → Security & analysis
2. Enable:
   - Dependabot alerts
   - Dependabot security updates
   - Code scanning (CodeQL)

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Nx CI Documentation](https://nx.dev/ci/intro/ci-with-nx)
- [Angular Deployment Guide](https://angular.dev/tools/cli/deployment)

## 📝 Checklist

### Initial Setup
- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] GitHub Pages enabled
- [ ] Branch protection enabled
- [ ] Security alerts enabled

### Workflows
- [ ] CI workflow running
- [ ] Deploy workflow running
- [ ] Release workflow tested
- [ ] CodeQL workflow running
- [ ] Dependabot configured

### Documentation
- [ ] README updated
- [ ] DEPLOYMENT.md created
- [ ] CHANGELOG.md created
- [ ] LICENSE file added
- [ ] Contributing guide added

### Testing
- [ ] All tests passing
- [ ] Production build successful
- [ ] Deployed site accessible
- [ ] All features working

---

**Version**: 1.0.0  
**Last Updated**: January 30, 2026
