# API Reference

> 📝 **Note**: This document will be populated as libraries are implemented. See implementation plans for details.

## Overview

This document provides API reference for all three libraries in the Angular BHP Real-Time Simulator.

---

## @angular-bhp-simulator/bhp-calculator

### Interfaces

#### `BhpDataPoint`
```typescript
interface BhpDataPoint {
  timestamp: number;
  flowRate: number;
  pressure: number;
  // Additional fields TBD
}
```

#### `BhpResult`
```typescript
interface BhpResult {
  timestamp: number;
  bhp: number;
  confidence: number;
  // Additional fields TBD
}
```

### Services

#### `BhpCalculatorService`

**Purpose**: Main service for BHP calculations

```typescript
class BhpCalculatorService {
  calculate(data: BhpDataPoint[]): BhpResult;
  calculateStream(data$: Observable<BhpDataPoint>): Observable<BhpResult>;
}
```

---

## @angular-bhp-simulator/data-generator

### Enums

#### `DataPattern`
```typescript
enum DataPattern {
  STEADY = 'steady',
  RAMPING = 'ramping',
  CYCLING = 'cycling',
  REALISTIC = 'realistic',
  PUMP_STOP = 'pump-stop',
  STAGE_TRANSITION = 'stage-transition'
}
```

### Interfaces

#### `GeneratorConfig`
```typescript
interface GeneratorConfig {
  pattern: DataPattern;
  interval: number;
  seed?: number;
  // Additional configuration TBD
}
```

### Services

#### `DataGeneratorService`

**Purpose**: Generate synthetic data streams

```typescript
class DataGeneratorService {
  generate(config: GeneratorConfig): Observable<BhpDataPoint>;
  stop(): void;
}
```

---

## @angular-bhp-simulator/chart-components

### Components

#### `RealtimeLineChartComponent`

**Purpose**: Real-time line chart visualization

```typescript
@Component({
  selector: 'bhp-realtime-line-chart',
  // ...
})
class RealtimeLineChartComponent {
  @Input() data$: Observable<ChartDataPoint>;
  @Input() options: ChartOptions;
  @Input() theme: 'light' | 'dark';
}
```

#### `MultiSeriesChartComponent`

**Purpose**: Multi-series chart visualization

```typescript
@Component({
  selector: 'bhp-multi-series-chart',
  // ...
})
class MultiSeriesChartComponent {
  @Input() series$: Observable<ChartSeries[]>;
  @Input() options: ChartOptions;
}
```

#### `MetricCardComponent`

**Purpose**: Display key metrics

```typescript
@Component({
  selector: 'bhp-metric-card',
  // ...
})
class MetricCardComponent {
  @Input() title: string;
  @Input() value: number | string;
  @Input() unit?: string;
  @Input() trend?: 'up' | 'down' | 'stable';
}
```

---

## Usage Examples

### Basic BHP Calculation

```typescript
import { BhpCalculatorService } from '@angular-bhp-simulator/bhp-calculator';

// TODO: Add example when implemented
```

### Data Generation

```typescript
import { DataGeneratorService, DataPattern } from '@angular-bhp-simulator/data-generator';

// TODO: Add example when implemented
```

### Chart Visualization

```typescript
import { RealtimeLineChartComponent } from '@angular-bhp-simulator/chart-components';

// TODO: Add example when implemented
```

---

## Type Definitions

Full TypeScript definitions are available in each library's `index.ts` export file.

---

**Note**: This API reference will be expanded as implementation progresses. For the latest API details, refer to the source code and inline documentation.
