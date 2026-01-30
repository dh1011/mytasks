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
