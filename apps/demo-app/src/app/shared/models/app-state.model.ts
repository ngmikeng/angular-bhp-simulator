import { GeneratorConfig, DataPattern } from '@angular-bhp-simulator/data-generator';

/**
 * Application state model
 */
export interface AppState {
  /**
   * Whether the simulation is currently running
   */
  isSimulationRunning: boolean;

  /**
   * Simulation speed multiplier (0.5x, 1x, 2x, 5x, 10x)
   */
  simulationSpeed: number;

  /**
   * Current data generation pattern
   */
  currentPattern: DataPattern;

  /**
   * Data generator configuration
   */
  generatorConfig: GeneratorConfig;

  /**
   * Selected metrics to display
   */
  selectedMetrics: string[];
}

/**
 * Initial application state
 */
export const initialAppState: AppState = {
  isSimulationRunning: false,
  simulationSpeed: 1,
  currentPattern: 'realistic',
  generatorConfig: {
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
  },
  selectedMetrics: ['rate', 'pressure', 'propConc', 'bhp'],
};

/**
 * Metric trend direction
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * Metric data for display
 */
export interface MetricData {
  /**
   * Current value
   */
  value: number;

  /**
   * Unit of measurement
   */
  unit: string;

  /**
   * Trend over last period
   */
  trend: TrendDirection;

  /**
   * Percentage change
   */
  changePercent: number;

  /**
   * Whether this is a calculated value
   */
  isCalculated?: boolean;
}
