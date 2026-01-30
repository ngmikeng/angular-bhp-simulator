# Phase 1: BHP Calculator Library Implementation

**Duration**: 7-10 days  
**Priority**: Critical  
**Dependencies**: Phase 0 (Project Setup)  

## Overview

Implement the core BHP calculation algorithm library in TypeScript, porting the backward-looking incremental algorithm from Rust. This is the foundational library that performs all BHP calculations.

## Objectives

- ✅ Create data models (DataPoint, ComputationState)
- ✅ Implement backward-looking BHP calculation algorithm
- ✅ Implement sliding window with auto-eviction
- ✅ Implement BHP cache with O(1) lookups
- ✅ Create RxJS stream integration
- ✅ Write comprehensive unit tests (>90% coverage)
- ✅ Document all APIs with JSDoc

## Tasks

### Task 2.1: Create Data Models
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Phase 0

**Steps**:
1. Create `libs/bhp-calculator/src/lib/models/data-point.model.ts`:
   ```typescript
   /**
    * Represents a single timestamped measurement from the surface
    */
   export interface DataPoint {
     /** Unix epoch timestamp in milliseconds */
     timestamp: number;
     
     /** Slurry pump rate in barrels per minute (0-100) */
     rate: number;
     
     /** Proppant concentration in pounds per gallon (0-20) */
     propConc: number;
     
     /** Pressure in PSI (optional, for visualization) */
     pressure?: number;
   }
   ```

2. Create `libs/bhp-calculator/src/lib/models/computation-state.model.ts`:
   ```typescript
   export class ComputationState {
     private dataWindow: DataPoint[] = [];
     private bhpCache: Map<number, number> = new Map();
     private readonly windowSizeSeconds: number;
     private flushVolume: number | null = null;
     
     constructor(windowSizeSeconds: number = 7200) {
       this.windowSizeSeconds = windowSizeSeconds;
     }
     
     // Methods: addDataPoint, getCachedBHP, cacheBHP, etc.
   }
   ```

3. Create `libs/bhp-calculator/src/lib/models/bhp-calculation-result.model.ts`:
   ```typescript
   export interface BHPCalculationResult {
     bhp: number | null;
     details: {
       timestamp: number;
       offsetMinutes: number;
       offsetMilliseconds: number;
       historicalTimestamp: number;
       historicalPoint: DataPoint | null;
       timeDifferenceSeconds: number;
       referenceRate: number;
       fromCache: boolean;
       errorMessage?: string;
     };
   }
   ```

4. Export all models from `libs/bhp-calculator/src/lib/models/index.ts`

5. Write unit tests for models (especially ComputationState)

**Acceptance Criteria**:
- [ ] All model files created
- [ ] Models have JSDoc comments
- [ ] ComputationState methods implemented
- [ ] Unit tests written and passing
- [ ] No TypeScript errors

**Verification**:
```bash
nx test bhp-calculator
nx lint bhp-calculator
```

---

### Task 2.2: Implement Sliding Window Utility
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.1

**Steps**:
1. Create `libs/bhp-calculator/src/lib/utils/sliding-window.util.ts`

2. Implement sliding window functionality:
   - Add data point
   - Auto-evict old data
   - Get window data
   - Get window statistics

3. Optimize for performance (consider circular buffer if needed)

4. Write comprehensive unit tests:
   - Test auto-eviction
   - Test window size limits
   - Test edge cases (empty window, single item)

**Acceptance Criteria**:
- [ ] Sliding window utility implemented
- [ ] Auto-eviction works correctly
- [ ] Performance optimized (O(1) operations)
- [ ] Unit tests >90% coverage
- [ ] Edge cases handled

**Verification**:
```typescript
// Test with 10,000 data points - should maintain constant memory
```

---

### Task 2.3: Implement Cache Utility
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.1

**Steps**:
1. Create `libs/bhp-calculator/src/lib/utils/cache.util.ts`

2. Implement cache with:
   - O(1) get operation
   - O(1) set operation
   - Auto-cleanup on window eviction
   - Memory limits

3. Write unit tests:
   - Test cache hits/misses
   - Test auto-cleanup
   - Test memory limits

**Acceptance Criteria**:
- [ ] Cache utility implemented
- [ ] O(1) operations verified
- [ ] Auto-cleanup works
- [ ] Unit tests passing

**Verification**:
```typescript
// Benchmark: 1,000,000 lookups should be < 100ms
```

---

### Task 2.4: Implement BHP Calculator Service
**Estimated Time**: 12 hours  
**Assignee**: TBD  
**Dependencies**: Tasks 2.1, 2.2, 2.3

**Steps**:
1. Create `libs/bhp-calculator/src/lib/services/bhp-calculator.service.ts`

2. Implement core algorithm:
   ```typescript
   @Injectable()
   export class BHPCalculatorService {
     calculateBHP(
       targetTimestamp: number,
       state: ComputationState
     ): BHPCalculationResult {
       // 1. Check cache
       // 2. Validate prerequisites
       // 3. Calculate offset = flush_volume / rate
       // 4. Calculate historical timestamp
       // 5. Find closest historical data point
       // 6. Return historical prop_conc as BHP
       // 7. Cache result
     }
   }
   ```

3. Implement helper methods:
   - `getReferenceRate()`
   - `findClosestDataPoint()` (binary search)
   - `validateOffset()`

4. Write extensive unit tests:
   - Test basic calculation
   - Test cache usage
   - Test edge cases (zero rate, no data, etc.)
   - Test with real-world scenarios
   - Test tolerance limits

**Acceptance Criteria**:
- [ ] Algorithm matches Rust implementation exactly
- [ ] All algorithm steps implemented
- [ ] Binary search for historical point
- [ ] Cache integration working
- [ ] Unit tests >95% coverage
- [ ] All edge cases handled
- [ ] Performance: <1ms per calculation

**Verification**:
```bash
nx test bhp-calculator --coverage
# Coverage should be >95%
```

---

### Task 2.5: Implement BHP Stream Service
**Estimated Time**: 8 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.4

**Steps**:
1. Create `libs/bhp-calculator/src/lib/services/bhp-stream.service.ts`

2. Implement RxJS integration:
   ```typescript
   @Injectable()
   export class BHPStreamService {
     private dataPointSubject = new Subject<DataPoint>();
     private flushVolumeSubject = new BehaviorSubject<number>(120);
     
     public readonly enhancedDataPoint$: Observable<EnhancedDataPoint>;
     public readonly stateStats$: Observable<StateStats>;
     
     addDataPoint(point: DataPoint): void;
     setFlushVolume(volume: number): void;
     reset(): void;
   }
   ```

3. Create data processing pipeline:
   - Accept incoming data points
   - Add to sliding window
   - Calculate BHP
   - Emit enhanced data point

4. Create state monitoring stream

5. Write unit tests:
   - Test data flow
   - Test state updates
   - Test flush volume changes
   - Test reset functionality

**Acceptance Criteria**:
- [ ] Stream service implemented
- [ ] RxJS pipelines working
- [ ] State management correct
- [ ] No memory leaks
- [ ] Unit tests passing

**Verification**:
```typescript
// Test streaming 10,000 points - no memory leaks
```

---

### Task 2.6: Create Enhanced Data Point Model
**Estimated Time**: 2 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.4

**Steps**:
1. Create `libs/bhp-calculator/src/lib/models/enhanced-data-point.model.ts`:
   ```typescript
   export interface EnhancedDataPoint extends DataPoint {
     bhp: number | null;
     bhpDetails: BHPCalculationResult['details'];
   }
   ```

2. Update exports

**Acceptance Criteria**:
- [ ] Model created and exported
- [ ] Used by BHP stream service

---

### Task 2.7: Configuration Service
**Estimated Time**: 3 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.4

**Steps**:
1. Create `libs/bhp-calculator/src/lib/services/bhp-config.service.ts`

2. Implement configuration:
   ```typescript
   export interface BHPCalculationConfig {
     maxTimeDiffSeconds: number;
     maxOffsetMinutes: number;
     minOffsetMinutes: number;
     windowSizeSeconds: number;
   }
   ```

3. Allow runtime configuration updates

4. Write unit tests

**Acceptance Criteria**:
- [ ] Config service implemented
- [ ] Runtime updates work
- [ ] Validation on config values
- [ ] Tests passing

---

### Task 2.8: Integration Tests
**Estimated Time**: 6 hours  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Create integration test suite

2. Test complete data flow:
   - Data point → sliding window → calculation → result

3. Test with realistic data patterns:
   - Steady pumping
   - Rate changes
   - Pump stops
   - Stage transitions

4. Test performance:
   - 1,000 calculations
   - 10,000 data points
   - Memory usage

5. Test edge cases:
   - First data points (insufficient history)
   - Extreme values
   - Rapid changes

**Acceptance Criteria**:
- [ ] Integration tests covering all flows
- [ ] Realistic scenarios tested
- [ ] Performance tests passing
- [ ] Edge cases handled correctly

**Verification**:
```bash
nx test bhp-calculator --testPathPattern=integration
```

---

### Task 2.9: Documentation
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: All previous tasks

**Steps**:
1. Add JSDoc comments to all public APIs

2. Create `libs/bhp-calculator/README.md`:
   - Installation
   - Usage examples
   - API documentation
   - Algorithm explanation
   - Performance characteristics

3. Create examples:
   - Basic usage
   - Stream usage
   - Configuration
   - Testing

4. Add inline code documentation

**Acceptance Criteria**:
- [ ] All public APIs documented
- [ ] README comprehensive
- [ ] Usage examples work
- [ ] Algorithm explained clearly

**Verification**:
- [ ] Documentation reviewed by peer
- [ ] Examples tested

---

### Task 2.10: Performance Optimization
**Estimated Time**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.8

**Steps**:
1. Profile calculation performance

2. Optimize hot paths:
   - Binary search for historical point
   - Cache lookups
   - Array operations

3. Benchmark and compare:
   - Calculate 1,000 BHP values
   - Target: <1ms average per calculation

4. Document performance characteristics

**Acceptance Criteria**:
- [ ] Performance profiled
- [ ] Optimizations applied
- [ ] Benchmarks meet targets
- [ ] No performance regressions

**Verification**:
```typescript
// Benchmark test should pass
expect(averageCalculationTime).toBeLessThan(1); // ms
```

---

## Deliverables

1. ✅ Data models (DataPoint, ComputationState, etc.)
2. ✅ BHPCalculatorService with full algorithm
3. ✅ BHPStreamService with RxJS integration
4. ✅ Sliding window utility
5. ✅ Cache utility
6. ✅ Configuration service
7. ✅ Comprehensive unit tests (>90% coverage)
8. ✅ Integration tests
9. ✅ Complete documentation
10. ✅ Performance benchmarks

## Success Criteria

- [ ] All tests passing (>90% coverage)
- [ ] Algorithm matches Rust implementation
- [ ] Performance: <1ms per calculation
- [ ] No memory leaks
- [ ] All TypeScript strict checks pass
- [ ] Documentation complete
- [ ] Can be imported and used by other libraries

## Verification Checklist

```bash
# Run all checks
nx test bhp-calculator --coverage
nx lint bhp-calculator
nx build bhp-calculator

# Check test coverage
# Should show >90% coverage for all files

# Performance test
npm run test:performance

# Memory leak test
npm run test:memory
```

## Next Steps

After Phase 1 completion, proceed to:
- **Phase 2**: Data Generator Library Implementation
- Begin implementing synthetic data generation patterns

## Notes

- Use strict TypeScript mode
- Follow Angular/RxJS best practices
- Optimize for performance (real-time calculations)
- Write tests first (TDD approach recommended)
- Document as you code (JSDoc)
- Commit frequently with descriptive messages
