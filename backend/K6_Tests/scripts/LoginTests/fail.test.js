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
};

export default function () {
  const url = "http://localhost:4000/api/user/login";
  const payload = JSON.stringify({
    email: "invalid@example.com",
    password: "wrongPassword",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);

  // Check if the response is JSON
  if (res.headers["Content-Type"] && res.headers["Content-Type"].includes("application/json")) {
    const jsonResponse = res.json();
    check(jsonResponse, {
      "is status 401": (r) => res.status === 401,
      "response contains error message": (r) => r.message === "Invalid credentials",
    });
  } else {
    // Handle non-JSON responses
    console.log("Non-JSON response received:", res.body);
    check(res, {
      "is status 401": (r) => res.status === 401,
      "response contains error message (non-JSON)": (r) => res.body.includes("אימייל או סיסמה לא נכונים"), // Check for the expected error message
    });
  }

  sleep(1);
}
