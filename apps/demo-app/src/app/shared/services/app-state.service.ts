import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState, initialAppState } from '../../shared/models/app-state.model';
import { DataPattern, GeneratorConfig } from '@angular-bhp-simulator/data-generator';

/**
 * Service for managing application state
 */
@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private state$ = new BehaviorSubject<AppState>(initialAppState);

  // Selectors
  public readonly isRunning$: Observable<boolean> = this.state$.pipe(
    map((s) => s.isSimulationRunning)
  );

  public readonly speed$: Observable<number> = this.state$.pipe(
    map((s) => s.simulationSpeed)
  );

  public readonly pattern$: Observable<DataPattern> = this.state$.pipe(
    map((s) => s.currentPattern)
  );

  public readonly generatorConfig$: Observable<GeneratorConfig> = this.state$.pipe(
    map((s) => s.generatorConfig)
  );

  public readonly selectedMetrics$: Observable<string[]> = this.state$.pipe(
    map((s) => s.selectedMetrics)
  );

  public readonly offsetTimeMinutes$: Observable<number> = this.state$.pipe(
    map((s) => s.offsetTimeMinutes)
  );

  /**
   * Get current state snapshot
   */
  public getState(): AppState {
    return this.state$.value;
  }

  /**
   * Get state observable
   */
  public getState$(): Observable<AppState> {
    return this.state$.asObservable();
  }

  /**
   * Start simulation
   */
  public startSimulation(): void {
    this.updateState({ isSimulationRunning: true });
  }

  /**
   * Stop simulation
   */
  public stopSimulation(): void {
    this.updateState({ isSimulationRunning: false });
  }

  /**
   * Set simulation speed
   */
  public setSpeed(speed: number): void {
    this.updateState({ simulationSpeed: speed });
  }

  /**
   * Set data pattern
   */
  public setPattern(pattern: DataPattern): void {
    this.updateState({
      currentPattern: pattern,
      generatorConfig: {
        ...this.state$.value.generatorConfig,
        pattern,
      },
    });
  }

  /**
   * Update generator configuration
   */
  public updateConfig(config: Partial<GeneratorConfig>): void {
    this.updateState({
      generatorConfig: {
        ...this.state$.value.generatorConfig,
        ...config,
      },
    });
  }

  /**
   * Set offset time for BHP calculation
   */
  public setOffsetTimeMinutes(minutes: number): void {
    if (minutes >= 0) {
      this.updateState({ offsetTimeMinutes: minutes });
    }
  }

  /**
   * Reset to initial state
   */
  public reset(): void {
    this.state$.next({ ...initialAppState });
  }

  /**
   * Update state with partial changes
   */
  private updateState(changes: Partial<AppState>): void {
    const currentState = this.state$.value;
    const newState = { ...currentState, ...changes };
    this.state$.next(newState);
  }
}
