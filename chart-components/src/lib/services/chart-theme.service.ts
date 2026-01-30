import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { EChartsOption } from 'echarts';

/**
 * Chart theme configuration
 */
export interface ChartTheme {
  /**
   * Theme name identifier
   */
  name: 'dark' | 'light';

  /**
   * Background color for charts
   */
  backgroundColor: string;

  /**
   * Text color for labels, titles, and legends
   */
  textColor: string;

  /**
   * Color for grid lines
   */
  gridColor: string;

  /**
   * Predefined color palette for series
   */
  colorPalette: string[];

  /**
   * Tooltip background color
   */
  tooltipBackgroundColor: string;

  /**
   * Tooltip border color
   */
  tooltipBorderColor: string;

  /**
   * Axis line color
   */
  axisLineColor: string;

  /**
   * Split line color (horizontal/vertical grid lines)
   */
  splitLineColor: string;
}

/**
 * Service for managing chart themes and providing ECharts configurations
 * Supports dark and light themes with automatic theme switching
 */
@Injectable({
  providedIn: 'root'
})
export class ChartThemeService {
  private readonly STORAGE_KEY = 'chart-theme-preference';

  /**
   * Dark theme configuration
   */
  private readonly darkTheme: ChartTheme = {
    name: 'dark',
    backgroundColor: '#1e1e1e',
    textColor: '#ffffff',
    gridColor: '#333333',
    colorPalette: [
      '#2196f3', // Blue
      '#ff9800', // Orange
      '#4caf50', // Green
      '#f44336', // Red
      '#9c27b0', // Purple
      '#00bcd4', // Cyan
      '#ffeb3b', // Yellow
      '#795548'  // Brown
    ],
    tooltipBackgroundColor: 'rgba(50, 50, 50, 0.95)',
    tooltipBorderColor: '#666666',
    axisLineColor: '#666666',
    splitLineColor: '#333333'
  };

  /**
   * Light theme configuration
   */
  private readonly lightTheme: ChartTheme = {
    name: 'light',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    gridColor: '#e0e0e0',
    colorPalette: [
      '#1976d2', // Blue
      '#f57c00', // Orange
      '#388e3c', // Green
      '#d32f2f', // Red
      '#7b1fa2', // Purple
      '#0097a7', // Cyan
      '#fbc02d', // Yellow
      '#5d4037'  // Brown
    ],
    tooltipBackgroundColor: 'rgba(255, 255, 255, 0.95)',
    tooltipBorderColor: '#cccccc',
    axisLineColor: '#cccccc',
    splitLineColor: '#e0e0e0'
  };

  /**
   * Observable for current dark mode state
   */
  private isDarkModeSubject: BehaviorSubject<boolean>;
  public readonly isDarkMode$: Observable<boolean>;

  /**
   * Observable for current theme
   */
  private currentThemeSubject: BehaviorSubject<ChartTheme>;
  public readonly currentTheme$: Observable<ChartTheme>;

  constructor() {
    // Load saved preference or detect system preference
    const isDark = this.loadThemePreference();
    
    this.isDarkModeSubject = new BehaviorSubject<boolean>(isDark);
    this.isDarkMode$ = this.isDarkModeSubject.asObservable();

    const initialTheme = isDark ? this.darkTheme : this.lightTheme;
    this.currentThemeSubject = new BehaviorSubject<ChartTheme>(initialTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
  }

  /**
   * Toggle between dark and light themes
   */
  public toggleTheme(): void {
    const isDark = !this.isDarkModeSubject.value;
    this.setTheme(isDark);
  }

  /**
   * Set theme explicitly
   * @param isDark - true for dark theme, false for light theme
   */
  public setTheme(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    this.currentThemeSubject.next(isDark ? this.darkTheme : this.lightTheme);
    this.saveThemePreference(isDark);
  }

  /**
   * Get the current theme
   * @returns Current chart theme configuration
   */
  public getCurrentTheme(): ChartTheme {
    return this.currentThemeSubject.value;
  }

  /**
   * Check if dark mode is currently active
   * @returns true if dark mode is active
   */
  public isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  /**
   * Generate base ECharts option with theme applied
   * @param isDark - Optional override for dark mode
   * @returns ECharts option object with theme configuration
   */
  public getBaseChartOption(isDark?: boolean): EChartsOption {
    const theme = (isDark !== undefined) 
      ? (isDark ? this.darkTheme : this.lightTheme)
      : this.getCurrentTheme();

    return {
      backgroundColor: 'transparent',
      color: theme.colorPalette,
      textStyle: {
        color: theme.textColor,
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif'
      },
      grid: {
        borderColor: theme.gridColor,
        containLabel: true
      },
      tooltip: {
        backgroundColor: theme.tooltipBackgroundColor,
        borderColor: theme.tooltipBorderColor,
        borderWidth: 1,
        textStyle: {
          color: theme.textColor
        }
      },
      legend: {
        textStyle: {
          color: theme.textColor
        }
      }
    };
  }

  /**
   * Apply theme to an existing chart option
   * @param option - Base chart option to theme
   * @param isDark - Optional override for dark mode
   * @returns Themed chart option
   */
  public applyTheme(option: EChartsOption, isDark?: boolean): EChartsOption {
    const baseOption = this.getBaseChartOption(isDark);
    return {
      ...baseOption,
      ...option,
      textStyle: {
        ...baseOption.textStyle,
        ...(option.textStyle || {})
      },
      tooltip: {
        ...baseOption.tooltip,
        ...(option.tooltip || {})
      }
    };
  }

  /**
   * Load theme preference from localStorage
   * Falls back to system preference if not found
   */
  private loadThemePreference(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored !== null) {
      return stored === 'dark';
    }

    // Detect system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return false; // Default to light theme
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemePreference(isDark: boolean): void {
    localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
  }

  /**
   * Get color from palette by index
   * @param index - Color index in palette
   * @param isDark - Optional theme override
   * @returns Color hex string
   */
  public getColor(index: number, isDark?: boolean): string {
    const theme = (isDark !== undefined)
      ? (isDark ? this.darkTheme : this.lightTheme)
      : this.getCurrentTheme();
    
    return theme.colorPalette[index % theme.colorPalette.length];
  }

  /**
   * Get all colors from current palette
   * @param isDark - Optional theme override
   * @returns Array of color hex strings
   */
  public getColorPalette(isDark?: boolean): string[] {
    const theme = (isDark !== undefined)
      ? (isDark ? this.darkTheme : this.lightTheme)
      : this.getCurrentTheme();
    
    return [...theme.colorPalette];
  }
}
