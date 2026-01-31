# BHP Calculation Logic

## Overview

Bottom Hole Proppant Concentration (BHP) represents the proppant concentration at the bottom of the wellbore. Since it takes time for the proppant slurry to travel from the surface to the bottom hole, **BHP is simply the Surface Proppant Concentration (PropConc) delayed by an offset time**.

## Algorithm

```
BHP(t) = PropConc(t - offsetTime)
```

Where:
- `BHP(t)` = Bottom Hole Proppant Concentration at time `t`
- `PropConc(t - offsetTime)` = Surface Proppant Concentration from `offsetTime` minutes ago
- `offsetTime` = User-defined delay in minutes (configurable via UI)

## Implementation

### Simple Time-Shift Approach

The current implementation uses a straightforward time-shift approach:

1. **User inputs Offset Time (minutes)** via the UI
2. For each incoming data point at timestamp `T`:
   - Calculate historical timestamp: `historicalTimestamp = T - (offsetTime × 60 × 1000)`
   - Find the closest data point to the historical timestamp in the data window
   - Return that point's `propConc` value as the BHP

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `BHPCalculatorService` | `libs/bhp-calculator/src/lib/services/bhp-calculator.service.ts` | Core calculation logic |
| `BHPStreamService` | `libs/bhp-calculator/src/lib/services/bhp-stream.service.ts` | RxJS stream processing |
| `ComputationState` | `libs/bhp-calculator/src/lib/models/computation-state.model.ts` | Data window & state management |

### Code Flow

```typescript
// 1. User sets offset time in UI (e.g., 3 minutes)
appState.setOffsetTimeMinutes(3);

// 2. BHPStreamService receives the update
bhpStreamService.setOffsetTimeMinutes(3);

// 3. For each data point, BHPCalculatorService calculates BHP
calculateBHP(targetTimestamp, state) {
  // Get offset time from state
  const offsetMinutes = state.getOffsetTimeMinutes(); // 3 minutes
  
  // Calculate historical timestamp
  const offsetMs = offsetMinutes * 60 * 1000; // 180,000 ms
  const historicalTimestamp = targetTimestamp - offsetMs;
  
  // Find closest data point to historical timestamp
  const historicalPoint = findClosestDataPoint(historicalTimestamp, dataWindow);
  
  // BHP = PropConc from historical point
  return historicalPoint.propConc;
}
```

## Finding the Closest Data Point

The `findClosestDataPoint` function searches the data window for the point closest to the target timestamp:

```typescript
findClosestDataPoint(targetTimestamp, dataWindow, toleranceMs = 60000) {
  let closest = null;
  let minDiff = Number.MAX_SAFE_INTEGER;

  for (const point of dataWindow) {
    const diff = Math.abs(point.timestamp - targetTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = point;
    }
  }

  // Only return if within tolerance (default: 1 minute)
  return minDiff <= toleranceMs ? closest : null;
}
```

### Tolerance Parameter

- Default tolerance: **60,000 ms (1 minute)**
- If no data point exists within the tolerance of the target timestamp, returns `null`
- This handles cases where there's a gap in the data

## Configuration

### Default Values

| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| Offset Time | 3 minutes | Time delay for BHP calculation |
| Tolerance | 60 seconds | Max time difference when finding historical point |
| Window Size | 7200 seconds (2 hours) | Data retention window |

### UI Controls

The **Offset Time (min)** input in the Simulation Controls allows users to:
- Set values from 0 to 30 minutes
- Adjust in 0.5 minute increments
- See immediate effect on BHP visualization

## Data Flow Diagram

```
┌─────────────────────┐
│  Data Generator     │
│  (Rate, PropConc)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  BHPStreamService   │
│  - Receives data    │
│  - Adds to window   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  BHPCalculatorService│
│  - Get offset time  │
│  - Find historical  │
│    PropConc         │
│  - Return as BHP    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  EnhancedDataPoint  │
│  {                  │
│    timestamp,       │
│    rate,            │
│    propConc,        │
│    bhp,  ← shifted  │
│    bhpDetails       │
│  }                  │
└─────────────────────┘
```

## Edge Cases

### 1. Insufficient History
When the simulation starts, there won't be enough historical data to calculate BHP for the first `offsetTime` minutes.

**Behavior:** Returns `bhp: null` with error message "Waiting for data history (offset time not yet reached)"

### 2. Zero Offset Time
If offset time is set to 0, BHP equals current PropConc (no delay).

### 3. Data Gaps
If there's a gap in the data larger than the tolerance, returns `null`.

## Previous Implementation (Deprecated)

The previous implementation calculated offset time dynamically:

```typescript
// OLD: Offset calculated from flush volume and rate
offsetMinutes = flushVolume / rate;
```

**Issues with the old approach:**
- Offset time varied with changing rate values
- More complex and harder to understand
- Difficult to demonstrate the time-shift effect

**New approach benefits:**
- Direct control over offset time
- Consistent, predictable delay
- Easier to test and demonstrate
- More intuitive for demo purposes

## Related Files

- [bhp-calculator.service.ts](../libs/bhp-calculator/src/lib/services/bhp-calculator.service.ts) - Core calculation
- [bhp-stream.service.ts](../libs/bhp-calculator/src/lib/services/bhp-stream.service.ts) - Stream processing
- [computation-state.model.ts](../libs/bhp-calculator/src/lib/models/computation-state.model.ts) - State management
- [simulation-controls.component.ts](../apps/demo-app/src/app/features/simulation/simulation-controls.component.ts) - UI controls
