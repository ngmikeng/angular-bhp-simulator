# User Guide

> 📝 **Note**: This guide will be expanded as features are implemented.

## Getting Started

Welcome to the Angular BHP Real-Time Simulator! This guide will help you understand and use the application.

## What is BHP?

**Bottom Hole Pressure (BHP)** is a critical measurement in drilling operations that represents the pressure at the bottom of the wellbore. Accurate BHP calculation is essential for:

- **Safety**: Preventing blowouts and well control issues
- **Efficiency**: Optimizing drilling parameters
- **Decision Making**: Real-time operational adjustments

## Application Overview

The BHP Real-Time Simulator provides:

1. **Real-time Visualization**: Live charts showing BHP calculations
2. **Multiple Data Patterns**: Simulate different drilling scenarios
3. **Interactive Controls**: Adjust parameters and see immediate results
4. **Theme Support**: Light and dark mode for comfortable viewing

## Features

### Data Generation Patterns

The simulator supports 6 different data patterns:

1. **Steady State**: Constant flow rate and pressure
   - Use case: Stable drilling conditions
   - Characteristics: Minimal variation

2. **Linear Ramping**: Gradual increase or decrease
   - Use case: Pump rate adjustments
   - Characteristics: Predictable trends

3. **Sinusoidal Cycling**: Periodic oscillations
   - Use case: Cyclic operations (e.g., reaming)
   - Characteristics: Regular patterns

4. **Realistic Drilling**: Complex, realistic variations
   - Use case: Actual drilling simulation
   - Characteristics: Multi-factor variations

5. **Pump Start/Stop**: Sudden changes
   - Use case: Equipment operations
   - Characteristics: Step changes

6. **Stage Transitions**: Multi-phase operations
   - Use case: Fracking stages
   - Characteristics: Distinct phases

### Real-time Calculation

The BHP calculator uses a **sliding window algorithm** for:

- **Efficiency**: Incremental calculations without reprocessing all data
- **Accuracy**: Considers recent historical context
- **Performance**: Optimized for real-time updates

### Visualization

Interactive charts provide:

- **Zoom and Pan**: Explore data at different scales
- **Multiple Series**: Compare different metrics
- **Tooltips**: Detailed data point information
- **Export**: Save charts as images

## Using the Application

### Starting the Application

```bash
# Development mode
npm start

# The app will open at http://localhost:4200
```

### Basic Workflow

1. **Select a Data Pattern**: Choose from the pattern dropdown
2. **Start Simulation**: Click the "Start" button
3. **Observe Results**: Watch the real-time charts update
4. **Adjust Parameters**: Modify settings as needed
5. **Pause/Stop**: Control the simulation flow

### Controls

#### Simulation Controls
- **Start**: Begin data generation and calculation
- **Pause**: Temporarily halt the simulation
- **Stop**: End simulation and clear data
- **Reset**: Return to initial state

#### Configuration
- **Pattern**: Select data generation pattern
- **Interval**: Set update frequency (ms)
- **Window Size**: Adjust calculation window
- **Theme**: Toggle light/dark mode

### Understanding the Charts

#### Main Time Series Chart
- **X-axis**: Time (seconds or milliseconds)
- **Y-axis**: Values (pressure, flow rate, BHP)
- **Multiple Lines**: Different measurements
- **Legend**: Identify each series

#### Metric Cards
Display key statistics:
- **Current BHP**: Latest calculated value
- **Average**: Mean over time window
- **Min/Max**: Range of values
- **Trend**: Direction indicator

### Tips for Best Results

1. **Choose Appropriate Patterns**: Match the pattern to your use case
2. **Adjust Window Size**: Larger windows = smoother but delayed results
3. **Monitor Performance**: Use browser dev tools if needed
4. **Export Data**: Save interesting scenarios for later analysis

## Keyboard Shortcuts

(To be implemented)

- `Space`: Start/Pause simulation
- `R`: Reset simulation
- `T`: Toggle theme
- `E`: Export chart

## Troubleshooting

### Application Won't Start
- Ensure Node.js 20.x+ is installed
- Run `npm ci` to install dependencies
- Check console for error messages

### Poor Performance
- Reduce update interval
- Decrease window size
- Close other browser tabs
- Use Chrome for best performance

### Charts Not Updating
- Check browser console for errors
- Verify simulation is running
- Refresh the page

## Advanced Usage

### Custom Data Sources

(Future feature - see implementation plans)

### API Integration

(Future feature - see implementation plans)

### Export and Analysis

(Future feature - see implementation plans)

## Getting Help

- **Documentation**: See [docs folder](.)
- **Issues**: [GitHub Issues](https://github.com/[username]/angular-bhp-simulator/issues)
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

## Next Steps

- Explore different data patterns
- Experiment with configuration options
- Review the API documentation
- Consider contributing enhancements

---

For technical details, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Implementation Plans](../plan/README.md)
