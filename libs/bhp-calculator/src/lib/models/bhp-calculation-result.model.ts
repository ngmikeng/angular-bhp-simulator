import { DataPoint } from './data-point.model';

/**
 * Result of a BHP calculation with detailed information
 */
export interface BHPCalculationResult {
  /**
   * Calculated BHP value (Bottom Hole Proppant Concentration) in ppg
   * null if calculation failed or insufficient data
   */
  bhp: number | null;

  /**
   * Detailed information about the calculation
   */
  details: {
    /**
     * Target timestamp for which BHP was calculated
     */
    timestamp: number;

    /**
     * Calculated offset in minutes (flush_volume / rate)
     */
    offsetMinutes: number;

    /**
     * Calculated offset in milliseconds
     */
    offsetMilliseconds: number;

    /**
     * Historical timestamp (target - offset)
     */
    historicalTimestamp: number;

    /**
     * The historical data point used for BHP value
     * null if no suitable point was found
     */
    historicalPoint: DataPoint | null;

    /**
     * Time difference between historical timestamp and actual point used (in seconds)
     */
    timeDifferenceSeconds: number;

    /**
     * Reference rate used for offset calculation (bbl/min)
     */
    referenceRate: number;

    /**
     * Whether the result was retrieved from cache
     */
    fromCache: boolean;

    /**
     * Error message if calculation failed
     */
    errorMessage?: string;
  };
}
