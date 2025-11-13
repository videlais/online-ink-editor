# Test Suite for Online Ink Editor

This directory contains comprehensive BDD (Behavior-Driven Development) tests for the Online Ink Editor application.

## Test Framework

- **Vitest**: Modern, fast unit testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation

## Running Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests follow the BDD pattern using Given-When-Then scenarios:

```typescript
describe('Feature: Component Name', () => {
  describe('Scenario: User performs action', () => {
    it('Given initial state, When action occurs, Then expected result', () => {
      // Test implementation
    });
  });
});
```

## Test Coverage

### Components

#### `App.test.tsx`
- Application initialization and default state
- Content editing and auto-compilation
- Story execution with choices
- Restart functionality
- Zoom level management
- LocalStorage persistence
- Error handling for invalid Ink syntax
- Story statistics modal

#### `EditorPane.test.tsx`
- Editor rendering and initialization
- Content display and editing
- CodeMirror integration
- Ink syntax highlighting
- Dark theme support

#### `StoryPane.test.tsx`
- Story output display
- Choice presentation and interaction
- Error message display
- Restart button functionality
- Placeholder text for empty state

#### `MenuBar.test.tsx`
- Menu category display (File, Edit, Story, View)
- Dropdown menu interactions
- File operations (New, Save, Export, Save as Ink)
- Edit operations (Copy, Paste)
- Story operations (Statistics)
- View operations (Zoom In, Zoom Out)
- Menu state management (open/close)

#### `StatsModal.test.tsx`
- Statistics display (word count, knots, stitches, variables)
- Modal open/close functionality
- Empty state handling
- Large dataset handling
- Variable value display

### Utilities

#### `inkUtils.test.ts`
- Story analysis (word counting, knot detection, stitch detection, variable detection)
- LocalStorage operations (save, load)
- JSON export functionality
- Complex story analysis with multiple elements

## Test Principles

### 1. Behavior-Driven Development (BDD)
Tests are written from the user's perspective, focusing on features and scenarios rather than implementation details.

### 2. AAA Pattern
Each test follows Arrange-Act-Assert:
- **Arrange**: Set up test data and initial state
- **Act**: Perform the action being tested
- **Assert**: Verify the expected outcome

### 3. User-Centric Testing
Tests interact with components the same way users would:
- Using accessible queries (`getByRole`, `getByText`)
- Simulating real user events (clicks, typing)
- Avoiding implementation details (class names, internal state)

### 4. Isolation
Each test is independent and can run in any order:
- Mock external dependencies (localStorage, DOM APIs)
- Clean up after each test
- Use fresh component instances

## Mocking Strategy

### LocalStorage
Tests mock `localStorage` to avoid side effects and ensure consistent behavior:

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; }
  };
})();
```

### DOM APIs
File download and blob operations are mocked to avoid actual file system operations.

## Writing New Tests

When adding new features, follow these steps:

1. **Create a test file** following the naming convention: `ComponentName.test.tsx` or `utilityName.test.ts`

2. **Structure with BDD**:
   ```typescript
   describe('Feature: [Feature Name]', () => {
     describe('Scenario: [User scenario]', () => {
       it('Given [context], When [action], Then [outcome]', () => {
         // Test code
       });
     });
   });
   ```

3. **Use semantic queries** from Testing Library:
   - Prefer: `getByRole`, `getByLabelText`, `getByText`
   - Avoid: `getByTestId`, `getByClassName`

4. **Simulate user interactions**:
   ```typescript
   const user = userEvent.setup();
   await user.click(button);
   await user.type(input, 'text');
   ```

5. **Test accessibility**: Ensure components can be queried by role and label

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Run `npm run test:coverage` to see current coverage metrics.

## Continuous Integration

Tests are designed to run in CI environments:
- No interactive prompts
- Deterministic results
- Fast execution
- Clear error messages

## Debugging Tests

### VSCode Integration
Install the Vitest extension for VSCode to:
- Run individual tests
- Debug with breakpoints
- See test results inline

### Console Debugging
Use `screen.debug()` to print the current DOM:
```typescript
import { screen } from '@testing-library/react';

screen.debug(); // Prints entire document
screen.debug(element); // Prints specific element
```

### Test Filtering
Run specific tests:
```bash
# Run tests matching pattern
npm test -- App.test

# Run tests in specific file
npm test -- test/components/EditorPane.test.tsx
```

## Best Practices

1. **Keep tests simple**: One assertion per test when possible
2. **Use descriptive names**: Test names should explain what they verify
3. **Avoid test interdependence**: Each test should work standalone
4. **Mock external dependencies**: Don't rely on network, filesystem, etc.
5. **Test user behavior**: Focus on what users see and do
6. **Maintain test performance**: Keep tests fast (< 100ms each)
7. **Update tests with code**: Tests are documentation - keep them current

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
