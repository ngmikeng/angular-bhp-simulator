import { TestBed } from '@angular/core/testing';
import { ChartThemeService } from './chart-theme.service';

describe('ChartThemeService', () => {
  let service: ChartThemeService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with light theme by default', () => {
    expect(service.isDarkMode()).toBe(false);
    const theme = service.getCurrentTheme();
    expect(theme.name).toBe('light');
  });

  it('should toggle theme', () => {
    expect(service.isDarkMode()).toBe(false);
    
    service.toggleTheme();
    expect(service.isDarkMode()).toBe(true);
    expect(service.getCurrentTheme().name).toBe('dark');
    
    service.toggleTheme();
    expect(service.isDarkMode()).toBe(false);
    expect(service.getCurrentTheme().name).toBe('light');
  });

  it('should set theme explicitly', () => {
    service.setTheme(true);
    expect(service.isDarkMode()).toBe(true);
    expect(service.getCurrentTheme().name).toBe('dark');
    
    service.setTheme(false);
    expect(service.isDarkMode()).toBe(false);
    expect(service.getCurrentTheme().name).toBe('light');
  });

  it('should persist theme preference to localStorage', () => {
    service.setTheme(true);
    expect(localStorage.getItem('chart-theme-preference')).toBe('dark');
    
    service.setTheme(false);
    expect(localStorage.getItem('chart-theme-preference')).toBe('light');
  });

  it('should load theme preference from localStorage', () => {
    localStorage.setItem('chart-theme-preference', 'dark');
    const newService = new ChartThemeService();
    expect(newService.isDarkMode()).toBe(true);
  });

  it('should provide base chart option with theme', () => {
    const option = service.getBaseChartOption();
    expect(option).toBeTruthy();
    expect(option.backgroundColor).toBe('transparent');
    expect(option.color).toBeDefined();
  });

  it('should apply theme to chart option', () => {
    const baseOption = {
      title: { text: 'Test Chart' },
      xAxis: { type: 'category' as const }
    };
    
    const themedOption = service.applyTheme(baseOption);
    expect(themedOption.title).toEqual(baseOption.title);
    expect(themedOption.textStyle).toBeDefined();
    expect(themedOption.color).toBeDefined();
  });

  it('should get color from palette by index', () => {
    const color0 = service.getColor(0);
    const color1 = service.getColor(1);
    expect(color0).toBeTruthy();
    expect(color1).toBeTruthy();
    expect(color0).not.toBe(color1);
    
    // Test wrapping
    const colorPalette = service.getColorPalette();
    const wrappedColor = service.getColor(colorPalette.length);
    expect(wrappedColor).toBe(color0);
  });

  it('should return color palette', () => {
    const palette = service.getColorPalette();
    expect(Array.isArray(palette)).toBe(true);
    expect(palette.length).toBeGreaterThan(0);
  });

  it('should provide different palettes for dark and light themes', () => {
    const lightPalette = service.getColorPalette(false);
    const darkPalette = service.getColorPalette(true);
    
    expect(lightPalette[0]).not.toBe(darkPalette[0]);
  });

  it('should emit theme changes via observables', () => {
    return new Promise<void>((resolve) => {
      let emissionCount = 0;
      
      service.isDarkMode$.subscribe(isDark => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(isDark).toBe(true);
          resolve();
        }
      });
      
      service.setTheme(true);
    });
  });
});
