import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil, scan } from 'rxjs/operators';
import { MetricCardComponent } from '@angular-bhp-simulator/chart-components';
import { EnhancedDataPoint } from '@angular-bhp-simulator/bhp-calculator';
import { MetricData, TrendDirection } from '../models/app-state.model';

/**
 * Metrics panel component
 * Displays real-time metrics with trend indicators
 */
@Component({
  selector: 'app-metrics-panel',
  standalone: true,
  imports: [CommonModule, MetricCardComponent],
  templateUrl: './metrics-panel.component.html',
  styleUrl: './metrics-panel.component.scss',
})
export class MetricsPanelComponent implements OnInit, OnDestroy {
  @Input() dataStream$!: Observable<EnhancedDataPoint>;

  private destroy$ = new Subject<void>();

  // Current metrics
  public rateMetric: MetricData = {
    value: 0,
    unit: 'BPM',
    trend: 'stable',
    changePercent: 0,
  };

  public pressureMetric: MetricData = {
    value: 0,
    unit: 'PSI',
    trend: 'stable',
    changePercent: 0,
  };

  public propConcMetric: MetricData = {
    value: 0,
    unit: 'PPA',
    trend: 'stable',
    changePercent: 0,
  };

  public bhpMetric: MetricData = {
    value: 0,
    unit: 'PSI',
    trend: 'stable',
    changePercent: 0,
    isCalculated: true,
  };

  // Historical data for trend calculation (last 10 values)
  private rateHistory: number[] = [];
  private pressureHistory: number[] = [];
  private propConcHistory: number[] = [];
  private bhpHistory: number[] = [];

  private readonly HISTORY_SIZE = 10;

  ngOnInit(): void {
    if (this.dataStream$) {
      this.dataStream$.pipe(takeUntil(this.destroy$)).subscribe((dataPoint) => {
        this.updateMetrics(dataPoint);
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update metrics with new data point
   */
  private updateMetrics(dataPoint: EnhancedDataPoint): void {
    // Update rate
    this.updateMetric(
      this.rateMetric,
      dataPoint.rate,
      this.rateHistory,
      'BPM'
    );

    // Update pressure
    this.updateMetric(
      this.pressureMetric,
      dataPoint.pressure ?? 0,
      this.pressureHistory,
      'PSI'
    );

    // Update prop concentration
    this.updateMetric(
      this.propConcMetric,
      dataPoint.propConc,
      this.propConcHistory,
      'PPA'
    );

    // Update BHP (if available)
    if (dataPoint.bhp !== undefined && dataPoint.bhp !== null) {
      this.updateMetric(
        this.bhpMetric,
        dataPoint.bhp,
        this.bhpHistory,
        'PSI',
        true
      );
    }
  }

  /**
   * Update individual metric with trend calculation
   */
  private updateMetric(
    metric: MetricData,
    value: number,
    history: number[],
    unit: string,
    isCalculated = false
  ): void {
    // Add to history
    history.push(value);
    if (history.length > this.HISTORY_SIZE) {
      history.shift();
    }

    // Calculate trend
    const trend = this.calculateTrend(history);
    const changePercent = this.calculateChangePercent(history);

    // Update metric
    metric.value = value;
    metric.unit = unit;
    metric.trend = trend;
    metric.changePercent = changePercent;
    metric.isCalculated = isCalculated;
  }

  /**
   * Calculate trend direction from history
   */
  private calculateTrend(history: number[]): TrendDirection {
    if (history.length < 2) {
      return 'stable';
    }

    // Compare recent average to older average
    const halfSize = Math.floor(history.length / 2);
    const oldAvg = this.average(history.slice(0, halfSize));
    const newAvg = this.average(history.slice(halfSize));

    const change = ((newAvg - oldAvg) / oldAvg) * 100;

    if (Math.abs(change) < 1) {
      return 'stable';
    }

    return change > 0 ? 'up' : 'down';
  }

  /**
   * Calculate percentage change
   */
  private calculateChangePercent(history: number[]): number {
    if (history.length < 2) {
      return 0;
    }

    const first = history[0];
    const last = history[history.length - 1];

    if (first === 0) {
      return 0;
    }

    return ((last - first) / first) * 100;
  }

  /**
   * Calculate average of array
   */
  private average(arr: number[]): number {
    if (arr.length === 0) {
      return 0;
    }
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
}
