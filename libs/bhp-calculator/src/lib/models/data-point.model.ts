/**
 * Represents a single timestamped measurement from the surface.
 * This is the fundamental data unit for BHP calculation.
 */
export interface DataPoint {
  /**
   * Unix epoch timestamp in milliseconds
   * @example 1705227045123 (2024-01-14 10:30:45.123 UTC)
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
