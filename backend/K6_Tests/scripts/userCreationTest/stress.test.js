/**
 * This K6 test script is designed to stress test the user creation functionality.
 *
 * What the test does:
 * - Logs in to obtain an authentication token.
 * - Simulates multiple users being created concurrently.
 * - Ensures that the `testUser` field is set to `true` for each user created.
 *
 * Expectations:
 * - The server should handle the load without crashing or returning unexpected errors.
 * - Each user should be created successfully with the `testUser` field set to `true`.
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 }, // Ramp up to 10 users over 1 minute
    { duration: "3m", target: 50 }, // Stay at 50 users for 3 minutes
    { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
};

export default function () {
  const loginUrl = "http://localhost:4000/api/user/login";
  const registerUrl = "http://localhost:4000/api/user/register";

  // Step 1: Log in to get a token
  const loginPayload = JSON.stringify({
    email: "adam@gmail.com",
    password: "12345Aa!",
  });

  const loginParams = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const loginRes = http.post(loginUrl, loginPayload, loginParams);

  check(loginRes, {
    "is login successful": (r) => r.status === 200,
  });

  const token = loginRes.json().token; // Extract the token from the login response

  // Step 2: Register a user using the token
  const uniqueUserId = `TestUser_${__VU}_${Date.now()}`; // Generate a unique user ID
  const registerPayload = JSON.stringify({
    name: `Test User ${__VU}`,
    email: `${uniqueUserId}@example.com`,
    id: uniqueUserId,
    password: "Password123!",
    isStudent: true,
    isAdvisor: false,
    isJudge: false,
    isCoordinator: false,
    testUser: true, // Set the testUser field to true
  });

  const registerParams = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Use the token in the Authorization header
    },
  };

  const registerRes = http.post(registerUrl, registerPayload, registerParams);

  // Check if the response is JSON and validate the user creation
  if (registerRes.headers["Content-Type"] && registerRes.headers["Content-Type"].includes("application/json")) {
    const responseBody = registerRes.json();
    check(responseBody, {
      "is status 201": (r) => registerRes.status === 201, // Expect the response status to be 201
      "is user creation successful": (r) => r.message && r.message.includes("User registered successfully"), // Validate success message
    });
  } else {
    check(registerRes, {
      "is status 201": (r) => registerRes.status === 201,
      "is user creation successful": (r) => r.body.includes("User registered successfully"),
    });
  }

  sleep(1); // Pause for 1 second between iterations
}
