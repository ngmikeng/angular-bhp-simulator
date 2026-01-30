# Chart Components Library

A comprehensive Angular library for real-time data visualization using ECharts. Designed for the BHP Real-Time Simulator with support for streaming data, multiple chart types, and theme customization.

## Features

- ✅ **Real-Time Line Chart**: Streaming data visualization with automatic buffering
- ✅ **Multi-Series Chart**: Multiple Y-axes with synchronized crosshair
- ✅ **Metric Cards**: Beautiful cards for displaying KPIs
- ✅ **Theme Support**: Dark/light mode with automatic switching
- ✅ **Performance Optimized**: LTTB downsampling, circular buffers, progressive rendering
- ✅ **Export Functionality**: Export charts as images or raw data
- ✅ **Responsive Design**: Auto-resize and mobile-friendly
- ✅ **TypeScript**: Full type safety with comprehensive interfaces

## Installation

The library is part of the Angular BHP Simulator monorepo. To use it in another project within the workspace:

```bash
npm install echarts ngx-echarts @angular/material
```

## Components

### 1. Real-Time Line Chart

Display real-time streaming data with smooth animations and automatic buffer management.

#### Usage

```typescript
import { Component } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  RealtimeLineChartComponent,
  RealtimeChartConfig,
  ChartDataPoint 
} from '@angular-bhp-simulator/chart-components';

@Component({
  selector: 'app-demo',
  imports: [RealtimeLineChartComponent],
  template: `
    <lib-realtime-line-chart
      [config]="chartConfig"
      [dataStream$]="dataStream$"
      [isDarkTheme]="isDark">
    </lib-realtime-line-chart>
  `
})
export class DemoComponent {
  isDark = false;
  
  chartConfig: RealtimeChartConfig = {
    title: 'Slurry Rate',
    yAxisLabel: 'bbl/min',
    yAxisRange: [0, 30],
    maxDataPoints: 300,
    lineColor: '#2196f3',
    showArea: true,
    smooth: true
  };
  
  dataStream$: Observable<ChartDataPoint> = interval(1000).pipe(
    map(() => ({
      timestamp: Date.now(),
      value: Math.random() * 30
    }))
  );
}
```

#### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | - | Chart title |
| `yAxisLabel` | `string` | - | Y-axis label (e.g., "bbl/min") |
| `yAxisRange` | `[number, number]` | auto | Fixed Y-axis range [min, max] |
| `maxDataPoints` | `number` | 300 | Maximum data points to display |
| `lineColor` | `string` | theme | Line color (hex/rgb/name) |
| `areaColor` | `string` | auto | Area fill color |
| `showArea` | `boolean` | false | Show filled area under line |
| `smooth` | `boolean` | true | Enable smooth curve |
| `animationDuration` | `number` | 300 | Animation duration (ms) |
| `timeFormat` | `string` | 'HH:mm:ss' | Time format for X-axis |

### 2. Multi-Series Chart

Display multiple data series with independent Y-axes in a single synchronized chart.

#### Usage

```typescript
import { 
  MultiSeriesChartComponent,
  MultiSeriesConfig,
  MultiSeriesDataPoint 
} from '@angular-bhp-simulator/chart-components';

@Component({
  selector: 'app-demo',
  imports: [MultiSeriesChartComponent],
  template: `
    <lib-multi-series-chart
      [config]="multiSeriesConfig"
      [dataStream$]="dataStream$"
      [isDarkTheme]="isDark">
    </lib-multi-series-chart>
  `
})
export class DemoComponent {
  multiSeriesConfig: MultiSeriesConfig = {
    title: 'BHP Real-Time Simulation',
    maxDataPoints: 600,
    series: [
      {
        name: 'Rate',
        yAxisIndex: 0,
        yAxisLabel: 'bbl/min',
        lineColor: '#2196f3',
        showArea: false
      },
      {
        name: 'Pressure',
        yAxisIndex: 1,
        yAxisLabel: 'psi',
        lineColor: '#ff9800',
        showArea: false
      },
      {
        name: 'BHP',
        yAxisIndex: 2,
        yAxisLabel: 'psi',
        lineColor: '#f44336',
        showArea: true
      }
    ]
  };
  
  dataStream$: Observable<MultiSeriesDataPoint> = interval(1000).pipe(
    map(() => ({
      timestamp: Date.now(),
      values: {
        'Rate': Math.random() * 30,
        'Pressure': 5000 + Math.random() * 3000,
        'BHP': 7000 + Math.random() * 2000
      }
    }))
  );
}
```

#### Multi-Series Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | - | Chart title |
| `series` | `SeriesConfig[]` | - | Array of series configurations |
| `maxDataPoints` | `number` | 600 | Maximum data points to display |
| `syncCrosshair` | `boolean` | true | Synchronize crosshair across series |
| `timeFormat` | `string` | 'HH:mm:ss' | Time format for X-axis |

#### Series Configuration

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Series name (shown in legend) |
| `yAxisIndex` | `number` | Y-axis index (0=left, 1+=right) |
| `yAxisLabel` | `string` | Label for this Y-axis |
| `lineColor` | `string` | Line color for this series |
| `showArea` | `boolean` | Show filled area under line |
| `yAxisRange` | `[number, number]` | Fixed range for this Y-axis |

### 3. Metric Card

Display key metrics with icons, trends, and calculated indicators.

#### Usage

```typescript
import { MetricCardComponent } from '@angular-bhp-simulator/chart-components';

@Component({
  selector: 'app-demo',
  imports: [MetricCardComponent],
  template: `
    <div class="metrics-grid">
      <lib-metric-card
        icon="speed"
        label="Rate"
        [value]="currentRate"
        unit="bbl/min"
        [trend]="rateTrend"
        [minValue]="5"
        [maxValue]="30">
      </lib-metric-card>
      
      <lib-metric-card
        icon="compress"
        label="Pressure"
        [value]="currentPressure"
        unit="psi"
        iconColor="#ff9800">
      </lib-metric-card>
      
      <lib-metric-card
        icon="analytics"
        label="BHP"
        [value]="calculatedBHP"
        unit="psi"
        [isCalculated]="true"
        [decimals]="2">
      </lib-metric-card>
    </div>
  `,
  styles: [`
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
  `]
})
export class DemoComponent {
  currentRate = 15.5;
  rateTrend = 2.3;
  currentPressure = 5234;
  calculatedBHP = 7891.45;
}
```

#### Metric Card Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `icon` | `string` | 'analytics' | Material icon name |
| `label` | `string` | '' | Metric label |
| `value` | `number \| null` | null | Current value |
| `unit` | `string` | '' | Unit of measurement |
| `trend` | `number \| null` | null | Trend percentage (+/-) |
| `isCalculated` | `boolean` | false | Show calculated badge |
| `iconColor` | `string` | - | Custom icon color |
| `minValue` | `number` | - | Min value for warning |
| `maxValue` | `number` | - | Max value for warning |
| `decimals` | `number` | 1 | Decimal places to display |

## Services

### Chart Theme Service

Manages chart themes and provides ECharts configuration with dark/light mode support.

#### Usage

```typescript
import { ChartThemeService } from '@angular-bhp-simulator/chart-components';

@Component({
  // ...
})
export class AppComponent {
  constructor(private themeService: ChartThemeService) {
    // Subscribe to theme changes
    this.themeService.isDarkMode$.subscribe(isDark => {
      console.log('Theme changed:', isDark ? 'dark' : 'light');
    });
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
  
  setDarkTheme() {
    this.themeService.setTheme(true);
  }
  
  getCurrentTheme() {
    return this.themeService.getCurrentTheme();
  }
  
  getColor(index: number) {
    return this.themeService.getColor(index);
  }
}
```

#### Theme Service Methods

| Method | Description |
|--------|-------------|
| `toggleTheme()` | Toggle between dark and light themes |
| `setTheme(isDark: boolean)` | Set theme explicitly |
| `getCurrentTheme()` | Get current theme configuration |
| `isDarkMode()` | Check if dark mode is active |
| `getBaseChartOption(isDark?)` | Get base ECharts option with theme |
| `applyTheme(option, isDark?)` | Apply theme to chart option |
| `getColor(index, isDark?)` | Get color from palette |
| `getColorPalette(isDark?)` | Get all colors |

## Utilities

### Format Time

```typescript
import { formatTime } from '@angular-bhp-simulator/chart-components';

const formatted = formatTime(Date.now(), 'HH:mm:ss.SSS');
// Output: "14:30:45.123"
```

### LTTB Downsampling

```typescript
import { downsampleLTTB } from '@angular-bhp-simulator/chart-components';

const data: [number, number][] = /* large dataset */;
const downsampled = downsampleLTTB(data, 500);
// Reduces data to 500 points while preserving visual appearance
```

### Circular Buffer

```typescript
import { CircularBuffer } from '@angular-bhp-simulator/chart-components';

const buffer = new CircularBuffer<number>(100);
buffer.push(1);
buffer.push(2);
buffer.push(3);

console.log(buffer.toArray()); // [1, 2, 3]
console.log(buffer.getSize()); // 3
console.log(buffer.at(0)); // 1

buffer.clear();
```

### Debounce

```typescript
import { debounce } from '@angular-bhp-simulator/chart-components';

const debouncedFn = debounce(() => {
  console.log('Called after delay');
}, 300);

debouncedFn(); // Will only execute once after 300ms
debouncedFn();
debouncedFn();
```

## Export Functionality

### Export Chart as Image

```typescript
import { ViewChild } from '@angular/core';
import { RealtimeLineChartComponent } from '@angular-bhp-simulator/chart-components';

@Component({
  // ...
})
export class AppComponent {
  @ViewChild(RealtimeLineChartComponent) chart!: RealtimeLineChartComponent;
  
  exportChart() {
    const dataUrl = this.chart.exportImage({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });
    
    if (dataUrl) {
      // Download or display the image
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = dataUrl;
      link.click();
    }
  }
}
```

### Export Chart Data

```typescript
exportData() {
  const data = this.chart.exportData();
  console.log('Chart data:', data);
  
  // Convert to CSV or other format
  const csv = data.map(([timestamp, value]) => 
    `${new Date(timestamp).toISOString()},${value}`
  ).join('\n');
}
```

## Performance Tips

1. **Use Appropriate Buffer Sizes**: Don't display more data than needed
   - Short-term view: 300 points (5 min @ 1Hz)
   - Medium-term view: 600 points (10 min @ 1Hz)
   - Long-term view: Enable downsampling

2. **Enable Downsampling**: For large datasets
   ```typescript
   config: RealtimeChartConfig = {
     // ...
     maxDataPoints: 300, // Automatically uses LTTB
   };
   ```

3. **Use OnPush Change Detection**: Already enabled in all components

4. **Batch Updates**: Components use circular buffers for efficient updates

5. **Monitor Performance**:
   ```typescript
   // Check buffer size
   console.log('Data size:', chart.getDataSize());
   ```

## Theme Customization

### Using with Angular Material

```typescript
import { Component } from '@angular/core';
import { ChartThemeService } from '@angular-bhp-simulator/chart-components';

@Component({
  // ...
})
export class AppComponent {
  constructor(private chartTheme: ChartThemeService) {
    // Sync with Angular Material theme
    const isDark = document.body.classList.contains('dark-theme');
    this.chartTheme.setTheme(isDark);
  }
}
```

### Custom Theme Colors

The theme service provides predefined color palettes, but you can override colors:

```typescript
chartConfig: RealtimeChartConfig = {
  title: 'Custom Colors',
  yAxisLabel: 'Value',
  lineColor: '#ff0000', // Custom red
  areaColor: 'rgba(255, 0, 0, 0.2)'
};
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Angular 18+
- ECharts 6.0+
- ngx-echarts 21.0+
- Angular Material 18+ (for metric cards)
- RxJS 7.8+

## Testing

All components include comprehensive unit tests:

```bash
# Run tests
nx test chart-components

# Run tests with coverage
nx test chart-components --coverage

# Run specific test file
nx test chart-components --testFile=realtime-line-chart.component.spec.ts
```

## Building the Library

```bash
# Build the library
nx build chart-components

# Build in watch mode
nx build chart-components --watch
```

## Examples

See the demo application for complete examples:
- Basic real-time chart
- Multi-series synchronized charts
- Metric dashboard
- Theme switching
- Export functionality

## API Reference

For detailed API documentation, see the TypeScript interfaces in:
- `lib/models/chart-config.model.ts`
- `lib/services/chart-theme.service.ts`
- Component source files

## License

MIT

## Contributing

See the main project CONTRIBUTING.md for guidelines.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing documentation
- Review code examples in the demo app
