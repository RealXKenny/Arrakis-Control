---
name: Unit Test Suite
description: Create a thorough, maintainable unit test suite for the selected code
invokable: true
---

# Unit Test Suite

Please write a **thorough, production-quality suite of unit tests** for the selected code.

Before writing tests, carefully inspect the implementation and understand:

- What the code is responsible for
- Its inputs and outputs
- Dependencies and external services
- Expected control flow
- Error handling
- Side effects
- Type constraints
- Existing project testing conventions
- Related implementations and utilities

## Testing Requirements

Create tests that cover all meaningful behavior, including:

### 1. Normal Behavior

Test all expected successful execution paths.

Cover:

- Typical valid inputs
- Expected return values
- Expected state changes
- Multiple valid input combinations
- Different supported configuration values
- Normal asynchronous behavior

### 2. Edge Cases

Explicitly test boundary conditions and unusual but valid inputs.

Consider:

- Empty arrays
- Empty strings
- Zero values
- Negative numbers where applicable
- Very large numbers
- Minimum and maximum values
- Missing optional values
- `null` and `undefined` where applicable
- Duplicate values
- Single-item collections
- Large collections
- Unexpected but type-valid combinations

Do not add tests for impossible states unless the implementation can realistically receive those values at runtime.

### 3. Error Handling

Test every meaningful error path.

Verify behavior when:

- Dependencies throw errors
- Promises reject
- API calls fail
- Invalid input is provided
- Required data is missing
- External services return unexpected responses
- Validation fails
- Configuration is invalid

Verify both the error itself and the resulting application behavior.

### 4. Mocking and Dependencies

Mock external dependencies appropriately.

Do not make unit tests depend on:

- Real Discord APIs
- Real HTTP requests
- Real databases
- Real external game APIs
- Real filesystem state
- Real AI/LLM endpoints
- Network connectivity
- Production credentials

Tests must be deterministic and isolated.

Mock only what is necessary. Do not over-mock internal implementation details when testing behavior.

### 5. Async Code

For asynchronous functions, test:

- Successful resolution
- Rejected promises
- Dependency failures
- Correct `await` behavior
- Returned values
- Errors propagated to callers

Make sure tests properly await asynchronous operations and do not leave unresolved promises or background work.

### 6. Discord-Specific Code

For Discord.js code, mock Discord objects and interactions rather than connecting to Discord.

Where applicable, verify:

- Commands receive the expected arguments
- Interactions are handled correctly
- Replies are sent correctly
- Deferred replies are handled correctly
- Errors are handled correctly
- Embeds and components are constructed correctly
- Permissions and validation are enforced
- External service calls receive the correct arguments

Avoid testing Discord.js itself.

### 7. API and Service Integrations

For API clients and adapters, test:

- Successful responses
- Failed responses
- Invalid responses
- Missing fields
- HTTP errors
- Timeouts
- Authentication failures
- Malformed data
- Correct request parameters
- Correct request payloads
- Correct response transformation

Do not make real network requests from unit tests.

### 8. Boundary Conditions

Pay particular attention to logic involving:

- Counters
- Statistics
- Sorting
- Filtering
- Pagination
- Date/time calculations
- Numeric calculations
- String manipulation
- Status values
- Permission checks
- Boolean conditions
- Empty collections

Test the values immediately below, at, and immediately above important boundaries where applicable.

### 9. Type and Runtime Safety

TypeScript types are not a substitute for runtime testing.

Where external or untrusted data can enter the system, test realistic malformed runtime values even when TypeScript would normally reject them.

Verify that the code fails safely instead of crashing unexpectedly.

## Test Quality Requirements

Tests must be:

- Deterministic
- Isolated
- Repeatable
- Readable
- Maintainable
- Fast
- Independent of execution order
- Free from real network dependencies
- Free from production credentials
- Focused on observable behavior

Use descriptive test names that explain the expected behavior.

Prefer:

```text
should return an empty result when no members are provided