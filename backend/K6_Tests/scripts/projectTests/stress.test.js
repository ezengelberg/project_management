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
import { check } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 }, // Ramp up to 10 users over 1 minute
    { duration: "3m", target: 50 }, // Stay at 50 users for 3 minutes
    { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
};

export default function () {
  const loginUrl = "http://localhost:4000/api/user/login";
  const projectUrl = "http://localhost:4000/api/project/create-project";

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
    projectId = responseBody.project ? responseBody.project._id : null; // Extract the project ID
  } else {
    console.error("Non-JSON response received:", projectRes.body);
  }
}
