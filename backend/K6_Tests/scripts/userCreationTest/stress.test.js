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
    { duration: "1m", target: 10 },
    { duration: "3m", target: 50 },
    { duration: "1m", target: 0 },
  ],
};

export function setup() {
  const baseUrl = __ENV.K6_BASE_URL;

  // Wait for backend readiness
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

  if (!success) throw new Error("Backend did not become ready in time");

  // Ensure admin user exists
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

  // Login to get session cookie
  const loginRes = http.post(`${api}/user/login`, JSON.stringify({
    email: "admin@jce.ac",
    password: adminPassword,
  }), {
    headers: { "Content-Type": "application/json" },
    jar: jar,
  });

  check(loginRes, {
    "login successful": (r) => r.status === 200,
  });

  const setCookieHeader = loginRes.headers['Set-Cookie'];
  if (!setCookieHeader) throw new Error("No Set-Cookie header received");

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

  if (!sessionCookie) throw new Error("Session cookie not found");

  const uniqueUserId = `TestUser_${__VU}_${Date.now()}`;
  const registerPayload = JSON.stringify({
    name: `Test User ${__VU}`,
    email: `${uniqueUserId}@example.com`,
    id: uniqueUserId,
    password: "Password123!",
    isStudent: true,
    isAdvisor: false,
    isJudge: false,
    isCoordinator: false,
    testUser: true,
  });

  const registerRes = http.post(`${api}/user/register`, registerPayload, {
    headers: {
      "Content-Type": "application/json",
      "Cookie": sessionCookie,
    },
    jar: jar,
  });

  if (registerRes.headers["Content-Type"]?.includes("application/json")) {
    const body = registerRes.json();
    check(body, {
      "status 201": () => registerRes.status === 201,
      "user registered": () => body.message?.includes("User registered successfully"),
    });
  } else {
    check(registerRes, {
      "status 201": (r) => r.status === 201,
      "response contains success message": (r) =>
        r.body.includes("User registered successfully"),
    });
  }

  sleep(1);
}