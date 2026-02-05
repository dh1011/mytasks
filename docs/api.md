# MyTasks API Documentation

This document describes the shared API contracts between the mobile and web applications.

## Overview

The MyTasks API provides a unified interface for managing tasks across all client platforms (mobile and web). All clients should adhere to these specifications to ensure consistent behavior.

## Base Configuration

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:3000/api` |
| Production  | TBD |

## Authentication

> [!NOTE]
> Authentication details to be defined based on the backend implementation.

## Endpoints

### Tasks

#### GET /tasks

Retrieve all tasks for the authenticated user.

**Response:**
```json
{
  "tasks": [
    {
      "id": "string",
      "text": "string",
      "completed": "boolean",
      "reminder": "string | null (ISO 8601 timestamp)",
      "repeat": "string | null (none, daily, weekly, monthly)",
      "createdAt": "string (ISO 8601 timestamp)",
      "updatedAt": "string (ISO 8601 timestamp)"
    }
  ]
}
```

---

#### POST /tasks

Create a new task.

**Request Body:**
```json
{
  "text": "string (required)",
  "reminder": "string | null (ISO 8601 timestamp)",
  "repeat": "string | null (none, daily, weekly, monthly)"
}
```

**Response:**
```json
{
  "id": "string",
  "text": "string",
  "completed": false,
  "reminder": "string | null",
  "repeat": "string | null",
  "createdAt": "string (ISO 8601 timestamp)",
  "updatedAt": "string (ISO 8601 timestamp)"
}
```

---

#### PUT /tasks/:id

Update an existing task.

**Request Body:**
```json
{
  "text": "string (optional)",
  "completed": "boolean (optional)",
  "reminder": "string | null (optional)",
  "repeat": "string | null (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "text": "string",
  "completed": "boolean",
  "reminder": "string | null",
  "repeat": "string | null",
  "createdAt": "string (ISO 8601 timestamp)",
  "updatedAt": "string (ISO 8601 timestamp)"
}
```

---

#### DELETE /tasks/:id

Delete a task.

**Response:**
```json
{
  "success": true
}
```

---

### Connection Test

#### GET /test-connection

Test the API connection.

**Response:**
```json
{
  "success": true,
  "message": "Connection successful"
}
```

## Data Types

### Task

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `text` | string | Task description |
| `completed` | boolean | Completion status |
| `reminder` | string \| null | Optional reminder timestamp (ISO 8601) |
| `repeat` | string \| null | Repeat interval: `none`, `daily`, `weekly`, `monthly` |
| `createdAt` | string | Creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid request body |
| 401 | `UNAUTHORIZED` | Authentication required |
| 404 | `NOT_FOUND` | Resource not found |
| 500 | `INTERNAL_ERROR` | Server error |

## Client Implementation Notes

> [!IMPORTANT]
> Both mobile and web clients should use the shared types and API service from `@mytasks/core` package to ensure consistency.

### Importing Shared Services

```typescript
import { testConnection, ConnectionTestResult } from '@mytasks/core';
```
