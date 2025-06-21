/**
 * This K6 test script is designed to test the login functionality with invalid credentials.
 *
 * What the test does:
 * - Sends a POST request to the `/api/user/login` endpoint with invalid user credentials.
 * - Validates the response to ensure the system handles login failures correctly.
 *
 * Expectations:
 * - The server should return a status code of 401, indicating unauthorized access.
 * - The response body should contain an appropriate error message, either in JSON or plain text.
 *
 * Test Configuration:
 * - Virtual Users (VUs): 1
 * - Test Duration: 10 seconds
 * - Each iteration pauses for 1 second between requests.
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "10s",
  thresholds: {
    http_req_duration: ['p(95)<500'],
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
    sleep(1);
  }

  if (!success) {
    throw new Error("Backend did not become ready in time");
  }

  return { baseUrl };
}

// Runs per VU per iteration
export default function (data) {
  const baseUrl = data.baseUrl;

  const payload = JSON.stringify({
    email: "invalid@example.com",
    password: "wrongPassword",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(`${baseUrl}/api/user/login`, payload, params);

  if (res.headers["Content-Type"]?.includes("application/json")) {
    const jsonResponse = res.json();
    check(res, {
      "status is 401 (unauthorized)": () => res.status === 401,
    });
    check(jsonResponse, {
      "error message is 'Invalid credentials'": (r) => r.message === "Invalid credentials",
    });
  } else {
    console.log("Non-JSON response received:", res.body);
    check(res, {
      "status is 401 (unauthorized)": () => res.status === 401,
      "body contains Hebrew error message": () =>
        res.body.includes("אימייל או סיסמה לא נכונים"),
    });
  }

  sleep(1);
}