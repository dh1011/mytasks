# Backend & Data Layer Requirements

This document defines the logical data requirements and API/service contracts, independent of the user interface.

## 1. Data Model Definitions

### 1.1 Entity: Task
The `Task` object must strictly adhere to the following schema:
- **`id`**: String (UUID or Timestamp-string). Must be unique across the system.
- **`title`**: String. Minimum length 1 char. Must not be null.
- **`completed`**: Boolean. Defaults to `false`.
- **`createdAt`**: ISO-8601 Date String or Timestamp.

## 2. API / Data Service Methods

### 2.1 CREATE Task
- [ ] **BE-REQ-001**: **Accept Valid Payload**
    - **Input**: `title` string.
    - **Expected Outcome**: Returns a `Task` object with a populated `id`, `createdAt`, and `completed: false`. Data is persisted.
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
- [ ] **BE-REQ-005**: **Data Integrity**
    - **Expected Outcome**: All returned objects must contain all required fields (`id`, `title`, `completed`, `createdAt`).

### 2.3 UPDATE Task
- [ ] **BE-REQ-006**: **Toggle Completion**
    - **Input**: `taskId`, `completed` (boolean).
    - **Expected Outcome**: The specific task's `completed` flag is updated in persistence.
    - **Expected Outcome**: Returns the updated `Task` object.
- [ ] **BE-REQ-007**: **Update Non-Existent Task**
    - **Input**: `taskId` (non-existent).
    - **Expected Outcome**: Returns/Throws a NOT_FOUND error.

### 2.4 DELETE Task
- [ ] **BE-REQ-008**: **Delete by ID**
    - **Input**: `taskId`.
    - **Expected Outcome**: The task is permanently removed from the backing store.
    - **Expected Outcome**: Subsequent Fetch All operations do not include this ID.
- [ ] **BE-REQ-009**: **Delete Idempotency**
    - **Input**: `taskId` (that was just deleted).
    - **Expected Outcome**: Operation completes successfully (or returns specific "already deleted" status), but does not throw a system error.

## 3. Database Configuration

### 3.1 Entity: DatabaseConfig
The `DatabaseConfig` object defines connection parameters for a PostgreSQL-compatible database:
- **`host`**: String. The database server hostname or IP address.
- **`port`**: Number. The database server port (default: 5432).
- **`database`**: String. The name of the database.
- **`user`**: String. The database user for authentication.
- **`password`**: String. The database user password.
- **`ssl`**: Boolean. Whether to use SSL for the connection (default: true).

### 3.2 Database Configuration Methods
- [ ] **BE-REQ-010**: **Set Database Configuration**
    - **Input**: A valid `DatabaseConfig` object.
    - **Expected Outcome**: Configuration is saved locally (e.g., to AsyncStorage or secure storage).
    - **Expected Outcome**: Future data operations use this configuration to connect.
- [ ] **BE-REQ-011**: **Get Database Configuration**
    - **Input**: None.
    - **Expected Outcome**: Returns the stored `DatabaseConfig` object, or `null` if not configured.
- [ ] **BE-REQ-012**: **Clear Database Configuration**
    - **Input**: None.
    - **Expected Outcome**: Removes stored configuration. App reverts to local-only mode.
- [ ] **BE-REQ-013**: **Test Database Connection**
    - **Input**: A `DatabaseConfig` object.
    - **Expected Outcome**: Returns `true` if connection succeeds, or throws a CONNECTION_ERROR with details.

## 4. Remote Data Persistence (PostgreSQL-Compatible)

### 4.1 Supported Backends
The application must support any PostgreSQL-compatible database server, including:
- PostgreSQL
- Supabase
- CockroachDB
- Other PostgreSQL wire-protocol compatible databases

### 4.2 Remote CRUD Operations
When a valid `DatabaseConfig` is set, data operations must persist to the remote database.

- [ ] **BE-REQ-014**: **Remote CREATE Task**
    - **Input**: `title` string.
    - **Expected Outcome**: Task is inserted into the remote `tasks` table and returned with server-generated `id` and `createdAt`.
- [ ] **BE-REQ-015**: **Remote READ Tasks**
    - **Input**: None.
    - **Expected Outcome**: Returns all tasks from the remote `tasks` table, ordered by `created_at DESC`.
- [ ] **BE-REQ-016**: **Remote UPDATE Task**
    - **Input**: `taskId`, `completed` (boolean).
    - **Expected Outcome**: The task's `completed` column is updated in the remote database.
- [ ] **BE-REQ-017**: **Remote DELETE Task**
    - **Input**: `taskId`.
    - **Expected Outcome**: The row is deleted from the remote `tasks` table.
- [ ] **BE-REQ-018**: **Connection Failure Handling**
    - **Condition**: Remote database is unreachable.
    - **Expected Outcome**: Returns/Throws a CONNECTION_ERROR. No silent data loss.
