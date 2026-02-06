# Web Docker Tests

This directory contains tests for the web Docker image.

## Test Files

- **smoke-test.sh** - Basic smoke tests to verify the container is running correctly
  - Tests index.html is served
  - Tests SPA routing fallback works
  - Tests container health

## Running Tests

### Manually run Docker tests:
```bash
cd web
bash test-docker.sh
```

### Run individual smoke tests:
```bash
cd web
bash tests/smoke-test.sh
```

## Pre-commit Hook

The pre-commit hook automatically runs these tests when you commit changes to the `web/` directory.

To skip the hook (not recommended):
```bash
git commit --no-verify
```

## Adding More Tests

Add additional test scripts to this directory and source them in `test-docker.sh`.

Example:
```bash
# In test-docker.sh
if [ -f "tests/your-test.sh" ]; then
    bash tests/your-test.sh
fi
```
