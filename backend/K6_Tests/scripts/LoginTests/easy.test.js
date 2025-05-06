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
  vus: 1, // Number of virtual users
  duration: "10s", // Duration of the test
};

export default function () {
  const url = "http://localhost:4000/api/user/login";
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

  sleep(1); // Pause for 1 second between iterations
}
