import { DataPoint } from '../models/data-point.model';

/**
 * Utility class for managing a sliding window of data points
 * Automatically evicts old data based on time-based or size-based constraints
 */
export class SlidingWindowUtil {
  private window: DataPoint[] = [];
  private readonly maxWindowSizeSeconds: number;

  /**
   * @param maxWindowSizeSeconds Maximum window duration in seconds (default: 7200 = 2 hours)
   */
  constructor(maxWindowSizeSeconds: number = 7200) {
    this.maxWindowSizeSeconds = maxWindowSizeSeconds;
  }

  /**
   * Add a data point to the window
   * Automatically evicts old points outside the time window
   * @param point Data point to add
   */
  public add(point: DataPoint): void {
    this.window.push(point);
    this.evictOldData(point.timestamp);
  }

  /**
   * Remove old data points outside the time window
   * @param currentTimestamp Reference timestamp for eviction
   */
  private evictOldData(currentTimestamp: number): void {
    const cutoffTimestamp = currentTimestamp - this.maxWindowSizeSeconds * 1000;

    while (this.window.length > 0 && this.window[0].timestamp < cutoffTimestamp) {
      this.window.shift();
    }
  }

  /**
   * Get all data points in the window
   * Returns a copy to prevent external modification
   */
  public getAll(): DataPoint[] {
    return [...this.window];
  }

  /**
   * Get the number of data points in the window
   */
  public size(): number {
    return this.window.length;
  }

  /**
   * Get the oldest data point in the window
   */
  public getOldest(): DataPoint | null {
    return this.window.length > 0 ? this.window[0] : null;
  }

  /**
   * Get the newest data point in the window
   */
  public getNewest(): DataPoint | null {
    return this.window.length > 0 ? this.window[this.window.length - 1] : null;
  }

  /**
   * Find the data point closest to a given timestamp
   * Uses binary search for O(log n) performance
   * @param targetTimestamp Target timestamp to search for
   * @returns Closest data point and time difference in milliseconds
   */
  public findClosest(targetTimestamp: number): {
    point: DataPoint | null;
    timeDiffMs: number;
  } {
    if (this.window.length === 0) {
      return { point: null, timeDiffMs: Infinity };
    }

    // Binary search for closest point
    let left = 0;
    let right = this.window.length - 1;
    let closestIndex = 0;
    let minDiff = Math.abs(this.window[0].timestamp - targetTimestamp);

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const diff = Math.abs(this.window[mid].timestamp - targetTimestamp);

      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = mid;
      }

      if (this.window[mid].timestamp < targetTimestamp) {
        left = mid + 1;
      } else if (this.window[mid].timestamp > targetTimestamp) {
        right = mid - 1;
      } else {
        // Exact match
        return { point: this.window[mid], timeDiffMs: 0 };
      }
    }

    return {
      point: this.window[closestIndex],
      timeDiffMs: minDiff,
    };
  }

  /**
   * Get window statistics
   */
  public getStats(): {
    size: number;
    oldestTimestamp: number;
    newestTimestamp: number;
    durationSeconds: number;
  } {
    const oldest = this.getOldest();
    const newest = this.getNewest();

    return {
      size: this.window.length,
      oldestTimestamp: oldest?.timestamp ?? 0,
      newestTimestamp: newest?.timestamp ?? 0,
      durationSeconds:
        oldest && newest ? (newest.timestamp - oldest.timestamp) / 1000 : 0,
    };
  }

  /**
   * Clear the entire window
   */
  public clear(): void {
    this.window = [];
  }

  /**
   * Check if window is empty
   */
  public isEmpty(): boolean {
    return this.window.length === 0;
  }

  /**
   * Get data points within a specific time range
   * @param startTimestamp Start of time range
   * @param endTimestamp End of time range
   */
  public getRange(startTimestamp: number, endTimestamp: number): DataPoint[] {
    return this.window.filter(
      (point) => point.timestamp >= startTimestamp && point.timestamp <= endTimestamp
    );
  }
}
