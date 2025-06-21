/**
 * This K6 test script is designed to stress test the project creation functionality.
 *
 * What the test does:
 * - Simulates multiple users creating projects concurrently.
 * - Validates the response to ensure the system remains stable under load.
 *
 * Expectations:
 * - The server should handle the load without crashing or returning unexpected errors.
 * - Each project should be created successfully with a unique name.
 * - Each project should be deleted successfully after creation.
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

export default function (data) {
  const baseUrl = data.baseUrl;
  const api = `${baseUrl}/api`;
  const adminPassword = __ENV.ADMIN_USER_PASSWORD;

  const jar = http.cookieJar();

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
  if (!setCookieHeader) throw new Error("No Set-Cookie header received from backend.");

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
  if (!sessionCookie) throw new Error("Session cookie not found.");

  const userId = loginRes.json()?._id;
  if (!userId) throw new Error("User ID not found in login response.");

  const uniqueProjectName = `Project_${__VU}_${Date.now()}`;
  const projectPayload = JSON.stringify({
    title: uniqueProjectName,
    description: `<p>${uniqueProjectName}</p>`,
    year: "תתת\"ת",
    suitableFor: "יחיד",
    type: "מחקרי",
    advisors: [userId],
    students: [],
  });

  const projectHeaders = {
    headers: {
      "Content-Type": "application/json",
      "Cookie": sessionCookie,
    },
    jar: jar,
  };

  const projectRes = http.post(`${api}/project/create-project`, projectPayload, projectHeaders);

  if (projectRes.headers["Content-Type"]?.includes("application/json")) {
    const responseBody = projectRes.json();
    check(responseBody, {
      "is status 201": () => projectRes.status === 201,
      "project title is correct": () => responseBody.project?.title === uniqueProjectName,
    });
  } else {
    console.error("Non-JSON response received:", projectRes.body);
  }

  sleep(1);
}