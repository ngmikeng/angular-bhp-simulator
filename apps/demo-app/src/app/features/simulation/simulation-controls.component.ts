import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStateService } from '../../shared/services/app-state.service';
import { DataPattern } from '@angular-bhp-simulator/data-generator';

/**
 * Simulation controls component
 * Provides UI controls for starting/stopping simulation, adjusting speed, and changing patterns
 */
@Component({
  selector: 'app-simulation-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatSliderModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './simulation-controls.component.html',
  styleUrl: './simulation-controls.component.scss',
})
export class SimulationControlsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Available patterns
  public readonly patterns: { value: DataPattern; label: string }[] = [
    { value: 'steady', label: 'Steady State' },
    { value: 'ramping', label: 'Ramping Up/Down' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'realistic', label: 'Realistic Mix' },
    { value: 'pump-stop', label: 'Pump Stop Events' },
    { value: 'stage-transition', label: 'Stage Transitions' },
  ];

  // Available speeds
  public readonly speeds: { value: number; label: string }[] = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 5, label: '5x' },
    { value: 10, label: '10x' },
  ];

  // Current state
  public isRunning = false;
  public currentSpeed = 1;
  public currentPattern: DataPattern = 'realistic';
  public offsetTimeMinutes = 3;

  constructor(public appState: AppStateService) {}

  ngOnInit(): void {
    // Subscribe to state changes
    this.appState.isRunning$.pipe(takeUntil(this.destroy$)).subscribe((running) => {
      this.isRunning = running;
    });

    this.appState.speed$.pipe(takeUntil(this.destroy$)).subscribe((speed) => {
      this.currentSpeed = speed;
    });

    this.appState.pattern$.pipe(takeUntil(this.destroy$)).subscribe((pattern) => {
      this.currentPattern = pattern;
    });

    this.appState.offsetTimeMinutes$.pipe(takeUntil(this.destroy$)).subscribe((minutes) => {
      this.offsetTimeMinutes = minutes;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle simulation start/stop
   */
  public onStartStop(): void {
    if (this.isRunning) {
      this.appState.stopSimulation();
    } else {
      this.appState.startSimulation();
    }
  }

  /**
   * Handle speed change
   */
  public onSpeedChange(speed: number): void {
    this.appState.setSpeed(speed);
  }

  /**
   * Handle pattern change
   */
  public onPatternChange(pattern: DataPattern): void {
    this.appState.setPattern(pattern);
  }

  /**
   * Handle offset time change
   */
  public onOffsetTimeChange(minutes: number): void {
    if (minutes >= 0) {
      this.appState.setOffsetTimeMinutes(minutes);
    }
  }

  /**
   * Reset simulation
   */
  public onReset(): void {
    this.appState.reset();
  }

  /**
   * Get icon for play/pause button
   */
  public getPlayPauseIcon(): string {
    return this.isRunning ? 'pause' : 'play_arrow';
  }

  /**
   * Get label for play/pause button
   */
  public getPlayPauseLabel(): string {
    return this.isRunning ? 'Pause' : 'Start';
  }
}
