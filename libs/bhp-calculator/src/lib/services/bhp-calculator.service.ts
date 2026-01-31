import { Injectable } from '@angular/core';
import { DataPoint } from '../models/data-point.model';
import { ComputationState } from '../models/computation-state.model';
import { BHPCalculationResult } from '../models/bhp-calculation-result.model';
import { BHPCalculationConfig, DEFAULT_BHP_CONFIG } from '../config/bhp-config.model';

/**
 * Service for calculating Bottom Hole Proppant Concentration (BHP)
 * using a simple time-shifted approach.
 *
 * Algorithm Overview:
 * BHP at time T = PropConc at time (T - offsetTime)
 * where offsetTime = flushVolume / rate (in minutes)
 *
 * This creates a delayed version of the PropConc signal,
 * representing the time it takes for proppant to travel
 * from surface to bottom hole.
 */
@Injectable({
  providedIn: 'root',
})
export class BHPCalculatorService {
  private config: BHPCalculationConfig = { ...DEFAULT_BHP_CONFIG };

  constructor() {}

  /**
   * Calculate BHP for a target timestamp using simple time-shift approach
   * BHP = PropConc shifted by offset time (user-defined in minutes)
   *
   * @param targetTimestamp - Timestamp to calculate BHP for
   * @param state - Computation state containing data window
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

    // Get offset time in minutes (directly from user input)
    const offsetMinutes = state.getOffsetTimeMinutes();
    if (offsetMinutes === null || offsetMinutes < 0) {
      details.errorMessage = 'Offset time not set or invalid';
      return { bhp: null, details };
    }

    const dataWindow = state.getDataWindow();
    if (dataWindow.length === 0) {
      details.errorMessage = 'No data points in window';
      return { bhp: null, details };
    }

    // Use offset time directly (no calculation from flush volume / rate)
    details.offsetMinutes = offsetMinutes;

    const offsetMilliseconds = offsetMinutes * 60 * 1000;
    details.offsetMilliseconds = offsetMilliseconds;

    // Calculate historical timestamp
    const historicalTimestamp = targetTimestamp - offsetMilliseconds;
    details.historicalTimestamp = historicalTimestamp;

    // Find closest data point to the historical timestamp
    const historicalPoint = this.findClosestDataPoint(historicalTimestamp, dataWindow);
    details.historicalPoint = historicalPoint;

    if (historicalPoint === null) {
      // Not enough history yet - return null (waiting for data to accumulate)
      details.errorMessage = 'Waiting for data history (offset time not yet reached)';
      return { bhp: null, details };
    }

    // Calculate time difference for diagnostics
    const timeDiffMs = Math.abs(historicalPoint.timestamp - historicalTimestamp);
    const timeDiffSeconds = timeDiffMs / 1000;
    details.timeDifferenceSeconds = timeDiffSeconds;

    // BHP = PropConc from the historical point (simple time shift)
    const bhp = historicalPoint.propConc;

    return { bhp, details };
  }

  /**
   * Find closest data point to a target timestamp in the window
   *
   * @param targetTimestamp Target timestamp to search for
   * @param dataWindow Array of data points (sorted by timestamp)
   * @param toleranceMs Maximum allowed time difference in milliseconds (default: 60000ms = 1 minute)
   * @returns Closest data point within tolerance, or null if none found
   */
  private findClosestDataPoint(
    targetTimestamp: number,
    dataWindow: DataPoint[],
    toleranceMs: number = 60000
  ): DataPoint | null {
    if (dataWindow.length === 0) {
      return null;
    }

    let closest: DataPoint | null = null;
    let minDiff = Number.MAX_SAFE_INTEGER;

    for (const point of dataWindow) {
      const diff = Math.abs(point.timestamp - targetTimestamp);

      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }

    // Only return if within tolerance
    if (minDiff <= toleranceMs) {
      return closest;
    } else {
      return null;
    }
  }

  /**
   * Update configuration
   * @param config Partial configuration to update
   */
  public updateConfig(config: Partial<BHPCalculationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): BHPCalculationConfig {
    return { ...this.config };
  }

  /**
   * Set complete configuration
   * @param config Complete configuration
   */
  public setConfig(config: BHPCalculationConfig): void {
    this.config = { ...config };
  }

  /**
   * Reset configuration to defaults
   */
  public resetConfig(): void {
    this.config = { ...DEFAULT_BHP_CONFIG };
  }
}
