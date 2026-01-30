import { SeededRandom } from './random.util';

/**
 * Noise generation utilities
 */

/**
 * Add Gaussian noise to a value
 * @param value Base value
 * @param noiseLevel Noise amplitude multiplier
 * @param random Random generator
 * @returns Value with added noise
 */
export function addGaussianNoise(
  value: number,
  noiseLevel: number,
  random: SeededRandom
): number {
  return value + random.gaussian(0, 1) * noiseLevel;
}

/**
 * Add uniform noise to a value
 * @param value Base value
 * @param noiseLevel Noise amplitude (will vary ±noiseLevel)
 * @param random Random generator
 * @returns Value with added noise
 */
export function addUniformNoise(
  value: number,
  noiseLevel: number,
  random: SeededRandom
): number {
  return value + random.nextRange(-noiseLevel, noiseLevel);
}

/**
 * Generate Perlin-like noise (simplified version for smooth variations)
 * @param t Time parameter
 * @param frequency Frequency of oscillation
 * @param amplitude Amplitude of oscillation
 * @param random Random generator for phase offset
 * @returns Smoothly varying noise value
 */
export function perlinNoise(
  t: number,
  frequency: number,
  amplitude: number,
  random: SeededRandom
): number {
  // Use multiple sine waves with random phase offsets
  const phase1 = random.next() * 2 * Math.PI;
  const phase2 = random.next() * 2 * Math.PI;
  const phase3 = random.next() * 2 * Math.PI;

  const noise1 = Math.sin(t * frequency + phase1);
  const noise2 = Math.sin(t * frequency * 2 + phase2) * 0.5;
  const noise3 = Math.sin(t * frequency * 4 + phase3) * 0.25;

  return (noise1 + noise2 + noise3) * amplitude;
}

/**
 * Clamp value within limits
 * @param value Value to clamp
 * @param limits [min, max] limits
 * @returns Clamped value
 */
export function clamp(value: number, limits: [number, number]): number {
  return Math.max(limits[0], Math.min(limits[1], value));
}

/**
 * Linear interpolation between two values
 * @param start Start value
 * @param end End value
 * @param t Interpolation factor [0, 1]
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Smooth interpolation (ease in/out)
 * @param start Start value
 * @param end End value
 * @param t Interpolation factor [0, 1]
 * @returns Smoothly interpolated value
 */
export function smoothLerp(start: number, end: number, t: number): number {
  // Use smoothstep function for easing
  const smoothT = t * t * (3 - 2 * t);
  return lerp(start, end, smoothT);
}
