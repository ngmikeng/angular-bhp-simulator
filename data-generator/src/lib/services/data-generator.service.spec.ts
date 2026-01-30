import { TestBed } from '@angular/core/testing';
import { DataGeneratorService } from './data-generator.service';
import { take } from 'rxjs/operators';

describe('DataGeneratorService', () => {
  let service: DataGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should configure with valid config', () => {
    expect(() => {
      service.configure({
        pattern: 'steady',
        samplingRateHz: 1,
        baseRate: 20,
      });
    }).not.toThrow();
  });

  it('should throw error for invalid config', () => {
    expect(() => {
      service.configure({
        samplingRateHz: -1, // Invalid
      });
    }).toThrow();
  });

  it('should start and generate data', async () => {
    service.configure({ pattern: 'steady', seed: 12345, samplingRateHz: 10 });

    const dataPoints: any[] = [];
    
    await new Promise<void>((resolve) => {
      service
        .start()
        .pipe(take(5))
        .subscribe({
          next: (point) => {
            expect(point.timestamp).toBeGreaterThan(0);
            expect(typeof point.rate).toBe('number');
            expect(typeof point.propConc).toBe('number');
            expect(typeof point.pressure).toBe('number');
            dataPoints.push(point);
          },
          complete: () => resolve(),
        });
    });
    
    expect(dataPoints.length).toBe(5);
  }, 3000);

  it('should generate reproducible data with same seed', async () => {
    service.configure({ pattern: 'steady', seed: 12345, samplingRateHz: 10 });

    const data1: number[] = [];
    await new Promise<void>((resolve) => {
      service
        .start()
        .pipe(take(10))
        .subscribe({
          next: (point) => data1.push(point.rate),
          complete: () => resolve(),
        });
    });

    service.reset(12345);
    const data2: number[] = [];
    
    await new Promise<void>((resolve) => {
      service
        .start()
        .pipe(take(10))
        .subscribe({
          next: (point) => data2.push(point.rate),
          complete: () => resolve(),
        });
    });

    expect(data1).toEqual(data2);
  }, 5000);

  it('should stop generation', async () => {
    service.configure({ pattern: 'steady', seed: 12345, samplingRateHz: 10 });

    let count = 0;
    const subscription = service.start().subscribe({
      next: () => {
        count++;
        if (count === 5) {
          service.stop();
        }
      },
    });

    // Wait longer for the data points to be generated
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    expect(count).toBeGreaterThanOrEqual(5);
    expect(service.isRunning()).toBe(false);
    subscription.unsubscribe();
  });

  it('should change speed', () => {
    service.setSpeed(2);
    expect(service.getSpeed()).toBe(2);
  });

  it('should throw error for invalid speed', () => {
    expect(() => service.setSpeed(0)).toThrow();
    expect(() => service.setSpeed(11)).toThrow();
  });

  it('should reset simulation', async () => {
    service.configure({ pattern: 'steady', seed: 12345, samplingRateHz: 10 });
    
    // Start and wait for some data to be generated
    await new Promise<void>((resolve) => {
      service
        .start()
        .pipe(take(5))
        .subscribe({
          complete: () => resolve(),
        });
    });

    const elapsedBefore = service.getElapsedTime();
    service.reset();
    const elapsedAfter = service.getElapsedTime();

    expect(elapsedBefore).toBeGreaterThan(0);
    expect(elapsedAfter).toBe(0);
  });

  it('should return current config', () => {
    service.configure({ pattern: 'realistic', baseRate: 25 });
    const config = service.getConfig();

    expect(config.pattern).toBe('realistic');
    expect(config.baseRate).toBe(25);
  });

  it('should generate data within limits', async () => {
    service.configure({
      pattern: 'steady',
      seed: 12345,
      samplingRateHz: 10,
      rateLimits: [10, 20],
      propConcLimits: [1, 5],
      pressureLimits: [3000, 6000],
    });

    await new Promise<void>((resolve) => {
      service
        .start()
        .pipe(take(50))
        .subscribe({
          next: (point) => {
            expect(point.rate).toBeGreaterThanOrEqual(10);
            expect(point.rate).toBeLessThanOrEqual(20);
            expect(point.propConc).toBeGreaterThanOrEqual(1);
            expect(point.propConc).toBeLessThanOrEqual(5);
            if (point.pressure) {
              expect(point.pressure).toBeGreaterThanOrEqual(3000);
              expect(point.pressure).toBeLessThanOrEqual(6000);
            }
          },
          complete: () => resolve(),
        });
    });
  }, 10000);

  it('should switch patterns correctly', async () => {
    service.configure({ pattern: 'steady', seed: 12345, samplingRateHz: 10 });
    
    await new Promise<void>((resolve) => {
      service
        .start()
        .pipe(take(5))
        .subscribe({
          complete: () => resolve(),
        });
    });

    service.stop();
    service.configure({ pattern: 'ramping', seed: 12345, samplingRateHz: 10 });
    
    await new Promise<void>((resolve) => {
      service
        .start()
        .pipe(take(5))
        .subscribe({
          next: (point) => {
            expect(point).toBeDefined();
          },
          complete: () => resolve(),
        });
    });
  }, 10000);
});

