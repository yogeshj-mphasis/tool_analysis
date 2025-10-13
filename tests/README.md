# Employee CRUD API Testing Guide

## Overview
This directory contains comprehensive test cases for the Employee Management System's CRUD operations using **Jest** and **Supertest**.

## Test Framework
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for API testing
- **SQLite (in-memory)**: Isolated test database

## Test Structure

### Test File: `employee.test.js`

The test suite covers all CRUD operations with 17 test cases:

#### **CREATE Tests (POST /add)** - 5 tests
- ✓ Create employee with all fields (name, email, department, salary)
- ✓ Create employee without optional email
- ✓ Create employee without optional salary
- ✓ Validate required field: name
- ✓ Validate required field: department

#### **READ Tests (GET /)** - 3 tests
- ✓ Return empty array when no employees exist
- ✓ Return all employees from database
- ✓ Verify employees sorted in DESC order by ID

#### **UPDATE Tests (POST /update/:id)** - 5 tests
- ✓ Update employee with all fields
- ✓ Update employee and clear email field
- ✓ Validate required field: name (on update)
- ✓ Validate required field: department (on update)
- ✓ Return 404 for non-existent employee

#### **DELETE Tests (POST /delete/:id)** - 3 tests
- ✓ Delete existing employee
- ✓ Return 404 for non-existent employee
- ✓ Delete correct employee from multiple records

#### **Integration Tests** - 1 test
- ✓ Complete CRUD lifecycle (Create → Read → Update → Read → Delete → Read)

## How to Run Tests

### 1. **Run All Tests**
```bash
npm test
```

### 2. **Run Tests in Watch Mode** (auto-rerun on file changes)
```bash
npm run test:watch
```

### 3. **Run Tests with Coverage Report**
```bash
npm run test:coverage
```

## Test Configuration

The Jest configuration is defined in `package.json`:

```json
{
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

## Test Database

- **Type**: SQLite in-memory database (`:memory:`)
- **Isolation**: Each test suite gets a fresh database
- **Cleanup**: Database is cleared after each test (`afterEach`)
- **Schema**: Matches production schema exactly

```sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    department TEXT,
    salary REAL
)
```

## Test Workflow

1. **beforeAll**: Creates in-memory database and sets up Express app
2. **Test Execution**: Each test runs independently
3. **afterEach**: Clears all employee records
4. **afterAll**: Closes database connection

## Example Test Output

```
PASS  tests/employee.test.js
  Employee CRUD API Tests
    POST /add - Create Employee
      ✓ should create a new employee with all fields (48 ms)
      ✓ should create employee without optional email (11 ms)
      ...
    
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        1.834 s
```

## Writing New Tests

To add new tests, follow this pattern:

```javascript
test('test description', async () => {
    const response = await request(app)
        .post('/endpoint')
        .send({ data });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('field');
});
```

## Common Assertions

```javascript
// Status codes
expect(response.status).toBe(201);

// Response properties
expect(response.body).toHaveProperty('id');

// Array lengths
expect(response.body.employees).toHaveLength(2);

// Text content
expect(response.text).toContain('required');

// Comparisons
expect(value).toBeGreaterThan(0);
expect(value).toBe(expected);
```

## Debugging Tests

### Run specific test file:
```bash
npx jest tests/employee.test.js
```

### Run specific test by name:
```bash
npx jest -t "should create a new employee"
```

### Verbose output:
```bash
npx jest --verbose
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test
  
- name: Upload Coverage
  run: npm run test:coverage
```

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Clear Names**: Test names describe exactly what they test
3. **AAA Pattern**: Arrange → Act → Assert
4. **Edge Cases**: Tests cover both success and failure scenarios
5. **Cleanup**: Database is reset between tests for consistency
