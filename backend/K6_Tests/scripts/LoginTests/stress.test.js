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
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 },  // Ramp up to 10 users
    { duration: "3m", target: 50 },  // Hold at 50 users
    { duration: "1m", target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<400', 'avg<300'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

// Runs once before the test begins
export function setup() {
  const baseUrl = __ENV.K6_BASE_URL;

  let success = false;
  for (let i = 0; i < 10; i++) {
    const res = http.get(`${baseUrl}/healthcheck`);
    if (res.status === 200) {
      success = true;
      break;
    }
    console.log(`Waiting for backend... retry ${i + 1}`);
    sleep(1);
  }

  if (!success) {
    throw new Error("Backend did not become ready in time");
  }

  const createRes = http.post(`${baseUrl}/api/user/create-admin`);

  check(createRes, {
    "admin created or already exists": (r) =>
      r.status === 200 || r.status === 201 || r.status === 409,
  });

  return { baseUrl };
}

// Runs per virtual user per iteration
export default function (data) {
  const baseUrl = data.baseUrl;
  const adminPassword = __ENV.ADMIN_USER_PASSWORD;

  const loginPayload = JSON.stringify({
    email: "admin@jce.ac",
    password: adminPassword,
  });

  const loginParams = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(`${baseUrl}/api/user/login`, loginPayload, loginParams);

  const passed = check(res, {
    "login status is 200": (r) => r.status === 200,
    "response contains admin email": (r) =>
      r.json() && r.json().email === "admin@jce.ac",
  });

  console.log(`VU: ${__VU}, Iteration: ${__ITER}, Login success: ${passed}`);
  sleep(1);
}
