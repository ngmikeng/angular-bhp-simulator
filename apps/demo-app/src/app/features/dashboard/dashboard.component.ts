import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import {
  DataGeneratorService,
  GeneratorConfig,
} from '@angular-bhp-simulator/data-generator';
import {
  BHPStreamService,
  EnhancedDataPoint,
} from '@angular-bhp-simulator/bhp-calculator';
import { AppStateService } from '../../shared/services/app-state.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ErrorService } from '../../shared/services/error.service';
import { SimulationControlsComponent } from '../simulation/simulation-controls.component';
import { MetricsPanelComponent } from '../../shared/components/metrics-panel.component';
import { ChartGridComponent } from '../charts/chart-grid.component';

/**
 * Dashboard page component
 * Main page that orchestrates the entire BHP simulation demo
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SimulationControlsComponent,
    MetricsPanelComponent,
    ChartGridComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public dataStream$!: Observable<EnhancedDataPoint>;
  public isDarkTheme = false;
  public isLoading = false;

  constructor(
    private dataGenerator: DataGeneratorService,
    private bhpCalculator: BHPStreamService,
    public appState: AppStateService,
    private theme: ThemeService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.theme.isDarkMode$.pipe(takeUntil(this.destroy$)).subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });

    // Subscribe to state changes to control data generation
    this.appState.isRunning$.pipe(takeUntil(this.destroy$)).subscribe((running) => {
      if (running) {
        this.startDataPipeline();
      } else {
        this.stopDataPipeline();
      }
    });

    // Subscribe to configuration changes
    this.appState.generatorConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        this.dataGenerator.configure(config);
      });

    // Subscribe to speed changes
    this.appState.speed$.pipe(takeUntil(this.destroy$)).subscribe((speed) => {
      this.dataGenerator.setSpeed(speed);
    });

    // Subscribe to offset time changes
    this.appState.offsetTimeMinutes$.pipe(takeUntil(this.destroy$)).subscribe((minutes) => {
      this.bhpCalculator.setOffsetTimeMinutes(minutes);
    });

    // Initialize data pipeline (but don't start it)
    this.initializeDataPipeline();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dataGenerator.stop();
  }

  /**
   * Initialize the data pipeline
   */
  private initializeDataPipeline(): void {
    try {
      // Set up BHP calculator with initial offset time from app state
      const initialOffsetTime = this.appState.getState().offsetTimeMinutes;
      this.bhpCalculator.setOffsetTimeMinutes(initialOffsetTime);

      // Connect to BHP calculator's enhanced data stream ONCE
      // This is a hot observable - it will emit whenever addDataPoint() is called
      this.dataStream$ = this.bhpCalculator.enhancedDataPoint$.pipe(
        tap(() => {
          this.isLoading = false;
        })
      );
    } catch (error) {
      this.errorService.handleError(error, 'Pipeline initialization');
    }
  }

  /**
   * Start the data pipeline
   */
  private startDataPipeline(): void {
    try {
      this.isLoading = true;

      // Get current configuration
      const config = this.appState.getState().generatorConfig;
      this.dataGenerator.configure(config);

      // Start generating data and feed it to BHP calculator
      // The BHP calculator will emit enhanced data points on enhancedDataPoint$
      const rawData$ = this.dataGenerator.start();

      rawData$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (dataPoint) => {
          this.bhpCalculator.addDataPoint(dataPoint);
        },
        error: (error) => {
          this.errorService.handleStreamError(error);
          this.appState.stopSimulation();
          this.isLoading = false;
        },
      });
    } catch (error) {
      this.errorService.handleError(error, 'Starting data pipeline');
      this.appState.stopSimulation();
      this.isLoading = false;
    }
  }

  /**
   * Stop the data pipeline
   */
  private stopDataPipeline(): void {
    try {
      this.dataGenerator.stop();
      this.isLoading = false;
    } catch (error) {
      this.errorService.handleError(error, 'Stopping data pipeline');
    }
  }
}
