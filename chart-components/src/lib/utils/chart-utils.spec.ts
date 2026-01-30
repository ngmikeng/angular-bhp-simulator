import { 
  formatTime, 
  downsampleLTTB, 
  CircularBuffer,
  debounce,
  batchDataPoints
} from './chart-utils';

describe('Chart Utilities', () => {
  describe('formatTime', () => {
    it('should format timestamp correctly with default format', () => {
      const timestamp = new Date('2024-01-15T14:30:45').getTime();
      const formatted = formatTime(timestamp);
      expect(formatted).toBe('14:30:45');
    });

    it('should format timestamp with custom format', () => {
      const timestamp = new Date('2024-01-15T14:30:45.123').getTime();
      const formatted = formatTime(timestamp, 'HH:mm:ss.SSS');
      expect(formatted).toBe('14:30:45.123');
    });
  });

  describe('downsampleLTTB', () => {
    it('should return original data if threshold >= data length', () => {
      const data: [number, number][] = [[1, 10], [2, 20], [3, 30]];
      const result = downsampleLTTB(data, 5);
      expect(result).toEqual(data);
    });

    it('should downsample data to threshold', () => {
      const data: [number, number][] = Array.from({ length: 100 }, (_, i) => [i, Math.sin(i / 10)]);
      const result = downsampleLTTB(data, 20);
      expect(result.length).toBe(20);
      expect(result[0]).toEqual(data[0]); // First point preserved
      expect(result[result.length - 1]).toEqual(data[data.length - 1]); // Last point preserved
    });

    it('should return empty array for empty input', () => {
      const result = downsampleLTTB([], 10);
      expect(result).toEqual([]);
    });
  });

  describe('CircularBuffer', () => {
    it('should create buffer with specified capacity', () => {
      const buffer = new CircularBuffer<number>(5);
      expect(buffer.getSize()).toBe(0);
      expect(buffer.isFull()).toBe(false);
    });

    it('should add items and maintain size', () => {
      const buffer = new CircularBuffer<number>(3);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.getSize()).toBe(2);
      expect(buffer.toArray()).toEqual([1, 2]);
    });

    it('should overwrite oldest items when full', () => {
      const buffer = new CircularBuffer<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.isFull()).toBe(true);
      
      buffer.push(4);
      expect(buffer.getSize()).toBe(3);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });

    it('should clear all items', () => {
      const buffer = new CircularBuffer<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.clear();
      expect(buffer.getSize()).toBe(0);
      expect(buffer.toArray()).toEqual([]);
    });

    it('should get item at index', () => {
      const buffer = new CircularBuffer<number>(5);
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      
      expect(buffer.at(0)).toBe(10);
      expect(buffer.at(1)).toBe(20);
      expect(buffer.at(2)).toBe(30);
      expect(buffer.at(3)).toBeUndefined();
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      return new Promise<void>((resolve) => {
        let callCount = 0;
        const debouncedFn = debounce(() => {
          callCount++;
        }, 100);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        setTimeout(() => {
          expect(callCount).toBe(1);
          resolve();
        }, 150);
      });
    });
  });

  describe('batchDataPoints', () => {
    it('should batch data points into groups', () => {
      const points = Array.from({ length: 25 }, (_, i) => ({ timestamp: i, value: i }));
      const batches = batchDataPoints(points, 10);
      
      expect(batches.length).toBe(3);
      expect(batches[0].length).toBe(10);
      expect(batches[1].length).toBe(10);
      expect(batches[2].length).toBe(5);
    });

    it('should handle empty array', () => {
      const batches = batchDataPoints([]);
      expect(batches.length).toBe(0);
    });
  });
});
