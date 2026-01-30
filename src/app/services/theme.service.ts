import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Service for managing application theme (light/dark mode)
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'bhp-simulator-theme';

  private themeModeSubject: BehaviorSubject<ThemeMode>;
  public themeMode$: Observable<ThemeMode>;

  private isDarkModeSubject: BehaviorSubject<boolean>;
  public isDarkMode$: Observable<boolean>;

  constructor() {
    const savedMode = this.loadThemeMode();
    this.themeModeSubject = new BehaviorSubject<ThemeMode>(savedMode);
    this.themeMode$ = this.themeModeSubject.asObservable();

    const isDark = this.resolveIsDark(savedMode);
    this.isDarkModeSubject = new BehaviorSubject<boolean>(isDark);
    this.isDarkMode$ = this.isDarkModeSubject.asObservable();

    // Listen for system theme changes
    this.watchSystemTheme();

    // Apply theme to document
    this.applyTheme(isDark);
  }

  /**
   * Set theme mode
   */
  public setThemeMode(mode: ThemeMode): void {
    this.themeModeSubject.next(mode);
    this.saveThemeMode(mode);

    const isDark = this.resolveIsDark(mode);
    this.isDarkModeSubject.next(isDark);
    this.applyTheme(isDark);
  }

  /**
   * Toggle between light and dark theme
   */
  public toggleTheme(): void {
    const currentMode = this.themeModeSubject.value;
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    this.setThemeMode(newMode);
  }

  /**
   * Get current theme mode
   */
  public getCurrentMode(): ThemeMode {
    return this.themeModeSubject.value;
  }

  /**
   * Check if current theme is dark
   */
  public isDark(): boolean {
    return this.isDarkModeSubject.value;
  }

  /**
   * Resolve whether theme should be dark
   */
  private resolveIsDark(mode: ThemeMode): boolean {
    if (mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return mode === 'dark';
  }

  /**
   * Apply theme to document body
   */
  private applyTheme(isDark: boolean): void {
    const body = document.body;

    if (isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  /**
   * Watch for system theme changes
   */
  private watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        if (this.themeModeSubject.value === 'auto') {
          const isDark = e.matches;
          this.isDarkModeSubject.next(isDark);
          this.applyTheme(isDark);
        }
      });
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener((e) => {
        if (this.themeModeSubject.value === 'auto') {
          const isDark = e.matches;
          this.isDarkModeSubject.next(isDark);
          this.applyTheme(isDark);
        }
      });
    }
  }

  /**
   * Load theme mode from localStorage
   */
  private loadThemeMode(): ThemeMode {
    try {
      const saved = localStorage.getItem(this.THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        return saved;
      }
    } catch (e) {
      console.warn('Failed to load theme from localStorage:', e);
    }
    return 'auto';
  }

  /**
   * Save theme mode to localStorage
   */
  private saveThemeMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }
}
