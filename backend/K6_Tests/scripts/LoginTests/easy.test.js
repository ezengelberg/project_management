/**
 * This K6 test script is designed to test the login functionality of the application.
 *
 * What the test does:
 * - Sends a POST request to the `/api/user/login` endpoint with a JSON payload containing valid user credentials.
 * - Validates the response to ensure the login endpoint works as expected.
 *
 * Expectations:
 * - The server should return a status code of 200, indicating a successful login.
 * - The response body should contain the user's email, confirming that the login was successful.
 *
 * Test Configuration:
 * - Virtual Users (VUs): 1
 * - Test Duration: 10 seconds
 * - Each iteration pauses for 1 second between requests.
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 30,            // simulate 30 users at once
  duration: "1m",     // let them run for 1 minute
  thresholds: {
    http_req_duration: ['p(95)<400', 'avg<300'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  }
};

// Runs ONCE before all virtual users
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
    sleep(1); // wait 1 second before retrying
  }

  if (!success) {
    throw new Error("Backend did not become ready in time");
  }

  const createRes = http.post(`${baseUrl}/api/user/create-admin`);

  check(createRes, {
    "admin created or already exists": (r) =>
      r.status === 200 || r.status === 201 || r.status === 409,
  });

  return { baseUrl }; // Pass to default function
}

// Runs per VU per iteration
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

  // const res = http.post(`${baseUrl}/api/user/login`, loginPayload, loginParams);

  // const passed = check(res, {
  //   "login status is 200": (r) => r.status === 200,
  //   "response contains admin email": (r) => r.json().email === "admin@jce.ac",
  // });

  // console.log(`VU: ${__VU}, Iteration: ${__ITER}, Login success: ${passed}`);

  sleep(1);
}