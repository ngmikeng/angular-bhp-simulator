# Phase 3: Chart Components Library Implementation

**Duration**: 7-10 days  
**Priority**: High  
**Dependencies**: Phase 0 (Project Setup)  

## Overview

Implement reusable ECharts wrapper components for real-time data visualization. These components will be used throughout the demo application to display Rate, Pressure, Proppant Concentration, and BHP data.

## Objectives

- ✅ Create real-time line chart component
- ✅ Create multi-series chart component
- ✅ Create metric card component
- ✅ Implement theme support (dark/light)
- ✅ Optimize for real-time performance
- ✅ Write comprehensive tests
- ✅ Document all components

## Tasks

### Task 4.1: Create Chart Configuration Models
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: Phase 0

**Steps**:
1. Create `libs/chart-components/src/lib/models/chart-config.model.ts`:
   ```typescript
   export interface RealtimeChartConfig {
     title: string;
     yAxisLabel: string;
     yAxisRange?: [number, number];
     maxDataPoints?: number;
     lineColor?: string;
     areaColor?: string;
     showArea?: boolean;
     smooth?: boolean;
     animationDuration?: number;
     timeFormat?: string;
   }

   export interface MultiSeriesConfig {
     title: string;
     series: SeriesConfig[];
     maxDataPoints?: number;
     syncCrosshair?: boolean;
   }

   export interface SeriesConfig {
     name: string;
     yAxisIndex: number;
     yAxisLabel: string;
     lineColor: string;
     showArea?: boolean;
   }
   ```

2. Export models

**Acceptance Criteria**:
- [ ] All configuration models created
- [ ] TypeScript types correct
- [ ] Exported from library

---

### Task 4.2: Implement Chart Theme Service
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 4.1

**Steps**:
1. Create `libs/chart-components/src/lib/services/chart-theme.service.ts`:
   ```typescript
   @Injectable()
   export class ChartThemeService {
     private isDarkMode$ = new BehaviorSubject<boolean>(false);
     
     getChartTheme(isDark: boolean): EChartsOption {
       return {
         backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
         textStyle: {
           color: isDark ? '#ffffff' : '#333333'
         },
         // ... more theme config
       };
     }
   }
   ```

2. Define dark and light theme configurations

3. Implement theme switching

4. Write unit tests

**Acceptance Criteria**:
- [ ] Theme service implemented
- [ ] Dark and light themes defined
- [ ] Theme switching works
- [ ] Tests passing

---

### Task 4.3: Implement Real-Time Line Chart Component
**Estimated Time**: 12 hours  
**Assignee**: TBD  
**Dependencies**: Tasks 4.1, 4.2

**Steps**:
1. Create component files:
   - `realtime-line-chart.component.ts`
   - `realtime-line-chart.component.html`
   - `realtime-line-chart.component.scss`
   - `realtime-line-chart.component.spec.ts`

2. Implement component:
   ```typescript
   @Component({
     selector: 'lib-realtime-line-chart',
     standalone: true,
     imports: [CommonModule, NgxEchartsModule],
     templateUrl: './realtime-line-chart.component.html',
     styleUrls: ['./realtime-line-chart.component.scss']
   })
   export class RealtimeLineChartComponent implements OnInit, OnDestroy {
     @Input() config!: RealtimeChartConfig;
     @Input() dataStream$!: Observable<{timestamp: number; value: number}>;
     @Input() isDarkTheme = false;
     
     // Implementation
   }
   ```

3. Implement data buffering:
   - Maintain rolling buffer of data points
   - Auto-evict old points
   - Efficient updates

4. Implement ECharts configuration:
   - Title, axes, grid
   - Tooltip with detailed info
   - DataZoom for pan/zoom
   - Responsive sizing

5. Implement streaming updates:
   - Subscribe to data stream
   - Update chart efficiently
   - Use `merge` option for updates

6. Add performance optimizations:
   - LTTB downsampling
   - Progressive rendering
   - OnPush change detection

7. Write unit tests:
   - Test data updates
   - Test theme switching
   - Test configuration changes

**Acceptance Criteria**:
- [ ] Component implemented and working
- [ ] Streaming updates smooth (60 FPS)
- [ ] Theme switching works
- [ ] Responsive to window resize
- [ ] Pan/zoom controls work
- [ ] Tooltip shows correct information
- [ ] Unit tests passing
- [ ] No memory leaks

**Verification**:
```typescript
// Should handle 600 data points smoothly
```

---

### Task 4.4: Implement Multi-Series Chart Component
**Estimated Time**: 10 hours  
**Assignee**: TBD  
**Dependencies**: Task 4.3

**Steps**:
1. Create component files similar to Task 4.3

2. Implement component:
   ```typescript
   @Component({
     selector: 'lib-multi-series-chart',
     // ...
   })
   export class MultiSeriesChartComponent implements OnInit, OnDestroy {
     @Input() dataStream$!: Observable<EnhancedDataPoint>;
     @Input() isDarkTheme = false;
     
     // Implementation
   }
   ```

3. Implement multiple Y-axes support:
   - Rate (left axis)
   - Pressure (right axis 1)
   - Prop Conc / BHP (right axis 2)

4. Implement synchronized features:
   - Crosshair across all series
   - Synchronized zoom/pan
   - Legend toggle

5. Optimize for multiple series:
   - Efficient data updates
   - Separate buffers per series

6. Write unit tests

**Acceptance Criteria**:
- [ ] Component handles multiple series
- [ ] Multiple Y-axes work correctly
- [ ] Crosshair synchronized
- [ ] Zoom/pan synchronized
- [ ] Legend toggles work
- [ ] Unit tests passing

**Verification**:
```bash
nx test chart-components --testNamePattern="MultiSeries"
```

---

### Task 4.5: Implement Metric Card Component
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Phase 0

**Steps**:
1. Create `metric-card.component.ts`:
   ```typescript
   @Component({
     selector: 'lib-metric-card',
     standalone: true,
     imports: [CommonModule, MatCardModule, MatIconModule],
     template: `
       <mat-card class="metric-card">
         <div class="icon"><mat-icon>{{icon}}</mat-icon></div>
         <div class="content">
           <div class="label">{{label}}</div>
           <div class="value">{{value | number:'1.1-1'}} {{unit}}</div>
           <div class="trend" *ngIf="trend">
             <mat-icon>{{trend > 0 ? 'trending_up' : 'trending_down'}}</mat-icon>
             {{Math.abs(trend) | number:'1.1-1'}}%
           </div>
         </div>
       </mat-card>
     `,
     styles: [...]
   })
   export class MetricCardComponent {
     @Input() icon!: string;
     @Input() label!: string;
     @Input() value: number | null = null;
     @Input() unit = '';
     @Input() trend: number | null = null;
     @Input() isCalculated = false;
   }
   ```

2. Style the component:
   - Card layout
   - Icon placement
   - Value display
   - Trend indicator
   - Calculated badge

3. Add theme support

4. Write unit tests

**Acceptance Criteria**:
- [ ] Component displays metrics correctly
- [ ] Trend indicator works
- [ ] Theme support works
- [ ] Responsive layout
- [ ] Unit tests passing

---

### Task 4.6: Create Chart Utilities
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 4.2

**Steps**:
1. Create `libs/chart-components/src/lib/utils/chart-utils.ts`

2. Implement utility functions:
   ```typescript
   // Format time for X-axis
   export function formatTime(timestamp: number, format: string): string;
   
   // Create common tooltip formatter
   export function createTooltipFormatter(config: any): Function;
   
   // Apply theme to chart options
   export function applyTheme(options: EChartsOption, isDark: boolean): EChartsOption;
   
   // LTTB downsampling
   export function downsampleLTTB(data: [number, number][], threshold: number): [number, number][];
   ```

3. Write unit tests for each utility

**Acceptance Criteria**:
- [ ] All utilities implemented
- [ ] Utilities used in components
- [ ] Unit tests passing
- [ ] Well documented

---

### Task 4.7: Implement Export Functionality
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 4.3

**Steps**:
1. Add export methods to chart components:
   ```typescript
   exportAsImage(): string | null {
     return this.chart?.getDataURL({
       type: 'png',
       pixelRatio: 2,
       backgroundColor: this.isDarkTheme ? '#1e1e1e' : '#ffffff'
     });
   }
   
   exportAsData(): DataPoint[] {
     return [...this.dataBuffer];
   }
   ```

2. Create export button directive (optional)

3. Write unit tests

**Acceptance Criteria**:
- [ ] Export to image works
- [ ] Export data works
- [ ] High quality output
- [ ] Tests passing

---

### Task 4.8: Performance Optimization
**Estimated Time**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Tasks 4.3, 4.4

**Steps**:
1. Implement LTTB downsampling:
   - Downsample when data points > threshold
   - Maintain visual appearance
   - Reduce rendering load

2. Implement progressive rendering:
   - Configure ECharts progressive options
   - Test with large datasets

3. Optimize change detection:
   - Use OnPush strategy
   - Minimize unnecessary updates

4. Implement data buffering:
   - Efficient circular buffer
   - Avoid array shifts

5. Profile and benchmark:
   - Test with 10,000 points
   - Measure FPS
   - Measure memory usage

6. Document performance characteristics

**Acceptance Criteria**:
- [ ] 60 FPS with 600 visible points
- [ ] Memory usage stable
- [ ] Downsampling works correctly
- [ ] Progressive rendering enabled
- [ ] Performance documented

**Verification**:
```typescript
// Performance test should pass
expect(averageFPS).toBeGreaterThanOrEqual(60);
```

---

### Task 4.9: Integration Tests
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: All component tasks

**Steps**:
1. Create integration test suite

2. Test complete scenarios:
   - Real-time data streaming
   - Theme switching during streaming
   - Multiple charts synchronized
   - Zoom and pan operations

3. Test edge cases:
   - Empty data
   - Rapid updates
   - Large datasets
   - Window resize

4. Test memory leaks:
   - Long-running streams
   - Component destruction

**Acceptance Criteria**:
- [ ] Integration tests for all scenarios
- [ ] Edge cases handled
- [ ] No memory leaks
- [ ] All tests passing

**Verification**:
```bash
nx test chart-components --testPathPattern=integration
```

---

### Task 4.10: Documentation
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Add JSDoc to all public APIs

2. Create `libs/chart-components/README.md`:
   - Installation
   - Component usage examples
   - Configuration guide
   - Theme customization
   - Performance tips
   - Export functionality

3. Create component examples:
   - Real-time line chart example
   - Multi-series chart example
   - Metric card example
   - Theme switching example

4. Create Storybook stories (optional but recommended):
   ```bash
   npm install --save-dev @storybook/angular
   ```

**Acceptance Criteria**:
- [ ] All components documented
- [ ] README comprehensive
- [ ] Examples tested and working
- [ ] Storybook stories (optional)

---

## Deliverables

1. ✅ Real-time line chart component
2. ✅ Multi-series chart component
3. ✅ Metric card component
4. ✅ Chart theme service
5. ✅ Chart utilities
6. ✅ Export functionality
7. ✅ Performance optimizations
8. ✅ Comprehensive unit tests (>85% coverage)
9. ✅ Integration tests
10. ✅ Complete documentation

## Success Criteria

- [ ] All tests passing (>85% coverage)
- [ ] Charts render smoothly at 60 FPS
- [ ] Theme switching works instantly
- [ ] All components responsive
- [ ] No memory leaks
- [ ] Export functionality works
- [ ] Documentation complete
- [ ] Can be imported and used by demo app

## Verification Checklist

```bash
# Run all checks
nx test chart-components --coverage
nx lint chart-components
nx build chart-components

# Check test coverage
# Should show >85% coverage

# Performance test
npm run test:performance

# Visual verification
npm run storybook # if implemented
```

## Next Steps

After Phase 3 completion, proceed to:
- **Phase 4**: Demo Application Implementation
- Begin building the main dashboard

## Notes

- Prioritize performance (60 FPS target)
- Use OnPush change detection
- Implement LTTB downsampling for large datasets
- Theme switching should be instant
- Export high-quality images (2x resolution)
- Document performance characteristics
- Consider Storybook for component showcase
- Test on different screen sizes
