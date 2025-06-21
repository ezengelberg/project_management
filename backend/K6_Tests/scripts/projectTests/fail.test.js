/**
 * This K6 test script is designed to test the project creation functionality with invalid data.
 *
 * What the test does:
 * - Logs in to obtain an authentication token.
 * - Sends a POST request to the `/api/project/create-project` endpoint with invalid project details.
 * - Validates the response to ensure the system handles the error correctly.
 *
 * Expectations:
 * - The server should return a status code of 400, indicating a bad request.
 * - The response body should contain an appropriate error message.
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "10s",
};

export function setup() {
  const baseUrl = __ENV.K6_BASE_URL;

  // Wait for backend to be healthy
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

export default function (data) {
  const baseUrl = data.baseUrl;
  const api = `${baseUrl}/api`;
  const adminPassword = __ENV.ADMIN_USER_PASSWORD;


  const jar = http.cookieJar();

  // Step 1: Log in
  const loginRes = http.post(`${api}/user/login`, JSON.stringify({
    email: "admin@jce.ac",
    password: adminPassword,
  }), {
    headers: { "Content-Type": "application/json" },
    jar,
  });

  check(loginRes, {
    "login successful": (r) => r.status === 200,
  });

  // Extract session cookie manually (for headers fallback)
  const setCookieHeader = loginRes.headers['Set-Cookie'];

  if (!setCookieHeader) {
    throw new Error("No Set-Cookie header received from backend.");
  }

  // Extract session cookie manually as backup
  let sessionCookie = '';
  if (Array.isArray(setCookieHeader)) {
    for (let cookie of setCookieHeader) {
      if (cookie.includes('connect.sid')) {
        sessionCookie = cookie.split(';')[0];
        break;
      }
    }
  } else if (setCookieHeader.includes('connect.sid')) {
    sessionCookie = setCookieHeader.split(';')[0];
  }

  if (!sessionCookie) {
    throw new Error("Session cookie not found in Set-Cookie header.");
  }

  // Step 2: Send invalid project creation request
  const invalidProjectPayload = JSON.stringify({
    // Missing required fields like `title` and `advisors`
    description: "This is an invalid project description.",
    year: "תתת\"ת",
    suitableFor: "יחיד",
    type: "מחקרי",
  });

  const projectRes = http.post(`${api}/project/create-project`, invalidProjectPayload, {
    headers: {
      "Content-Type": "application/json",
      "Cookie": sessionCookie,
    },
    jar,
  });

  check(projectRes, {
    "is status 400": (r) => r.status === 400,
    "contains error message": (r) =>
      r.headers["Content-Type"]?.includes("application/json") &&
      r.json().message?.toLowerCase().includes("missing"),
  });

  sleep(1);
}

