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
import { MultiSeriesConfig, MultiSeriesDataPoint, ChartExportOptions } from '../../models';
import { ChartThemeService } from '../../services';
import { formatTime, CircularBuffer } from '../../utils';

/**
 * Multi-series chart component for synchronized visualization
 * Displays multiple data series with separate Y-axes in a single chart
 * 
 * Features:
 * - Multiple Y-axes support (left and right)
 * - Synchronized crosshair and zoom
 * - Independent scaling per series
 * - Legend with series toggle
 * - Theme-aware styling
 * - Export functionality
 * 
 * @example
 * ```html
 * <lib-multi-series-chart
 *   [config]="multiSeriesConfig"
 *   [dataStream$]="dataObservable"
 *   [isDarkTheme]="isDark">
 * </lib-multi-series-chart>
 * ```
 */
@Component({
  selector: 'lib-multi-series-chart',
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './multi-series-chart.component.html',
  styleUrls: ['./multi-series-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSeriesChartComponent implements OnInit, OnDestroy {
  /**
   * Multi-series chart configuration
   */
  @Input({ required: true }) config!: MultiSeriesConfig;

  /**
   * Observable stream of multi-series data points
   */
  @Input({ required: true }) dataStream$!: Observable<MultiSeriesDataPoint>;

  /**
   * Dark theme flag
   */
  @Input() isDarkTheme = false;

  private destroy$ = new Subject<void>();
  private chart: ECharts | null = null;

  // Data buffers per series
  private seriesBuffers = new Map<string, CircularBuffer<[number, number | null]>>();
  private maxDataPoints = 600;

  // Chart options signals
  protected chartOptions = signal<EChartsOption>({});
  protected updateOptions = signal<EChartsOption>({});

  constructor(
    private themeService: ChartThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.maxDataPoints = this.config.maxDataPoints ?? 600;
    
    // Initialize buffers for each series
    this.config.series.forEach((seriesConfig) => {
      this.seriesBuffers.set(
        seriesConfig.name,
        new CircularBuffer(this.maxDataPoints)
      );
    });

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

    // Build Y-axes configuration
    const yAxes: any[] = [];
    const uniqueYAxisIndices = new Set(this.config.series.map((s) => s.yAxisIndex));
    
    uniqueYAxisIndices.forEach((yAxisIndex) => {
      const seriesForAxis = this.config.series.filter((s) => s.yAxisIndex === yAxisIndex);
      const firstSeries = seriesForAxis[0];

      yAxes.push({
        type: 'value',
        name: firstSeries.yAxisLabel,
        nameLocation: 'middle',
        nameGap: yAxisIndex === 0 ? 50 : 50,
        nameTextStyle: {
          color: theme.textColor,
          fontSize: 12
        },
        position: yAxisIndex === 0 ? 'left' : 'right',
        offset: (yAxisIndex as number) > 1 ? ((yAxisIndex as number) - 1) * 60 : 0,
        min: firstSeries.yAxisRange?.[0],
        max: firstSeries.yAxisRange?.[1],
        axisLine: {
          show: true,
          lineStyle: {
            color: theme.axisLineColor
          }
        },
        axisLabel: {
          color: theme.textColor,
          formatter: (value: number) => value.toFixed(1)
        },
        splitLine: {
          show: yAxisIndex === 0,
          lineStyle: {
            color: theme.splitLineColor,
            type: 'dashed'
          }
        }
      });
    });

    // Build series configuration
    const seriesConfigs = this.config.series.map((seriesConfig) => {
      const lineColor = seriesConfig.lineColor;
      const areaColor = this.hexToRgba(lineColor, 0.2);

      return {
        name: seriesConfig.name,
        type: 'line' as const,
        yAxisIndex: seriesConfig.yAxisIndex,
        smooth: true,
        symbol: 'none',
        sampling: 'lttb' as const,
        lineStyle: {
          color: lineColor,
          width: 2
        },
        areaStyle: seriesConfig.showArea ? {
          color: areaColor
        } : undefined,
        data: [],
        animation: true,
        animationDuration: this.config.animationDuration ?? 300,
        connectNulls: false // Don't connect across null values
      };
    });

    this.chartOptions.set({
      backgroundColor: 'transparent',
      color: this.config.series.map((s) => s.lineColor),

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

      legend: {
        data: this.config.series.map((s) => s.name),
        top: 40,
        left: 'center',
        textStyle: {
          color: theme.textColor
        },
        itemGap: 20,
        icon: 'roundRect'
      },

      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltipBackgroundColor,
        borderColor: theme.tooltipBorderColor,
        borderWidth: 1,
        textStyle: {
          color: theme.textColor
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';

          const timestamp = params[0].data[0];
          const formattedTime = formatTime(timestamp, this.config.timeFormat ?? 'HH:mm:ss');

          let html = `<div style="padding: 8px;">
            <div style="font-weight: 500; margin-bottom: 8px;">${formattedTime}</div>`;

          params.forEach((param: any) => {
            const value = param.data[1];
            const displayValue = value != null ? value.toFixed(2) : 'N/A';
            const series = this.config.series.find((s) => s.name === param.seriesName);
            const unit = series?.yAxisLabel || '';

            html += `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>
                <span style="margin-right: 8px;">${param.seriesName}:</span>
                <span style="font-weight: 500;">${displayValue} ${unit}</span>
              </div>`;
          });

          html += '</div>';
          return html;
        },
        axisPointer: {
          type: this.config.syncCrosshair !== false ? 'cross' : 'line',
          animation: false,
          label: {
            backgroundColor: theme.tooltipBorderColor
          }
        }
      },

      grid: {
        left: '70px',
        right: uniqueYAxisIndices.size > 1 ? '70px' : '40px',
        top: '90px',
        bottom: '100px',
        containLabel: false
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

      yAxis: yAxes,

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
          handleStyle: {
            borderColor: theme.axisLineColor
          }
        }
      ],

      series: seriesConfigs,

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
      console.warn('No data stream provided to multi-series chart');
      return;
    }

    this.dataStream$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dataPoint => {
        this.addDataPoint(dataPoint);
      });
  }

  /**
   * Add a new multi-series data point to the chart
   */
  private addDataPoint(dataPoint: MultiSeriesDataPoint): void {
    // Update each series buffer
    this.config.series.forEach((seriesConfig) => {
      const buffer = this.seriesBuffers.get(seriesConfig.name);
      const value = dataPoint.values[seriesConfig.name];
      
      if (buffer) {
        buffer.push([dataPoint.timestamp, value ?? null]);
      }
    });

    // Prepare data for all series
    const seriesData = this.config.series.map((seriesConfig) => {
      const buffer = this.seriesBuffers.get(seriesConfig.name);
      return {
        data: buffer ? buffer.toArray() : []
      };
    });

    // Update chart
    this.updateOptions.set({
      series: seriesData
    });

    this.cdr.markForCheck();
  }

  /**
   * Clear all data from the chart
   */
  public clear(): void {
    this.seriesBuffers.forEach(buffer => buffer.clear());

    const seriesData = this.config.series.map(() => ({
      data: []
    }));

    this.updateOptions.set({
      series: seriesData
    });

    this.cdr.markForCheck();
  }

  /**
   * Export chart as image
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
   * Export chart data for all series
   */
  public exportData(): Map<string, [number, number | null][]> {
    const exportMap = new Map<string, [number, number | null][]>();
    
    this.seriesBuffers.forEach((buffer, seriesName) => {
      exportMap.set(seriesName, buffer.toArray());
    });

    return exportMap;
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
