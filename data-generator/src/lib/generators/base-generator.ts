import { GeneratorConfig } from '../models/generator-config.model';
import { SeededRandom } from '../utils/random.util';

/**
 * Partial data point without timestamp
 */
export interface GeneratedData {
  rate: number;
  propConc: number;
  pressure: number;
}

/**
 * Abstract base class for all data generators
 */
export abstract class BaseGenerator {
  protected random: SeededRandom;
  protected config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.random = new SeededRandom(config.seed ?? Date.now());
  }

  /**
   * Generate data point for the given elapsed time
   * @param elapsed Elapsed time in seconds since start
   * @returns Generated data (rate, propConc, pressure)
   */
  abstract generate(elapsed: number): GeneratedData;

  /**
   * Update configuration
   * @param config New configuration (partial)
   */
  updateConfig(config: Partial<GeneratorConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.seed !== undefined) {
      this.random = new SeededRandom(config.seed);
    }
  }

  /**
   * Reset generator state
   * @param seed Optional new seed
   */
  reset(seed?: number): void {
    if (seed !== undefined) {
      this.random = new SeededRandom(seed);
    } else if (this.config.seed !== undefined) {
      this.random = new SeededRandom(this.config.seed);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): GeneratorConfig {
    return { ...this.config };
  }

  /**
   * Generate Gaussian noise
   */
  protected noise(): number {
    return this.random.gaussian(0, 1);
  }

  /**
   * Clamp value within limits
   */
  protected clamp(value: number, limits: [number, number]): number {
    return Math.max(limits[0], Math.min(limits[1], value));
  }
}
