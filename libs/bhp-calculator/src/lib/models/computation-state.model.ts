import { DataPoint } from './data-point.model';

/**
 * Maintains all state needed for incremental BHP calculation.
 * Implements a sliding window pattern for efficient memory management.
 */
export class ComputationState {
  /**
   * Sliding window of data points (2-hour window by default)
   */
  private dataWindow: DataPoint[] = [];

  /**
   * Cache of computed BHP values for O(1) lookups
   * Map<timestamp, bhp_value>
   */
  private bhpCache: Map<number, number> = new Map();

  /**
   * Maximum window size in seconds (default: 7200 = 2 hours)
   */
  private readonly windowSizeSeconds: number;

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
    const cutoffTimestamp = point.timestamp - this.windowSizeSeconds * 1000;

    // Evict old points (keep only points within window)
    while (
      this.dataWindow.length > 0 &&
      this.dataWindow[0].timestamp < cutoffTimestamp
    ) {
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
   * Returns a copy to prevent external modification
   */
  public getDataWindow(): DataPoint[] {
    return [...this.dataWindow];
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
   * Check if cache has BHP for a given timestamp
   */
  public hasCachedBHP(timestamp: number): boolean {
    return this.bhpCache.has(timestamp);
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
    const endTimestamp =
      this.dataWindow.length > 0
        ? this.dataWindow[this.dataWindow.length - 1].timestamp
        : 0;

    return {
      windowSize: this.dataWindow.length,
      cacheSize: this.bhpCache.size,
      windowStartTimestamp: this.windowStartTimestamp,
      windowEndTimestamp: endTimestamp,
      windowDurationMinutes:
        (endTimestamp - this.windowStartTimestamp) / 60000,
    };
  }

  /**
   * Clear all state (useful for reset)
   */
  public clear(): void {
    this.dataWindow = [];
    this.bhpCache.clear();
    this.windowStartTimestamp = 0;
    this.flushVolume = null;
  }

  /**
   * Get the number of data points in the window
   */
  public getWindowSize(): number {
    return this.dataWindow.length;
  }

  /**
   * Get the oldest timestamp in the window
   */
  public getWindowStartTimestamp(): number {
    return this.windowStartTimestamp;
  }

  /**
   * Get the newest timestamp in the window
   */
  public getWindowEndTimestamp(): number {
    return this.dataWindow.length > 0
      ? this.dataWindow[this.dataWindow.length - 1].timestamp
      : 0;
  }
}
