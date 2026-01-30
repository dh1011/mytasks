# Backend & Data Layer Requirements

This document defines the data requirements and API/service contracts.

## 1. Data Model Definitions

### 1.1 Entity: Task
The `Task` object must strictly adhere to the following schema:
- **`id`**: String (UUID). Unique across the system.
- **`title`**: String. Minimum length 1 char. Must not be null.
- **`completed`**: Boolean. Defaults to `false`.
- **`createdAt`**: ISO-8601 Date String or Timestamp.

## 2. API / Data Service Methods

### 2.1 CREATE Task
- [ ] **BE-REQ-001**: **Accept Valid Payload**
    - **Input**: `title` string.
    - **Expected Outcome**: Returns a `Task` object with a populated `id`, `createdAt`, and `completed: false`. Persisted via API.
- [ ] **BE-REQ-002**: **Sanitization**
    - **Input**: String with leading/trailing whitespace.
    - **Expected Outcome**: Service stores and returns the trimmed string.
- [ ] **BE-REQ-003**: **Validation Error (Empty)**
    - **Input**: Empty string or null.
    - **Expected Outcome**: Returns/Throws an INVALID_INPUT error. No data persisted.

### 2.2 READ Tasks
- [ ] **BE-REQ-004**: **Fetch All**
    - **Input**: None.
    - **Expected Outcome**: Returns an Array of `Task` objects.
    - **Condition**: Newest tasks should be returned first (descending Sort by `createdAt`).

### 2.3 UPDATE Task
- [ ] **BE-REQ-006**: **Toggle Completion**
    - **Input**: `taskId`, `completed` (boolean).
    - **Expected Outcome**: The specific task's `completed` flag is updated in persistence.
- [ ] **BE-REQ-007**: **Update Non-Existent Task**
    - **Input**: `taskId` (non-existent).
    - **Expected Outcome**: Returns/Throws a NOT_FOUND error.

### 2.4 DELETE Task
- [ ] **BE-REQ-008**: **Delete by ID**
    - **Input**: `taskId`.
    - **Expected Outcome**: The task is permanently removed.
- [ ] **BE-REQ-009**: **Delete Idempotency**
    - **Expected Outcome**: Operation completes successfully even if task is already deleted.

## 3. API Configuration (PostgREST)

### 3.1 Entity: DatabaseConfig
The `DatabaseConfig` object defines connection parameters for the PostgREST-compatible API:
- **`apiUrl`**: String. The base URL of the PostgREST API (e.g., Supabase REST URL).
- **`anonKey`**: String. The public anonymous key for authorization.

### 3.2 Configuration Methods
- [ ] **BE-REQ-010**: **Set API Configuration**
    - **Input**: A valid `DatabaseConfig` object.
    - **Expected Outcome**: Configuration is saved locally.
    - **Expected Outcome**: Future data operations use this configuration.
- [ ] **BE-REQ-011**: **Get API Configuration**
    - **Input**: None.
    - **Expected Outcome**: Returns the stored `DatabaseConfig` object, or `null`.
- [ ] **BE-REQ-012**: **Clear API Configuration**
    - **Input**: None.
    - **Expected Outcome**: Removes stored configuration.
- [ ] **BE-REQ-013**: **Test API Connection**
    - **Input**: A `DatabaseConfig` object.
    - **Expected Outcome**: Returns `true` if API is reachable and authorized.

## 4. Remote Data Persistence (PostgREST-Compatible)

### 4.1 Supported Backends
The application must support any PostgREST-compatible API, specifically **Supabase**.

### 4.2 Remote CRUD Operations
When a valid configuration is set, data operations must persist to the remote API.

- [ ] **BE-REQ-014**: **Remote CREATE Task**: `POST /tasks`
- [ ] **BE-REQ-015**: **Remote READ Tasks**: `GET /tasks`
- [ ] **BE-REQ-016**: **Remote UPDATE Task**: `PATCH /tasks`
- [ ] **BE-REQ-017**: **Remote DELETE Task**: `DELETE /tasks`
- [ ] **BE-REQ-018**: **Connection Failure Handling**: Returns/Throws error on network failure.
