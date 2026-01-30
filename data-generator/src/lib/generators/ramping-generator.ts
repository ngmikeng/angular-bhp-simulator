import { BaseGenerator, GeneratedData } from './base-generator';

/**
 * Ramping pattern generator: gradual ramp up and down
 */
export class RampingGenerator extends BaseGenerator {
  generate(elapsed: number): GeneratedData {
    const period = 300; // 5 minutes per cycle
    const phase = (elapsed % period) / period;

    // Calculate ramp factor based on phase
    let rampFactor: number;
    if (phase < 0.3) {
      // Ramp up (0 to 1 over 30% of period)
      rampFactor = phase / 0.3;
    } else if (phase < 0.7) {
      // Plateau (stay at 1 for 40% of period)
      rampFactor = 1;
    } else {
      // Ramp down (1 to 0 over last 30% of period)
      rampFactor = (1 - phase) / 0.3;
    }

    const [minRate, maxRate] = this.config.rateLimits;
    const [minProp, maxProp] = this.config.propConcLimits;

    const rate = minRate + (maxRate - minRate) * rampFactor + this.noise() * 2;
    const propConc = minProp + (maxProp - minProp) * rampFactor + this.noise() * 0.5;
    const pressure = 2000 + rate * 200 + this.noise() * 200;

    return {
      rate: this.clamp(rate, this.config.rateLimits),
      propConc: this.clamp(propConc, this.config.propConcLimits),
      pressure: this.clamp(pressure, this.config.pressureLimits),
    };
  }
}
