import { BaseGenerator, GeneratedData } from './base-generator';

/**
 * Steady pattern generator: constant values with minimal noise
 */
export class SteadyGenerator extends BaseGenerator {
  generate(elapsed: number): GeneratedData {
    const noiseAmp = this.config.noiseLevel;

    const rate = this.config.baseRate + this.noise() * noiseAmp * 2;
    const propConc = this.config.basePropConc + this.noise() * noiseAmp * 0.5;
    const pressure = this.config.basePressure + this.noise() * noiseAmp * 100;

    return {
      rate: this.clamp(rate, this.config.rateLimits),
      propConc: this.clamp(propConc, this.config.propConcLimits),
      pressure: this.clamp(pressure, this.config.pressureLimits),
    };
  }
}
