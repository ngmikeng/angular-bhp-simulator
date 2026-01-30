import { BaseGenerator, GeneratedData } from './base-generator';
import { RealisticGenerator } from './realistic-generator';

/**
 * Stage transition pattern generator: simulates transitions between stages
 */
export class StageTransitionGenerator extends BaseGenerator {
  private realisticGenerator: RealisticGenerator;

  constructor(config: any) {
    super(config);
    this.realisticGenerator = new RealisticGenerator(config);
  }

  generate(elapsed: number): GeneratedData {
    const stageDuration = 480; // 8 minutes per stage
    const transitionDuration = 120; // 2 minutes transition

    const totalCycle = stageDuration + transitionDuration;
    const cycleTime = elapsed % totalCycle;
    const isTransition = cycleTime >= stageDuration;

    if (isTransition) {
      // Transition phase: ramping down then up
      const transitionTime = cycleTime - stageDuration;
      const midPoint = transitionDuration / 2;

      let rate: number;
      let propConc: number;
      let pressure: number;

      if (transitionTime < midPoint) {
        // First half: ramp down
        const downProgress = transitionTime / midPoint;
        rate = this.config.baseRate * (1 - downProgress) + this.noise() * 1;
        propConc = this.config.basePropConc * (1 - downProgress) + this.noise() * 0.2;
        pressure = 4000 * (1 - downProgress * 0.5) + 1000 + this.noise() * 150;
      } else {
        // Second half: ramp up
        const upProgress = (transitionTime - midPoint) / midPoint;
        rate = this.config.baseRate * upProgress + this.noise() * 1;
        propConc = this.config.basePropConc * 0.5 * upProgress + this.noise() * 0.2;
        pressure = 1000 + 3000 * upProgress + this.noise() * 150;
      }

      return {
        rate: this.clamp(rate, this.config.rateLimits),
        propConc: this.clamp(propConc, this.config.propConcLimits),
        pressure: this.clamp(pressure, this.config.pressureLimits),
      };
    } else {
      // Normal stage pumping - use realistic generator
      return this.realisticGenerator.generate(cycleTime);
    }
  }

  override updateConfig(config: Partial<any>): void {
    super.updateConfig(config);
    this.realisticGenerator.updateConfig(config);
  }

  override reset(seed?: number): void {
    super.reset(seed);
    this.realisticGenerator.reset(seed);
  }
}
