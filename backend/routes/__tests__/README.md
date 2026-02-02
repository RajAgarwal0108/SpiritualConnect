# Admin Routes Tests

## Overview
This test suite covers the admin routes functionality including authentication, authorization, and CRUD operations.

## Test Coverage

### Authentication & Authorization
- ✅ No token provided (401)
- ✅ Invalid token (401)
- ✅ Non-admin access attempt (403)

### Endpoints Tested
- **GET /api/admin/users** - Retrieve all users
- **GET /api/admin/stats** - Get admin statistics
- **GET /api/admin/posts** - Retrieve all posts
- **GET /api/admin/reports** - Get all reports
- **GET /api/admin/analytics** - Get analytics data
- **DELETE /api/admin/users/:id** - Delete a user
- **DELETE /api/admin/posts/:id** - Delete a post

## Running Tests

### Run all tests
```bash
bun test
```

### Run tests in watch mode
```bash
bun test:watch
```

### Run specific test file
```bash
bun test routes/__tests__/admin.routes.test.ts
```

### Run with coverage
```bash
bun test --coverage
```

## Test Database Setup

Before running tests, ensure you have a test database configured:

1. Create a test database:
```bash
createdb spiritual_db_test
```

2. Run migrations on the test database:
```bash
DATABASE_URL="postgresql://spiritual_user_test:spiritual_password_test@localhost:5432/spiritual_db_test?schema=public" bunx prisma db push
```

3. (Optional) Seed test data:
```bash
DATABASE_URL="postgresql://spiritual_user_test:spiritual_password_test@localhost:5432/spiritual_db_test?schema=public" bunx prisma db seed
```

## Environment Variables

Tests use `.env.test` for configuration. Make sure this file exists and contains:
- `DATABASE_URL` - Test database connection string
- `JWT_SECRET` - Secret for JWT token generation
- Other required environment variables

## Writing New Tests

When adding new admin route tests:

1. Use the `adminToken` for authenticated admin requests
2. Use the `userToken` for testing authorization failures
3. Always test error cases and edge cases
4. Clean up any test data created during tests
5. Use descriptive test names

## Test Structure

```typescript
describe("Feature", () => {
  beforeAll(async () => {
    // Setup before all tests
  });

  afterAll(async () => {
    // Cleanup after all tests
  });

  test("should do something", async () => {
    // Test implementation
  });
});
```

## Mocking

For tests that require mocking Prisma or other services:

```typescript
import { mock } from "bun:test";

const mockPrisma = {
  user: {
    findMany: mock(() => []),
  },
};
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Ensure:
- Test database is available
- Environment variables are set
- Dependencies are installed

## Troubleshooting

### Database Connection Issues
- Verify test database exists
- Check DATABASE_URL in .env.test
- Ensure PostgreSQL is running

### Token Issues
- Verify JWT_SECRET matches between test and application
- Check token expiration settings

### Port Conflicts
- Tests use PORT=3002 by default
- Change if needed in .env.test
