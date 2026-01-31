/**
 * Supported data generation patterns
 */
export type DataPattern =
  | 'steady'              // Constant values with minimal noise
  | 'ramping'             // Gradual ramp up and down
  | 'cycling'             // Periodic cycling
  | 'realistic'           // Mixed pattern mimicking real operations
  | 'pump-stop'           // Includes pump stops
  | 'stage-transition';   // Simulates stage changes

/**
 * Configuration for data generation
 */
export interface GeneratorConfig {
  /**
   * Data points per second
   * @default 1
   * @range 0.1 - 10
   */
  samplingRateHz: number;

  /**
   * Generation pattern to use
   * @default 'realistic'
   */
  pattern: DataPattern;

  /**
   * Base slurry rate in barrels per minute
   * @default 15
   * @range 0 - 100
   */
  baseRate: number;

  /**
   * Min/max rate limits [min, max]
   * @default [5, 30]
   */
  rateLimits: [number, number];

  /**
   * Base pressure in PSI
   * @default 5000
   * @range 0 - 15000
   */
  basePressure: number;

  /**
   * Min/max pressure limits [min, max]
   * @default [2000, 8000]
   */
  pressureLimits: [number, number];

  /**
   * Base proppant concentration in pounds per gallon
   * @default 2.5
   * @range 0 - 20
   */
  basePropConc: number;

  /**
   * Min/max proppant concentration limits [min, max]
   * @default [0, 15]
   */
  propConcLimits: [number, number];

  /**
   * Noise amplitude multiplier
   * @default 0.1
   * @range 0 - 1
   */
  noiseLevel: number;

  /**
   * Random seed for reproducibility
   * @default undefined (uses Date.now())
   */
  seed?: number;

  /**
   * Normalize timestamp to seconds (floor to nearest second)
   * Useful for aligning timestamps with BHP calculations
   * @default false
   */
  normalizeTimestampToSeconds?: boolean;
}

/**
 * Default configuration for each pattern
 */
export const DEFAULT_CONFIGS: Record<DataPattern, Partial<GeneratorConfig>> = {
  steady: {
    samplingRateHz: 0.5,
    pattern: 'steady',
    baseRate: 20,
    rateLimits: [19, 21],
    basePressure: 5000,
    pressureLimits: [4800, 5200],
    basePropConc: 2.5,
    propConcLimits: [2.3, 2.7],
    noiseLevel: 0.05,
  },
  ramping: {
    samplingRateHz: 1,
    pattern: 'ramping',
    baseRate: 15,
    rateLimits: [5, 30],
    basePressure: 5000,
    pressureLimits: [2000, 8000],
    basePropConc: 2.5,
    propConcLimits: [0, 15],
    noiseLevel: 0.1,
  },
  cycling: {
    samplingRateHz: 2,
    pattern: 'cycling',
    baseRate: 20,
    rateLimits: [10, 30],
    basePressure: 5500,
    pressureLimits: [3000, 8000],
    basePropConc: 5,
    propConcLimits: [2, 10],
    noiseLevel: 0.15,
  },
  realistic: {
    samplingRateHz: 1,
    pattern: 'realistic',
    baseRate: 15,
    rateLimits: [5, 30],
    basePressure: 5000,
    pressureLimits: [2000, 8000],
    basePropConc: 2.5,
    propConcLimits: [0, 15],
    noiseLevel: 0.15,
  },
  'pump-stop': {
    samplingRateHz: 1,
    pattern: 'pump-stop',
    baseRate: 20,
    rateLimits: [0, 30],
    basePressure: 5000,
    pressureLimits: [1000, 8000],
    basePropConc: 3,
    propConcLimits: [0, 10],
    noiseLevel: 0.1,
  },
  'stage-transition': {
    samplingRateHz: 1,
    pattern: 'stage-transition',
    baseRate: 18,
    rateLimits: [5, 30],
    basePressure: 5000,
    pressureLimits: [2000, 8000],
    basePropConc: 4,
    propConcLimits: [0, 15],
    noiseLevel: 0.12,
  },
};

/**
 * Default generator configuration
 */
export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
  samplingRateHz: 1,
  pattern: 'realistic',
  baseRate: 15,
  rateLimits: [5, 30],
  basePressure: 5000,
  pressureLimits: [2000, 8000],
  basePropConc: 2.5,
  propConcLimits: [0, 15],
  noiseLevel: 0.1,
  normalizeTimestampToSeconds: false,
};

/**
 * Validates generator configuration
 * @param config Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateGeneratorConfig(config: Partial<GeneratorConfig>): string[] {
  const errors: string[] = [];

  if (config.samplingRateHz !== undefined) {
    if (config.samplingRateHz <= 0 || config.samplingRateHz > 10) {
      errors.push('samplingRateHz must be between 0.1 and 10');
    }
  }

  if (config.baseRate !== undefined && config.baseRate < 0) {
    errors.push('baseRate must be non-negative');
  }

  if (config.basePressure !== undefined && config.basePressure < 0) {
    errors.push('basePressure must be non-negative');
  }

  if (config.basePropConc !== undefined && config.basePropConc < 0) {
    errors.push('basePropConc must be non-negative');
  }

  if (config.noiseLevel !== undefined) {
    if (config.noiseLevel < 0 || config.noiseLevel > 1) {
      errors.push('noiseLevel must be between 0 and 1');
    }
  }

  if (config.rateLimits !== undefined) {
    if (config.rateLimits[0] > config.rateLimits[1]) {
      errors.push('rateLimits min must be <= max');
    }
  }

  if (config.pressureLimits !== undefined) {
    if (config.pressureLimits[0] > config.pressureLimits[1]) {
      errors.push('pressureLimits min must be <= max');
    }
  }

  if (config.propConcLimits !== undefined) {
    if (config.propConcLimits[0] > config.propConcLimits[1]) {
      errors.push('propConcLimits min must be <= max');
    }
  }

  return errors;
}
