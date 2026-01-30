import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { RealtimeLineChartComponent } from './realtime-line-chart.component';
import { ChartThemeService } from '../../services';
import { ChartDataPoint, RealtimeChartConfig } from '../../models';
import { vi } from 'vitest';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';

// Mock ResizeObserver
(window as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('RealtimeLineChartComponent', () => {
  let component: RealtimeLineChartComponent;
  let fixture: ComponentFixture<RealtimeLineChartComponent>;
  let dataStream$: Subject<ChartDataPoint>;

  const mockConfig: RealtimeChartConfig = {
    title: 'Test Chart',
    yAxisLabel: 'bbl/min',
    maxDataPoints: 100
  };

  beforeEach(async () => {
    dataStream$ = new Subject<ChartDataPoint>();

    await TestBed.configureTestingModule({
      imports: [RealtimeLineChartComponent],
      providers: [
        ChartThemeService,
        {
          provide: NGX_ECHARTS_CONFIG,
          useValue: { echarts: () => import('echarts') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RealtimeLineChartComponent);
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

  it('should handle data points', () => {
    fixture.detectChanges();
    
    const dataPoint: ChartDataPoint = {
      timestamp: Date.now(),
      value: 15.5
    };

    dataStream$.next(dataPoint);
    expect(component.getDataSize()).toBe(1);
  });

  it('should maintain max data points', () => {
    fixture.detectChanges();
    
    // Add more points than maxDataPoints
    for (let i = 0; i < 150; i++) {
      dataStream$.next({
        timestamp: Date.now() + i * 1000,
        value: Math.random() * 100
      });
    }

    expect(component.getDataSize()).toBe(mockConfig.maxDataPoints);
  });

  it('should clear data', () => {
    fixture.detectChanges();
    
    dataStream$.next({ timestamp: Date.now(), value: 10 });
    expect(component.getDataSize()).toBe(1);
    
    component.clear();
    expect(component.getDataSize()).toBe(0);
  });

  it('should export data', () => {
    fixture.detectChanges();
    
    const dataPoint = { timestamp: Date.now(), value: 20 };
    dataStream$.next(dataPoint);
    
    const exported = component.exportData();
    expect(exported.length).toBe(1);
    expect(exported[0][0]).toBe(dataPoint.timestamp);
    expect(exported[0][1]).toBe(dataPoint.value);
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
