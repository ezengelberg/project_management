import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    console.log(email);
    console.log("Login form submitted");

    try {
      const result = await axios.post(
        "http://localhost:5000/api/user/login",
        {
          email,
          password
        },
        { withCredentials: true }
      );
    } catch (error) {
      // Log the actual error message
      console.error("Error occurred:", error.response ? error.response.data : error.message);
    } finally {
      console.log("Request completed.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleOnSubmit}>
        <label htmlFor="emaiil">Email</label>
        <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Login</button>
      </form>
    </div>
  );
};

export default Login;
