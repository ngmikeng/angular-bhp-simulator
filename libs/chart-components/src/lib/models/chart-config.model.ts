/**
 * Configuration interface for real-time line chart component
 */
export interface RealtimeChartConfig {
  /**
   * Chart title displayed at the top
   */
  title: string;

  /**
   * Label for the Y-axis (e.g., "bbl/min", "ppg", "psi")
   */
  yAxisLabel: string;

  /**
   * Optional fixed Y-axis range [min, max]
   * If not provided, the chart will auto-scale
   */
  yAxisRange?: [number, number];

  /**
   * Maximum number of data points to display in the chart
   * Older points will be removed as new ones are added
   * @default 300 (5 minutes at 1/sec sampling rate)
   */
  maxDataPoints?: number;

  /**
   * Line color in hex, rgb, or CSS color name format
   * Supports theme tokens when using theme service
   */
  lineColor?: string;

  /**
   * Area fill color (optional)
   * Used when showArea is true
   */
  areaColor?: string;

  /**
   * Whether to show filled area under the line
   * @default false
   */
  showArea?: boolean;

  /**
   * Enable smooth curve interpolation
   * @default true
   */
  smooth?: boolean;

  /**
   * Animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number;

  /**
   * Time format string for X-axis labels
   * @default 'HH:mm:ss'
   */
  timeFormat?: string;
}

/**
 * Configuration for a single series in a multi-series chart
 */
export interface SeriesConfig {
  /**
   * Display name for the series (shown in legend)
   */
  name: string;

  /**
   * Index of the Y-axis this series should use
   * 0 = primary (left), 1+ = secondary (right)
   */
  yAxisIndex: number;

  /**
   * Label for this series' Y-axis
   */
  yAxisLabel: string;

  /**
   * Line color for this series
   */
  lineColor: string;

  /**
   * Whether to show filled area under this series' line
   * @default false
   */
  showArea?: boolean;

  /**
   * Optional fixed Y-axis range for this series [min, max]
   */
  yAxisRange?: [number, number];
}

/**
 * Configuration interface for multi-series chart component
 */
export interface MultiSeriesConfig {
  /**
   * Chart title displayed at the top
   */
  title: string;

  /**
   * Array of series configurations
   */
  series: SeriesConfig[];

  /**
   * Maximum number of data points to display
   * @default 15000 (250 minutes at 1/sec)
   */
  maxDataPoints?: number;

  /**
   * Whether to synchronize crosshair across all series
   * @default true
   */
  syncCrosshair?: boolean;

  /**
   * Time format string for X-axis labels
   * @default 'HH:mm:ss'
   */
  timeFormat?: string;

  /**
   * Animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number;
}

/**
 * Data point structure for real-time charts
 */
export interface ChartDataPoint {
  /**
   * Timestamp in milliseconds (Unix epoch)
   */
  timestamp: number;

  /**
   * Numeric value for the data point
   */
  value: number;
}

/**
 * Multi-series data point structure
 */
export interface MultiSeriesDataPoint {
  /**
   * Timestamp in milliseconds (Unix epoch)
   */
  timestamp: number;

  /**
   * Values for each series, indexed by series name
   */
  values: { [seriesName: string]: number | null };
}

/**
 * Export options for chart image generation
 */
export interface ChartExportOptions {
  /**
   * Image format
   * @default 'png'
   */
  type?: 'png' | 'jpeg' | 'svg';

  /**
   * Pixel ratio for high-DPI displays
   * @default 2
   */
  pixelRatio?: number;

  /**
   * Background color for the exported image
   * If not provided, uses current theme background
   */
  backgroundColor?: string;

  /**
   * Whether to exclude the chart title in export
   * @default false
   */
  excludeTitle?: boolean;
}
