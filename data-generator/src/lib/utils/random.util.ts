/**
 * Seeded random number generator using Linear Congruential Generator (LCG)
 * Provides reproducible random number sequences for testing and deterministic data generation
 */
export class SeededRandom {
  private state: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = Math.pow(2, 32);

  /**
   * Create a seeded random generator
   * @param seed Initial seed value
   */
  constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Generate next random number in [0, 1)
   * @returns Random number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / this.m;
  }

  /**
   * Generate Gaussian (normally) distributed random number
   * Uses Box-Muller transform to convert uniform random to Gaussian
   * @param mean Mean of the distribution (default: 0)
   * @param stdDev Standard deviation (default: 1)
   * @returns Random number from Gaussian distribution
   */
  gaussian(mean = 0, stdDev = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    
    // Box-Muller transform
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    return z0 * stdDev + mean;
  }

  /**
   * Generate random integer in range [min, max]
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Random integer in range
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random number in range [min, max)
   * @param min Minimum value (inclusive)
   * @param max Maximum value (exclusive)
   * @returns Random number in range
   */
  nextRange(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Generate boolean with given probability
   * @param probability Probability of returning true (default: 0.5)
   * @returns Random boolean
   */
  nextBoolean(probability = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Reset the generator with a new seed
   * @param seed New seed value
   */
  reset(seed: number): void {
    this.state = seed;
  }

  /**
   * Get current state (useful for saving/restoring state)
   * @returns Current state value
   */
  getState(): number {
    return this.state;
  }

  /**
   * Set state directly (useful for restoring saved state)
   * @param state State value to set
   */
  setState(state: number): void {
    this.state = state;
  }
}

/**
 * Create a seeded random generator with current timestamp as seed
 * @returns New SeededRandom instance
 */
export function createSeededRandom(seed?: number): SeededRandom {
  return new SeededRandom(seed ?? Date.now());
}
