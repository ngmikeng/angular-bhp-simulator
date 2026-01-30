# Phase 4: Demo Application Implementation

**Duration**: 10-14 days  
**Priority**: High  
**Dependencies**: Phases 1, 2, 3 (All libraries complete)  

## Overview

Build the main demo application that integrates all libraries to create a complete real-time BHP simulation dashboard. This is the primary deliverable that users will interact with.

## Objectives

- ✅ Create application shell with routing
- ✅ Implement dashboard layout
- ✅ Integrate all three libraries
- ✅ Implement simulation controls
- ✅ Add theme switching
- ✅ Implement responsive design
- ✅ Add error handling
- ✅ Write E2E tests

## Tasks

### Task 5.1: Create Application Structure
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Phase 0

**Steps**:
1. Generate application shell:
   ```bash
   nx generate @nx/angular:application demo-app
   ```

2. Set up routing structure:
   ```typescript
   // app.routes.ts
   export const appRoutes: Route[] = [
     { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
     {
       path: 'dashboard',
       loadComponent: () => import('./pages/dashboard/dashboard.component')
     },
     {
       path: 'about',
       loadComponent: () => import('./pages/about/about.component')
     },
     { path: '**', redirectTo: '/dashboard' }
   ];
   ```

3. Create folder structure:
   ```
   demo-app/src/app/
   ├── pages/
   │   ├── dashboard/
   │   └── about/
   ├── components/
   │   ├── simulation-controls/
   │   ├── metrics-panel/
   │   └── chart-grid/
   ├── services/
   │   └── app-state.service.ts
   └── models/
       └── app-state.model.ts
   ```

4. Configure Angular Material

**Acceptance Criteria**:
- [ ] Application structure created
- [ ] Routing configured
- [ ] Angular Material configured
- [ ] Builds successfully

**Verification**:
```bash
nx serve demo-app
```

---

### Task 5.2: Implement Theme Service
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 5.1

**Steps**:
1. Create `app/services/theme.service.ts`:
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class ThemeService {
     private isDarkMode$ = new BehaviorSubject<boolean>(false);
     
     isDarkMode = this.isDarkMode$.asObservable();
     
     constructor() {
       const savedTheme = localStorage.getItem('theme');
       if (savedTheme) {
         this.setDarkMode(savedTheme === 'dark');
       } else {
         const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
         this.setDarkMode(prefersDark);
       }
     }
     
     toggleTheme(): void {
       this.setDarkMode(!this.isDarkMode$.value);
     }
     
     private setDarkMode(isDark: boolean): void {
       this.isDarkMode$.next(isDark);
       localStorage.setItem('theme', isDark ? 'dark' : 'light');
       document.body.classList.toggle('dark-theme', isDark);
     }
   }
   ```

2. Add theme styles to `styles.scss`:
   ```scss
   @use '@angular/material' as mat;
   
   $light-theme: mat.define-theme((
     color: (
       theme-type: light,
       primary: mat.$azure-palette,
     )
   ));
   
   $dark-theme: mat.define-theme((
     color: (
       theme-type: dark,
       primary: mat.$azure-palette,
     )
   ));
   
   :root {
     @include mat.all-component-themes($light-theme);
   }
   
   .dark-theme {
     @include mat.all-component-colors($dark-theme);
   }
   ```

3. Write unit tests

**Acceptance Criteria**:
- [ ] Theme service implemented
- [ ] Themes switch correctly
- [ ] Persists to localStorage
- [ ] Tests passing

---

### Task 5.3: Implement Application State Service
**Estimated Time**: 5 hours  
**Assignee**: TBD  
**Dependencies**: Task 5.1

**Steps**:
1. Create state model:
   ```typescript
   // app/models/app-state.model.ts
   export interface AppState {
     isSimulationRunning: boolean;
     simulationSpeed: number;
     currentPattern: DataPattern;
     generatorConfig: GeneratorConfig;
     selectedMetrics: string[];
   }
   ```

2. Create `app/services/app-state.service.ts`:
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class AppStateService {
     private state$ = new BehaviorSubject<AppState>(initialState);
     
     // Selectors
     isRunning$ = this.state$.pipe(map(s => s.isSimulationRunning));
     speed$ = this.state$.pipe(map(s => s.simulationSpeed));
     pattern$ = this.state$.pipe(map(s => s.currentPattern));
     
     // Actions
     startSimulation(): void;
     stopSimulation(): void;
     setSpeed(speed: number): void;
     setPattern(pattern: DataPattern): void;
     updateConfig(config: Partial<GeneratorConfig>): void;
   }
   ```

3. Implement state persistence (optional)

4. Write unit tests

**Acceptance Criteria**:
- [ ] State service implemented
- [ ] All actions work correctly
- [ ] Selectors return correct data
- [ ] Tests passing

---

### Task 5.4: Implement Simulation Controls Component
**Estimated Time**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Tasks 5.2, 5.3

**Steps**:
1. Create `components/simulation-controls/simulation-controls.component.ts`:
   ```typescript
   @Component({
     selector: 'app-simulation-controls',
     standalone: true,
     imports: [
       CommonModule,
       MatButtonModule,
       MatSelectModule,
       MatSliderModule,
       MatIconModule,
       MatTooltipModule
     ],
     templateUrl: './simulation-controls.component.html'
   })
   export class SimulationControlsComponent {
     patterns: DataPattern[] = ['steady', 'ramping', 'cycling', 'realistic', 'pump-stop', 'stage-transition'];
     
     constructor(
       public appState: AppStateService,
       private dataGenerator: DataGeneratorService
     ) {}
     
     onStartStop(): void;
     onSpeedChange(speed: number): void;
     onPatternChange(pattern: DataPattern): void;
     onReset(): void;
   }
   ```

2. Create template with Material components:
   - Play/pause button
   - Speed slider (0.5x, 1x, 2x, 5x, 10x)
   - Pattern selector
   - Reset button
   - Simulation time display

3. Style the component

4. Write unit tests

**Acceptance Criteria**:
- [ ] Controls functional
- [ ] UI responsive
- [ ] All interactions work
- [ ] Tests passing

---

### Task 5.5: Implement Metrics Panel Component
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Phase 3

**Steps**:
1. Create `components/metrics-panel/metrics-panel.component.ts`:
   ```typescript
   @Component({
     selector: 'app-metrics-panel',
     standalone: true,
     imports: [CommonModule, MetricCardComponent],
     template: `
       <div class="metrics-grid">
         <lib-metric-card
           icon="speed"
           label="Current Rate"
           [value]="currentMetrics.rate"
           unit="BPM"
           [trend]="rateTrend"
         />
         <lib-metric-card
           icon="compress"
           label="Current Pressure"
           [value]="currentMetrics.pressure"
           unit="PSI"
           [trend]="pressureTrend"
         />
         <lib-metric-card
           icon="science"
           label="Prop Conc"
           [value]="currentMetrics.propConc"
           unit="PPA"
           [trend]="propConcTrend"
         />
         <lib-metric-card
           icon="trending_up"
           label="Bottomhole Pressure"
           [value]="currentMetrics.bhp"
           unit="PSI"
           [trend]="bhpTrend"
           [isCalculated]="true"
         />
       </div>
     `
   })
   export class MetricsPanelComponent implements OnInit, OnDestroy {
     currentMetrics: any = {};
     // ... trends
   }
   ```

2. Implement metric calculations:
   - Current values
   - Trends (last 10 seconds)

3. Style the grid

4. Write unit tests

**Acceptance Criteria**:
- [ ] Displays all metrics
- [ ] Updates in real-time
- [ ] Trends calculated correctly
- [ ] Tests passing

---

### Task 5.6: Implement Chart Grid Component
**Estimated Time**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Phase 3

**Steps**:
1. Create `components/chart-grid/chart-grid.component.ts`:
   ```typescript
   @Component({
     selector: 'app-chart-grid',
     standalone: true,
     imports: [
       CommonModule,
       RealtimeLineChartComponent,
       MultiSeriesChartComponent
     ],
     template: `
       <div class="chart-grid">
         <!-- Main Multi-Series Chart -->
         <div class="chart-full">
           <lib-multi-series-chart
             [dataStream$]="dataStream$"
             [isDarkTheme]="isDarkTheme$ | async"
           />
         </div>
         
         <!-- Individual Charts -->
         <div class="chart-half">
           <lib-realtime-line-chart
             [config]="rateChartConfig"
             [dataStream$]="rateStream$"
             [isDarkTheme]="isDarkTheme$ | async"
           />
         </div>
         <div class="chart-half">
           <lib-realtime-line-chart
             [config]="bhpChartConfig"
             [dataStream$]="bhpStream$"
             [isDarkTheme]="isDarkTheme$ | async"
           />
         </div>
       </div>
     `
   })
   export class ChartGridComponent {}
   ```

2. Implement responsive grid layout:
   - Desktop: 2x2 grid
   - Tablet: 1x3 stack
   - Mobile: Full stack

3. Wire up data streams

4. Write unit tests

**Acceptance Criteria**:
- [ ] Charts display correctly
- [ ] Responsive layout works
- [ ] Data streams connected
- [ ] Tests passing

---

### Task 5.7: Implement Dashboard Page
**Estimated Time**: 8 hours  
**Assignee**: TBD  
**Dependencies**: Tasks 5.4, 5.5, 5.6

**Steps**:
1. Create `pages/dashboard/dashboard.component.ts`:
   ```typescript
   @Component({
     selector: 'app-dashboard',
     standalone: true,
     imports: [
       CommonModule,
       MatToolbarModule,
       MatButtonModule,
       MatIconModule,
       SimulationControlsComponent,
       MetricsPanelComponent,
       ChartGridComponent
     ],
     templateUrl: './dashboard.component.html'
   })
   export class DashboardComponent implements OnInit, OnDestroy {
     dataStream$!: Observable<EnhancedDataPoint>;
     
     constructor(
       private dataGenerator: DataGeneratorService,
       private bhpCalculator: BHPStreamService,
       private appState: AppStateService,
       private theme: ThemeService
     ) {}
     
     ngOnInit(): void {
       // Set up data pipeline
       const rawData$ = this.dataGenerator.start();
       this.dataStream$ = this.bhpCalculator.processStream(rawData$);
     }
   }
   ```

2. Create dashboard layout:
   ```html
   <mat-toolbar color="primary">
     <span>BHP Real-Time Simulator</span>
     <span class="spacer"></span>
     <button mat-icon-button (click)="toggleTheme()">
       <mat-icon>{{(isDarkTheme$ | async) ? 'light_mode' : 'dark_mode'}}</mat-icon>
     </button>
   </mat-toolbar>
   
   <div class="dashboard-container">
     <app-simulation-controls />
     <app-metrics-panel />
     <app-chart-grid />
   </div>
   ```

3. Implement data pipeline integration

4. Add error handling

5. Write unit tests

**Acceptance Criteria**:
- [ ] Dashboard displays all components
- [ ] Data flows correctly through pipeline
- [ ] Theme toggle works
- [ ] Responsive layout
- [ ] Tests passing

**Verification**:
```bash
nx serve demo-app
# Navigate to http://localhost:4200
```

---

### Task 5.8: Implement About Page
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: Task 5.1

**Steps**:
1. Create `pages/about/about.component.ts`

2. Add content:
   - Project description
   - Algorithm explanation
   - Links to documentation
   - Technology stack
   - GitHub repository link

3. Style the page

**Acceptance Criteria**:
- [ ] About page created
- [ ] Content comprehensive
- [ ] Links work
- [ ] Styled consistently

---

### Task 5.9: Add Error Handling and Loading States
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 5.7

**Steps**:
1. Create error service:
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class ErrorService {
     private errors$ = new Subject<string>();
     
     showError(message: string): void;
     clearErrors(): void;
   }
   ```

2. Create error notification component (snackbar)

3. Add loading indicators:
   - Simulation initializing
   - Data loading

4. Add error boundaries:
   - Catch streaming errors
   - Catch calculation errors
   - Display user-friendly messages

5. Write unit tests

**Acceptance Criteria**:
- [ ] Errors caught and displayed
- [ ] Loading states shown
- [ ] User can recover from errors
- [ ] Tests passing

---

### Task 5.10: E2E Tests and Final Integration
**Estimated Time**: 8 hours  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Set up Cypress or Playwright:
   ```bash
   nx generate @nx/angular:cypress-e2e-configuration demo-app
   ```

2. Write E2E test scenarios:
   - Load application
   - Start simulation
   - Change pattern
   - Adjust speed
   - Toggle theme
   - Reset simulation
   - Verify charts update
   - Verify metrics update

3. Test responsive layouts:
   - Desktop view
   - Tablet view
   - Mobile view

4. Test error scenarios:
   - Invalid configuration
   - Network errors (if applicable)

5. Performance testing:
   - Long-running simulation
   - Memory leaks
   - CPU usage

**Acceptance Criteria**:
- [ ] All E2E tests passing
- [ ] Responsive tests passing
- [ ] Performance acceptable
- [ ] No memory leaks

**Verification**:
```bash
nx e2e demo-app-e2e
```

---

## Deliverables

1. ✅ Complete application structure
2. ✅ Theme service with dark/light modes
3. ✅ Application state management
4. ✅ Simulation controls component
5. ✅ Metrics panel component
6. ✅ Chart grid component
7. ✅ Dashboard page
8. ✅ About page
9. ✅ Error handling and loading states
10. ✅ E2E tests

## Success Criteria

- [ ] Application loads successfully
- [ ] Simulation runs smoothly
- [ ] All controls functional
- [ ] Charts update in real-time
- [ ] Metrics display correctly
- [ ] Theme switching works
- [ ] Responsive on all devices
- [ ] No console errors
- [ ] E2E tests passing
- [ ] Performance acceptable (60 FPS)

## Verification Checklist

```bash
# Build and serve
nx build demo-app --configuration=production
nx serve demo-app

# Run tests
nx test demo-app --coverage
nx e2e demo-app-e2e

# Check bundle size
nx run demo-app:analyze

# Lighthouse score check
npm run lighthouse

# Performance profiling
# Use Chrome DevTools
```

## Next Steps

After Phase 4 completion, proceed to:
- **Phase 5**: CI/CD & Deployment
- Set up GitHub Actions
- Deploy to GitHub Pages

## Notes

- Focus on user experience
- Ensure smooth animations (60 FPS)
- Keep bundle size reasonable (<500KB)
- Test on multiple browsers
- Add keyboard shortcuts for power users
- Consider adding export functionality
- Document any known limitations
- Ensure accessibility (ARIA labels)
- Test with screen readers
