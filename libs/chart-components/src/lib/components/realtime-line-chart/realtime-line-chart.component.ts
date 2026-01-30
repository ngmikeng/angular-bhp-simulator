import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { ECharts, EChartsOption } from 'echarts';
import { RealtimeChartConfig, ChartDataPoint, ChartExportOptions } from '../../models';
import { ChartThemeService } from '../../services';
import { formatTime, createTooltipFormatter, CircularBuffer } from '../../utils';

/**
 * Real-time line chart component for streaming data visualization
 * 
 * Features:
 * - Automatic data buffering with configurable max points
 * - Smooth animations for new data points
 * - Theme-aware (dark/light mode)
 * - Responsive sizing
 * - Zoom and pan controls
 * - Data point tooltips
 * - Export functionality
 * 
 * @example
 * ```html
 * <lib-realtime-line-chart
 *   [config]="chartConfig"
 *   [dataStream$]="dataObservable"
 *   [isDarkTheme]="isDark">
 * </lib-realtime-line-chart>
 * ```
 */
@Component({
  selector: 'lib-realtime-line-chart',
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './realtime-line-chart.component.html',
  styleUrls: ['./realtime-line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealtimeLineChartComponent implements OnInit, OnDestroy {
  /**
   * Chart configuration
   */
  @Input({ required: true }) config!: RealtimeChartConfig;

  /**
   * Observable stream of data points
   */
  @Input({ required: true }) dataStream$!: Observable<ChartDataPoint>;

  /**
   * Dark theme flag
   */
  @Input() isDarkTheme = false;

  private destroy$ = new Subject<void>();
  private chart: ECharts | null = null;
  
  // Data buffer using circular buffer for efficiency
  private dataBuffer!: CircularBuffer<[number, number]>;
  private maxDataPoints = 300;

  // Chart options signals for reactivity
  protected chartOptions = signal<EChartsOption>({});
  protected updateOptions = signal<EChartsOption>({});

  constructor(
    private themeService: ChartThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.maxDataPoints = this.config.maxDataPoints ?? 300;
    this.dataBuffer = new CircularBuffer(this.maxDataPoints);
    
    this.initChart();
    this.subscribeToDataStream();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }

  /**
   * Handle chart initialization
   */
  onChartInit(chart: any): void {
    this.chart = chart;

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      this.chart?.resize();
    });

    const chartContainer = (chart as any).getDom?.()?.parentElement;
    if (chartContainer) {
      resizeObserver.observe(chartContainer);
    }
  }

  /**
   * Initialize chart configuration
   */
  private initChart(): void {
    const theme = this.themeService.getCurrentTheme();
    const lineColor = this.config.lineColor ?? theme.colorPalette[0];
    const areaColor = this.config.areaColor ?? this.hexToRgba(lineColor, 0.3);

    this.chartOptions.set({
      backgroundColor: 'transparent',
      color: [lineColor],
      
      title: {
        text: this.config.title,
        left: 'center',
        top: 10,
        textStyle: {
          color: theme.textColor,
          fontSize: 16,
          fontWeight: 500
        }
      },

      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltipBackgroundColor,
        borderColor: theme.tooltipBorderColor,
        borderWidth: 1,
        textStyle: {
          color: theme.textColor
        },
        formatter: createTooltipFormatter({
          timeFormat: this.config.timeFormat ?? 'HH:mm:ss',
          unit: ` ${this.config.yAxisLabel}`
        }),
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: theme.tooltipBorderColor
          }
        }
      },

      grid: {
        left: '60px',
        right: '40px',
        top: '60px',
        bottom: '80px',
        containLabel: true
      },

      xAxis: {
        type: 'time',
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor
          }
        },
        axisLabel: {
          color: theme.textColor,
          formatter: (value: number) => formatTime(value, this.config.timeFormat ?? 'HH:mm:ss')
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: theme.splitLineColor,
            type: 'dashed'
          }
        }
      },

      yAxis: {
        type: 'value',
        name: this.config.yAxisLabel,
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: theme.textColor,
          fontSize: 12
        },
        min: this.config.yAxisRange?.[0],
        max: this.config.yAxisRange?.[1],
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor
          }
        },
        axisLabel: {
          color: theme.textColor,
          formatter: (value: number) => value.toFixed(1)
        },
        splitLine: {
          lineStyle: {
            color: theme.splitLineColor,
            type: 'dashed'
          }
        }
      },

      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 30,
          bottom: 10,
          textStyle: {
            color: theme.textColor
          },
          borderColor: theme.axisLineColor,
          fillerColor: this.hexToRgba(lineColor, 0.2),
          handleStyle: {
            color: lineColor,
            borderColor: theme.axisLineColor
          },
          dataBackground: {
            lineStyle: {
              color: lineColor
            },
            areaStyle: {
              color: areaColor
            }
          }
        }
      ],

      series: [
        {
          name: this.config.title,
          type: 'line' as const,
          smooth: this.config.smooth ?? true,
          symbol: 'none',
          sampling: 'lttb' as const,
          lineStyle: {
            color: lineColor,
            width: 2
          },
          areaStyle: this.config.showArea ? {
            color: areaColor
          } : undefined,
          data: [],
          animation: true,
          animationDuration: this.config.animationDuration ?? 300
        }
      ],

      animation: true,
      animationThreshold: 2000,
      animationDuration: this.config.animationDuration ?? 300,
      progressive: 400,
      progressiveThreshold: 3000
    });

    this.cdr.markForCheck();
  }

  /**
   * Subscribe to data stream and update chart
   */
  private subscribeToDataStream(): void {
    if (!this.dataStream$) {
      console.warn('No data stream provided to realtime line chart');
      return;
    }

    this.dataStream$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dataPoint => {
        this.addDataPoint(dataPoint);
      });
  }

  /**
   * Add a new data point to the chart
   */
  private addDataPoint(dataPoint: ChartDataPoint): void {
    // Add to circular buffer
    this.dataBuffer.push([dataPoint.timestamp, dataPoint.value]);

    // Get all data from buffer
    const chartData = this.dataBuffer.toArray();

    // Update chart efficiently using merge
    this.updateOptions.set({
      series: [
        {
          data: chartData
        }
      ]
    });

    this.cdr.markForCheck();
  }

  /**
   * Clear all data from the chart
   */
  public clear(): void {
    this.dataBuffer.clear();

    this.updateOptions.set({
      series: [
        {
          data: []
        }
      ]
    });

    this.cdr.markForCheck();
  }

  /**
   * Export chart as image
   * @param options - Export options
   * @returns Data URL of the image or null if chart is not initialized
   */
  public exportImage(options?: ChartExportOptions): string | null {
    if (!this.chart) {
      return null;
    }

    const theme = this.themeService.getCurrentTheme();
    const exportOptions = {
      type: options?.type ?? 'png',
      pixelRatio: options?.pixelRatio ?? 2,
      backgroundColor: options?.backgroundColor ?? theme.backgroundColor
    };

    return this.chart.getDataURL(exportOptions);
  }

  /**
   * Export chart data as array
   * @returns Array of [timestamp, value] tuples
   */
  public exportData(): [number, number][] {
    return this.dataBuffer.toArray();
  }

  /**
   * Get current data buffer size
   */
  public getDataSize(): number {
    return this.dataBuffer.getSize();
  }

  /**
   * Convert hex color to rgba
   */
  private hexToRgba(hex: string, alpha: number): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
