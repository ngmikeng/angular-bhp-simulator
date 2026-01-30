# Contributing to Angular BHP Real-Time Simulator

Thank you for your interest in contributing to the Angular BHP Real-Time Simulator! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** for the enhancement
- **Proposed solution** or implementation approach
- **Alternatives considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm ci`
3. **Make your changes** following the coding standards
4. **Add tests** for your changes
5. **Ensure tests pass**: `npm run test:all`
6. **Ensure linting passes**: `npm run lint`
7. **Format your code**: `npm run format`
8. **Commit with conventional commits** (see below)
9. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/ngmikeng/angular-bhp-simulator.git
cd angular-bhp-simulator

# Install dependencies
npm ci

# Start development server
nx serve demo-app

# Run tests
npm run test:all

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
angular-bhp-simulator/
├── demo-app/              # Main demo application
├── bhp-calculator/        # BHP calculation library
├── data-generator/        # Data generation library
├── chart-components/      # Chart components library
├── docs/                  # Documentation
└── plan/                  # Implementation plans
```

## Coding Standards

### TypeScript

- Use **strict mode** TypeScript
- Follow **Angular style guide**
- Use **meaningful variable names**
- Add **JSDoc comments** for public APIs
- Prefer **const** over let when possible
- Use **async/await** over raw promises

### Angular

- Use **standalone components**
- Implement **OnPush change detection** where applicable
- Follow **reactive programming** patterns with RxJS
- Use **Angular Material** components
- Implement **proper lifecycle hooks**

### Testing

- Write **unit tests** for all new code
- Maintain **>85% code coverage**
- Use **descriptive test names**
- Follow **Arrange-Act-Assert** pattern
- Mock external dependencies

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(bhp-calculator): add sliding window algorithm
fix(data-generator): correct ramping pattern calculation
docs(readme): update installation instructions
test(chart-components): add tests for line chart component
```

## Testing Guidelines

### Unit Tests

```typescript
describe('BhpCalculatorService', () => {
  it('should calculate BHP correctly for steady state', () => {
    // Arrange
    const service = new BhpCalculatorService();
    const data = createTestData();

    // Act
    const result = service.calculate(data);

    // Assert
    expect(result.bhp).toBe(expectedValue);
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run tests for specific project
nx test bhp-calculator

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Documentation

- Update **README.md** for user-facing changes
- Update **API.md** for API changes
- Add **inline comments** for complex logic
- Update **CHANGELOG.md** with notable changes

## Review Process

1. All pull requests require **at least one approval**
2. **CI checks must pass** (tests, linting, build)
3. **Code coverage** should not decrease
4. **Conflicts must be resolved** before merge
5. Maintainers may request changes or clarifications

## Questions?

If you have questions, please:

1. Check the [documentation](./docs/)
2. Search existing [GitHub issues](https://github.com/ngmikeng/angular-bhp-simulator/issues)
3. Create a new issue with the **question** label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
