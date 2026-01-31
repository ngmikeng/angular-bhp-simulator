import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { tap, map, shareReplay } from 'rxjs/operators';
import { DataPoint } from '../models/data-point.model';
import { ComputationState } from '../models/computation-state.model';
import { EnhancedDataPoint } from '../models/enhanced-data-point.model';
import { BHPCalculatorService } from './bhp-calculator.service';

/**
 * Service for real-time BHP calculation stream processing
 * Integrates RxJS observables with the BHP calculation algorithm
 */
@Injectable({
  providedIn: 'root',
})
export class BHPStreamService {
  private readonly state = new ComputationState();
  private readonly calculator: BHPCalculatorService;

  // Input stream: raw data points
  private readonly dataPointSubject = new Subject<DataPoint>();
  public readonly dataPoint$ = this.dataPointSubject.asObservable();

  // Configuration stream: offset time in minutes
  private readonly offsetTimeMinutesSubject = new BehaviorSubject<number>(3);
  public readonly offsetTimeMinutes$ = this.offsetTimeMinutesSubject.asObservable();

  // Output stream: enhanced data points with BHP
  public readonly enhancedDataPoint$: Observable<EnhancedDataPoint>;

  // State stream for monitoring
  public readonly stateStats$: Observable<ReturnType<ComputationState['getStats']>>;

  constructor() {
    this.calculator = new BHPCalculatorService();

    // Update offset time in state when it changes
    this.offsetTimeMinutes$.subscribe((minutes) => {
      this.state.setOffsetTimeMinutes(minutes);
    });

    // Process data points and calculate BHP
    this.enhancedDataPoint$ = this.dataPoint$.pipe(
      tap((point) => {
        // Add point to sliding window
        this.state.addDataPoint(point);
      }),
      map((point) => {
        // Calculate BHP for this data point
        const result = this.calculator.calculateBHP(point.timestamp, this.state);

        // Create enhanced data point
        const enhanced: EnhancedDataPoint = {
          ...point,
          bhp: result.bhp,
          bhpDetails: result.details,
        };

        return enhanced;
      }),
      shareReplay(1) // Share the latest value with late subscribers
    );

    // Create state monitoring stream
    this.stateStats$ = this.dataPoint$.pipe(
      map(() => this.state.getStats()),
      shareReplay(1)
    );
  }

  /**
   * Add a data point to the stream
   * This triggers BHP calculation and emits enhanced data point
   *
   * @param point Data point to add
   */
  public addDataPoint(point: DataPoint): void {
    this.dataPointSubject.next(point);
  }

  /**
   * Add multiple data points to the stream
   *
   * @param points Array of data points to add
   */
  public addDataPoints(points: DataPoint[]): void {
    points.forEach((point) => this.addDataPoint(point));
  }

  /**
   * Set the offset time for BHP calculations
   *
   * @param minutes Offset time in minutes
   */
  public setOffsetTimeMinutes(minutes: number): void {
    if (minutes < 0) {
      throw new Error('Offset time must be non-negative');
    }
    this.offsetTimeMinutesSubject.next(minutes);
  }

  /**
   * Get current offset time in minutes
   */
  public getOffsetTimeMinutes(): number {
    return this.offsetTimeMinutesSubject.value;
  }

  /**
   * Reset the computation state
   * Clears all data window and cache
   */
  public reset(): void {
    this.state.clear();
  }

  /**
   * Get current state statistics
   */
  public getStateStats(): ReturnType<ComputationState['getStats']> {
    return this.state.getStats();
  }

  /**
   * Get the computation state (for advanced usage)
   * Returns a copy to prevent external modification
   */
  public getState(): ComputationState {
    // Return a reference to the state for read-only operations
    // Note: The state object itself protects against direct modification
    return this.state;
  }

  /**
   * Calculate BHP for a specific timestamp
   * (synchronous calculation without adding to stream)
   *
   * @param timestamp Timestamp to calculate BHP for
   * @returns BHP calculation result
   */
  public calculateBHPForTimestamp(timestamp: number) {
    return this.calculator.calculateBHP(timestamp, this.state);
  }

  /**
   * Update calculator configuration
   */
  public updateCalculatorConfig(config: Parameters<BHPCalculatorService['updateConfig']>[0]): void {
    this.calculator.updateConfig(config);
  }

  /**
   * Get calculator configuration
   */
  public getCalculatorConfig() {
    return this.calculator.getConfig();
  }
}
