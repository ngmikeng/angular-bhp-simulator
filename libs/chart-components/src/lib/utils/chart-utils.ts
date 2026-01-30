import type { EChartsOption } from 'echarts';

/**
 * Format timestamp for X-axis display
 * @param timestamp - Unix timestamp in milliseconds
 * @param format - Time format string (default: 'HH:mm:ss')
 * @returns Formatted time string
 */
export function formatTime(timestamp: number, format: string = 'HH:mm:ss'): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return format
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
    .replace('SSS', milliseconds);
}

/**
 * Create a tooltip formatter function for ECharts
 * @param config - Configuration object for tooltip formatting
 * @returns Formatter function for ECharts tooltip
 */
export function createTooltipFormatter(config: {
  timeFormat?: string;
  valueFormatter?: (value: number) => string;
  unit?: string;
}): (params: any) => string {
  const { timeFormat = 'HH:mm:ss', valueFormatter, unit = '' } = config;

  return (params: any) => {
    if (!params || (Array.isArray(params) && params.length === 0)) {
      return '';
    }

    const paramArray = Array.isArray(params) ? params : [params];
    const timestamp = paramArray[0].data[0];
    const formattedTime = formatTime(timestamp, timeFormat);

    let html = `<div style="padding: 8px;">
      <div style="font-weight: 500; margin-bottom: 8px;">${formattedTime}</div>`;

    paramArray.forEach((param: any) => {
      const value = param.data[1];
      const displayValue = valueFormatter 
        ? valueFormatter(value)
        : value != null 
          ? value.toFixed(2) 
          : 'N/A';

      html += `
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>
          <span style="margin-right: 8px;">${param.seriesName}:</span>
          <span style="font-weight: 500;">${displayValue}${unit}</span>
        </div>`;
    });

    html += '</div>';
    return html;
  };
}

/**
 * LTTB (Largest-Triangle-Three-Buckets) downsampling algorithm
 * Reduces the number of data points while preserving visual appearance
 * 
 * @param data - Array of [timestamp, value] tuples
 * @param threshold - Target number of data points
 * @returns Downsampled array of [timestamp, value] tuples
 */
export function downsampleLTTB(
  data: [number, number][],
  threshold: number
): [number, number][] {
  if (threshold >= data.length || threshold === 0 || data.length === 0) {
    return data;
  }

  if (threshold === 1) {
    return [data[0]];
  }

  if (threshold === 2) {
    return [data[0], data[data.length - 1]];
  }

  const sampled: [number, number][] = [];
  
  // Always include first point
  sampled.push(data[0]);

  // Bucket size (leave room for start and end)
  const bucketSize = (data.length - 2) / (threshold - 2);

  let a = 0; // Initially at the first point

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket
    let avgX = 0;
    let avgY = 0;
    
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    if (avgRangeLength > 0) {
      for (let j = avgRangeStart; j < avgRangeEnd; j++) {
        if (data[j]) {
          avgX += data[j][0];
          avgY += data[j][1];
        }
      }
      avgX /= avgRangeLength;
      avgY /= avgRangeLength;

      // Get the range for this bucket
      const rangeOffs = Math.floor(i * bucketSize) + 1;
      const rangeTo = Math.min(Math.floor((i + 1) * bucketSize) + 1, data.length);

      // Point a
      const pointAX = data[a][0];
      const pointAY = data[a][1];

      let maxArea = -1;
      let maxAreaPoint = rangeOffs;

      for (let j = rangeOffs; j < rangeTo; j++) {
        if (data[j]) {
          // Calculate triangle area
          const area = Math.abs(
            (pointAX - avgX) * (data[j][1] - pointAY) -
            (pointAX - data[j][0]) * (avgY - pointAY)
          ) * 0.5;

          if (area > maxArea) {
            maxArea = area;
            maxAreaPoint = j;
          }
        }
      }

      if (data[maxAreaPoint]) {
        sampled.push(data[maxAreaPoint]);
        a = maxAreaPoint; // This point is the next "a"
      }
    }
  }

  // Always include last point
  sampled.push(data[data.length - 1]);

  return sampled;
}

/**
 * Apply theme styling to chart options
 * @param options - Base ECharts options
 * @param isDark - Whether dark theme is active
 * @returns Themed chart options
 */
export function applyThemeToChartOptions(
  options: EChartsOption,
  isDark: boolean
): EChartsOption {
  const theme = {
    textColor: isDark ? '#ffffff' : '#333333',
    gridColor: isDark ? '#333333' : '#e0e0e0',
    axisLineColor: isDark ? '#666666' : '#cccccc',
    splitLineColor: isDark ? '#333333' : '#e0e0e0',
  };

  return {
    ...options,
    textStyle: {
      color: theme.textColor,
      ...(options.textStyle as object || {})
    },
    grid: {
      borderColor: theme.gridColor,
      ...(options.grid as object || {})
    }
  };
}

/**
 * Create a circular buffer for efficient data management
 */
export class CircularBuffer<T> {
  private buffer: T[];
  private head: number = 0;
  private tail: number = 0;
  private size: number = 0;

  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }

  /**
   * Add an item to the buffer
   * Automatically removes oldest item if buffer is full
   */
  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  /**
   * Get all items in order
   */
  toArray(): T[] {
    if (this.size === 0) {
      return [];
    }

    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index]);
    }
    return result;
  }

  /**
   * Get the current number of items
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Check if buffer is full
   */
  isFull(): boolean {
    return this.size === this.capacity;
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  /**
   * Get item at index
   */
  at(index: number): T | undefined {
    if (index < 0 || index >= this.size) {
      return undefined;
    }
    const actualIndex = (this.head + index) % this.capacity;
    return this.buffer[actualIndex];
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Merge multiple data points into batches for efficient chart updates
 */
export function batchDataPoints<T extends { timestamp: number }>(
  points: T[],
  maxBatchSize: number = 10
): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < points.length; i += maxBatchSize) {
    batches.push(points.slice(i, i + maxBatchSize));
  }
  return batches;
}
