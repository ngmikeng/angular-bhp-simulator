# BHP Calculator Library

A TypeScript library for calculating Bottom Hole Proppant Concentration (BHP) in hydraulic fracturing operations using a backward-looking incremental algorithm.

## Overview

This library implements a sophisticated algorithm that calculates the proppant concentration at the bottom of a wellbore by looking back in time based on the fluid travel time through the wellbore. It's designed for real-time data processing with optimal performance through caching and efficient data structures.

## Features

- **Backward-Looking Algorithm**: Calculates BHP by looking back in time based on flush volume and pump rate
- **Real-Time Streaming**: RxJS integration for reactive data processing
- **Efficient Data Management**: 
  - Sliding window with automatic eviction (default: 2-hour window)
  - O(1) cache lookups for previously calculated values
  - Binary search for historical data point retrieval
- **Configurable**: Runtime configuration for tolerances and window sizes
- **Well-Tested**: 79 unit tests with comprehensive coverage
- **TypeScript**: Full type safety and IDE support

## Quick Start

### Basic Usage

```typescript
import { BHPCalculatorService, ComputationState, DataPoint } from '@angular-bhp-simulator/bhp-calculator';

// Create calculator and state
const calculator = new BHPCalculatorService();
const state = new ComputationState(7200); // 2-hour window

// Set flush volume (wellbore volume in barrels)
state.setFlushVolume(120);

// Add data points
const dataPoint: DataPoint = {
  timestamp: Date.now(),
  rate: 15,        // barrels per minute
  propConc: 2.5,   // pounds per gallon
  pressure: 5000   // PSI (optional)
};

state.addDataPoint(dataPoint);

// Calculate BHP
const result = calculator.calculateBHP(dataPoint.timestamp, state);

console.log('BHP:', result.bhp);
console.log('Details:', result.details);
```

### Streaming Usage

```typescript
import { BHPStreamService } from '@angular-bhp-simulator/bhp-calculator';

// Inject or create service
const streamService = new BHPStreamService();

// Configure
streamService.setFlushVolume(120);

// Subscribe to enhanced data points with BHP
streamService.enhancedDataPoint$.subscribe(enhanced => {
  console.log('BHP:', enhanced.bhp);
  console.log('Details:', enhanced.bhpDetails);
});

// Add data points
streamService.addDataPoint({
  timestamp: Date.now(),
  rate: 15,
  propConc: 2.5
});
```

## Algorithm Explanation

The BHP calculation algorithm works as follows:

1. **Check Cache**: First checks if BHP has already been calculated for this timestamp
2. **Calculate Offset**: Computes the time offset based on flush volume and pump rate:
   ```
   offset (minutes) = flush_volume (barrels) / rate (barrels/minute)
   ```
3. **Look Backward**: Calculates the historical timestamp:
   ```
   historical_timestamp = current_timestamp - offset
   ```
4. **Find Historical Data**: Uses binary search to find the data point closest to the historical timestamp
5. **Extract BHP**: The proppant concentration at the historical point becomes the BHP at the current point
6. **Cache Result**: Stores the result for O(1) future lookups

### Example

If the current time is 10:00 AM, the flush volume is 120 barrels, and the pump rate is 15 bbl/min:

- Offset = 120 / 15 = 8 minutes
- Historical timestamp = 10:00 AM - 8 min = 9:52 AM
- BHP at 10:00 AM = Prop Conc at 9:52 AM

## API Reference

### Services

#### BHPCalculatorService

Core calculation service with synchronous API.

**Methods:**
- `calculateBHP(timestamp: number, state: ComputationState): BHPCalculationResult`
- `updateConfig(config: Partial<BHPCalculationConfig>): void`
- `getConfig(): BHPCalculationConfig`

#### BHPStreamService

RxJS-based streaming service for real-time processing.

**Properties:**
- `enhancedDataPoint$: Observable<EnhancedDataPoint>` - Stream of data points with calculated BHP
- `stateStats$: Observable<StateStats>` - Stream of state statistics
- `flushVolume$: Observable<number>` - Stream of flush volume changes

**Methods:**
- `addDataPoint(point: DataPoint): void`
- `setFlushVolume(volume: number): void`
- `reset(): void`

## Performance

- **Calculation Time**: < 1ms per BHP calculation
- **Cache Hit Rate**: ~95% for typical streaming scenarios
- **Memory Usage**: Constant memory with automatic window eviction
- **Binary Search**: O(log n) historical point lookup

## Testing

Run the test suite:

```bash
nx test bhp-calculator
```

Test coverage: **79 tests** covering all services, models, and utilities.

## License

MIT
