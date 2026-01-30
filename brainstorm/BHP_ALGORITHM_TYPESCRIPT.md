# BHP Algorithm - TypeScript Implementation Guide

## Overview

This document provides detailed guidance for implementing the backward-looking incremental BHP calculation algorithm in TypeScript for the Angular application. The implementation closely mirrors the Rust version while leveraging TypeScript/JavaScript idioms and browser capabilities.

## Core Data Structures

### DataPoint Interface

```typescript
/**
 * Represents a single timestamped measurement from the surface.
 * This is the fundamental data unit for BHP calculation.
 */
export interface DataPoint {
  /**
   * Unix epoch timestamp in milliseconds
   * @example 1705227045123 (2026-01-14 10:30:45.123 UTC)
   */
  timestamp: number;
  
  /**
   * Slurry pump rate in barrels per minute
   * @range 0.0 - 100.0
   */
  rate: number;
  
  /**
   * Proppant concentration in pounds per gallon
   * @range 0.0 - 20.0
   */
  propConc: number;
  
  /**
   * Pressure in PSI (optional, for visualization)
   * @range 0 - 10000
   */
  pressure?: number;
}
```

### ComputationState Class

```typescript
/**
 * Maintains all state needed for incremental BHP calculation.
 * Uses circular buffer pattern for efficient memory management.
 */
export class ComputationState {
  /**
   * Sliding window of data points (2-hour window by default)
   * Using native Array for simplicity, could use circular-buffer library for optimization
   */
  private dataWindow: DataPoint[] = [];
  
  /**
   * Cache of computed BHP values for O(1) lookups
   * Map<timestamp, bhp_value>
   */
  private bhpCache: Map<number, number> = new Map();
  
  /**
   * Maximum window size (default: 7200 data points = 2 hours at 1/sec)
   */
  private readonly windowSizeSeconds: number = 7200;
  
  /**
   * Flush volume in barrels
   * This is the volume of fluid in the wellbore
   */
  private flushVolume: number | null = null;
  
  /**
   * Window start timestamp (oldest point in window)
   */
  private windowStartTimestamp: number = 0;
  
  constructor(windowSizeSeconds: number = 7200) {
    this.windowSizeSeconds = windowSizeSeconds;
  }
  
  /**
   * Add a new data point to the sliding window
   * Automatically evicts old points outside the window
   */
  public addDataPoint(point: DataPoint): void {
    // Add new point
    this.dataWindow.push(point);
    
    // Calculate window cutoff timestamp
    const cutoffTimestamp = point.timestamp - (this.windowSizeSeconds * 1000);
    
    // Evict old points (keep only points within window)
    while (this.dataWindow.length > 0 && this.dataWindow[0].timestamp < cutoffTimestamp) {
      const removedPoint = this.dataWindow.shift();
      // Also remove from cache to free memory
      if (removedPoint) {
        this.bhpCache.delete(removedPoint.timestamp);
      }
    }
    
    // Update window start timestamp
    if (this.dataWindow.length > 0) {
      this.windowStartTimestamp = this.dataWindow[0].timestamp;
    }
  }
  
  /**
   * Set flush volume for BHP calculations
   */
  public setFlushVolume(volume: number): void {
    this.flushVolume = volume;
  }
  
  /**
   * Get current flush volume
   */
  public getFlushVolume(): number | null {
    return this.flushVolume;
  }
  
  /**
   * Get all data points in the window
   */
  public getDataWindow(): DataPoint[] {
    return [...this.dataWindow]; // Return copy to prevent external modification
  }
  
  /**
   * Get BHP from cache
   */
  public getCachedBHP(timestamp: number): number | null {
    return this.bhpCache.get(timestamp) ?? null;
  }
  
  /**
   * Store BHP in cache
   */
  public cacheBHP(timestamp: number, bhp: number): void {
    this.bhpCache.set(timestamp, bhp);
  }
  
  /**
   * Get window statistics for debugging/monitoring
   */
  public getStats(): {
    windowSize: number;
    cacheSize: number;
    windowStartTimestamp: number;
    windowEndTimestamp: number;
    windowDurationMinutes: number;
  } {
    const endTimestamp = this.dataWindow.length > 0 
      ? this.dataWindow[this.dataWindow.length - 1].timestamp 
      : 0;
    
    return {
      windowSize: this.dataWindow.length,
      cacheSize: this.bhpCache.size,
      windowStartTimestamp: this.windowStartTimestamp,
      windowEndTimestamp: endTimestamp,
      windowDurationMinutes: (endTimestamp - this.windowStartTimestamp) / 60000,
    };
  }
  
  /**
   * Clear all state (useful for reset)
   */
  public clear(): void {
    this.dataWindow = [];
    this.bhpCache.clear();
    this.windowStartTimestamp = 0;
  }
}
```

## Core Algorithm Implementation

### BHPCalculator Service

```typescript
import { Injectable } from '@angular/core';

/**
 * Configuration for BHP calculation
 */
export interface BHPCalculationConfig {
  /**
   * Maximum time difference tolerance for finding historical point (seconds)
   * Default: 60 seconds
   */
  maxTimeDiffSeconds: number;
  
  /**
   * Maximum valid offset in minutes
   * Default: 120 minutes (2 hours)
   */
  maxOffsetMinutes: number;
  
  /**
   * Minimum valid offset in minutes
   * Default: 0.1 minutes (6 seconds)
   */
  minOffsetMinutes: number;
}

/**
 * Result of BHP calculation with diagnostic information
 */
export interface BHPCalculationResult {
  /**
   * Calculated BHP value, or null if calculation failed
   */
  bhp: number | null;
  
  /**
   * Detailed calculation information for display/debugging
   */
  details: {
    timestamp: number;
    offsetMinutes: number;
    offsetMilliseconds: number;
    historicalTimestamp: number;
    historicalPoint: DataPoint | null;
    timeDifferenceSeconds: number;
    referenceRate: number;
    fromCache: boolean;
    errorMessage?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BHPCalculatorService {
  private readonly config: BHPCalculationConfig = {
    maxTimeDiffSeconds: 60,
    maxOffsetMinutes: 120,
    minOffsetMinutes: 0.1,
  };
  
  constructor() {}
  
  /**
   * Calculate BHP for a target timestamp using backward-looking algorithm
   * 
   * Algorithm:
   * 1. Check cache for existing value
   * 2. Validate prerequisites (flush volume, sufficient history)
   * 3. Calculate time offset based on flush volume and rate
   * 4. Look backward in time to find historical data point
   * 5. Return historical prop_conc as BHP
   * 6. Cache result for future lookups
   * 
   * @param targetTimestamp - Timestamp to calculate BHP for
   * @param state - Computation state containing data window and cache
   * @returns BHP calculation result with diagnostic information
   */
  public calculateBHP(
    targetTimestamp: number,
    state: ComputationState
  ): BHPCalculationResult {
    const details: BHPCalculationResult['details'] = {
      timestamp: targetTimestamp,
      offsetMinutes: 0,
      offsetMilliseconds: 0,
      historicalTimestamp: 0,
      historicalPoint: null,
      timeDifferenceSeconds: 0,
      referenceRate: 0,
      fromCache: false,
    };
    
    // Step 1: Check cache
    const cachedBHP = state.getCachedBHP(targetTimestamp);
    if (cachedBHP !== null) {
      details.fromCache = true;
      return { bhp: cachedBHP, details };
    }
    
    // Step 2: Validate prerequisites
    const flushVolume = state.getFlushVolume();
    if (flushVolume === null || flushVolume <= 0) {
      details.errorMessage = 'Flush volume not set or invalid';
      return { bhp: null, details };
    }
    
    const dataWindow = state.getDataWindow();
    if (dataWindow.length < 2) {
      details.errorMessage = 'Insufficient data points in window (need at least 2)';
      return { bhp: null, details };
    }
    
    // Step 3: Get reference rate (from target timestamp or most recent)
    const referenceRate = this.getReferenceRate(targetTimestamp, dataWindow);
    details.referenceRate = referenceRate;
    
    if (referenceRate <= 0 || !isFinite(referenceRate)) {
      details.errorMessage = 'Invalid reference rate (must be > 0)';
      return { bhp: 0, details }; // Return 0 for zero rate (pump stopped)
    }
    
    // Step 4: Calculate offset
    const offsetMinutes = flushVolume / referenceRate;
    details.offsetMinutes = offsetMinutes;
    
    // Validate offset range
    if (offsetMinutes < this.config.minOffsetMinutes || offsetMinutes > this.config.maxOffsetMinutes) {
      details.errorMessage = `Offset out of valid range (${this.config.minOffsetMinutes} - ${this.config.maxOffsetMinutes} min)`;
      return { bhp: 0, details };
    }
    
    const offsetMilliseconds = offsetMinutes * 60 * 1000;
    details.offsetMilliseconds = offsetMilliseconds;
    
    // Step 5: Calculate historical timestamp
    const historicalTimestamp = targetTimestamp - offsetMilliseconds;
    details.historicalTimestamp = historicalTimestamp;
    
    // Step 6: Find closest historical data point
    const historicalPoint = this.findClosestDataPoint(historicalTimestamp, dataWindow);
    details.historicalPoint = historicalPoint;
    
    if (historicalPoint === null) {
      details.errorMessage = 'No historical data point found in window';
      return { bhp: null, details };
    }
    
    // Calculate time difference
    const timeDiffMs = Math.abs(historicalPoint.timestamp - historicalTimestamp);
    const timeDiffSeconds = timeDiffMs / 1000;
    details.timeDifferenceSeconds = timeDiffSeconds;
    
    // Step 7: Check tolerance
    if (timeDiffSeconds > this.config.maxTimeDiffSeconds) {
      details.errorMessage = `Historical point too far (${timeDiffSeconds.toFixed(1)}s > ${this.config.maxTimeDiffSeconds}s)`;
      return { bhp: null, details };
    }
    
    // Step 8: Extract BHP value (historical prop_conc)
    const bhp = historicalPoint.propConc;
    
    // Step 9: Cache result
    state.cacheBHP(targetTimestamp, bhp);
    
    return { bhp, details };
  }
  
  /**
   * Get reference rate for a target timestamp
   * Prefers rate at target timestamp, falls back to most recent
   */
  private getReferenceRate(targetTimestamp: number, dataWindow: DataPoint[]): number {
    if (dataWindow.length === 0) {
      return 0;
    }
    
    // Try to find exact timestamp match
    const exactMatch = dataWindow.find(p => p.timestamp === targetTimestamp);
    if (exactMatch) {
      return exactMatch.rate;
    }
    
    // Find closest point at or before target timestamp
    let closest: DataPoint | null = null;
    for (const point of dataWindow) {
      if (point.timestamp <= targetTimestamp) {
        closest = point;
      } else {
        break; // Window is sorted by timestamp
      }
    }
    
    // Fall back to most recent point if no point before target
    return closest ? closest.rate : dataWindow[dataWindow.length - 1].rate;
  }
  
  /**
   * Find closest data point to a target timestamp in the window
   * Uses binary search for O(log n) complexity
   */
  private findClosestDataPoint(
    targetTimestamp: number,
    dataWindow: DataPoint[]
  ): DataPoint | null {
    if (dataWindow.length === 0) {
      return null;
    }
    
    // Binary search to find insertion point
    let left = 0;
    let right = dataWindow.length - 1;
    
    // Check bounds
    if (targetTimestamp <= dataWindow[left].timestamp) {
      return dataWindow[left];
    }
    if (targetTimestamp >= dataWindow[right].timestamp) {
      return dataWindow[right];
    }
    
    // Binary search
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midPoint = dataWindow[mid];
      
      if (midPoint.timestamp === targetTimestamp) {
        return midPoint; // Exact match
      }
      
      if (midPoint.timestamp < targetTimestamp) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    // At this point, right < left
    // right points to largest element < target
    // left points to smallest element > target
    // Choose the closest one
    
    if (right < 0) {
      return dataWindow[left];
    }
    if (left >= dataWindow.length) {
      return dataWindow[right];
    }
    
    const leftDiff = Math.abs(dataWindow[left].timestamp - targetTimestamp);
    const rightDiff = Math.abs(dataWindow[right].timestamp - targetTimestamp);
    
    return leftDiff < rightDiff ? dataWindow[left] : dataWindow[right];
  }
  
  /**
   * Update configuration
   */
  public updateConfig(config: Partial<BHPCalculationConfig>): void {
    Object.assign(this.config, config);
  }
  
  /**
   * Get current configuration
   */
  public getConfig(): BHPCalculationConfig {
    return { ...this.config };
  }
}
```

## RxJS Integration for Real-Time Streams

### BHP Calculation Stream Service

```typescript
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, combineLatest, interval } from 'rxjs';
import { map, scan, shareReplay, filter, tap } from 'rxjs/operators';

/**
 * Enhanced data point with BHP calculation
 */
export interface EnhancedDataPoint extends DataPoint {
  bhp: number | null;
  bhpDetails: BHPCalculationResult['details'];
}

@Injectable({
  providedIn: 'root'
})
export class BHPStreamService {
  private readonly state = new ComputationState();
  private readonly calculator = new BHPCalculatorService();
  
  // Input stream: raw data points
  private readonly dataPointSubject = new Subject<DataPoint>();
  public readonly dataPoint$ = this.dataPointSubject.asObservable();
  
  // Configuration stream
  private readonly flushVolumeSubject = new BehaviorSubject<number>(120);
  public readonly flushVolume$ = this.flushVolumeSubject.asObservable();
  
  // Output stream: enhanced data points with BHP
  public readonly enhancedDataPoint$: Observable<EnhancedDataPoint>;
  
  // State stream for monitoring
  public readonly stateStats$: Observable<ReturnType<ComputationState['getStats']>>;
  
  constructor() {
    // Update flush volume in state when it changes
    this.flushVolume$.subscribe(volume => {
      this.state.setFlushVolume(volume);
    });
    
    // Process data points and calculate BHP
    this.enhancedDataPoint$ = this.dataPoint$.pipe(
      tap(point => {
        // Add point to sliding window
        this.state.addDataPoint(point);
      }),
      map(point => {
        // Calculate BHP for this point
        const result = this.calculator.calculateBHP(point.timestamp, this.state);
        
        return {
          ...point,
          bhp: result.bhp,
          bhpDetails: result.details,
        };
      }),
      shareReplay(1) // Share result with multiple subscribers
    );
    
    // Emit state stats every second for monitoring
    this.stateStats$ = interval(1000).pipe(
      map(() => this.state.getStats()),
      shareReplay(1)
    );
  }
  
  /**
   * Add a new data point to the stream
   */
  public addDataPoint(point: DataPoint): void {
    this.dataPointSubject.next(point);
  }
  
  /**
   * Update flush volume
   */
  public setFlushVolume(volume: number): void {
    this.flushVolumeSubject.next(volume);
  }
  
  /**
   * Reset all state
   */
  public reset(): void {
    this.state.clear();
  }
  
  /**
   * Get current state (for debugging)
   */
  public getCurrentState(): ComputationState {
    return this.state;
  }
}
```

## Usage Example in Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-bhp-simulation',
  template: `
    <div class="simulation-container">
      <h2>BHP Real-Time Simulation</h2>
      
      <div class="controls">
        <button (click)="startSimulation()">Start</button>
        <button (click)="stopSimulation()">Stop</button>
        <button (click)="reset()">Reset</button>
        
        <label>
          Flush Volume (barrels):
          <input type="number" 
                 [(ngModel)]="flushVolume" 
                 (change)="updateFlushVolume()" />
        </label>
      </div>
      
      <div class="stats" *ngIf="currentData">
        <div class="stat">
          <label>Current Time:</label>
          <span>{{ currentData.timestamp | date:'HH:mm:ss' }}</span>
        </div>
        <div class="stat">
          <label>Rate:</label>
          <span>{{ currentData.rate | number:'1.1-1' }} bbl/min</span>
        </div>
        <div class="stat">
          <label>Prop Conc:</label>
          <span>{{ currentData.propConc | number:'1.1-1' }} ppg</span>
        </div>
        <div class="stat">
          <label>BHP:</label>
          <span class="bhp-value">
            {{ currentData.bhp !== null ? (currentData.bhp | number:'1.1-1') : 'N/A' }} ppg
          </span>
        </div>
        <div class="stat" *ngIf="currentData.bhpDetails.fromCache">
          <span class="badge">From Cache</span>
        </div>
      </div>
      
      <div class="calculation-details" *ngIf="currentData?.bhpDetails">
        <h3>Calculation Details</h3>
        <dl>
          <dt>Offset:</dt>
          <dd>{{ currentData.bhpDetails.offsetMinutes | number:'1.2-2' }} minutes</dd>
          
          <dt>Historical Timestamp:</dt>
          <dd>{{ currentData.bhpDetails.historicalTimestamp | date:'HH:mm:ss' }}</dd>
          
          <dt>Time Difference:</dt>
          <dd>{{ currentData.bhpDetails.timeDifferenceSeconds | number:'1.1-1' }} seconds</dd>
          
          <dt>Reference Rate:</dt>
          <dd>{{ currentData.bhpDetails.referenceRate | number:'1.1-1' }} bbl/min</dd>
          
          <dt *ngIf="currentData.bhpDetails.errorMessage">Error:</dt>
          <dd *ngIf="currentData.bhpDetails.errorMessage" class="error">
            {{ currentData.bhpDetails.errorMessage }}
          </dd>
        </dl>
      </div>
      
      <app-realtime-chart 
        [dataPoints]="dataHistory"
        [chartType]="'multi-series'">
      </app-realtime-chart>
    </div>
  `
})
export class BHPSimulationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  flushVolume = 120;
  currentData: EnhancedDataPoint | null = null;
  dataHistory: EnhancedDataPoint[] = [];
  
  private simulationStartTime = Date.now();
  private simulationInterval: any;
  
  constructor(
    private bhpStreamService: BHPStreamService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to enhanced data stream
    this.bhpStreamService.enhancedDataPoint$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.currentData = data;
        this.dataHistory.push(data);
        
        // Keep only last 10 minutes (600 points at 1/sec)
        if (this.dataHistory.length > 600) {
          this.dataHistory.shift();
        }
      });
  }
  
  ngOnDestroy(): void {
    this.stopSimulation();
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  startSimulation(): void {
    if (this.simulationInterval) {
      return; // Already running
    }
    
    this.simulationStartTime = Date.now();
    
    // Generate data point every second
    this.simulationInterval = setInterval(() => {
      const timestamp = Date.now();
      const elapsedSeconds = (timestamp - this.simulationStartTime) / 1000;
      
      // Generate synthetic data
      const point: DataPoint = {
        timestamp,
        rate: this.generateRate(elapsedSeconds),
        propConc: this.generatePropConc(elapsedSeconds),
        pressure: this.generatePressure(elapsedSeconds),
      };
      
      this.bhpStreamService.addDataPoint(point);
    }, 1000);
  }
  
  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
  
  reset(): void {
    this.stopSimulation();
    this.bhpStreamService.reset();
    this.currentData = null;
    this.dataHistory = [];
    this.simulationStartTime = Date.now();
  }
  
  updateFlushVolume(): void {
    this.bhpStreamService.setFlushVolume(this.flushVolume);
  }
  
  // Synthetic data generation methods
  private generateRate(elapsedSeconds: number): number {
    // Sine wave with some noise: 10-25 bbl/min
    const base = 17.5;
    const amplitude = 7.5;
    const period = 120; // 2 minute cycle
    const noise = (Math.random() - 0.5) * 2;
    
    return base + amplitude * Math.sin(2 * Math.PI * elapsedSeconds / period) + noise;
  }
  
  private generatePropConc(elapsedSeconds: number): number {
    // Ramp up pattern with plateaus
    const phase = (elapsedSeconds % 300) / 300; // 5 minute cycle
    
    if (phase < 0.2) {
      // Ramp up: 0 to 10
      return (phase / 0.2) * 10;
    } else if (phase < 0.7) {
      // Plateau: 10
      return 10 + (Math.random() - 0.5) * 0.5;
    } else {
      // Ramp down: 10 to 0
      return ((1 - phase) / 0.3) * 10;
    }
  }
  
  private generatePressure(elapsedSeconds: number): number {
    // Pressure correlates with rate
    const rate = this.generateRate(elapsedSeconds);
    const basePressure = 3000;
    const rateMultiplier = 200;
    const noise = (Math.random() - 0.5) * 100;
    
    return basePressure + rate * rateMultiplier + noise;
  }
}
```

## Performance Optimizations

### 1. Circular Buffer Implementation

For better performance with large datasets, consider using a circular buffer:

```typescript
/**
 * Efficient circular buffer for fixed-size data window
 */
export class CircularBuffer<T> {
  private buffer: T[];
  private head = 0;
  private tail = 0;
  private size = 0;
  
  constructor(private readonly capacity: number) {
    this.buffer = new Array(capacity);
  }
  
  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    
    if (this.size < this.capacity) {
      this.size++;
    } else {
      // Overwrite oldest element
      this.head = (this.head + 1) % this.capacity;
    }
  }
  
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity]);
    }
    return result;
  }
  
  get length(): number {
    return this.size;
  }
  
  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
}
```

### 2. Web Worker for Heavy Calculations

For very high-frequency data (>10 Hz), consider offloading calculations to a Web Worker:

```typescript
// bhp-calculator.worker.ts
import { calculateBHP } from './bhp-calculator';

addEventListener('message', ({ data }) => {
  const { type, payload } = data;
  
  if (type === 'CALCULATE_BHP') {
    const result = calculateBHP(payload.timestamp, payload.dataWindow, payload.flushVolume);
    postMessage({ type: 'BHP_RESULT', payload: result });
  }
});
```

### 3. Memoization for Repeated Calculations

```typescript
/**
 * Memoized calculation for frequently accessed values
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Clear cache if it gets too large
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('BHPCalculatorService', () => {
  let service: BHPCalculatorService;
  let state: ComputationState;
  
  beforeEach(() => {
    service = new BHPCalculatorService();
    state = new ComputationState();
    state.setFlushVolume(120);
  });
  
  it('should return null when flush volume is not set', () => {
    state.setFlushVolume(null!);
    const result = service.calculateBHP(1000, state);
    expect(result.bhp).toBeNull();
    expect(result.details.errorMessage).toContain('Flush volume');
  });
  
  it('should return null with insufficient data points', () => {
    state.addDataPoint({ timestamp: 1000, rate: 10, propConc: 2.0 });
    const result = service.calculateBHP(1000, state);
    expect(result.bhp).toBeNull();
  });
  
  it('should calculate BHP correctly with backward-looking algorithm', () => {
    // Add historical data
    for (let i = 0; i < 10; i++) {
      state.addDataPoint({
        timestamp: 1000 + i * 60000, // Every minute
        rate: 20,
        propConc: 2.0 + i * 0.5,
      });
    }
    
    // Calculate BHP for timestamp 7000 (7 minutes)
    // offset = 120 / 20 = 6 minutes = 360000 ms
    // historical = 7000 - 360000 = 1000 (1 minute)
    // Expected BHP = prop_conc at 1 minute = 2.0
    
    const result = service.calculateBHP(7000 * 60000, state);
    expect(result.bhp).toBeCloseTo(2.0, 1);
  });
  
  it('should use cache for repeated calculations', () => {
    // Setup data
    for (let i = 0; i < 10; i++) {
      state.addDataPoint({
        timestamp: 1000 + i * 60000,
        rate: 20,
        propConc: 2.0,
      });
    }
    
    // First calculation
    const result1 = service.calculateBHP(7000 * 60000, state);
    expect(result1.details.fromCache).toBe(false);
    
    // Second calculation (should be cached)
    const result2 = service.calculateBHP(7000 * 60000, state);
    expect(result2.details.fromCache).toBe(true);
    expect(result2.bhp).toBe(result1.bhp);
  });
});
```

## Conclusion

This TypeScript implementation provides a robust, performant, and well-documented port of the Rust BHP calculation algorithm for use in Angular applications. The implementation leverages TypeScript's type system, RxJS for reactive streams, and Angular's dependency injection for clean architecture.

Key features:
- ✅ Faithful port of backward-looking algorithm
- ✅ O(1) cache lookups
- ✅ O(log n) binary search for historical points
- ✅ Memory-efficient sliding window
- ✅ RxJS integration for real-time streams
- ✅ Comprehensive error handling and diagnostics
- ✅ Full TypeScript type safety
- ✅ Extensive documentation and examples
- ✅ Ready for unit and integration testing
