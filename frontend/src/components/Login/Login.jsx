import React, { useState } from "react";
import "./Login.css";
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
          password,
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
    <div className="login">
      <form onSubmit={handleOnSubmit}>
        <h1>התחברות</h1>
        <div className="login-form-group">
          <label htmlFor="emaiil">אימייל</label>
          <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="login-form-group">
          <label htmlFor="password">סיסמה</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="rememberMe">
          <input type="checkbox" id="rememberMe" name="rememberMe" />
          <label htmlFor="rememberMe">זכור אותי</label>
        </div>
        <button>התחבר</button>
      </form>
    </div>
  );
};

export default Login;
