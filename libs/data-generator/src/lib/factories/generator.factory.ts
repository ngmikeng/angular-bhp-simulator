import { DataPattern, GeneratorConfig } from '../models/generator-config.model';
import { BaseGenerator } from '../generators/base-generator';
import { SteadyGenerator } from '../generators/steady-generator';
import { RampingGenerator } from '../generators/ramping-generator';
import { CyclingGenerator } from '../generators/cycling-generator';
import { RealisticGenerator } from '../generators/realistic-generator';
import { PumpStopGenerator } from '../generators/pump-stop-generator';
import { StageTransitionGenerator } from '../generators/stage-transition-generator';

/**
 * Factory for creating data generators based on pattern type
 */
export class GeneratorFactory {
  /**
   * Create a generator for the specified pattern
   * @param pattern Data pattern type
   * @param config Generator configuration
   * @returns Generator instance
   * @throws Error if pattern is unknown
   */
  static create(pattern: DataPattern, config: GeneratorConfig): BaseGenerator {
    switch (pattern) {
      case 'steady':
        return new SteadyGenerator(config);
      case 'ramping':
        return new RampingGenerator(config);
      case 'cycling':
        return new CyclingGenerator(config);
      case 'realistic':
        return new RealisticGenerator(config);
      case 'pump-stop':
        return new PumpStopGenerator(config);
      case 'stage-transition':
        return new StageTransitionGenerator(config);
      default:
        throw new Error(`Unknown pattern: ${pattern}`);
    }
  }

  /**
   * Get list of all available patterns
   * @returns Array of pattern names
   */
  static getAvailablePatterns(): DataPattern[] {
    return [
      'steady',
      'ramping',
      'cycling',
      'realistic',
      'pump-stop',
      'stage-transition',
    ];
  }

  /**
   * Get description for a pattern
   * @param pattern Pattern type
   * @returns Description string
   */
  static getPatternDescription(pattern: DataPattern): string {
    const descriptions: Record<DataPattern, string> = {
      steady: 'Constant values with minimal noise',
      ramping: 'Gradual ramp up and down cycles',
      cycling: 'Sinusoidal periodic variations',
      realistic: 'Complex multi-stage simulation mimicking real operations',
      'pump-stop': 'Includes periodic pump shutdowns with decay',
      'stage-transition': 'Simulates transitions between pumping stages',
    };
    return descriptions[pattern] || 'Unknown pattern';
  }
}
