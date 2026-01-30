import { DataPoint } from './data-point.model';
import { ComputationState } from './computation-state.model';

describe('ComputationState', () => {
  let state: ComputationState;

  beforeEach(() => {
    state = new ComputationState(7200); // 2-hour window
  });

  describe('addDataPoint', () => {
    it('should add a data point to the window', () => {
      const point: DataPoint = {
        timestamp: Date.now(),
        rate: 15,
        propConc: 2.5,
        pressure: 5000,
      };

      state.addDataPoint(point);

      expect(state.getWindowSize()).toBe(1);
      expect(state.getDataWindow()[0]).toEqual(point);
    });

    it('should evict old data points outside the window', () => {
      const now = Date.now();
      const oldPoint: DataPoint = {
        timestamp: now - 8000 * 1000, // 8000 seconds ago (> 7200)
        rate: 10,
        propConc: 2.0,
      };
      const newPoint: DataPoint = {
        timestamp: now,
        rate: 15,
        propConc: 2.5,
      };

      state.addDataPoint(oldPoint);
      state.addDataPoint(newPoint);

      // Old point should be evicted
      expect(state.getWindowSize()).toBe(1);
      expect(state.getDataWindow()[0]).toEqual(newPoint);
    });

    it('should update window start timestamp', () => {
      const now = Date.now();
      const point: DataPoint = {
        timestamp: now,
        rate: 15,
        propConc: 2.5,
      };

      state.addDataPoint(point);

      expect(state.getWindowStartTimestamp()).toBe(now);
    });
  });

  describe('flush volume management', () => {
    it('should set and get flush volume', () => {
      state.setFlushVolume(120);
      expect(state.getFlushVolume()).toBe(120);
    });

    it('should return null for unset flush volume', () => {
      expect(state.getFlushVolume()).toBeNull();
    });
  });

  describe('cache management', () => {
    it('should cache and retrieve BHP values', () => {
      state.cacheBHP(1000, 2.5);
      expect(state.getCachedBHP(1000)).toBe(2.5);
    });

    it('should return null for uncached timestamps', () => {
      expect(state.getCachedBHP(1000)).toBeNull();
    });

    it('should check if cache has value', () => {
      state.cacheBHP(1000, 2.5);
      expect(state.hasCachedBHP(1000)).toBe(true);
      expect(state.hasCachedBHP(2000)).toBe(false);
    });

    it('should remove cached values when data points are evicted', () => {
      const now = Date.now();
      const oldPoint: DataPoint = {
        timestamp: now - 8000 * 1000,
        rate: 10,
        propConc: 2.0,
      };
      const newPoint: DataPoint = {
        timestamp: now,
        rate: 15,
        propConc: 2.5,
      };

      state.addDataPoint(oldPoint);
      state.cacheBHP(oldPoint.timestamp, 3.0);
      
      // Add new point which should evict the old one
      state.addDataPoint(newPoint);

      // Cache for old point should be cleared
      expect(state.hasCachedBHP(oldPoint.timestamp)).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const now = Date.now();
      const point1: DataPoint = {
        timestamp: now - 1000,
        rate: 10,
        propConc: 2.0,
      };
      const point2: DataPoint = {
        timestamp: now,
        rate: 15,
        propConc: 2.5,
      };

      state.addDataPoint(point1);
      state.addDataPoint(point2);
      state.cacheBHP(now, 2.5);

      const stats = state.getStats();

      expect(stats.windowSize).toBe(2);
      expect(stats.cacheSize).toBe(1);
      expect(stats.windowStartTimestamp).toBe(now - 1000);
      expect(stats.windowEndTimestamp).toBe(now);
      expect(stats.windowDurationMinutes).toBeCloseTo(1000 / 60000, 2);
    });
  });

  describe('clear', () => {
    it('should clear all state', () => {
      const point: DataPoint = {
        timestamp: Date.now(),
        rate: 15,
        propConc: 2.5,
      };

      state.addDataPoint(point);
      state.setFlushVolume(120);
      state.cacheBHP(point.timestamp, 2.5);

      state.clear();

      expect(state.getWindowSize()).toBe(0);
      expect(state.getFlushVolume()).toBeNull();
      expect(state.getCachedBHP(point.timestamp)).toBeNull();
    });
  });

  describe('getDataWindow', () => {
    it('should return a copy of the data window', () => {
      const point: DataPoint = {
        timestamp: Date.now(),
        rate: 15,
        propConc: 2.5,
      };

      state.addDataPoint(point);
      const window = state.getDataWindow();

      // Modify the returned array
      window.push({
        timestamp: Date.now() + 1000,
        rate: 20,
        propConc: 3.0,
      });

      // Original window should remain unchanged
      expect(state.getWindowSize()).toBe(1);
    });
  });
});
