import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BHPCalculationConfig, DEFAULT_BHP_CONFIG } from './bhp-config.model';

/**
 * Service for managing BHP calculation configuration
 * Provides reactive updates to configuration changes
 */
@Injectable({
  providedIn: 'root',
})
export class BHPConfigService {
  private readonly configSubject = new BehaviorSubject<BHPCalculationConfig>(
    DEFAULT_BHP_CONFIG
  );

  /**
   * Observable stream of configuration updates
   */
  public readonly config$: Observable<BHPCalculationConfig> =
    this.configSubject.asObservable();

  constructor() {}

  /**
   * Get current configuration
   */
  public getConfig(): BHPCalculationConfig {
    return { ...this.configSubject.value };
  }

  /**
   * Update configuration (partial update)
   * @param config Partial configuration to merge with current config
   */
  public updateConfig(config: Partial<BHPCalculationConfig>): void {
    const currentConfig = this.configSubject.value;
    const newConfig = { ...currentConfig, ...config };

    // Validate configuration
    this.validateConfig(newConfig);

    this.configSubject.next(newConfig);
  }

  /**
   * Set complete configuration (replace)
   * @param config Complete configuration
   */
  public setConfig(config: BHPCalculationConfig): void {
    // Validate configuration
    this.validateConfig(config);

    this.configSubject.next({ ...config });
  }

  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(): void {
    this.configSubject.next({ ...DEFAULT_BHP_CONFIG });
  }

  /**
   * Validate configuration values
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: BHPCalculationConfig): void {
    if (config.maxTimeDiffSeconds <= 0) {
      throw new Error('maxTimeDiffSeconds must be positive');
    }

    if (config.maxOffsetMinutes <= 0) {
      throw new Error('maxOffsetMinutes must be positive');
    }

    if (config.minOffsetMinutes < 0) {
      throw new Error('minOffsetMinutes must be non-negative');
    }

    if (config.minOffsetMinutes >= config.maxOffsetMinutes) {
      throw new Error('minOffsetMinutes must be less than maxOffsetMinutes');
    }

    if (config.windowSizeSeconds <= 0) {
      throw new Error('windowSizeSeconds must be positive');
    }
  }
}
