import { BaseGenerator, GeneratedData } from './base-generator';

/**
 * Pump stop pattern generator: includes periodic pump shutdowns
 */
export class PumpStopGenerator extends BaseGenerator {
  generate(elapsed: number): GeneratedData {
    const cycleDuration = 360; // 6 minutes
    const pumpingDuration = 300; // 5 minutes pumping
    const stopDuration = 60; // 1 minute stopped

    const cycleTime = elapsed % cycleDuration;
    const isPumping = cycleTime < pumpingDuration;

    if (isPumping) {
      // Normal pumping
      const pumpTime = cycleTime;
      const cyclicVariation = Math.sin((2 * Math.PI * pumpTime) / 120) * 3;

      const rate = this.config.baseRate + cyclicVariation + this.noise() * 2;
      const propConc = this.config.basePropConc + this.noise() * 0.5;
      const pressure = 5000 + rate * 150 + this.noise() * 200;

      return {
        rate: this.clamp(rate, this.config.rateLimits),
        propConc: this.clamp(propConc, this.config.propConcLimits),
        pressure: this.clamp(pressure, this.config.pressureLimits),
      };
    } else {
      // Pump stopped - exponential decay
      const stopTime = cycleTime - pumpingDuration;
      const decayFactor = Math.exp(-stopTime / 20);

      const rate = this.config.baseRate * 0.1 * decayFactor + this.noise() * 0.5;
      const propConc = this.config.basePropConc * 0.2 * decayFactor + this.noise() * 0.1;
      const pressure = 2000 * decayFactor + 500 + this.noise() * 100;

      return {
        rate: this.clamp(rate, this.config.rateLimits),
        propConc: this.clamp(propConc, this.config.propConcLimits),
        pressure: this.clamp(pressure, this.config.pressureLimits),
      };
    }
  }
}
