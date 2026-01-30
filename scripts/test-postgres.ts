import { PostgresService } from '../services/postgresService';
import { DatabaseConfig } from '../types/DatabaseConfig';

// Test configuration for local PostgreSQL container
const testConfig: DatabaseConfig = {
    host: 'localhost',
    port: 5432,
    database: 'mytasks',
    user: 'mytasks',
    password: 'mytasks',
    ssl: false,
};

interface TestResult {
    requirement: string;
    passed: boolean;
    error?: string;
}

const results: TestResult[] = [];

function logResult(requirement: string, passed: boolean, error?: string) {
    const icon = passed ? '✓' : '✗';
    console.log(`  ${icon} ${requirement}${error ? `: ${error}` : ''}`);
    results.push({ requirement, passed, error });
}

async function runTests() {
    console.log('\n=== PostgreSQL Backend SRS Tests ===\n');

    const service = new PostgresService(testConfig);
    let createdTaskId: string | null = null;

    // BE-REQ-013: Test Database Connection
    console.log('BE-REQ-013: Test Database Connection');
    try {
        const connected = await service.testConnection();
        logResult('Connection successful', connected);
    } catch (e) {
        logResult('Connection successful', false, (e as Error).message);
        console.log('\n❌ Cannot proceed without database connection. Exiting.\n');
        await service.close();
        process.exit(1);
    }

    // BE-REQ-014: Remote CREATE Task
    console.log('\nBE-REQ-014: Remote CREATE Task');
    try {
        const task = await service.createTask('Test Task from Script');
        const hasRequiredFields =
            task.id && task.title === 'Test Task from Script' && task.completed === false && task.createdAt instanceof Date;
        logResult('Creates task with all required fields', !!hasRequiredFields);
        createdTaskId = task.id;
    } catch (e) {
        logResult('Creates task with all required fields', false, (e as Error).message);
    }

    // BE-REQ-002: Sanitization (via remote)
    console.log('\nBE-REQ-002: Sanitization');
    try {
        const task = await service.createTask('   Trimmed Title   ');
        logResult('Trims whitespace from title', task.title === 'Trimmed Title');
        if (task.id) await service.deleteTask(task.id); // cleanup
    } catch (e) {
        logResult('Trims whitespace from title', false, (e as Error).message);
    }

    // BE-REQ-003: Validation Error (Empty)
    console.log('\nBE-REQ-003: Validation Error (Empty)');
    try {
        await service.createTask('   ');
        logResult('Rejects empty title', false, 'No error thrown');
    } catch (e) {
        const isInvalidInput = (e as Error).message.includes('INVALID_INPUT');
        logResult('Rejects empty title', isInvalidInput);
    }

    // BE-REQ-015: Remote READ Tasks
    console.log('\nBE-REQ-015: Remote READ Tasks');
    try {
        const tasks = await service.fetchTasks();
        const isArray = Array.isArray(tasks);
        const hasCreatedTask = createdTaskId ? tasks.some((t) => t.id === createdTaskId) : false;
        logResult('Returns array of tasks', isArray);
        logResult('Includes created task', hasCreatedTask);
    } catch (e) {
        logResult('Returns array of tasks', false, (e as Error).message);
    }

    // BE-REQ-016: Remote UPDATE Task
    console.log('\nBE-REQ-016: Remote UPDATE Task');
    if (createdTaskId) {
        try {
            const updated = await service.updateTask(createdTaskId, true);
            logResult('Updates task completed status', updated.completed === true);
        } catch (e) {
            logResult('Updates task completed status', false, (e as Error).message);
        }
    } else {
        logResult('Updates task completed status', false, 'No task to update');
    }

    // BE-REQ-007: Update Non-Existent Task
    console.log('\nBE-REQ-007: Update Non-Existent Task');
    try {
        await service.updateTask('00000000-0000-0000-0000-000000000000', true);
        logResult('Throws NOT_FOUND for non-existent task', false, 'No error thrown');
    } catch (e) {
        const isNotFound = (e as Error).message.includes('NOT_FOUND');
        logResult('Throws NOT_FOUND for non-existent task', isNotFound);
    }

    // BE-REQ-017: Remote DELETE Task
    console.log('\nBE-REQ-017: Remote DELETE Task');
    if (createdTaskId) {
        try {
            await service.deleteTask(createdTaskId);
            const tasksAfterDelete = await service.fetchTasks();
            const stillExists = tasksAfterDelete.some((t) => t.id === createdTaskId);
            logResult('Deletes task by ID', !stillExists);
        } catch (e) {
            logResult('Deletes task by ID', false, (e as Error).message);
        }
    } else {
        logResult('Deletes task by ID', false, 'No task to delete');
    }

    // BE-REQ-009: Delete Idempotency
    console.log('\nBE-REQ-009: Delete Idempotency');
    try {
        await service.deleteTask('00000000-0000-0000-0000-000000000000');
        logResult('Delete is idempotent (no error for non-existent)', true);
    } catch (e) {
        logResult('Delete is idempotent (no error for non-existent)', false, (e as Error).message);
    }

    // BE-REQ-018: Connection Failure Handling
    console.log('\nBE-REQ-018: Connection Failure Handling');
    const badConfig: DatabaseConfig = { ...testConfig, host: 'nonexistent.invalid', port: 9999 };
    const badService = new PostgresService(badConfig);
    try {
        await badService.testConnection();
        logResult('Throws CONNECTION_ERROR for bad config', false, 'No error thrown');
    } catch (e) {
        const isConnectionError = (e as Error).message.includes('CONNECTION_ERROR');
        logResult('Throws CONNECTION_ERROR for bad config', isConnectionError);
    }
    await badService.close();

    // Summary
    console.log('\n=== Test Summary ===');
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    console.log(`\n  Passed: ${passed}/${total}\n`);

    await service.close();
    process.exit(passed === total ? 0 : 1);
}

runTests().catch((err) => {
    console.error('Test runner error:', err);
    process.exit(1);
});
