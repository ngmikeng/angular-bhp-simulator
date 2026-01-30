import { DataPoint } from './data-point.model';
import { BHPCalculationResult } from './bhp-calculation-result.model';

/**
 * Data point enhanced with calculated BHP value and details
 * Used for streaming BHP calculations
 */
export interface EnhancedDataPoint extends DataPoint {
  /**
   * Calculated BHP value (Bottom Hole Proppant Concentration) in ppg
   * null if calculation failed or insufficient data
   */
  bhp: number | null;

  /**
   * Detailed information about the BHP calculation
   */
  bhpDetails: BHPCalculationResult['details'];
}
