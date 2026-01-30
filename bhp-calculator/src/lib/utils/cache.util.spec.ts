import { CacheUtil } from './cache.util';

describe('CacheUtil', () => {
  let cache: CacheUtil<number, string>;

  beforeEach(() => {
    cache = new CacheUtil<number, string>(5); // Small cache for testing
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set(1, 'value1');
      expect(cache.get(1)).toBe('value1');
    });

    it('should return undefined for missing keys', () => {
      expect(cache.get(999)).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should check if key exists', () => {
      cache.set(1, 'value1');
      expect(cache.has(1)).toBe(true);
      expect(cache.has(2)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete entries', () => {
      cache.set(1, 'value1');
      cache.delete(1);

      expect(cache.has(1)).toBe(false);
      expect(cache.size()).toBe(0);
    });

    it('should return true if entry was deleted', () => {
      cache.set(1, 'value1');
      expect(cache.delete(1)).toBe(true);
    });

    it('should return false if entry did not exist', () => {
      expect(cache.delete(999)).toBe(false);
    });
  });

  describe('maxSize enforcement', () => {
    it('should evict oldest entry when full', () => {
      // Fill cache to max
      for (let i = 1; i <= 5; i++) {
        cache.set(i, `value${i}`);
      }

      expect(cache.size()).toBe(5);
      expect(cache.has(1)).toBe(true);

      // Add one more - should evict first entry
      cache.set(6, 'value6');

      expect(cache.size()).toBe(5);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(6)).toBe(true);
    });

    it('should not evict when updating existing key', () => {
      cache.set(1, 'value1');
      cache.set(1, 'updated');

      expect(cache.size()).toBe(1);
      expect(cache.get(1)).toBe('updated');
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set(1, 'value1');
      cache.set(2, 'value2');

      cache.clear();

      expect(cache.isEmpty()).toBe(true);
      expect(cache.size()).toBe(0);
    });
  });

  describe('keys, values, entries', () => {
    beforeEach(() => {
      cache.set(1, 'value1');
      cache.set(2, 'value2');
      cache.set(3, 'value3');
    });

    it('should return all keys', () => {
      const keys = cache.keys();
      expect(keys).toEqual([1, 2, 3]);
    });

    it('should return all values', () => {
      const values = cache.values();
      expect(values).toEqual(['value1', 'value2', 'value3']);
    });

    it('should return all entries', () => {
      const entries = cache.entries();
      expect(entries).toEqual([
        [1, 'value1'],
        [2, 'value2'],
        [3, 'value3'],
      ]);
    });
  });

  describe('isFull', () => {
    it('should detect when cache is full', () => {
      expect(cache.isFull()).toBe(false);

      for (let i = 1; i <= 5; i++) {
        cache.set(i, `value${i}`);
      }

      expect(cache.isFull()).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      cache.set(1, 'value1');
      cache.set(2, 'value2');

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(5);
      expect(stats.utilizationPercent).toBe(40);
    });
  });
});
