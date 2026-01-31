import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RealtimeLineChartComponent,
  MultiSeriesChartComponent,
  RealtimeChartConfig,
  MultiSeriesConfig,
  MultiSeriesDataPoint,
} from '@angular-bhp-simulator/chart-components';
import { EnhancedDataPoint } from '@angular-bhp-simulator/bhp-calculator';

/**
 * Chart grid component
 * Displays multiple charts in a responsive grid layout
 */
@Component({
  selector: 'app-chart-grid',
  standalone: true,
  imports: [CommonModule, RealtimeLineChartComponent, MultiSeriesChartComponent],
  templateUrl: './chart-grid.component.html',
  styleUrl: './chart-grid.component.scss',
})
export class ChartGridComponent {
  @Input() dataStream$!: Observable<EnhancedDataPoint>;
  @Input() isDarkTheme = false;

  private readonly MAX_DATA_POINTS = 15000; // 250 minutes at 1/sec

  // Multi-series chart configuration
  public readonly multiSeriesConfig: MultiSeriesConfig = {
    title: 'All Measurements',
    series: [
      {
        name: 'Pressure',
        yAxisIndex: 0,
        yAxisLabel: 'PSI',
        lineColor: '#FF9800',
      },
      {
        name: 'Rate',
        yAxisIndex: 1,
        yAxisLabel: 'BPM',
        lineColor: '#2196F3',
      },
      {
        name: 'Prop Conc',
        yAxisIndex: 2,
        yAxisLabel: 'PPA',
        lineColor: '#4CAF50',
      },
      {
        name: 'BHP',
        yAxisIndex: 3,
        yAxisLabel: 'PPA',
        lineColor: '#9C27B0',
      },
    ],
    maxDataPoints: this.MAX_DATA_POINTS,
  };

  // Chart configurations
  public readonly rateChartConfig: RealtimeChartConfig = {
    title: 'Slurry Rate',
    yAxisLabel: 'Rate (BPM)',
    lineColor: '#2196F3',
    maxDataPoints: this.MAX_DATA_POINTS,
  };

  public readonly pressureChartConfig: RealtimeChartConfig = {
    title: 'Treating Pressure',
    yAxisLabel: 'Pressure (PSI)',
    lineColor: '#FF9800',
    maxDataPoints: this.MAX_DATA_POINTS,
  };

  public readonly propConcChartConfig: RealtimeChartConfig = {
    title: 'Proppant Concentration',
    yAxisLabel: 'Concentration (PPA)',
    lineColor: '#4CAF50',
    maxDataPoints: this.MAX_DATA_POINTS,
  };

  public readonly bhpChartConfig: RealtimeChartConfig = {
    title: 'Bottomhole Prop Conc (Calculated)',
    yAxisLabel: 'BHP (PPA)',
    lineColor: '#9C27B0',
    maxDataPoints: this.MAX_DATA_POINTS,
  };

  /**
   * Get multi-series data stream
   */
  public get multiSeriesStream$(): Observable<MultiSeriesDataPoint> {
    return this.dataStream$.pipe(
      map((point) => ({
        timestamp: point.timestamp,
        values: {
          'Rate': point.rate,
          'Pressure': point.pressure ?? 0,
          'Prop Conc': point.propConc,
          'BHP': point.bhp ?? 0,
        },
      }))
    );
  }

  /**
   * Get rate data stream
   */
  public get rateStream$(): Observable<{ timestamp: number; value: number }> {
    return this.dataStream$.pipe(
      map((point) => ({
        timestamp: point.timestamp,
        value: point.rate,
      }))
    );
  }

  /**
   * Get pressure data stream
   */
  public get pressureStream$(): Observable<{ timestamp: number; value: number }> {
    return this.dataStream$.pipe(
      map((point) => ({
        timestamp: point.timestamp,
        value: point.pressure ?? 0,
      }))
    );
  }

  /**
   * Get proppant concentration data stream
   */
  public get propConcStream$(): Observable<{ timestamp: number; value: number }> {
    return this.dataStream$.pipe(
      map((point) => ({
        timestamp: point.timestamp,
        value: point.propConc,
      }))
    );
  }

  /**
   * Get BHP data stream
   */
  public get bhpStream$(): Observable<{ timestamp: number; value: number }> {
    return this.dataStream$.pipe(
      map((point) => ({
        timestamp: point.timestamp,
        value: point.bhp ?? 0,
      }))
    );
  }
}
