import { BaseGenerator, GeneratedData } from './base-generator';

/**
 * Realistic pattern generator: complex mixed behavior mimicking real operations
 * Combines ramping, cycling, and random events across multiple stages
 */
export class RealisticGenerator extends BaseGenerator {
  generate(elapsed: number): GeneratedData {
    // Multi-stage simulation: each stage lasts ~10 minutes
    const stageDuration = 600;
    const stageNumber = Math.floor(elapsed / stageDuration);
    const stageTime = elapsed % stageDuration;

    // Stage phases
    const rampUpDuration = 60; // 1 minute ramp up
    const steadyDuration = 240; // 4 minutes steady
    const propRampDuration = 180; // 3 minutes prop ramping
    const rampDownDuration = 120; // 2 minutes ramp down

    let rate: number;
    let propConc: number;
    let pressure: number;

    if (stageTime < rampUpDuration) {
      // Phase 1: Rate ramp up
      const progress = stageTime / rampUpDuration;
      const [minRate] = this.config.rateLimits;
      rate = minRate + (this.config.baseRate - minRate) * progress + this.noise() * 2;
      propConc = 0.5 + this.noise() * 0.2;
      pressure = 2000 + rate * 180 + this.noise() * 200;
    } else if (stageTime < rampUpDuration + steadyDuration) {
      // Phase 2: Steady pumping
      rate = this.config.baseRate + this.noise() * 2;
      propConc = 1.0 + this.noise() * 0.3;
      pressure = 4500 + this.noise() * 300;
    } else if (stageTime < rampUpDuration + steadyDuration + propRampDuration) {
      // Phase 3: Proppant ramping
      const propPhaseTime = stageTime - rampUpDuration - steadyDuration;
      const propProgress = propPhaseTime / propRampDuration;
      const [, maxProp] = this.config.propConcLimits;
      
      rate = this.config.baseRate + this.noise() * 2;
      propConc = 1.0 + (maxProp - 1.0) * propProgress + this.noise() * 0.5;
      pressure = 5000 + propConc * 150 + this.noise() * 250;
    } else {
      // Phase 4: Ramp down / flush
      const downPhaseTime = stageTime - rampUpDuration - steadyDuration - propRampDuration;
      const downProgress = downPhaseTime / rampDownDuration;
      
      rate = this.config.baseRate * (1 - downProgress * 0.5) + this.noise() * 2;
      propConc = Math.max(0, 10 * (1 - downProgress)) + this.noise() * 0.3;
      pressure = 5500 * (1 - downProgress * 0.4) + this.noise() * 200;
    }

    // Add occasional pressure spikes (screen outs simulation)
    if (this.random.next() < 0.02 && propConc > 5) {
      pressure += 1000 + this.random.next() * 1000;
    }

    return {
      rate: this.clamp(rate, this.config.rateLimits),
      propConc: this.clamp(propConc, this.config.propConcLimits),
      pressure: this.clamp(pressure, this.config.pressureLimits),
    };
  }
}
