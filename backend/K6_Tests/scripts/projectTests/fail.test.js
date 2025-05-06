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
  vus: 1, // Number of virtual users
  duration: "10s", // Duration of the test
};

export default function () {
  const loginUrl = "http://localhost:4000/api/user/login";
  const projectUrl = "http://localhost:4000/api/project/create-project";

  // Step 1: Log in to get a token
  const loginPayload = JSON.stringify({
    email: "adam@gmail.com", // Replace with valid credentials
    password: "12345Aa!", // Replace with valid credentials
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

  // Step 2: Attempt to create a project with invalid data
  const invalidProjectPayload = JSON.stringify({
    // Missing required fields like `title` and `advisors`
    description: "This is an invalid project description.",
    year: "תשפ״ה",
    suitableFor: "יחיד",
    type: "מחקרי",
  });

  const projectParams = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Use the token in the Authorization header
    },
  };

  const projectRes = http.post(projectUrl, invalidProjectPayload, projectParams);

  check(projectRes, {
    "is status 400": (r) => r.status === 400, // Expect the response status to be 400
    "response contains error message": (r) => r.json().message.includes("Missing required fields"), // Validate error message
  });

  sleep(1); // Pause for 1 second between iterations
}
