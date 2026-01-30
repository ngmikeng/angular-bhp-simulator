# Architecture Documentation

> 📝 **Note**: This document will be expanded as the project develops. See [Phase 1](../plan/01_BHP_CALCULATOR_LIBRARY.md) for detailed implementation plans.

## Overview

The Angular BHP Real-Time Simulator is built on a modular, library-based architecture designed for maximum reusability, testability, and maintainability.

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           Demo Application                  │
│  (Angular Standalone + Material Design)     │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼─────┐  ┌─────▼──────┐  ┌──────────────┐
│    BHP     │  │    Data    │  │    Chart     │
│ Calculator │  │ Generator  │  │ Components   │
│  Library   │  │  Library   │  │   Library    │
└────────────┘  └────────────┘  └──────────────┘
```

## Core Libraries

### 1. BHP Calculator Library (`@angular-bhp-simulator/bhp-calculator`)

**Purpose**: Core Bottom Hole Pressure calculation engine

**Key Components**:
- Data models (interfaces and types)
- Sliding window utility
- BHP calculation service
- RxJS stream processing

**Technology**: TypeScript, RxJS

### 2. Data Generator Library (`@angular-bhp-simulator/data-generator`)

**Purpose**: Synthetic data generation for testing and demonstration

**Key Components**:
- Pattern generators (6 patterns)
- Seeded random number generator
- Data streaming service
- Configuration models

**Technology**: TypeScript, RxJS

### 3. Chart Components Library (`@angular-bhp-simulator/chart-components`)

**Purpose**: Reusable visualization components

**Key Components**:
- Real-time line chart component
- Multi-series chart component
- Metric card component
- Theme service

**Technology**: Angular, ECharts, ngx-echarts

## Design Principles

### 1. Separation of Concerns
- Each library has a single, well-defined responsibility
- Libraries are independent and can be used separately
- Business logic separated from UI components

### 2. Reactive Programming
- RxJS Observables for data streams
- Push-based architecture for real-time updates
- Declarative data transformations

### 3. Type Safety
- TypeScript strict mode
- Comprehensive interfaces and types
- Generic types for reusability

### 4. Testability
- Pure functions where possible
- Dependency injection
- Mock-friendly architecture
- >85% code coverage target

### 5. Performance
- OnPush change detection
- Incremental calculations (sliding window)
- Efficient chart updates
- Lazy loading where applicable

## Data Flow

```
Data Generator → BHP Calculator → Chart Components → UI Display
     │                │                  │
     └────────────────┴──────────────────┘
              RxJS Observables
```

1. **Data Generation**: Synthetic data generated with configurable patterns
2. **Calculation**: Real-time BHP calculations using sliding window
3. **Visualization**: Chart components update reactively
4. **User Interaction**: Controls modify generation/calculation parameters

## Technology Stack

- **Framework**: Angular 21 (Standalone Components)
- **Build System**: Nx 22
- **UI Library**: Angular Material 21
- **Charts**: ECharts 6 with ngx-echarts
- **State Management**: RxJS
- **Testing**: Vitest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Language**: TypeScript 5 (Strict Mode)

## Development Workflow

1. **Local Development**: `nx serve demo-app`
2. **Testing**: `npm run test:all`
3. **Linting**: `npm run lint`
4. **Formatting**: `npm run format`
5. **Building**: `nx build-many --target=build --all`

## Future Enhancements

- Server-side data processing (optional)
- WebSocket support for real data
- Additional visualization types
- Export/import functionality
- Advanced filtering and analysis

---

For implementation details, see:
- [BHP Calculator Implementation](../plan/01_BHP_CALCULATOR_LIBRARY.md)
- [Data Generator Implementation](../plan/02_DATA_GENERATOR_LIBRARY.md)
- [Chart Components Implementation](../plan/03_CHART_COMPONENTS_LIBRARY.md)
