/**
 * Configuration for BHP calculation algorithm
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
   * Default: 0.0167 minutes (1 second)
   */
  minOffsetMinutes: number;

  /**
   * Window size in seconds for data retention
   * Default: 7200 seconds (2 hours)
   */
  windowSizeSeconds: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_BHP_CONFIG: BHPCalculationConfig = {
  maxTimeDiffSeconds: 60,
  maxOffsetMinutes: 120,
  minOffsetMinutes: 0.0167,
  windowSizeSeconds: 7200,
};
