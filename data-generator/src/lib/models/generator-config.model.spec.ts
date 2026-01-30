import { validateGeneratorConfig } from './generator-config.model';

describe('GeneratorConfig', () => {
  describe('validateGeneratorConfig', () => {
    it('should validate valid config', () => {
      const errors = validateGeneratorConfig({
        samplingRateHz: 1,
        baseRate: 20,
        basePressure: 5000,
        basePropConc: 2.5,
        noiseLevel: 0.1,
      });

      expect(errors).toHaveLength(0);
    });

    it('should reject negative samplingRateHz', () => {
      const errors = validateGeneratorConfig({
        samplingRateHz: -1,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('samplingRateHz');
    });

    it('should reject samplingRateHz > 10', () => {
      const errors = validateGeneratorConfig({
        samplingRateHz: 11,
      });

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative baseRate', () => {
      const errors = validateGeneratorConfig({
        baseRate: -5,
      });

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative basePressure', () => {
      const errors = validateGeneratorConfig({
        basePressure: -100,
      });

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject noiseLevel out of range', () => {
      const errors1 = validateGeneratorConfig({
        noiseLevel: -0.1,
      });
      const errors2 = validateGeneratorConfig({
        noiseLevel: 1.5,
      });

      expect(errors1.length).toBeGreaterThan(0);
      expect(errors2.length).toBeGreaterThan(0);
    });

    it('should reject invalid limit ranges', () => {
      const errors = validateGeneratorConfig({
        rateLimits: [30, 10], // min > max
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('rateLimits');
    });
  });
});
