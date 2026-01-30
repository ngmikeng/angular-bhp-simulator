import { DEFAULT_GENERATOR_CONFIG } from '../models/generator-config.model';
import { SteadyGenerator } from './steady-generator';
import { RampingGenerator } from './ramping-generator';
import { CyclingGenerator } from './cycling-generator';
import { RealisticGenerator } from './realistic-generator';

describe('Pattern Generators', () => {
  const config = { ...DEFAULT_GENERATOR_CONFIG, seed: 12345 };

  describe('SteadyGenerator', () => {
    it('should generate steady values', () => {
      const generator = new SteadyGenerator(config);
      const data = Array.from({ length: 10 }, (_, i) => generator.generate(i));

      // Check all values are within reasonable range of base values
      // With noise level of 0.1, values can vary by a few units
      data.forEach((point) => {
        expect(point.rate).toBeCloseTo(config.baseRate, -1); // Within 5 units
        expect(point.propConc).toBeCloseTo(config.basePropConc, -1); // Within 5 units  
        expect(point.pressure).toBeCloseTo(config.basePressure, -2); // Within 50 units
      });
    });

    it('should stay within limits', () => {
      const generator = new SteadyGenerator(config);
      const data = Array.from({ length: 100 }, (_, i) => generator.generate(i));

      data.forEach((point) => {
        expect(point.rate).toBeGreaterThanOrEqual(config.rateLimits[0]);
        expect(point.rate).toBeLessThanOrEqual(config.rateLimits[1]);
        expect(point.propConc).toBeGreaterThanOrEqual(config.propConcLimits[0]);
        expect(point.propConc).toBeLessThanOrEqual(config.propConcLimits[1]);
        expect(point.pressure).toBeGreaterThanOrEqual(config.pressureLimits[0]);
        expect(point.pressure).toBeLessThanOrEqual(config.pressureLimits[1]);
      });
    });
  });

  describe('RampingGenerator', () => {
    it('should generate ramping pattern', () => {
      const generator = new RampingGenerator(config);
      const data = Array.from({ length: 300 }, (_, i) => generator.generate(i));

      // Find min and max rates
      const rates = data.map((d) => d.rate);
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);

      // Should vary between limits
      expect(maxRate - minRate).toBeGreaterThan(5);
    });

    it('should stay within limits', () => {
      const generator = new RampingGenerator(config);
      const data = Array.from({ length: 300 }, (_, i) => generator.generate(i));

      data.forEach((point) => {
        expect(point.rate).toBeGreaterThanOrEqual(config.rateLimits[0]);
        expect(point.rate).toBeLessThanOrEqual(config.rateLimits[1]);
        expect(point.propConc).toBeGreaterThanOrEqual(config.propConcLimits[0]);
        expect(point.propConc).toBeLessThanOrEqual(config.propConcLimits[1]);
      });
    });
  });

  describe('CyclingGenerator', () => {
    it('should generate cycling pattern', () => {
      const generator = new CyclingGenerator(config);
      const data = Array.from({ length: 120 }, (_, i) => generator.generate(i));

      const rates = data.map((d) => d.rate);
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);

      // Should oscillate
      expect(maxRate - minRate).toBeGreaterThan(3);
    });

    it('should stay within limits', () => {
      const generator = new CyclingGenerator(config);
      const data = Array.from({ length: 200 }, (_, i) => generator.generate(i));

      data.forEach((point) => {
        expect(point.rate).toBeGreaterThanOrEqual(config.rateLimits[0]);
        expect(point.rate).toBeLessThanOrEqual(config.rateLimits[1]);
      });
    });
  });

  describe('RealisticGenerator', () => {
    it('should generate realistic multi-stage pattern', () => {
      const generator = new RealisticGenerator(config);
      
      // Generate full stage (10 minutes = 600 seconds)
      const data = Array.from({ length: 600 }, (_, i) => generator.generate(i));

      // Should have variation
      const rates = data.map((d) => d.rate);
      const props = data.map((d) => d.propConc);
      
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);
      const minProp = Math.min(...props);
      const maxProp = Math.max(...props);

      expect(maxRate - minRate).toBeGreaterThan(5);
      expect(maxProp - minProp).toBeGreaterThan(2);
    });

    it('should stay within limits', () => {
      const generator = new RealisticGenerator(config);
      const data = Array.from({ length: 600 }, (_, i) => generator.generate(i));

      data.forEach((point) => {
        expect(point.rate).toBeGreaterThanOrEqual(config.rateLimits[0]);
        expect(point.rate).toBeLessThanOrEqual(config.rateLimits[1]);
        expect(point.propConc).toBeGreaterThanOrEqual(config.propConcLimits[0]);
        expect(point.propConc).toBeLessThanOrEqual(config.propConcLimits[1]);
        expect(point.pressure).toBeGreaterThanOrEqual(config.pressureLimits[0]);
        expect(point.pressure).toBeLessThanOrEqual(config.pressureLimits[1]);
      });
    });
  });

  describe('Generator Reset', () => {
    it('should generate same sequence after reset', () => {
      const generator = new SteadyGenerator(config);
      
      const sequence1 = Array.from({ length: 10 }, (_, i) => generator.generate(i));
      
      generator.reset(config.seed);
      
      const sequence2 = Array.from({ length: 10 }, (_, i) => generator.generate(i));

      expect(sequence1).toEqual(sequence2);
    });
  });
});
