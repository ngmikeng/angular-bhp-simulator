import { GeneratorFactory } from './generator.factory';
import { DEFAULT_GENERATOR_CONFIG, DataPattern } from '../models/generator-config.model';
import { SteadyGenerator } from '../generators/steady-generator';
import { RampingGenerator } from '../generators/ramping-generator';
import { CyclingGenerator } from '../generators/cycling-generator';
import { RealisticGenerator } from '../generators/realistic-generator';
import { PumpStopGenerator } from '../generators/pump-stop-generator';
import { StageTransitionGenerator } from '../generators/stage-transition-generator';

describe('GeneratorFactory', () => {
  const config = { ...DEFAULT_GENERATOR_CONFIG, seed: 12345 };

  it('should create SteadyGenerator', () => {
    const generator = GeneratorFactory.create('steady', config);
    expect(generator).toBeInstanceOf(SteadyGenerator);
  });

  it('should create RampingGenerator', () => {
    const generator = GeneratorFactory.create('ramping', config);
    expect(generator).toBeInstanceOf(RampingGenerator);
  });

  it('should create CyclingGenerator', () => {
    const generator = GeneratorFactory.create('cycling', config);
    expect(generator).toBeInstanceOf(CyclingGenerator);
  });

  it('should create RealisticGenerator', () => {
    const generator = GeneratorFactory.create('realistic', config);
    expect(generator).toBeInstanceOf(RealisticGenerator);
  });

  it('should create PumpStopGenerator', () => {
    const generator = GeneratorFactory.create('pump-stop', config);
    expect(generator).toBeInstanceOf(PumpStopGenerator);
  });

  it('should create StageTransitionGenerator', () => {
    const generator = GeneratorFactory.create('stage-transition', config);
    expect(generator).toBeInstanceOf(StageTransitionGenerator);
  });

  it('should throw error for unknown pattern', () => {
    expect(() => {
      GeneratorFactory.create('unknown' as DataPattern, config);
    }).toThrow('Unknown pattern: unknown');
  });

  it('should return all available patterns', () => {
    const patterns = GeneratorFactory.getAvailablePatterns();
    expect(patterns).toHaveLength(6);
    expect(patterns).toContain('steady');
    expect(patterns).toContain('realistic');
  });

  it('should return pattern descriptions', () => {
    const description = GeneratorFactory.getPatternDescription('realistic');
    expect(description).toBeTruthy();
    expect(typeof description).toBe('string');
  });
});
