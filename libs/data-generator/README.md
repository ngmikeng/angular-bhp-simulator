# Data Generator Library

A comprehensive Angular library for generating realistic synthetic data streams simulating hydraulic fracturing operations. This library generates Rate, Pressure, and Proppant Concentration values with various realistic patterns.

## Features

- ✅ **6 Realistic Patterns**: Steady, Ramping, Cycling, Realistic, Pump-Stop, Stage-Transition
- ✅ **Seeded Random Generation**: Reproducible data for testing
- ✅ **RxJS Streaming**: Observable-based real-time data generation
- ✅ **Configurable Parameters**: Fully customizable generation parameters
- ✅ **Data Validation**: Built-in validation and sanitization
- ✅ **Speed Control**: Adjustable simulation speed (0.5x to 10x)
- ✅ **Type Safe**: Full TypeScript support

## Installation

```bash
npm install @angular-bhp-simulator/data-generator
```

## Quick Start

```typescript
import { DataGeneratorService } from '@angular-bhp-simulator/data-generator';

@Component({
  selector: 'app-simulation',
  template: `<div>{{ currentData | json }}</div>`
})
export class SimulationComponent implements OnInit {
  currentData: DataPoint | null = null;

  constructor(private dataGenerator: DataGeneratorService) {}

  ngOnInit(): void {
    // Configure generator
    this.dataGenerator.configure({
      pattern: 'realistic',
      samplingRateHz: 1,
      noiseLevel: 0.15,
      seed: 12345
    });

    // Start generating data
    this.dataGenerator.start().subscribe(dataPoint => {
      this.currentData = dataPoint;
      console.log('New data:', dataPoint);
    });
  }

  ngOnDestroy(): void {
    this.dataGenerator.stop();
  }
}
```

## Data Patterns

### 1. Steady Pattern

Constant values with minimal noise - ideal for testing stable conditions.

### 2. Ramping Pattern

Gradual ramp up, plateau, and ramp down cycles - simulates controlled rate changes.

### 3. Cycling Pattern

Sinusoidal periodic variations - simulates oscillating conditions.

### 4. Realistic Pattern (Recommended)

Complex multi-stage simulation with 4 phases:
- **Phase 1**: Rate ramp up (1 minute)
- **Phase 2**: Steady pumping (4 minutes)
- **Phase 3**: Proppant ramping (3 minutes)
- **Phase 4**: Ramp down/flush (2 minutes)

### 5. Pump-Stop Pattern

Includes periodic pump shutdowns with exponential decay.

### 6. Stage-Transition Pattern

Simulates transitions between pumping stages with ramp down/up cycles.

## API Reference

### DataGeneratorService

The main service for generating data streams.

#### Methods

- `configure(config: Partial<GeneratorConfig>): void` - Configure generation parameters
- `start(): Observable<DataPoint>` - Start generating data stream
- `stop(): void` - Stop data generation
- `reset(seed?: number): void` - Reset simulation state
- `setSpeed(multiplier: number): void` - Set simulation speed (0.5x to 10x)
- `getSpeed(): number` - Get current speed multiplier
- `isRunning(): boolean` - Check if generator is running
- `getConfig(): GeneratorConfig` - Get current configuration
- `getElapsedTime(): number` - Get elapsed simulation time in seconds

### GeneratorConfig Interface

```typescript
interface GeneratorConfig {
  samplingRateHz: number;          // Data points per second (0.1-10)
  pattern: DataPattern;             // Generation pattern
  baseRate: number;                 // Base slurry rate (bbl/min)
  rateLimits: [number, number];    // Min/max rate
  basePressure: number;             // Base pressure (psi)
  pressureLimits: [number, number]; // Min/max pressure
  basePropConc: number;             // Base prop conc (ppg)
  propConcLimits: [number, number]; // Min/max prop conc
  noiseLevel: number;               // Noise amplitude (0-1)
  seed?: number;                    // Random seed for reproducibility
}
```

### DataPoint Interface

```typescript
interface DataPoint {
  timestamp: number;   // Unix epoch milliseconds
  rate: number;        // Slurry rate (bbl/min)
  propConc: number;    // Proppant concentration (ppg)
  pressure?: number;   // Pressure (psi)
}
```

## Advanced Usage

### Reproducible Data Generation

Use seeds for reproducible sequences:

```typescript
// Same seed produces same data
dataGenerator.configure({ pattern: 'realistic', seed: 12345 });
```

### Dynamic Pattern Switching

Switch patterns during runtime by stopping and reconfiguring.

### Speed Control During Simulation

```typescript
dataGenerator.setSpeed(2);   // 2x speed
dataGenerator.setSpeed(0.5); // Half speed
```

## Testing

### Unit Testing with Seeds

```typescript
import { TestBed } from '@angular/core/testing';
import { DataGeneratorService } from '@angular-bhp-simulator/data-generator';
import { take } from 'rxjs/operators';

describe('DataGeneratorService', () => {
  let service: DataGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataGeneratorService);
  });

  it('should generate reproducible data with seed', (done) => {
    service.configure({ pattern: 'steady', seed: 12345 });
    
    service.start()
      .pipe(take(10))
      .subscribe({
        complete: () => done()
      });
  });
});
```

## Running unit tests

Run `nx test data-generator` to execute the unit tests.

## License

MIT
