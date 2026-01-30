/**
 * Data validation utilities
 */

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a numeric value
 * @param value Value to validate
 * @param name Name of the value (for error messages)
 * @param min Minimum allowed value (inclusive)
 * @param max Maximum allowed value (inclusive)
 * @returns Validation result
 */
export function validateNumber(
  value: number,
  name: string,
  min?: number,
  max?: number
): ValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${name} must be a valid number`);
  } else if (!isFinite(value)) {
    errors.push(`${name} must be finite`);
  } else {
    if (min !== undefined && value < min) {
      errors.push(`${name} must be >= ${min}`);
    }
    if (max !== undefined && value > max) {
      errors.push(`${name} must be <= ${max}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a data point
 * @param rate Rate value
 * @param propConc Proppant concentration value
 * @param pressure Pressure value
 * @returns Validation result
 */
export function validateDataPoint(
  rate: number,
  propConc: number,
  pressure: number
): ValidationResult {
  const errors: string[] = [];

  // Validate rate
  const rateResult = validateNumber(rate, 'rate', 0, 100);
  errors.push(...rateResult.errors);

  // Validate proppant concentration
  const propResult = validateNumber(propConc, 'propConc', 0, 20);
  errors.push(...propResult.errors);

  // Validate pressure
  const pressureResult = validateNumber(pressure, 'pressure', 0, 15000);
  errors.push(...pressureResult.errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate timestamp
 * @param timestamp Unix epoch timestamp in milliseconds
 * @returns Validation result
 */
export function validateTimestamp(timestamp: number): ValidationResult {
  const errors: string[] = [];

  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    errors.push('timestamp must be a valid number');
  } else if (!isFinite(timestamp)) {
    errors.push('timestamp must be finite');
  } else if (timestamp < 0) {
    errors.push('timestamp must be non-negative');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize a numeric value by clamping and handling special cases
 * @param value Value to sanitize
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param defaultValue Default value if input is invalid
 * @returns Sanitized value
 */
export function sanitizeNumber(
  value: number,
  min: number,
  max: number,
  defaultValue: number
): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, value));
}
