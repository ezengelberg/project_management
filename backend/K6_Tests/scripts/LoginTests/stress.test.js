/**
 * This K6 test script is designed to stress test the login functionality of the application.
 *
 * What the test does:
 * - Simulates a high number of concurrent users attempting to log in over a period of time.
 * - Validates the response to ensure the system remains stable under load.
 *
 * Expectations:
 * - The server should handle the load without crashing or returning unexpected errors.
 * - The response time should remain within acceptable limits.
 *
 * Test Configuration:
 * - Gradual ramp-up of virtual users to simulate increasing load.
 * - Test duration: 5 minutes.
 */

import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 }, // Ramp up to 10 users over 1 minute
    { duration: "3m", target: 50 }, // Stay at 50 users for 3 minutes
    { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
};

export default function () {
  const url = `${__ENV.K6_BASE_URL}/api/user/login`;
  const payload = JSON.stringify({
    email: "adam@gmail.com",
    password: "12345Aa!",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "is status 200": (r) => r.status === 200, // Expect the response status to be 200
    "response contains user data": (r) => r.json().email === "adam@gmail.com", // Expect the response to include the user's email
  });
}
