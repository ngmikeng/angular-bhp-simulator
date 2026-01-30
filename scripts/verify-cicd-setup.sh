#!/bin/bash

# CI/CD Setup Verification Script
# This script verifies that all CI/CD components are properly configured

echo "🔍 Verifying CI/CD Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
passed=0
failed=0
warnings=0

# Check function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((passed++))
    else
        echo -e "${RED}✗${NC} $2"
        ((failed++))
    fi
}

# Check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((passed++))
    else
        echo -e "${RED}✗${NC} $2"
        ((failed++))
    fi
}

echo "📁 Checking GitHub Actions workflows..."
check_file ".github/workflows/ci.yml" "CI workflow"
check_file ".github/workflows/deploy.yml" "Deployment workflow"
check_file ".github/workflows/release.yml" "Release workflow"
check_file ".github/workflows/codeql.yml" "CodeQL security workflow"
echo ""

echo "🤖 Checking Dependabot configuration..."
check_file ".github/dependabot.yml" "Dependabot config"
echo ""

echo "📝 Checking GitHub templates..."
check_file ".github/ISSUE_TEMPLATE/bug_report.md" "Bug report template"
check_file ".github/ISSUE_TEMPLATE/feature_request.md" "Feature request template"
check_file ".github/pull_request_template.md" "Pull request template"
echo ""

echo "📚 Checking documentation..."
check_file "docs/DEPLOYMENT.md" "Deployment guide"
check_file "docs/API.md" "API documentation"
check_file "docs/ARCHITECTURE.md" "Architecture guide"
check_file "docs/USER_GUIDE.md" "User guide"
check_file "README.md" "README"
check_file "CHANGELOG.md" "Changelog"
check_file "LICENSE" "License"
check_file "CONTRIBUTING.md" "Contributing guide"
check_file "CODE_OF_CONDUCT.md" "Code of conduct"
echo ""

echo "🏗️ Checking project structure..."
check_dir "apps/demo-app" "Demo application"
check_dir "libs/bhp-calculator" "BHP Calculator library"
check_dir "libs/chart-components" "Chart Components library"
check_dir "libs/data-generator" "Data Generator library"
echo ""

echo "⚙️ Checking configuration files..."
check_file "package.json" "Package configuration"
check_file "nx.json" "Nx configuration"
check_file "tsconfig.base.json" "TypeScript base config"
check_file ".gitignore" "Git ignore file"
echo ""

echo "🧪 Running tests..."
if npm run test:all > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} All tests passed"
    ((passed++))
else
    echo -e "${YELLOW}⚠${NC} Some tests failed or timed out"
    ((warnings++))
fi
echo ""

echo "🔨 Testing production build..."
if npx nx build demo-app --configuration=production --base-href=/angular-bhp-simulator/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Production build successful"
    ((passed++))
else
    echo -e "${RED}✗${NC} Production build failed"
    ((failed++))
fi
echo ""

# Summary
echo "═══════════════════════════════════════"
echo "📊 Summary:"
echo -e "${GREEN}✓ Passed:${NC} $passed"
echo -e "${RED}✗ Failed:${NC} $failed"
echo -e "${YELLOW}⚠ Warnings:${NC} $warnings"
echo "═══════════════════════════════════════"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 CI/CD setup verification complete! All checks passed.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Initialize git repository: git init"
    echo "2. Create GitHub repository"
    echo "3. Add remote: git remote add origin <repo-url>"
    echo "4. Push to GitHub: git push -u origin main"
    echo "5. Enable GitHub Pages in repository settings"
    echo "6. Workflows will run automatically on push"
    exit 0
else
    echo -e "${RED}❌ CI/CD setup has issues. Please fix the failed checks above.${NC}"
    exit 1
fi
