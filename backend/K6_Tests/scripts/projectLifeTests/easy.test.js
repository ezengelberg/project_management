/**
 * This K6 test script combines multiple functionalities into one comprehensive test:
 * - Logs in to obtain an authentication token.
 * - Creates two users with valid 9-digit IDs and unique email addresses.
 * - Creates a project and adds the two users as students.
 * - Creates a submission for each project in the year "תתת\"ת".
 * - Uploads a PDF file for the submission.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export const options = {
  vus: 1,
  duration: "10s",
  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

function generateValidId() {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

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

export default function (data) {
  const baseUrl = data.baseUrl;
  const api = `${baseUrl}/api`;
  const adminPassword = __ENV.ADMIN_USER_PASSWORD;

  // Create a cookie jar to automatically handle cookies
  const jar = http.cookieJar();

  const loginRes = http.post(`${api}/user/login`, JSON.stringify({
    email: "admin@jce.ac",
    password: adminPassword,
  }), {
    headers: { "Content-Type": "application/json" },
    jar: jar,
  });

  check(loginRes, { "login successful": (r) => r.status === 200 });

  // Debug cookie information
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

  // Headers for authenticated requests
  const authHeaders = {
    headers: {
      "Content-Type": "application/json",
      "Cookie": sessionCookie,
    },
    jar: jar, // Continue using cookie jar
  };

  // Register 2 test users
  const users = [];
  for (let i = 0; i < 2; i++) {
    const userId = generateValidId();
    const email = `testuser${i}_${randomString(5)}@example.com`;

    const payload = JSON.stringify({
      name: `User ${i + 1}`,
      email,
      id: userId,
      password: "Password123!",
      isStudent: true,
      testUser: true,
    });

    const userRes = http.post(`${api}/user/register`, payload, authHeaders);
    check(userRes, { "user created": (r) => r.status === 201 });

    if (userRes.status === 201 && userRes.headers["Content-Type"]?.includes("application/json")) {
      const body = userRes.json();
      if (body.newUser) {
        users.push(body.newUser);
      } else {
        console.error("Missing newUser in response body");
      }
    } else {
      console.error(`Registration failed (${userRes.status}): ${userRes.body}`);
    }
  }

  const advisorID = loginRes.json()._id; // Use the admin ID as an advisor
  // Create project
  const projectTitle = `Project_${randomString(5)}`;
  const projectRes = http.post(`${api}/project/create-project`, JSON.stringify({
    title: projectTitle,
    description: `<p>${projectTitle}</p>`,
    year: 'תתת"ת',
    suitableFor: "זוג",
    type: "מחקרי",
    advisors: [advisorID.toString()],
    students: users,
  }), authHeaders);

  check(projectRes, { "project created": (r) => r.status === 201 });
  const projectId = projectRes.json().project?._id;
  if (!projectId) return;

  // // Create submission
  const submissionRes = http.post(`${api}/submission/create`, JSON.stringify({
    name: "test submission",
    submissionDate: new Date().toISOString(),
    submissionYear: 'תתת"ת',
    isGraded: true,
    isReviewed: true,
    fileNeeded: true,
  }), authHeaders);

  check(submissionRes, { "submission created": (r) => r.status === 201 });

  // Get submission details - FIXED: Use cookie instead of Bearer token
  const submissionDetails = http.get(`${api}/submission/get-specific-project-submissions/${projectId}`, authHeaders);
  check(submissionDetails, { "got submission details": (r) => r.status === 200 });

  const submissionId = submissionDetails.json()[0]?.key;
  if (!submissionId) return;

  // Upload file
  const boundary = "----WebKitFormBoundary" + randomString(16);
  const fileBody = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="files"; filename="test-file.pdf"`,
    `Content-Type: application/pdf`,
    ``,
    `This is a test PDF file.`,
    `--${boundary}`,
    `Content-Disposition: form-data; name="destination"`,
    ``,
    `submissions`,
    `--${boundary}--`,
    ``,
  ].join("\r\n");

  const uploadRes = http.post(`${api}/uploads?destination=submissions`, fileBody, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Cookie": sessionCookie,
    },
    jar: jar,
  });

  check(uploadRes, { "file uploaded": (r) => r.status === 201 });

  const fileId = uploadRes.json().files[0]?._id;
  if (!fileId) return;

  // Link file to submission
  const updateRes = http.post(`${api}/submission/update-submission-file/${submissionId}`, JSON.stringify({
    file: fileId,
  }), authHeaders);

  check(updateRes, { "submission updated": (r) => r.status === 200 });

  sleep(1);
}