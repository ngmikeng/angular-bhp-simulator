# Phase 2: Data Generator Library Implementation

**Duration**: 5-7 days  
**Priority**: High  
**Dependencies**: Phase 0 (Project Setup)  

## Overview

Implement the data generator library to create realistic synthetic data streams simulating hydraulic fracturing operations. This library generates Rate, Pressure, and Proppant Concentration values with various realistic patterns.

## Objectives

- ✅ Create configurable data generation service
- ✅ Implement multiple data patterns (steady, ramping, cycling, realistic, pump-stop, stage-transition)
- ✅ Add seeded random for reproducibility
- ✅ Implement streaming with RxJS
- ✅ Write comprehensive unit tests
- ✅ Document all APIs

## Tasks

### Task 3.1: Create Generator Configuration Model
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: Phase 0

**Steps**:
1. Create `libs/data-generator/src/lib/models/generator-config.model.ts`:
   ```typescript
   export type DataPattern = 
     | 'steady'
     | 'ramping'
     | 'cycling'
     | 'realistic'
     | 'pump-stop'
     | 'stage-transition';

   export interface GeneratorConfig {
     samplingRateHz: number;
     pattern: DataPattern;
     baseRate: number;
     rateLimits: [number, number];
     basePressure: number;
     pressureLimits: [number, number];
     basePropConc: number;
     propConcLimits: [number, number];
     noiseLevel: number;
     seed?: number;
   }
   ```

2. Create default configurations for each pattern

3. Add validation logic

**Acceptance Criteria**:
- [ ] Configuration model created
- [ ] Default configs for all patterns
- [ ] Validation implemented
- [ ] TypeScript types correct

---

### Task 3.2: Implement Seeded Random Generator
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 3.1

**Steps**:
1. Create `libs/data-generator/src/lib/utils/random.util.ts`

2. Implement Linear Congruential Generator (LCG):
   ```typescript
   export class SeededRandom {
     private state: number;
     
     constructor(seed: number) {
       this.state = seed;
     }
     
     next(): number {
       // LCG algorithm
     }
     
     gaussian(): number {
       // Box-Muller transform
     }
   }
   ```

3. Write unit tests:
   - Same seed produces same sequence
   - Different seeds produce different sequences
   - Gaussian distribution

**Acceptance Criteria**:
- [ ] Seeded random implemented
- [ ] Reproducible with same seed
- [ ] Gaussian noise available
- [ ] Unit tests passing

**Verification**:
```typescript
const rng1 = new SeededRandom(12345);
const rng2 = new SeededRandom(12345);
expect(rng1.next()).toBe(rng2.next());
```

---

### Task 3.3: Implement Pattern Generators
**Estimated Time**: 12 hours  
**Assignee**: TBD  
**Dependencies**: Tasks 3.1, 3.2

**Steps**:
1. Create base generator class:
   ```typescript
   // libs/data-generator/src/lib/generators/base-generator.ts
   export abstract class BaseGenerator {
     abstract generate(elapsed: number): Omit<DataPoint, 'timestamp'>;
   }
   ```

2. Implement each pattern generator:

   **SteadyGenerator** (2 hours):
   - Constant values with minimal noise
   - `libs/data-generator/src/lib/generators/steady-generator.ts`

   **RampingGenerator** (2 hours):
   - Gradual ramp up/plateau/ramp down cycle
   - `libs/data-generator/src/lib/generators/ramping-generator.ts`

   **CyclingGenerator** (2 hours):
   - Sinusoidal variations
   - `libs/data-generator/src/lib/generators/cycling-generator.ts`

   **RealisticGenerator** (4 hours):
   - Multi-stage simulation
   - Complex mixed patterns
   - Phase changes (ramp up, steady, prop ramp, ramp down)
   - Occasional pressure spikes
   - `libs/data-generator/src/lib/generators/realistic-generator.ts`

   **PumpStopGenerator** (1 hour):
   - Periodic pump shutdowns
   - Exponential decay during stops
   - `libs/data-generator/src/lib/generators/pump-stop-generator.ts`

   **StageTransitionGenerator** (1 hour):
   - Stage transitions with ramp down/up
   - `libs/data-generator/src/lib/generators/stage-transition-generator.ts`

3. Write unit tests for each generator:
   - Output within expected ranges
   - Pattern characteristics verified
   - Reproducibility with seed

**Acceptance Criteria**:
- [ ] All 6 generators implemented
- [ ] Each follows specified pattern
- [ ] All within configured limits
- [ ] Unit tests for each generator
- [ ] Visual verification possible

**Verification**:
```bash
nx test data-generator --testNamePattern="generators"
```

---

### Task 3.4: Implement Data Generator Service
**Estimated Time**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Task 3.3

**Steps**:
1. Create `libs/data-generator/src/lib/services/data-generator.service.ts`:
   ```typescript
   @Injectable()
   export class DataGeneratorService {
     private config: GeneratorConfig;
     private isRunning$ = new BehaviorSubject<boolean>(false);
     private speed$ = new BehaviorSubject<number>(1);
     
     configure(config: Partial<GeneratorConfig>): void;
     start(): Observable<DataPoint>;
     stop(): void;
     setSpeed(multiplier: number): void;
     reset(): void;
   }
   ```

2. Implement data point generation with timestamps

3. Implement streaming with RxJS:
   - Use `interval()` for timing
   - Adjust for speed multiplier
   - Emit DataPoint objects

4. Add state management:
   - Track elapsed time
   - Track simulation start time

5. Write unit tests:
   - Test start/stop
   - Test speed changes
   - Test pattern switching
   - Test reset

**Acceptance Criteria**:
- [ ] Service implemented with all methods
- [ ] Streaming works correctly
- [ ] Speed adjustment works
- [ ] Pattern switching works
- [ ] Unit tests passing

**Verification**:
```typescript
service.start().pipe(take(100)).subscribe(points => {
  expect(points.length).toBe(100);
});
```

---

### Task 3.5: Implement Noise Generation
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 3.2

**Steps**:
1. Create `libs/data-generator/src/lib/utils/noise.util.ts`

2. Implement noise functions:
   - Gaussian noise
   - Uniform noise
   - Perlin noise (optional for smooth variations)

3. Add noise to generated values:
   ```typescript
   addNoise(value: number, level: number): number {
     return value + gaussian() * level;
   }
   ```

4. Write unit tests

**Acceptance Criteria**:
- [ ] Noise utilities implemented
- [ ] Configurable noise levels
- [ ] Does not break value limits
- [ ] Tests passing

---

### Task 3.6: Add Data Validation
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: Task 3.4

**Steps**:
1. Create `libs/data-generator/src/lib/validators/data-validator.ts`

2. Implement validation:
   - Check value ranges
   - Check for NaN/Infinity
   - Check timestamp validity

3. Add validation to service

4. Write unit tests

**Acceptance Criteria**:
- [ ] Validation implemented
- [ ] Invalid data rejected
- [ ] Error messages clear
- [ ] Tests passing

---

### Task 3.7: Create Generator Factory
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 3.3

**Steps**:
1. Create `libs/data-generator/src/lib/factories/generator.factory.ts`:
   ```typescript
   export class GeneratorFactory {
     static create(pattern: DataPattern, config: GeneratorConfig): BaseGenerator {
       switch (pattern) {
         case 'steady': return new SteadyGenerator(config);
         case 'ramping': return new RampingGenerator(config);
         // ... etc
       }
     }
   }
   ```

2. Update service to use factory

3. Write unit tests

**Acceptance Criteria**:
- [ ] Factory creates correct generator
- [ ] All patterns supported
- [ ] Error handling for unknown patterns
- [ ] Tests passing

---

### Task 3.8: Integration Tests
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 3.4

**Steps**:
1. Create integration test suite

2. Test complete flows:
   - Configure → Start → Generate 1000 points → Stop
   - Test each pattern
   - Test speed changes during generation
   - Test pattern switching

3. Test reproducibility:
   - Same seed produces same data
   - Different seeds produce different data

4. Performance tests:
   - Generate 10,000 points
   - Measure generation time
   - Check memory usage

**Acceptance Criteria**:
- [ ] Integration tests for all patterns
- [ ] Reproducibility verified
- [ ] Performance acceptable
- [ ] All tests passing

**Verification**:
```bash
nx test data-generator --testPathPattern=integration
```

---

### Task 3.9: Documentation
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Add JSDoc to all public APIs

2. Create `libs/data-generator/README.md`:
   - Installation
   - Usage examples for each pattern
   - Configuration guide
   - Pattern descriptions with visualizations
   - Performance characteristics

3. Create usage examples:
   ```typescript
   // Example: Generate realistic data
   const generator = new DataGeneratorService();
   generator.configure({
     pattern: 'realistic',
     samplingRateHz: 1,
     seed: 12345
   });
   
   generator.start().subscribe(point => {
     console.log(point);
   });
   ```

4. Document pattern characteristics

**Acceptance Criteria**:
- [ ] All public APIs documented
- [ ] README comprehensive
- [ ] Examples tested and working
- [ ] Pattern visualizations included

---

### Task 3.10: Visual Pattern Verification Tool
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 3.9

**Steps**:
1. Create simple script to visualize patterns:
   ```typescript
   // libs/data-generator/tools/visualize-patterns.ts
   // Generate data and export to CSV for visualization
   ```

2. Generate sample data for each pattern

3. Create ASCII art visualizations in docs

4. Optional: Create simple HTML preview page

**Acceptance Criteria**:
- [ ] Visualization tool created
- [ ] Sample data generated for all patterns
- [ ] Patterns visually verified
- [ ] Documentation includes visualizations

**Verification**:
- Visual inspection of pattern outputs

---

## Deliverables

1. ✅ Generator configuration model
2. ✅ Seeded random generator
3. ✅ 6 pattern generators (steady, ramping, cycling, realistic, pump-stop, stage-transition)
4. ✅ Data generator service with RxJS streaming
5. ✅ Noise utilities
6. ✅ Data validation
7. ✅ Generator factory
8. ✅ Comprehensive unit tests (>85% coverage)
9. ✅ Integration tests
10. ✅ Complete documentation with examples

## Success Criteria

- [ ] All tests passing (>85% coverage)
- [ ] All 6 patterns working correctly
- [ ] Reproducible with same seed
- [ ] Streaming works smoothly
- [ ] Speed adjustment works
- [ ] Performance: Generate 10,000 points in <1 second
- [ ] Documentation complete
- [ ] Can be imported and used by demo app

## Verification Checklist

```bash
# Run all checks
nx test data-generator --coverage
nx lint data-generator
nx build data-generator

# Check test coverage
# Should show >85% coverage

# Generate sample data
npm run generate:samples

# Visual verification
npm run visualize:patterns
```

## Next Steps

After Phase 2 completion, proceed to:
- **Phase 3**: Chart Components Library Implementation
- Begin implementing ECharts wrapper components

## Notes

- Focus on realistic patterns for demo
- Ensure reproducibility for testing
- Optimize for continuous streaming
- Keep memory usage constant
- Document pattern characteristics clearly
- Visual verification important for quality
