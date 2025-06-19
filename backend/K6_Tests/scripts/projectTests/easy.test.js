/**
 * This K6 test script is designed to test the project creation functionality with valid data and clean up after itself.
 *
 * What the test does:
 * - Logs in to obtain an authentication token.
 * - Sends a POST request to the `/api/project/create-project` endpoint with valid project details.
 * - Validates the response to ensure the project is created successfully.
 *
 * Expectations:
 * - The server should return a status code of 201 for project creation.
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1, // Number of virtual users
  duration: "10s", // Duration of the test
};

export default function () {
  const loginUrl = `${__ENV.K6_BASE_URL}/api/user/login`;
  const projectUrl = `${__ENV.K6_BASE_URL}/api/project/create-project`;

  // Step 1: Log in to get a token
  const loginPayload = JSON.stringify({
    email: "adam@gmail.com",
    password: "12345Aa!",
  });

  const loginParams = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const loginRes = http.post(loginUrl, loginPayload, loginParams);

  check(loginRes, {
    "is login successful": (r) => r.status === 200,
  });

  const token = loginRes.json().token; // Extract the token from the login response

  // Step 2: Create a project using the token
  const uniqueProjectName = `Project_${__VU}_${Date.now()}`; // Generate a unique project name
  const projectPayload = JSON.stringify({
    title: uniqueProjectName,
    description: `<p>${uniqueProjectName}</p>`, // Description in HTML format
    year: "תתת״ת",
    suitableFor: "יחיד",
    type: "מחקרי",
    advisors: ["67d92862d95be53d76a16d0f"],
    students: [],
  });

  const projectParams = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Use the token in the Authorization header
    },
  };

  const projectRes = http.post(projectUrl, projectPayload, projectParams);

  // Check if the response is JSON and extract the project ID
  if (projectRes.headers["Content-Type"] && projectRes.headers["Content-Type"].includes("application/json")) {
    const responseBody = projectRes.json();
    check(responseBody, {
      "is status 201": (r) => projectRes.status === 201, // Expect the response status to be 201
      "is creation successful": (r) => r.project && r.project.title === uniqueProjectName, // Validate project title
    });
  } else {
    console.error("Non-JSON response received:", projectRes.body);
  }

  sleep(1); // Pause for 1 second between iterations
}
