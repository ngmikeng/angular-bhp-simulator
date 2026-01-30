import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Metric card component for displaying key performance indicators
 * 
 * Features:
 * - Displays metric value with label and unit
 * - Optional icon
 * - Trend indicator (up/down with percentage)
 * - Calculated/derived indicator badge
 * - Theme-aware styling
 * 
 * @example
 * ```html
 * <lib-metric-card
 *   icon="speed"
 *   label="Rate"
 *   [value]="15.5"
 *   unit="bbl/min"
 *   [trend]="-2.3">
 * </lib-metric-card>
 * ```
 */
@Component({
  selector: 'lib-metric-card',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricCardComponent {
  /**
   * Material icon name
   */
  @Input() icon = 'analytics';

  /**
   * Label for the metric
   */
  @Input() label = '';

  /**
   * Current value of the metric
   */
  @Input() value: number | null = null;

  /**
   * Unit of measurement
   */
  @Input() unit = '';

  /**
   * Trend percentage (positive = up, negative = down)
   * Shows trend indicator if provided
   */
  @Input() trend: number | null = null;

  /**
   * Whether this is a calculated/derived metric
   * Shows a badge if true
   */
  @Input() isCalculated = false;

  /**
   * Custom color for the icon
   */
  @Input() iconColor?: string;

  /**
   * Minimum value for visual warning (optional)
   */
  @Input() minValue?: number;

  /**
   * Maximum value for visual warning (optional)
   */
  @Input() maxValue?: number;

  /**
   * Number of decimal places to display
   * @default 1
   */
  @Input() decimals = 1;

  /**
   * Get formatted value with specified decimal places
   */
  get formattedValue(): string {
    if (this.value === null || this.value === undefined) {
      return 'N/A';
    }
    return this.value.toFixed(this.decimals);
  }

  /**
   * Get formatted trend value
   */
  get formattedTrend(): string {
    if (this.trend === null || this.trend === undefined) {
      return '';
    }
    return Math.abs(this.trend).toFixed(1);
  }

  /**
   * Check if value is in warning range
   */
  get isWarning(): boolean {
    if (this.value === null || this.value === undefined) {
      return false;
    }

    if (this.minValue !== undefined && this.value < this.minValue) {
      return true;
    }

    if (this.maxValue !== undefined && this.value > this.maxValue) {
      return true;
    }

    return false;
  }

  /**
   * Get icon for trend direction
   */
  get trendIcon(): string {
    if (this.trend === null || this.trend === undefined) {
      return '';
    }
    return this.trend > 0 ? 'trending_up' : 'trending_down';
  }

  /**
   * Get CSS class for trend direction
   */
  get trendClass(): string {
    if (this.trend === null || this.trend === undefined) {
      return '';
    }
    return this.trend > 0 ? 'trend-up' : 'trend-down';
  }
}
