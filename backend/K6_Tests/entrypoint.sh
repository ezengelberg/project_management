#!/bin/sh
echo "Starting K6 test execution..."

# set -e

run_tests_in_dir() {
  DIR=$1
  echo "Running tests in $DIR"
  for file in "$DIR"/*.js; do
    if [ -f "$file" ]; then
      echo "Running: $file"
      k6 run "$file"
    else
      echo "No .js files found in $DIR"
    fi
  done
}

run_tests_in_dir "/app/scripts/LoginTests"
run_tests_in_dir "/app/scripts/projectLifeTests"
run_tests_in_dir "/app/scripts/projectTests"
run_tests_in_dir "/app/scripts/userCreationTest"

echo "All tests executed successfully."