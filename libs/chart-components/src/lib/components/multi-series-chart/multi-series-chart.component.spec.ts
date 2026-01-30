import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { MultiSeriesChartComponent } from './multi-series-chart.component';
import { ChartThemeService } from '../../services';
import { MultiSeriesDataPoint, MultiSeriesConfig } from '../../models';
import { vi } from 'vitest';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';

// Mock ResizeObserver
(window as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('MultiSeriesChartComponent', () => {
  let component: MultiSeriesChartComponent;
  let fixture: ComponentFixture<MultiSeriesChartComponent>;
  let dataStream$: Subject<MultiSeriesDataPoint>;

  const mockConfig: MultiSeriesConfig = {
    title: 'Multi-Series Test Chart',
    series: [
      {
        name: 'Rate',
        yAxisIndex: 0,
        yAxisLabel: 'bbl/min',
        lineColor: '#2196f3'
      },
      {
        name: 'Pressure',
        yAxisIndex: 1,
        yAxisLabel: 'psi',
        lineColor: '#ff9800'
      },
      {
        name: 'Prop Conc',
        yAxisIndex: 2,
        yAxisLabel: 'ppg',
        lineColor: '#4caf50'
      }
    ],
    maxDataPoints: 100
  };

  beforeEach(async () => {
    dataStream$ = new Subject<MultiSeriesDataPoint>();

    await TestBed.configureTestingModule({
      imports: [MultiSeriesChartComponent],
      providers: [
        ChartThemeService,
        {
          provide: NGX_ECHARTS_CONFIG,
          useValue: { echarts: () => import('echarts') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSeriesChartComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
    component.dataStream$ = dataStream$.asObservable();
  });

  afterEach(() => {
    dataStream$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with config', () => {
    fixture.detectChanges();
    expect(component.config).toEqual(mockConfig);
  });

  it('should handle multi-series data points', () => {
    fixture.detectChanges();

    const dataPoint: MultiSeriesDataPoint = {
      timestamp: Date.now(),
      values: {
        'Rate': 15.5,
        'Pressure': 5000,
        'Prop Conc': 2.5
      }
    };

    dataStream$.next(dataPoint);

    const exportedData = component.exportData();
    expect(exportedData.size).toBe(3);
    expect(exportedData.get('Rate')?.length).toBe(1);
    expect(exportedData.get('Pressure')?.length).toBe(1);
    expect(exportedData.get('Prop Conc')?.length).toBe(1);
  });

  it('should handle null values in series', () => {
    fixture.detectChanges();

    const dataPoint: MultiSeriesDataPoint = {
      timestamp: Date.now(),
      values: {
        'Rate': 15.5,
        'Pressure': null,
        'Prop Conc': 2.5
      }
    };

    dataStream$.next(dataPoint);

    const exportedData = component.exportData();
    const pressureData = exportedData.get('Pressure');
    expect(pressureData?.[0][1]).toBeNull();
  });

  it('should maintain max data points per series', () => {
    fixture.detectChanges();

    // Add more points than maxDataPoints
    for (let i = 0; i < 150; i++) {
      dataStream$.next({
        timestamp: Date.now() + i * 1000,
        values: {
          'Rate': Math.random() * 100,
          'Pressure': Math.random() * 10000,
          'Prop Conc': Math.random() * 15
        }
      });
    }

    const exportedData = component.exportData();
    exportedData.forEach(seriesData => {
      expect(seriesData.length).toBe(mockConfig.maxDataPoints);
    });
  });

  it('should clear all series data', () => {
    fixture.detectChanges();

    dataStream$.next({
      timestamp: Date.now(),
      values: {
        'Rate': 10,
        'Pressure': 5000,
        'Prop Conc': 2
      }
    });

    component.clear();

    const exportedData = component.exportData();
    exportedData.forEach(seriesData => {
      expect(seriesData.length).toBe(0);
    });
  });

  it('should export data for all series', () => {
    fixture.detectChanges();

    dataStream$.next({
      timestamp: 12345,
      values: {
        'Rate': 20,
        'Pressure': 6000,
        'Prop Conc': 3
      }
    });

    const exported = component.exportData();
    expect(exported.size).toBe(3);
    expect(exported.get('Rate')?.[0]).toEqual([12345, 20]);
    expect(exported.get('Pressure')?.[0]).toEqual([12345, 6000]);
    expect(exported.get('Prop Conc')?.[0]).toEqual([12345, 3]);
  });

  it('should handle theme changes', () => {
    component.isDarkTheme = false;
    fixture.detectChanges();

    component.isDarkTheme = true;
    fixture.detectChanges();

    expect(component.isDarkTheme).toBe(true);
  });

  it('should cleanup on destroy', () => {
    fixture.detectChanges();
    const disposeSpy = vi.spyOn(component as any, 'ngOnDestroy');

    component.ngOnDestroy();
    expect(disposeSpy).toHaveBeenCalled();
  });
});
