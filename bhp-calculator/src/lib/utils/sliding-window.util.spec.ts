import { SlidingWindowUtil } from './sliding-window.util';
import { DataPoint } from '../models/data-point.model';

describe('SlidingWindowUtil', () => {
  let window: SlidingWindowUtil;

  beforeEach(() => {
    window = new SlidingWindowUtil(7200); // 2-hour window
  });

  describe('add', () => {
    it('should add a data point', () => {
      const point: DataPoint = {
        timestamp: Date.now(),
        rate: 15,
        propConc: 2.5,
      };

      window.add(point);

      expect(window.size()).toBe(1);
      expect(window.getAll()[0]).toEqual(point);
    });

    it('should automatically evict old data', () => {
      const now = Date.now();
      const oldPoint: DataPoint = {
        timestamp: now - 8000 * 1000, // > 2 hours
        rate: 10,
        propConc: 2.0,
      };
      const newPoint: DataPoint = {
        timestamp: now,
        rate: 15,
        propConc: 2.5,
      };

      window.add(oldPoint);
      window.add(newPoint);

      expect(window.size()).toBe(1);
      expect(window.getAll()[0]).toEqual(newPoint);
    });
  });

  describe('findClosest', () => {
    beforeEach(() => {
      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        window.add({
          timestamp: now + i * 1000,
          rate: 15,
          propConc: 2.5,
        });
      }
    });

    it('should find exact match', () => {
      const now = Date.now();
      const result = window.findClosest(now + 5000);

      expect(result.point?.timestamp).toBe(now + 5000);
      expect(result.timeDiffMs).toBe(0);
    });

    it('should find closest point when no exact match', () => {
      const now = Date.now();
      const result = window.findClosest(now + 5500);

      // Should find either point at +5000 or +6000
      expect(result.point?.timestamp).toBeGreaterThanOrEqual(now + 5000);
      expect(result.point?.timestamp).toBeLessThanOrEqual(now + 6000);
      expect(result.timeDiffMs).toBeLessThanOrEqual(500);
    });

    it('should return null for empty window', () => {
      const emptyWindow = new SlidingWindowUtil();
      const result = emptyWindow.findClosest(Date.now());

      expect(result.point).toBeNull();
      expect(result.timeDiffMs).toBe(Infinity);
    });
  });

  describe('getOldest and getNewest', () => {
    it('should return oldest and newest points', () => {
      const now = Date.now();
      const oldest: DataPoint = {
        timestamp: now,
        rate: 10,
        propConc: 2.0,
      };
      const newest: DataPoint = {
        timestamp: now + 10000,
        rate: 20,
        propConc: 3.0,
      };

      window.add(oldest);
      window.add(newest);

      expect(window.getOldest()).toEqual(oldest);
      expect(window.getNewest()).toEqual(newest);
    });

    it('should return null for empty window', () => {
      expect(window.getOldest()).toBeNull();
      expect(window.getNewest()).toBeNull();
    });
  });

  describe('getRange', () => {
    beforeEach(() => {
      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        window.add({
          timestamp: now + i * 1000,
          rate: 15,
          propConc: 2.5,
        });
      }
    });

    it('should return points within range', () => {
      const now = Date.now();
      const range = window.getRange(now + 2000, now + 5000);

      expect(range.length).toBe(4); // Points at 2000, 3000, 4000, 5000
      expect(range[0].timestamp).toBe(now + 2000);
      expect(range[range.length - 1].timestamp).toBe(now + 5000);
    });

    it('should return empty array for range with no points', () => {
      const now = Date.now();
      const range = window.getRange(now + 20000, now + 30000);

      expect(range.length).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all data points', () => {
      window.add({
        timestamp: Date.now(),
        rate: 15,
        propConc: 2.5,
      });

      window.clear();

      expect(window.isEmpty()).toBe(true);
      expect(window.size()).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const now = Date.now();
      window.add({
        timestamp: now,
        rate: 10,
        propConc: 2.0,
      });
      window.add({
        timestamp: now + 5000,
        rate: 15,
        propConc: 2.5,
      });

      const stats = window.getStats();

      expect(stats.size).toBe(2);
      expect(stats.oldestTimestamp).toBe(now);
      expect(stats.newestTimestamp).toBe(now + 5000);
      expect(stats.durationSeconds).toBe(5);
    });
  });
});
