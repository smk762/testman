#!/bin/sh

cd /etc/newman
# Debug information

# Check for required files
if [ ! -f "tests.js" ]; then
  echo "ERROR: tests.js not found!"
  exit 1
fi

if [ ! -f "collection.json" ]; then
  echo "ERROR: collection.json not found!"
  exit 1
fi

# Run the tests with verbose output
echo "Starting tests..."
node --trace-warnings tests.js

# Capture exit code
EXIT_CODE=$?
echo "Tests completed with exit code: $EXIT_CODE"
exit $EXIT_CODE