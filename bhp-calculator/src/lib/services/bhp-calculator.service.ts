import { Injectable } from '@angular/core';
import { DataPoint } from '../models/data-point.model';
import { ComputationState } from '../models/computation-state.model';
import { BHPCalculationResult } from '../models/bhp-calculation-result.model';
import { BHPCalculationConfig, DEFAULT_BHP_CONFIG } from '../config/bhp-config.model';

/**
 * Service for calculating Bottom Hole Proppant Concentration (BHP)
 * using the backward-looking incremental algorithm.
 *
 * Algorithm Overview:
 * 1. Check cache for existing value
 * 2. Validate prerequisites (flush volume, sufficient history)
 * 3. Calculate time offset based on flush volume and rate
 * 4. Look backward in time to find historical data point
 * 5. Return historical prop_conc as BHP
 * 6. Cache result for future lookups
 */
@Injectable({
  providedIn: 'root',
})
export class BHPCalculatorService {
  private config: BHPCalculationConfig = { ...DEFAULT_BHP_CONFIG };

  constructor() {}

  /**
   * Calculate BHP for a target timestamp using backward-looking algorithm
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
      details.errorMessage =
        'Insufficient data points in window (need at least 2)';
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
    if (
      offsetMinutes < this.config.minOffsetMinutes ||
      offsetMinutes > this.config.maxOffsetMinutes
    ) {
      details.errorMessage = `Offset out of valid range (${this.config.minOffsetMinutes} - ${this.config.maxOffsetMinutes} min)`;
      return { bhp: 0, details };
    }

    const offsetMilliseconds = offsetMinutes * 60 * 1000;
    details.offsetMilliseconds = offsetMilliseconds;

    // Step 5: Calculate historical timestamp
    const historicalTimestamp = targetTimestamp - offsetMilliseconds;
    details.historicalTimestamp = historicalTimestamp;

    // Step 6: Find closest historical data point
    const historicalPoint = this.findClosestDataPoint(
      historicalTimestamp,
      dataWindow
    );
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
      details.errorMessage = `Historical point too far (${timeDiffSeconds.toFixed(
        1
      )}s > ${this.config.maxTimeDiffSeconds}s)`;
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
   *
   * @param targetTimestamp Target timestamp
   * @param dataWindow Array of data points (sorted by timestamp)
   * @returns Reference rate in bbl/min
   */
  private getReferenceRate(
    targetTimestamp: number,
    dataWindow: DataPoint[]
  ): number {
    if (dataWindow.length === 0) {
      return 0;
    }

    // Try to find exact timestamp match
    const exactMatch = dataWindow.find((p) => p.timestamp === targetTimestamp);
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
   *
   * @param targetTimestamp Target timestamp to search for
   * @param dataWindow Array of data points (sorted by timestamp)
   * @returns Closest data point or null if window is empty
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
