# Angular BHP Real-Time Simulator - Project Overview

## Project Vision

Create an Angular workspace application that simulates the real-time Bottom Hole Proppant Concentration (BHP) calculation in a web browser using ECharts for visualization. The application will demonstrate the backward-looking incremental BHP algorithm through interactive, animated charts with configurable parameters.

## Key Objectives

1. **Educational Demonstration**: Visualize how BHP is calculated from surface measurements (Rate, Pressure, Prop Conc) using the backward-looking algorithm
2. **Real-Time Simulation**: Simulate streaming data to show how BHP values are computed incrementally as new data arrives
3. **Interactive Configuration**: Allow users to adjust parameters like Flush Volume to see how it affects the calculation
4. **Professional UI/UX**: Modern, responsive interface with dark/light theme support using Angular Material
5. **Zero Backend**: All simulation logic runs client-side in the browser
6. **Easy Deployment**: CI/CD pipeline using GitHub Actions to GitHub Pages

## Technical Architecture

### Workspace Structure

```
angular-bhp-simulator/
├── apps/
│   └── demo-app/                    # Main demo application
│       ├── src/
│       │   ├── app/
│       │   │   ├── features/
│       │   │   │   ├── dashboard/   # Main dashboard page
│       │   │   │   ├── simulation/  # Simulation control
│       │   │   │   └── charts/      # Chart components
│       │   │   ├── shared/
│       │   │   │   ├── components/  # Reusable UI components
│       │   │   │   └── services/    # Theme, state services
│       │   │   └── app.component.ts
│       │   ├── assets/
│       │   ├── styles/
│       │   └── environments/
│       └── project.json
│
├── libs/
│   ├── bhp-calculator/              # Core BHP calculation library
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── models/          # DataPoint, ComputationState
│   │   │   │   ├── calculator/      # incremental_calc_bhp logic
│   │   │   │   ├── data-window/     # Sliding window management
│   │   │   │   └── cache/           # BHP cache implementation
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   ├── data-generator/              # Simulated data stream generator
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── generators/      # Rate, Pressure, PropConc generators
│   │   │   │   ├── stream/          # Data stream controller
│   │   │   │   └── validators/      # Data validation
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   └── chart-components/            # Reusable ECharts components
│       ├── src/
│       │   ├── lib/
│       │   │   ├── realtime-line-chart/
│       │   │   ├── multi-series-chart/
│       │   │   └── chart-config/    # ECharts configuration utilities
│       │   └── index.ts
│       └── README.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Build and test
│       └── deploy.yml               # Deploy to GitHub Pages
│
├── angular.json
├── nx.json                          # Nx workspace configuration
├── package.json
├── tsconfig.base.json
└── README.md
```

## Core Components

### 1. Demo Application

**Purpose**: Main user-facing application that orchestrates all features

**Key Features**:
- Real-time dashboard with multiple synchronized charts
- Simulation controls (play/pause, speed adjustment, reset)
- Configuration panel for Flush Volume and other parameters
- Theme switcher (dark/light mode)
- Responsive layout for desktop and tablet

### 2. BHP Calculator Library

**Purpose**: Pure TypeScript implementation of the incremental BHP calculation algorithm

**Key Features**:
- Port of Rust algorithm to TypeScript
- DataPoint and ComputationState models
- Sliding window with automatic eviction (2-hour window)
- BHP cache with O(1) lookups
- Zero dependencies (except RxJS for observables)

**Core Algorithm**: Backward-Looking BHP Calculation
```typescript
// Pseudocode
function calculateBHP(
  targetTimestamp: number,
  dataWindow: DataPoint[],
  flushVolume: number,
  bhpCache: Map<number, number>
): number | null {
  // 1. Check cache
  if (bhpCache.has(targetTimestamp)) {
    return bhpCache.get(targetTimestamp);
  }
  
  // 2. Calculate offset
  const referenceRate = getCurrentRate(targetTimestamp, dataWindow);
  const offsetMs = (flushVolume / referenceRate) * 60 * 1000;
  
  // 3. Look backward in time
  const historicalTimestamp = targetTimestamp - offsetMs;
  
  // 4. Find closest historical data point
  const historicalPoint = findClosestPoint(historicalTimestamp, dataWindow);
  
  // 5. Return historical prop_conc as BHP
  const bhp = historicalPoint.propConc;
  
  // 6. Cache result
  bhpCache.set(targetTimestamp, bhp);
  
  return bhp;
}
```

### 3. Data Generator Library

**Purpose**: Simulate realistic streaming data for Rate, Pressure, and Prop Conc

**Key Features**:
- Configurable data generation patterns
- Realistic noise and variations
- Event simulation (pump stops, stage changes)
- Adjustable streaming speed (1x, 2x, 5x, 10x)
- Time-based or event-based triggers

**Generation Patterns**:
- **Rate**: 5-25 bbl/min with gradual changes and occasional stops
- **Pressure**: 1000-8000 psi correlated with rate
- **Prop Conc**: 0-15 ppg with ramp-up/ramp-down patterns
- **Flush Volume**: User-configurable or random between 80-150 barrels

### 4. Chart Components Library

**Purpose**: Reusable ECharts wrapper components for data visualization

**Key Features**:
- Real-time line chart with streaming updates
- Multi-series synchronized charts
- Zoom and pan capabilities
- Data point tooltips with BHP calculation details
- Responsive sizing
- Theme-aware (dark/light mode support)

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                         │
│    (Configure Flush Volume, Start/Stop Simulation)          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              SimulationService (RxJS)                       │
│  • Manages simulation state (running, paused, speed)       │
│  • Emits configuration changes                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DataGeneratorService                           │
│  • Generates DataPoint every second (adjustable)           │
│  • Emits: { timestamp, rate, pressure, propConc }          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BHPCalculatorService                           │
│  • Maintains sliding window (VecDeque equivalent)          │
│  • Maintains BHP cache (Map<timestamp, bhp>)               │
│  • Calculates BHP using backward-looking algorithm         │
│  • Emits: { timestamp, rate, pressure, propConc, bhp }     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ChartService                                   │
│  • Aggregates data for visualization                       │
│  • Manages chart data buffers (last N points)              │
│  • Updates ECharts instances                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Chart Components                               │
│  • Real-time line charts for Rate, Pressure, Prop Conc     │
│  • BHP chart with historical overlay                       │
│  • All charts synchronized on X-axis (time)                │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Framework
- **Angular 18+**: Latest stable version with standalone components
- **TypeScript 5+**: Strict mode enabled
- **RxJS 7+**: Reactive state management and data streams

### UI/UX
- **Angular Material 18+**: Component library for consistent UI
- **ECharts 5+**: Powerful charting library with real-time support
- **ngx-echarts**: Angular wrapper for ECharts

### Build & Development Tools
- **Nx**: Monorepo management and build optimization
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Cypress**: E2E testing (optional)

### CI/CD & Deployment
- **GitHub Actions**: Automated build, test, and deployment
- **GitHub Pages**: Static site hosting

## Key Features Breakdown

### 1. Real-Time Simulation Dashboard

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: BHP Real-Time Simulator       [Dark/Light Toggle]  │
├─────────────────────────────────────────────────────────────┤
│  Control Panel:                                              │
│  [▶ Play] [⏸ Pause] [↻ Reset]  Speed: [1x▼]                │
│  Flush Volume: [120] barrels  [Random]                      │
├─────────────────────────────────────────────────────────────┤
│  Charts (4 synchronized charts):                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Rate (bbl/min)              Current: 18.5           │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pressure (psi)              Current: 5420           │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prop Conc (ppg)             Current: 3.2            │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BHP (ppg) - CALCULATED      Current: 2.7            │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│  │  Historical Point: ● (6 min ago)                     │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Calculation Details:                                       │
│  Offset: 6.49 min | Historical Timestamp: 389 sec ago      │
│  BHP = Prop Conc at T-389s = 2.7 ppg                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Interactive Configuration Panel

**Features**:
- Flush Volume input with validation (0-300 barrels)
- Random flush volume generator (80-150 barrels)
- Simulation speed control (0.5x, 1x, 2x, 5x, 10x)
- Data generation patterns (steady, ramping, cycling)
- Window size configuration (default 2 hours)

### 3. Real-Time Chart Features

**Chart Capabilities**:
- Streaming updates at 1 Hz (or faster based on speed setting)
- Automatic Y-axis scaling
- Time-based X-axis (last N minutes visible)
- Zoom controls (mouse wheel, pinch gestures)
- Pan controls (drag to move timeline)
- Data point tooltips with detailed information
- Historical point indicators on BHP chart
- Synchronized crosshair across all charts

**Tooltip Example**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Time: 10:45:23
━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Rate:      18.5 bbl/min
 Pressure:  5420 psi
 Prop Conc: 3.2 ppg
 BHP:       2.7 ppg ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BHP Calculation:
 • Flush Volume: 120 barrels
 • Offset: 6.49 min (389 sec)
 • Historical Time: 10:38:54
 • Historical Prop Conc: 2.7 ppg
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Theme Support

**Dark Theme**:
- Dark background (#1e1e1e)
- Light text (#ffffff)
- Blue accent color (#2196f3)
- Chart colors optimized for dark backgrounds

**Light Theme**:
- Light background (#ffffff)
- Dark text (#000000)
- Material Design default colors
- Chart colors optimized for light backgrounds

**Implementation**:
- Angular Material theming
- Custom ECharts theme matching Material theme
- CSS custom properties for dynamic theming
- Theme preference saved to localStorage

## Development Approach

### Phase 1: Project Setup (Week 1)
1. Create Nx workspace with Angular preset
2. Generate demo app and library projects
3. Configure Angular Material with theming
4. Set up ECharts and ngx-echarts
5. Configure ESLint, Prettier, and Jest

### Phase 2: Core Libraries (Week 2-3)
1. Implement bhp-calculator library
   - DataPoint and ComputationState models
   - Sliding window implementation
   - BHP cache implementation
   - Core calculation algorithm
   - Unit tests

2. Implement data-generator library
   - Data generation strategies
   - Stream controller
   - Unit tests

3. Implement chart-components library
   - Real-time line chart component
   - Chart configuration utilities
   - Theme integration

### Phase 3: Demo Application (Week 4-5)
1. Create dashboard layout with Angular Material
2. Implement simulation controls
3. Integrate BHP calculator with data generator
4. Connect charts to data streams
5. Add configuration panel
6. Implement theme switcher

### Phase 4: Polish & Documentation (Week 6)
1. Add tooltips and help text
2. Optimize performance
3. Write comprehensive documentation
4. Add usage examples
5. Create demo video/screenshots

### Phase 5: CI/CD & Deployment (Week 7)
1. Set up GitHub Actions workflows
2. Configure GitHub Pages deployment
3. Add build optimization
4. Set up automated testing
5. Deploy to production

## Performance Considerations

### Memory Management
- **Sliding Window**: Maximum 7,200 data points (2 hours at 1/sec)
- **Chart Buffer**: Last 300-600 points visible (5-10 minutes)
- **BHP Cache**: Maximum 7,200 entries, auto-evict with window
- **Memory Usage**: Estimated ~5-10 MB for 2-hour window

### Rendering Optimization
- **ECharts Optimization**: Use `dataZoom` and `sampling` for large datasets
- **Angular Change Detection**: Use `OnPush` strategy for chart components
- **RxJS**: Use `shareReplay()` for expensive observables
- **Virtual Scrolling**: If adding data tables

### Performance Targets
- **Chart Update Rate**: 60 FPS for smooth animations
- **Calculation Time**: <1ms per BHP calculation
- **Initial Load**: <2 seconds
- **Memory Growth**: <100 KB per minute of simulation

## Testing Strategy

### Unit Tests
- **BHP Calculator**: Test all algorithm paths and edge cases
- **Data Generator**: Test data generation patterns
- **Services**: Test state management and RxJS streams
- **Components**: Test user interactions and data binding

### Integration Tests
- **End-to-End Flow**: Test complete simulation cycle
- **Chart Updates**: Test data flow from generator to charts
- **Theme Switching**: Test theme persistence and application

### E2E Tests (Optional)
- **User Workflows**: Start simulation, change parameters, reset
- **Responsive Design**: Test on different screen sizes
- **Cross-Browser**: Test on Chrome, Firefox, Safari

## Documentation Plan

### Developer Documentation
1. **README.md**: Project overview, setup instructions, development guide
2. **ARCHITECTURE.md**: Detailed architecture and design decisions
3. **API.md**: Library APIs and usage examples
4. **CONTRIBUTING.md**: Contribution guidelines

### User Documentation
1. **USER_GUIDE.md**: How to use the simulator
2. **ALGORITHM.md**: BHP calculation algorithm explanation
3. **FAQ.md**: Common questions and answers

### Code Documentation
- JSDoc comments for all public APIs
- README for each library
- Inline comments for complex logic

## Deployment Strategy

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test
      - run: npm run build:production
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/apps/demo-app
```

### Production Build Optimizations
- **AOT Compilation**: Ahead-of-time compilation for faster runtime
- **Tree Shaking**: Remove unused code
- **Minification**: Minify JS, CSS, HTML
- **Code Splitting**: Lazy load feature modules
- **Service Worker**: Add PWA support for offline capability (optional)

## Future Enhancements

### Version 1.1
- Export data to CSV
- Save/load simulation scenarios
- Compare multiple simulation runs
- Add more data generation patterns

### Version 1.2
- Multi-stage simulation
- Historical data playback from CSV
- Custom calculation parameters
- Advanced analytics dashboard

### Version 2.0
- WebSocket support for real device data
- Mobile app (Ionic/Capacitor)
- Collaborative features (share simulations)
- Machine learning predictions

## Success Metrics

### Technical Metrics
- **Performance**: Maintains 60 FPS during simulation
- **Reliability**: Zero calculation errors in unit tests
- **Code Quality**: >80% test coverage
- **Bundle Size**: <2 MB initial load

### User Experience Metrics
- **Ease of Use**: Users can start simulation within 30 seconds
- **Visual Clarity**: Charts are readable and informative
- **Responsiveness**: Works well on desktop and tablet
- **Accessibility**: Meets WCAG 2.1 Level AA standards

## Conclusion

This Angular BHP Real-Time Simulator project will provide a powerful, interactive demonstration of the incremental BHP calculation algorithm. By implementing the core logic in TypeScript and visualizing it with ECharts, users can gain deep insights into how BHP values are calculated in real-time from surface measurements.

The modular architecture with separate libraries ensures code reusability, maintainability, and testability. The CI/CD pipeline with GitHub Actions and GitHub Pages deployment makes it easy to share and iterate on the application.

This project serves as both an educational tool and a technical showcase of modern Angular development practices, real-time data visualization, and complex algorithm implementation in the browser.
