# Phase 0: Project Setup & Initialization

**Duration**: 3-5 days  
**Priority**: Critical  
**Dependencies**: None  

## Overview

Set up the complete development environment, create the Nx workspace, configure all necessary tools, and establish the project foundation for all subsequent phases.

## Objectives

- ✅ Create GitHub repository with proper configuration
- ✅ Initialize Nx workspace with Angular
- ✅ Set up development tools (linting, formatting, testing)
- ✅ Configure Angular Material with theming
- ✅ Install and configure ECharts
- ✅ Generate library projects
- ✅ Verify build and test pipelines work

## Tasks

### Task 1.1: Repository Setup
**Estimated Time**: 1 hour  
**Assignee**: TBD

**Steps**:
1. Create GitHub repository: `angular-bhp-simulator`
2. Initialize with README.md
3. Add MIT License
4. Create `.gitignore` for Node/Angular/Nx
5. Set up branch protection rules (main branch)
6. Create project board with milestones

**Acceptance Criteria**:
- [ ] Repository created and accessible
- [ ] README with project description
- [ ] License file added
- [ ] .gitignore configured
- [ ] Branch protection enabled

**Verification**:
```bash
git clone https://github.com/[username]/angular-bhp-simulator
cd angular-bhp-simulator
```

---

### Task 1.2: Nx Workspace Creation
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: Task 1.1

**Steps**:
1. Install Nx CLI globally
   ```bash
   npm install -g nx
   ```

2. Create Nx workspace
   ```bash
   npx create-nx-workspace@latest angular-bhp-simulator \
     --preset=angular-standalone \
     --appName=demo-app \
     --style=scss \
     --routing=true \
     --standaloneApi=true \
     --strict=true
   ```

3. Navigate to workspace
   ```bash
   cd angular-bhp-simulator
   ```

4. Verify initial build
   ```bash
   nx build demo-app
   nx serve demo-app
   ```

5. Commit initial workspace
   ```bash
   git add .
   git commit -m "chore: initialize Nx workspace"
   git push origin main
   ```

**Acceptance Criteria**:
- [ ] Nx workspace created successfully
- [ ] Demo app builds without errors
- [ ] Demo app runs on localhost:4200
- [ ] Initial commit pushed to GitHub

**Verification**:
```bash
nx build demo-app
# Should complete successfully
```

---

### Task 1.3: Install Core Dependencies
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: Task 1.2

**Steps**:
1. Install Angular Material
   ```bash
   npm install @angular/material @angular/cdk @angular/animations
   ```

2. Install ECharts
   ```bash
   npm install echarts ngx-echarts
   npm install --save-dev @types/echarts
   ```

3. Install RxJS (if not already included)
   ```bash
   npm install rxjs
   ```

4. Install development dependencies
   ```bash
   npm install --save-dev jest @types/jest
   npm install --save-dev eslint prettier
   npm install --save-dev @nx/jest
   ```

5. Verify all dependencies installed
   ```bash
   npm list --depth=0
   ```

**Acceptance Criteria**:
- [ ] All dependencies installed without errors
- [ ] package.json updated correctly
- [ ] package-lock.json generated
- [ ] No peer dependency warnings

**Verification**:
```bash
npm list echarts ngx-echarts @angular/material
# Should show all packages installed
```

---

### Task 1.4: Configure Angular Material
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: Task 1.3

**Steps**:
1. Run Angular Material schematic
   ```bash
   nx g @angular/material:ng-add --project=demo-app
   ```

2. Select "Custom" theme
3. Set up typography: Yes
4. Set up animations: Yes

5. Create custom theme file: `apps/demo-app/src/styles/themes.scss`
   ```scss
   @use '@angular/material' as mat;

   $light-primary: mat.define-palette(mat.$blue-palette, 500);
   $light-accent: mat.define-palette(mat.$orange-palette, 500);
   $light-warn: mat.define-palette(mat.$red-palette, 500);

   $light-theme: mat.define-light-theme((
     color: (
       primary: $light-primary,
       accent: $light-accent,
       warn: $light-warn,
     )
   ));

   $dark-primary: mat.define-palette(mat.$blue-palette, 300);
   $dark-accent: mat.define-palette(mat.$orange-palette, 300);
   $dark-warn: mat.define-palette(mat.$red-palette, 300);

   $dark-theme: mat.define-dark-theme((
     color: (
       primary: $dark-primary,
       accent: $dark-accent,
       warn: $dark-warn,
     )
   ));

   @include mat.core();

   .light-theme {
     @include mat.all-component-themes($light-theme);
   }

   .dark-theme {
     @include mat.all-component-themes($dark-theme);
   }
   ```

6. Update `styles.scss` to import themes
   ```scss
   @import './styles/themes.scss';
   ```

7. Test theme switching manually

**Acceptance Criteria**:
- [ ] Material Design components available
- [ ] Custom theme file created
- [ ] Light and dark themes defined
- [ ] Theme switching works in app

**Verification**:
```bash
# App should compile with Material styles
nx serve demo-app
# Check browser console for no Material errors
```

---

### Task 1.5: Configure ECharts
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: Task 1.3

**Steps**:
1. Create ECharts provider in `apps/demo-app/src/app/app.config.ts`
   ```typescript
   import { ApplicationConfig } from '@angular/core';
   import { provideAnimations } from '@angular/platform-browser/animations';
   import { provideRouter } from '@angular/router';
   import { provideEcharts } from 'ngx-echarts';
   import { routes } from './app.routes';

   export const appConfig: ApplicationConfig = {
     providers: [
       provideRouter(routes),
       provideAnimations(),
       provideEcharts(),
     ]
   };
   ```

2. Create a test chart component to verify ECharts works
3. Build and test

**Acceptance Criteria**:
- [ ] ECharts provider configured
- [ ] Test chart renders correctly
- [ ] No console errors related to ECharts

**Verification**:
```typescript
// Simple test component should render a basic chart
```

---

### Task 1.6: Generate Library Projects
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: Task 1.2

**Steps**:
1. Generate BHP Calculator library
   ```bash
   nx g @nx/angular:library bhp-calculator \
     --buildable \
     --publishable \
     --importPath=@angular-bhp-simulator/bhp-calculator \
     --strict
   ```

2. Generate Data Generator library
   ```bash
   nx g @nx/angular:library data-generator \
     --buildable \
     --publishable \
     --importPath=@angular-bhp-simulator/data-generator \
     --strict
   ```

3. Generate Chart Components library
   ```bash
   nx g @nx/angular:library chart-components \
     --buildable \
     --publishable \
     --importPath=@angular-bhp-simulator/chart-components \
     --strict
   ```

4. Verify libraries build
   ```bash
   nx build bhp-calculator
   nx build data-generator
   nx build chart-components
   ```

**Acceptance Criteria**:
- [ ] All three libraries generated
- [ ] Libraries have correct import paths
- [ ] All libraries build successfully
- [ ] No build errors or warnings

**Verification**:
```bash
nx build-many --target=build --projects=bhp-calculator,data-generator,chart-components
# Should succeed for all projects
```

---

### Task 1.7: Configure Testing Framework
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: Task 1.2

**Steps**:
1. Configure Jest for all projects
2. Update jest.config.ts files with proper settings
3. Add test scripts to package.json:
   ```json
   {
     "scripts": {
       "test": "nx test",
       "test:all": "nx run-many --target=test --all",
       "test:coverage": "nx run-many --target=test --all --code-coverage",
       "test:watch": "nx test --watch"
     }
   }
   ```

4. Create test utility files in each library
5. Write sample test for each project
6. Run all tests to verify

**Acceptance Criteria**:
- [ ] Jest configured for all projects
- [ ] Test scripts added to package.json
- [ ] Sample test passes in each project
- [ ] Test coverage reports generated

**Verification**:
```bash
npm run test:all
# All tests should pass
```

---

### Task 1.8: Configure Linting & Formatting
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: Task 1.2

**Steps**:
1. Configure ESLint (should be pre-configured by Nx)
2. Create `.prettierrc` file:
   ```json
   {
     "singleQuote": true,
     "trailingComma": "es5",
     "printWidth": 100,
     "tabWidth": 2,
     "semi": true
   }
   ```

3. Create `.prettierignore`:
   ```
   dist
   node_modules
   coverage
   *.md
   ```

4. Add scripts to package.json:
   ```json
   {
     "scripts": {
       "lint": "nx run-many --target=lint --all",
       "lint:fix": "nx run-many --target=lint --all --fix",
       "format": "prettier --write \"**/*.{ts,html,scss,json}\"",
       "format:check": "prettier --check \"**/*.{ts,html,scss,json}\""
     }
   }
   ```

5. Run linting and formatting
   ```bash
   npm run lint
   npm run format
   ```

**Acceptance Criteria**:
- [ ] ESLint configured and working
- [ ] Prettier configured and working
- [ ] No linting errors in codebase
- [ ] Code formatted consistently

**Verification**:
```bash
npm run lint
npm run format:check
# Both should pass without errors
```

---

### Task 1.9: Create Project Documentation
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Update main README.md with:
   - Project description
   - Setup instructions
   - Development commands
   - Project structure
   - Contributing guidelines

2. Create CONTRIBUTING.md
3. Create CODE_OF_CONDUCT.md
4. Create docs/ folder with:
   - ARCHITECTURE.md (placeholder)
   - API.md (placeholder)
   - USER_GUIDE.md (placeholder)

5. Add badges to README:
   - Build status
   - Test coverage
   - License

**Acceptance Criteria**:
- [ ] README.md comprehensive and clear
- [ ] CONTRIBUTING.md created
- [ ] CODE_OF_CONDUCT.md created
- [ ] docs/ folder structure created

**Verification**:
- [ ] Documentation is clear and helpful
- [ ] New developers can set up project from README

---

### Task 1.10: Initial Commit & Verification
**Estimated Time**: 1 hour  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Run full verification:
   ```bash
   npm run lint
   npm run test:all
   nx build-many --target=build --all
   ```

2. Commit all changes:
   ```bash
   git add .
   git commit -m "chore: complete project setup"
   git push origin main
   ```

3. Tag the setup completion:
   ```bash
   git tag -a v0.1.0-setup -m "Project setup complete"
   git push origin v0.1.0-setup
   ```

4. Create GitHub milestone: "Phase 1 - Project Setup" (Done)

**Acceptance Criteria**:
- [ ] All builds pass
- [ ] All tests pass
- [ ] All linting passes
- [ ] Code committed and pushed
- [ ] Tag created

**Verification**:
```bash
# Clone fresh and verify everything works
git clone https://github.com/[username]/angular-bhp-simulator fresh-test
cd fresh-test
npm ci
npm run test:all
nx build-many --target=build --all
```

## Deliverables

1. ✅ GitHub repository with project
2. ✅ Nx workspace with demo app
3. ✅ Three library projects generated
4. ✅ Angular Material configured with themes
5. ✅ ECharts configured and tested
6. ✅ Testing framework set up
7. ✅ Linting and formatting configured
8. ✅ Initial documentation created
9. ✅ All builds and tests passing

## Success Criteria

- [ ] Fresh clone and `npm ci` works without errors
- [ ] `npm run test:all` passes
- [ ] `npm run lint` passes with no errors
- [ ] All libraries build successfully
- [ ] Demo app runs without errors
- [ ] Documentation is clear and complete

## Next Steps

After Phase 0 completion, proceed to:
- **Phase 1**: BHP Calculator Library Implementation
- Begin implementing core data models and algorithm

## Notes

- Use Node.js 20.x LTS
- Angular 21.x (latest stable)
- TypeScript 5.9.x with strict mode
- Nx 22.4.3
- Testing with Vitest 4.x
- Angular Material 21.x
- ECharts 6.x with ngx-echarts 21.x
- Commit frequently with conventional commit messages
- Create branches for each major task if working in team
