import { Injectable } from '@angular/core';
import { Observable, interval, BehaviorSubject, Subject, NEVER } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import {
  GeneratorConfig,
  DEFAULT_GENERATOR_CONFIG,
  validateGeneratorConfig,
} from '../models/generator-config.model';
import { GeneratorFactory } from '../factories/generator.factory';
import { BaseGenerator } from '../generators/base-generator';
import { validateDataPoint, sanitizeNumber } from '../validators/data-validator';

/**
 * Data point with timestamp (matches bhp-calculator DataPoint interface)
 */
export interface DataPoint {
  timestamp: number;
  rate: number;
  propConc: number;
  pressure?: number;
}

/**
 * Service for generating synthetic data streams
 * Provides configurable patterns with RxJS streaming
 */
@Injectable({
  providedIn: 'root',
})
export class DataGeneratorService {
  private config: GeneratorConfig = { ...DEFAULT_GENERATOR_CONFIG };
  private generator: BaseGenerator;
  private _isRunning$ = new BehaviorSubject<boolean>(false);
  private _speed$ = new BehaviorSubject<number>(1);
  private stop$ = new Subject<void>();
  private simulationStartTime = 0;
  private elapsedSeconds = 0;

  constructor() {
    this.generator = GeneratorFactory.create(this.config.pattern, this.config);
  }

  /**
   * Configure data generation parameters
   * @param config Partial configuration to merge with current config
   * @throws Error if configuration is invalid
   */
  configure(config: Partial<GeneratorConfig>): void {
    // Validate configuration
    const errors = validateGeneratorConfig(config);
    if (errors.length > 0) {
      throw new Error(`Invalid configuration: ${errors.join(', ')}`);
    }

    // Merge with current config
    this.config = { ...this.config, ...config };

    // Recreate generator if pattern changed
    if (config.pattern && config.pattern !== this.generator.getConfig().pattern) {
      this.generator = GeneratorFactory.create(this.config.pattern, this.config);
    } else {
      this.generator.updateConfig(this.config);
    }
  }

  /**
   * Start generating data stream
   * @returns Observable stream of data points
   */
  start(): Observable<DataPoint> {
    if (this._isRunning$.value) {
      console.warn('Generator is already running');
      return NEVER;
    }

    this.simulationStartTime = Date.now();
    this.elapsedSeconds = 0;
    this._isRunning$.next(true);
    this.stop$ = new Subject<void>();

    const intervalMs = 1000 / this.config.samplingRateHz;

    return interval(intervalMs).pipe(
      takeUntil(this.stop$),
      tap(() => {
        this.elapsedSeconds += (intervalMs / 1000) * this._speed$.value;
      }),
      map(() => this.generateDataPoint())
    );
  }

  /**
   * Stop data generation
   */
  stop(): void {
    if (this._isRunning$.value) {
      this.stop$.next();
      this.stop$.complete();
      this._isRunning$.next(false);
    }
  }

  /**
   * Reset simulation state
   * @param seed Optional new random seed
   */
  reset(seed?: number): void {
    this.stop();
    this.elapsedSeconds = 0;
    this.simulationStartTime = 0;
    
    if (seed !== undefined) {
      this.config = { ...this.config, seed };
      this.generator.reset(seed);
    } else {
      this.generator.reset();
    }
  }

  /**
   * Set simulation speed multiplier
   * @param multiplier Speed multiplier (0.5 = half speed, 2 = double speed)
   */
  setSpeed(multiplier: number): void {
    if (multiplier <= 0 || multiplier > 10) {
      throw new Error('Speed multiplier must be between 0 and 10');
    }
    this._speed$.next(multiplier);
  }

  /**
   * Get current speed multiplier
   * @returns Current speed multiplier
   */
  getSpeed(): number {
    return this._speed$.value;
  }

  /**
   * Check if generator is currently running
   * @returns True if running
   */
  isRunning(): boolean {
    return this._isRunning$.value;
  }

  /**
   * Get current configuration
   * @returns Copy of current configuration
   */
  getConfig(): GeneratorConfig {
    return { ...this.config };
  }

  /**
   * Get current elapsed time in seconds
   * @returns Elapsed time since start
   */
  getElapsedTime(): number {
    return this.elapsedSeconds;
  }

  /**
   * Get observable of running state
   * @returns Observable of running state
   */
  getIsRunningObservable(): Observable<boolean> {
    return this._isRunning$.asObservable();
  }

  /**
   * Get observable of speed changes
   * @returns Observable of speed multiplier
   */
  getSpeedObservable(): Observable<number> {
    return this._speed$.asObservable();
  }

  /**
   * Generate a single data point
   * @returns Data point with timestamp
   */
  private generateDataPoint(): DataPoint {
    const timestamp = Date.now();
    const generated = this.generator.generate(this.elapsedSeconds);

    // Validate generated data
    const validation = validateDataPoint(
      generated.rate,
      generated.propConc,
      generated.pressure
    );

    if (!validation.valid) {
      console.warn('Generated invalid data, sanitizing:', validation.errors);
      
      // Sanitize invalid data
      const rate = sanitizeNumber(
        generated.rate,
        this.config.rateLimits[0],
        this.config.rateLimits[1],
        this.config.baseRate
      );
      const propConc = sanitizeNumber(
        generated.propConc,
        this.config.propConcLimits[0],
        this.config.propConcLimits[1],
        this.config.basePropConc
      );
      const pressure = sanitizeNumber(
        generated.pressure,
        this.config.pressureLimits[0],
        this.config.pressureLimits[1],
        this.config.basePressure
      );

      return { timestamp, rate, propConc, pressure };
    }

    return {
      timestamp,
      rate: generated.rate,
      propConc: generated.propConc,
      pressure: generated.pressure,
    };
  }
}
