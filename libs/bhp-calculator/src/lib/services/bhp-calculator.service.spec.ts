import { TestBed } from '@angular/core/testing';
import { BHPCalculatorService } from './bhp-calculator.service';
import { ComputationState } from '../models/computation-state.model';
import { DataPoint } from '../models/data-point.model';

describe('BHPCalculatorService', () => {
  let service: BHPCalculatorService;
  let state: ComputationState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BHPCalculatorService],
    });
    service = TestBed.inject(BHPCalculatorService);
    state = new ComputationState(7200);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateBHP', () => {
    it('should return cached value if available', () => {
      const timestamp = Date.now();
      state.cacheBHP(timestamp, 3.5);

      const result = service.calculateBHP(timestamp, state);

      expect(result.bhp).toBe(3.5);
      expect(result.details.fromCache).toBe(true);
    });

    it('should return null if flush volume not set', () => {
      const timestamp = Date.now();
      const point: DataPoint = {
        timestamp,
        rate: 15,
        propConc: 2.5,
      };
      state.addDataPoint(point);

      const result = service.calculateBHP(timestamp, state);

      expect(result.bhp).toBeNull();
      expect(result.details.errorMessage).toContain('Flush volume');
    });

    it('should return null if insufficient data points', () => {
      const timestamp = Date.now();
      state.setFlushVolume(120);

      const result = service.calculateBHP(timestamp, state);

      expect(result.bhp).toBeNull();
      expect(result.details.errorMessage).toContain('Insufficient data');
    });

    it('should calculate BHP correctly with valid data', () => {
      const now = Date.now();
      state.setFlushVolume(120); // barrels

      // Add data points spanning sufficient time
      for (let i = 0; i < 30; i++) {
        state.addDataPoint({
          timestamp: now + i * 60000, // 1-minute intervals
          rate: 15, // bbl/min
          propConc: 2.0 + i * 0.1, // Increasing prop conc
        });
      }

      // Calculate BHP for a recent timestamp
      const targetTimestamp = now + 20 * 60000; // 20 minutes in
      const result = service.calculateBHP(targetTimestamp, state);

      // With rate=15 and flush_volume=120, offset = 120/15 = 8 minutes
      // Historical timestamp = target - 8 minutes
      // Should look back 8 minutes
      expect(result.bhp).not.toBeNull();
      expect(result.details.offsetMinutes).toBeCloseTo(8, 1);
      expect(result.details.referenceRate).toBe(15);
      expect(result.details.fromCache).toBe(false);
    });

    it('should return 0 for zero rate (pump stopped)', () => {
      const now = Date.now();
      state.setFlushVolume(120);

      state.addDataPoint({
        timestamp: now,
        rate: 0,
        propConc: 2.5,
      });
      state.addDataPoint({
        timestamp: now + 1000,
        rate: 0,
        propConc: 2.5,
      });

      const result = service.calculateBHP(now + 1000, state);

      expect(result.bhp).toBe(0);
      expect(result.details.errorMessage).toContain('Invalid reference rate');
    });

    it('should validate offset range', () => {
      const now = Date.now();
      state.setFlushVolume(1000); // Large flush volume

      state.addDataPoint({
        timestamp: now,
        rate: 5, // Low rate
        propConc: 2.5,
      });
      state.addDataPoint({
        timestamp: now + 1000,
        rate: 5,
        propConc: 2.5,
      });

      const result = service.calculateBHP(now + 1000, state);

      // offset = 1000 / 5 = 200 minutes > maxOffsetMinutes (120)
      expect(result.bhp).toBe(0);
      expect(result.details.errorMessage).toContain('Offset out of valid range');
    });

    it('should check time difference tolerance', () => {
      const now = Date.now();
      state.setFlushVolume(120);

      // Add only one recent data point
      state.addDataPoint({
        timestamp: now,
        rate: 15,
        propConc: 2.5,
      });
      state.addDataPoint({
        timestamp: now + 1000,
        rate: 15,
        propConc: 3.0,
      });

      // Try to calculate for a much later timestamp
      const result = service.calculateBHP(now + 20 * 60000, state);

      // Historical point will be too far from the required historical timestamp
      expect(result.bhp).toBeNull();
    });

    it('should cache calculated values', () => {
      const now = Date.now();
      state.setFlushVolume(120);

      for (let i = 0; i < 20; i++) {
        state.addDataPoint({
          timestamp: now + i * 60000,
          rate: 15,
          propConc: 2.0 + i * 0.1,
        });
      }

      const targetTimestamp = now + 15 * 60000;
      
      // First calculation
      const result1 = service.calculateBHP(targetTimestamp, state);
      expect(result1.details.fromCache).toBe(false);

      // Second calculation should use cache
      const result2 = service.calculateBHP(targetTimestamp, state);
      expect(result2.details.fromCache).toBe(true);
      expect(result2.bhp).toBe(result1.bhp);
    });
  });

  describe('configuration management', () => {
    it('should update configuration', () => {
      service.updateConfig({
        maxTimeDiffSeconds: 120,
      });

      const config = service.getConfig();
      expect(config.maxTimeDiffSeconds).toBe(120);
    });

    it('should set complete configuration', () => {
      const newConfig = {
        maxTimeDiffSeconds: 90,
        maxOffsetMinutes: 180,
        minOffsetMinutes: 0.5,
        windowSizeSeconds: 10800,
      };

      service.setConfig(newConfig);

      const config = service.getConfig();
      expect(config).toEqual(newConfig);
    });

    it('should reset to default configuration', () => {
      service.updateConfig({
        maxTimeDiffSeconds: 120,
      });

      service.resetConfig();

      const config = service.getConfig();
      expect(config.maxTimeDiffSeconds).toBe(60); // Default value
    });
  });

  describe('edge cases', () => {
    it('should handle exact timestamp match for reference rate', () => {
      const now = Date.now();
      state.setFlushVolume(120);

      for (let i = 0; i < 20; i++) {
        state.addDataPoint({
          timestamp: now + i * 60000,
          rate: 15,
          propConc: 2.0,
        });
      }

      const result = service.calculateBHP(now + 10 * 60000, state);

      expect(result.details.referenceRate).toBe(15);
    });

    it('should handle historical point exactly matching target', () => {
      const now = Date.now();
      state.setFlushVolume(120);

      // Create points such that historical timestamp matches a data point
      const targetTimestamp = now + 10 * 60000;
      const historicalTimestamp = now + 2 * 60000; // 8 minutes before target

      state.addDataPoint({
        timestamp: historicalTimestamp,
        rate: 15,
        propConc: 2.5,
      });
      state.addDataPoint({
        timestamp: targetTimestamp,
        rate: 15,
        propConc: 3.0,
      });

      const result = service.calculateBHP(targetTimestamp, state);

      expect(result.details.timeDifferenceSeconds).toBe(0);
    });
  });
});
