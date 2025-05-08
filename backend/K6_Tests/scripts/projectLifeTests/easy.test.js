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
  vus: 1, // Number of virtual users
  duration: "10s", // Duration of the test
};

function generateValidId() {
  return Math.floor(100000000 + Math.random() * 900000000).toString(); // Generate a 9-digit string
}

export default function () {
  const baseUrl = "http://localhost:4000/api";
  const loginUrl = `${baseUrl}/user/login`;
  const registerUrl = `${baseUrl}/user/register`;
  const projectUrl = `${baseUrl}/project/create-project`;
  const submissionUrl = `${baseUrl}/submission/create`;

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

  // Step 2: Create 2 users with unique email addresses
  const users = [];
  for (let i = 0; i < 2; i++) {
    const uniqueUserId = generateValidId(); // Generate a valid 9-digit ID
    const uniqueEmail = `testuser${i + 1}_${randomString(5)}@example.com`; // Generate a unique email address
    const registerPayload = JSON.stringify({
      name: `Test User ${i + 1}`,
      email: uniqueEmail,
      id: uniqueUserId,
      password: "Password123!",
      isStudent: true,
      testUser: true,
    });

    const registerParams = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const registerRes = http.post(registerUrl, registerPayload, registerParams);

    // Check if the response is plain text or JSON
    if (registerRes.headers["Content-Type"] && registerRes.headers["Content-Type"].includes("application/json")) {
      const responseBody = registerRes.json();
      check(responseBody, {
        "is user creation successful": (r) => registerRes.status === 201,
      });
      if (responseBody.newUser) {
        users.push(responseBody.newUser);
      } else {
        console.error("User creation failed");
      }
    } else {
      // Handle plain text response
      check(registerRes, {
        "is user creation successful": (r) => registerRes.status === 201,
      });
      console.error("User creation failed: Expected JSON response with id");
    }
  }

  // Step 3: Create a project and add the two users as students
  const uniqueProjectName = `Project_${randomString(5)}`;
  const projectPayload = JSON.stringify({
    title: uniqueProjectName,
    description: `<p>${uniqueProjectName}</p>`,
    year: 'תתת"ת', // Updated project year
    suitableFor: "זוג", // Updated suitableFor
    type: "מחקרי",
    advisors: ["67d92862d95be53d76a16d0f"], // Replace with a valid advisor ID
    students: users, // Add the two users as students
  });

  const projectParams = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const projectRes = http.post(projectUrl, projectPayload, projectParams);

  let projectId;
  // Check if the response is JSON and validate the project creation
  if (projectRes.headers["Content-Type"] && projectRes.headers["Content-Type"].includes("application/json")) {
    const responseBody = projectRes.json();
    check(responseBody, {
      "is project creation successful": (r) => projectRes.status === 201,
    });

    if (responseBody.project && responseBody.project._id) {
      projectId = responseBody.project._id; // Extract the project ID for later use
    } else {
      console.error("Project creation failed: Missing project ID");
    }
  } else {
    console.error("Non-JSON response received:", projectRes.body);
    check(projectRes, {
      "is project creation successful": (r) => projectRes.status === 201,
    });
  }

  // Step 4: Create a submission for the project
  if (projectId) {
    const submissionPayload = JSON.stringify({
      name: "test submission",
      submissionDate: new Date().toISOString(),
      submissionYear: 'תתת"ת', // Year of the project
      isGraded: true,
      isReviewed: true,
      fileNeeded: true,
    });

    const submissionParams = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const submissionRes = http.post(submissionUrl, submissionPayload, submissionParams);

    check(submissionRes, {
      "is submission creation successful": (r) => submissionRes.status === 201,
    });
  }

  // Step 5: Upload a file for the submission
  if (projectId) {
    // Step 5.1: Retrieve the submission details
    const submissionDetailsRes = http.get(`${baseUrl}/submission/get-specific-project-submissions/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    check(submissionDetailsRes, {
      "is submission details retrieval successful": (r) => r.status === 200,
    });

    const submissionDetails = submissionDetailsRes.json();
    const submissionId = submissionDetails[0]?.key; // Assuming the first submission is the one we need

    if (!submissionId) {
      console.error("No submission found for the project");
      return;
    }

    // Step 5.2: Upload the file
    const boundary = "----WebKitFormBoundary" + randomString(16); // Generate a boundary string
    const body = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="files"; filename="test-file.pdf"`,
      `Content-Type: application/pdf`,
      ``,
      `This is a test PDF file`, // File content
      `--${boundary}`,
      `Content-Disposition: form-data; name="destination"`,
      ``,
      `submissions`, // Destination field
      `--${boundary}--`, // Final boundary
      ``,
    ].join("\r\n"); // Join all parts with CRLF

    const fileParams = {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${token}`,
      },
    };

    const uploadRes = http.post(`${baseUrl}/uploads`, body, fileParams);

    check(uploadRes, {
      "is file upload successful": (r) => uploadRes.status === 201,
    });

    const uploadedFile = uploadRes.json().files[0]; // Assuming the first file is the one we uploaded

    if (!uploadedFile || !uploadedFile._id) {
      console.error("File upload failed or file ID is missing");
      return;
    }

    // Step 5.3: Associate the file with the submission
    const updateSubmissionPayload = JSON.stringify({
      file: uploadedFile._id,
    });

    const updateSubmissionParams = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const updateSubmissionRes = http.post(
      `${baseUrl}/submission/update-submission-file/${submissionId}`,
      updateSubmissionPayload,
      updateSubmissionParams
    );

    check(updateSubmissionRes, {
      "is submission update successful": (r) => r.status === 200,
    });
  }

  sleep(1); // Pause for 1 second between iterations
}
