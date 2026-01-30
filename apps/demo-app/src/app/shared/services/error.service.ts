import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Error message structure
 */
export interface ErrorMessage {
  /**
   * Error message text
   */
  message: string;

  /**
   * Error type/severity
   */
  type: 'error' | 'warning' | 'info';

  /**
   * Timestamp when error occurred
   */
  timestamp: Date;

  /**
   * Optional error details
   */
  details?: any;
}

/**
 * Service for managing application errors and notifications
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private errors$ = new Subject<ErrorMessage>();

  /**
   * Observable stream of error messages
   */
  public readonly errorStream$: Observable<ErrorMessage> = this.errors$.asObservable();

  /**
   * Show an error message
   */
  public showError(message: string, details?: any): void {
    this.errors$.next({
      message,
      type: 'error',
      timestamp: new Date(),
      details,
    });
  }

  /**
   * Show a warning message
   */
  public showWarning(message: string, details?: any): void {
    this.errors$.next({
      message,
      type: 'warning',
      timestamp: new Date(),
      details,
    });
  }

  /**
   * Show an info message
   */
  public showInfo(message: string, details?: any): void {
    this.errors$.next({
      message,
      type: 'info',
      timestamp: new Date(),
      details,
    });
  }

  /**
   * Handle streaming errors
   */
  public handleStreamError(error: any): void {
    console.error('Stream error:', error);
    this.showError('Simulation stream error. Attempting to recover...', error);
  }

  /**
   * Handle calculation errors
   */
  public handleCalculationError(error: any): void {
    console.error('Calculation error:', error);
    this.showError('Error calculating BHP values. Please check configuration.', error);
  }

  /**
   * Handle generic errors
   */
  public handleError(error: any, context?: string): void {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    const message = error?.message || 'An unexpected error occurred';
    this.showError(message, error);
  }
}
