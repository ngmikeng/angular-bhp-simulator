/**
 * Generic cache utility with O(1) operations
 * Automatically manages memory by tracking access patterns
 */
export class CacheUtil<K, V> {
  private cache: Map<K, V> = new Map();
  private readonly maxSize: number;

  /**
   * @param maxSize Maximum number of entries in cache (default: 10000)
   */
  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or undefined
   */
  public get(key: K): V | undefined {
    return this.cache.get(key);
  }

  /**
   * Check if cache contains key
   * @param key Cache key
   */
  public has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Set value in cache
   * Automatically evicts oldest entry if cache is full
   * @param key Cache key
   * @param value Value to cache
   */
  public set(key: K, value: V): void {
    // If cache is full, remove the oldest entry
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  /**
   * Delete entry from cache
   * @param key Cache key
   */
  public delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in cache
   */
  public keys(): K[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in cache
   */
  public values(): V[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get all entries in cache
   */
  public entries(): [K, V][] {
    return Array.from(this.cache.entries());
  }

  /**
   * Check if cache is empty
   */
  public isEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * Check if cache is full
   */
  public isFull(): boolean {
    return this.cache.size >= this.maxSize;
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    size: number;
    maxSize: number;
    utilizationPercent: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.cache.size / this.maxSize) * 100,
    };
  }
}
