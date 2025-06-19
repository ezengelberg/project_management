#!/bin/bash

echo "Starting K6 test execution..."

# Fail the script on any error
set -e

# Function to run all test files in a given directory
run_tests_in_dir() {
  DIR=$1
  echo "Running tests in $DIR"

  for file in "$DIR"/*.js; do
    if [[ -f "$file" ]]; then
      echo "Running: $file"
      k6 run "$file"
    else
      echo "No .js files found in $DIR"
    fi
  done
}

# Run test files from each directory
run_tests_in_dir "/app/LoginTests"
run_tests_in_dir "/app/userCreationTests"
run_tests_in_dir "/app/projectLifeTests"

echo "All tests executed successfully."
