# BHP Real-Time Simulator

[![CI](https://github.com/ngmikeng/angular-bhp-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/ngmikeng/angular-bhp-simulator/actions/workflows/ci.yml)
[![Deploy](https://github.com/ngmikeng/angular-bhp-simulator/actions/workflows/deploy.yml/badge.svg)](https://github.com/ngmikeng/angular-bhp-simulator/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://ngmikeng.github.io/angular-bhp-simulator/) | [📖 Documentation](./docs) | [🔧 API Reference](./docs/API.md)

A real-time Bottomhole Pressure (BHP) simulator built with Angular 21, TypeScript, and Apache ECharts. This application demonstrates advanced data visualization, real-time calculations, and modern Angular architecture using Nx monorepo structure.

## ✨ Features

- 📊 **Real-time BHP Calculations** - Dynamic pressure calculations using standard petroleum engineering formulas
- 📈 **Interactive Visualizations** - Multiple chart types powered by Apache ECharts
- 🎨 **Theming Support** - Light and dark themes with Angular Material
- 🏗️ **Modular Architecture** - Three independent Angular libraries with clear separation of concerns
- 🧪 **Comprehensive Testing** - Unit tests with Vitest for all components and services
- 🚀 **Nx Monorepo** - Optimized build system with caching and incremental builds
- 📱 **Responsive Design** - Works seamlessly across desktop and mobile devices

## 🏗️ Project Structure

This workspace is organized as an Nx monorepo with the following structure:

```
angular-bhp-simulator/
├── apps/
│   └── demo-app/              # Demo application showcasing the libraries
├── libs/
│   ├── bhp-calculator/        # Core BHP calculation engine
│   ├── chart-components/      # Reusable chart components with ECharts
│   └── data-generator/        # Synthetic data generation utilities
└── docs/                      # Project documentation
```

## 🚀 Quick Start

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or later
- npm 10.x or later

### Installation

```bash
# Clone the repository
git clone https://github.com/ngmikeng/angular-bhp-simulator.git
cd angular-bhp-simulator

# Install dependencies
npm install
```

### Development Server

```bash
# Start the development server
npm start
# or
npx nx serve demo-app

# Navigate to http://localhost:4200/
```

### Building

```bash
# Build all libraries and the demo application
npm run build
# or
npx nx build demo-app --configuration=production
```

### Testing

```bash
# Run all tests
npm run test:all

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Lint all projects
npm run lint

# Lint with auto-fix
npm run lint:fix
```

## 📦 Libraries

### @angular-bhp-simulator/bhp-calculator

Core calculation engine for Bottomhole Pressure computations.

- Hydrostatic pressure calculations
- Friction pressure loss calculations
- Temperature corrections
- Unit conversions (psi, bar, MPa)

[Library README](./libs/bhp-calculator/README.md)

### @angular-bhp-simulator/chart-components

Reusable Angular components for data visualization.

- Line charts for trend analysis
- Gauge charts for real-time metrics
- Scatter plots for correlation analysis
- Bar charts for comparative analysis

[Library README](./libs/chart-components/README.md)

### @angular-bhp-simulator/data-generator

Utilities for generating synthetic drilling data.

- Configurable data generation
- Realistic noise and trends
- Multiple parameter support
- Time-series data generation

[Library README](./libs/data-generator/README.md)

## 🎯 Usage Example

```typescript
import { BhpCalculatorService } from '@angular-bhp-simulator/bhp-calculator';
import { DataGeneratorService } from '@angular-bhp-simulator/data-generator';

// Generate synthetic drilling data
const data = dataGenerator.generateDrillingData({
  duration: 60,
  depth: { min: 0, max: 5000 }
});

// Calculate BHP
const bhp = bhpCalculator.calculateBHP({
  mudDensity: 1.2,
  depth: 3000,
  flowRate: 500
});
```

## 📊 Demo Application

The demo application showcases all three libraries working together:

- **Real-time Simulation** - Start/stop/reset controls with adjustable parameters
- **Dashboard View** - Overview of all key metrics and charts
- **Interactive Charts** - Zoom, pan, and interact with time-series data
- **Theme Toggle** - Switch between light and dark modes
- **Responsive Layout** - Optimized for desktop and mobile

## 🛠️ Technology Stack

- **Angular 21** - Latest Angular framework with standalone components
- **TypeScript 5.9** - Strongly typed JavaScript
- **Apache ECharts 6.0** - Professional data visualization library
- **Angular Material 21** - Material Design components
- **Nx 22** - Build system and monorepo tools
- **Vitest 4** - Fast unit testing framework
- **RxJS 7.8** - Reactive programming library
- **SCSS** - Advanced CSS with variables and mixins

## 📁 Project Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - System design and component architecture
- [API Reference](./docs/API.md) - Detailed API documentation for all libraries
- [User Guide](./docs/USER_GUIDE.md) - How to use the demo application
- [Deployment Guide](./docs/DEPLOYMENT.md) - CI/CD and deployment instructions

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md) before submitting a pull request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nx](https://nx.dev) - Smart Monorepos · Fast CI
- Charts powered by [Apache ECharts](https://echarts.apache.org/)
- UI components from [Angular Material](https://material.angular.io/)

## 🔗 Links

- [Live Demo](https://ngmikeng.github.io/angular-bhp-simulator/)
- [GitHub Repository](https://github.com/ngmikeng/angular-bhp-simulator)
- [Issue Tracker](https://github.com/ngmikeng/angular-bhp-simulator/issues)

---

<div align="center">

Built with ❤️ using Angular and Nx

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

</div>
