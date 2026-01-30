import { SeededRandom } from './random.util';

describe('SeededRandom', () => {
  it('should create with seed', () => {
    const random = new SeededRandom(12345);
    expect(random).toBeDefined();
  });

  it('should generate reproducible sequence with same seed', () => {
    const random1 = new SeededRandom(12345);
    const random2 = new SeededRandom(12345);

    const sequence1 = Array.from({ length: 10 }, () => random1.next());
    const sequence2 = Array.from({ length: 10 }, () => random2.next());

    expect(sequence1).toEqual(sequence2);
  });

  it('should generate different sequences with different seeds', () => {
    const random1 = new SeededRandom(12345);
    const random2 = new SeededRandom(54321);

    const sequence1 = Array.from({ length: 10 }, () => random1.next());
    const sequence2 = Array.from({ length: 10 }, () => random2.next());

    expect(sequence1).not.toEqual(sequence2);
  });

  it('should generate numbers in [0, 1) range', () => {
    const random = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const value = random.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('should generate Gaussian distributed numbers', () => {
    const random = new SeededRandom(12345);
    const samples = Array.from({ length: 1000 }, () => random.gaussian(0, 1));

    // Check mean is close to 0
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(0, 0);

    // Check standard deviation is close to 1
    const variance =
      samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;
    const stdDev = Math.sqrt(variance);
    expect(stdDev).toBeCloseTo(1, 0);
  });

  it('should generate random integers in range', () => {
    const random = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const value = random.nextInt(1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('should generate random floats in range', () => {
    const random = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const value = random.nextRange(5, 15);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThan(15);
    }
  });

  it('should generate boolean with correct probability', () => {
    const random = new SeededRandom(12345);
    const samples = Array.from({ length: 1000 }, () => random.nextBoolean(0.7));
    const trueCount = samples.filter((v) => v).length;
    const probability = trueCount / samples.length;

    // Should be approximately 0.7
    expect(probability).toBeCloseTo(0.7, 1);
  });

  it('should reset to same seed', () => {
    const random = new SeededRandom(12345);
    const sequence1 = Array.from({ length: 5 }, () => random.next());

    random.reset(12345);
    const sequence2 = Array.from({ length: 5 }, () => random.next());

    expect(sequence1).toEqual(sequence2);
  });

  it('should get and set state', () => {
    const random = new SeededRandom(12345);
    random.next();
    random.next();

    const state = random.getState();
    const value1 = random.next();

    random.setState(state);
    const value2 = random.next();

    expect(value1).toBe(value2);
  });
});
