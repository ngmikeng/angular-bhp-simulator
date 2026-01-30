import { BaseGenerator, GeneratedData } from './base-generator';

/**
 * Cycling pattern generator: sinusoidal variation
 */
export class CyclingGenerator extends BaseGenerator {
  generate(elapsed: number): GeneratedData {
    const rateCyclePeriod = 120; // 2 minutes
    const propCyclePeriod = 180; // 3 minutes

    const rateOscillation = Math.sin((2 * Math.PI * elapsed) / rateCyclePeriod);
    const propOscillation = Math.sin((2 * Math.PI * elapsed) / propCyclePeriod);

    const [minRate, maxRate] = this.config.rateLimits;
    const [minProp, maxProp] = this.config.propConcLimits;

    const rateRange = maxRate - minRate;
    const propRange = maxProp - minProp;

    const rate =
      this.config.baseRate + rateRange * 0.3 * rateOscillation + this.noise() * 2;
    const propConc =
      this.config.basePropConc + propRange * 0.4 * propOscillation + this.noise() * 0.5;
    const pressure = 2000 + rate * 200 + this.noise() * 200;

    return {
      rate: this.clamp(rate, this.config.rateLimits),
      propConc: this.clamp(propConc, this.config.propConcLimits),
      pressure: this.clamp(pressure, this.config.pressureLimits),
    };
  }
}
