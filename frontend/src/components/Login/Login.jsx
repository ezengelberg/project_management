import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import collegeLogo from "../../assets/CollegeLogo.png";
import { Alert, Form, Input, Button, message } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: false, password: false });
  const [errorMessage, setErrorMessage] = useState("");
  const [tempUserData, setTempUserData] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOnSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Check for empty fields
    let newErrors = { email: false, password: false };
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await axios.post(
        "/api/user/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      const userData = result.data;
      if (userData.firstLogin) {
        setTempUserData(userData);
        setShowChangePassword(true);
      } else {
        localStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("user", JSON.stringify(userData));
        navigate("/home");
      }
    } catch (error) {
      if (error.response.status === 403) {
        setErrorMessage("משתמש מושהה, פנה למנהל הפרויקטים");
      } else {
        setErrorMessage(error.response.data);
      }
      console.error("Error occurred:", error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      // Change password
      await axios.put(
        "/api/user/change-password",
        {
          oldPassword: tempUserData.id,
          newPassword: values.newPassword,
        },
        { withCredentials: true }
      );

      // Update the user data to reflect password change
      const updatedUserData = {
        ...tempUserData,
        firstLogin: false,
      };

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      sessionStorage.setItem("user", JSON.stringify(updatedUserData));

      message.success("הסיסמה שונתה בהצלחה");
      navigate("/home");
    } catch (error) {
      if (error.response?.status === 400) {
        message.error("הסיסמה החדשה לא יכולה להיות זהה לסיסמה הנוכחית");
      } else {
        message.error("שגיאה בעת שינוי הסיסמה");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <img src={collegeLogo} alt="collage logo" className="collage-logo" />
      {!showChangePassword ? (
        <form onSubmit={handleOnSubmit} className="login-form">
          <h1>התחברות</h1>
          <div className="form-input-group login-input-group">
            <label htmlFor="email">אימייל</label>
            <div className="input-icon-holder">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="הכנס אימייל"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: false }));
                  setErrorMessage("");
                }}
              />
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12ZM16 12V13.5C16 14.8807 17.1193 16 18.5 16V16C19.8807 16 21 14.8807 21 13.5V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21H16"
                    stroke="#adadad"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"></path>
                </g>
              </svg>
            </div>
            {errors.email && <Alert message="שדה חובה" type="error" showIcon />}
          </div>
          <div className="form-input-group login-input-group">
            <label htmlFor="password">סיסמה</label>
            <div className="input-icon-holder">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="הכנס סיסמה"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: false }));
                  setErrorMessage("");
                }}
              />
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z"
                    stroke="#adadad"
                    strokeWidth="1.5"></path>
                  <circle cx="12" cy="16" r="2" stroke="#adadad" strokeWidth="1.5"></circle>
                  <path
                    d="M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10"
                    stroke="#adadad"
                    strokeWidth="1.5"
                    strokeLinecap="round"></path>
                </g>
              </svg>
              <div className="login-password-icon">
                {showPassword ? (
                  <EyeOutlined onClick={() => setShowPassword(false)} />
                ) : (
                  <EyeInvisibleOutlined onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>
            {errors.password && <Alert message="שדה חובה" type="error" showIcon />}
          </div>
          <a className="forgot-password" onClick={() => navigate("/")}>
            שכחת סיסמה?
          </a>
          <button className="button-large login-button">התחבר</button>
          {errorMessage && <Alert className="server-error" message={errorMessage} type="error" showIcon />}
        </form>
      ) : (
        <Form form={form} onFinish={handleChangePassword} className="change-password-form">
          <h2>שינוי סיסמה ראשונית</h2>
          <Form.Item
            name="newPassword"
            hasFeedback
            rules={[
              { required: true, message: "חובה להזין סיסמה חדשה" },
              { min: 8, message: "הסיסמה חייבת להכיל לפחות 8 תווים" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "הסיסמה חייבת להכיל אות גדולה, אות קטנה, מספר ותו מיוחד",
              },
            ]}>
            <Input.Password
              placeholder="סיסמה חדשה"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "חובה לאמת את הסיסמה" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("הסיסמאות אינן תואמות"));
                },
              }),
            ]}>
            <Input.Password
              placeholder="אימות סיסמה"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item className="change-password-button">
            <Button type="primary" htmlType="submit" loading={loading}>
              שנה סיסמה
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Login;
