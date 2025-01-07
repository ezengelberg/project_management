import React, { useState, useEffect } from "react";
import "./Login.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import collegeLogo from "../../assets/CollegeLogo.png";
import { Alert, Form, Input, Button, message, Checkbox } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tempUserData, setTempUserData] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (user && user.rememberMe) {
  //     const cookie = document.cookie.split("; ").find((row) => row.startsWith("connect.sid="));
  //     if (!cookie) {
  //       localStorage.removeItem("user");
  //     } else {
  //       navigate("/home");
  //     }
  //   }
  // }, [navigate]);

  const EmailSvg = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  );

  const PasswordSvg = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  );

  const handleOnSubmit = async (e) => {
    setLoading(true);

    try {
      const lowerCaseEmail = email.toLowerCase();
      if (process.env.REACT_APP_ROOT_USER === lowerCaseEmail && process.env.REACT_APP_ROOT_PASSWORD === password) {
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/create-admin`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        });
      } else {
        console.log("🔵 Logging in with email:", lowerCaseEmail);
        console.log("sending request to:", `${process.env.REACT_APP_BACKEND_URL}/api/user/login`);
        const result = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/user/login`,
          {
            email: lowerCaseEmail,
            password,
            rememberMe,
          },
          { withCredentials: true },
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
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          setErrorMessage("משתמש מושהה, פנה למנהל הפרויקטים");
        } else {
          setErrorMessage(error.response.data || "שגיאה בהתחברות");
        }
      } else if (error.request) {
        setErrorMessage("לא ניתן להתחבר לשרת. אנא בדוק את החיבור לאינטרנט ונסה שוב");
      } else {
        setErrorMessage("שגיאה בהתחברות");
      }
      console.error("Error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      const updateData = {
        oldPassword: tempUserData.id,
        newPassword: values.newPassword,
      };

      if (tempUserData.isAdvisor) {
        updateData.interests = values.interests;
      }

      // Change password
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/user/change-password`, updateData, {
        withCredentials: true,
      });

      // Update the user data to reflect password change
      const updatedUserData = {
        ...tempUserData,
        firstLogin: false,
      };

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      sessionStorage.setItem("user", JSON.stringify(updatedUserData));

      message.success("הסיסמה שונתה בהצלחה");
      changePasswordForm.resetFields();
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

  const handleForgotPassword = async () => {};

  return (
    <div className="login">
      <img src={collegeLogo} alt="collage logo" className="collage-logo" />
      {!showChangePassword && !showForgotPassword ? (
        <Form form={loginForm} onFinish={handleOnSubmit} layout="vertical" className="login-form">
          <h1>התחברות</h1>
          <div className="form-area">
            <Form.Item
              name="email"
              label="אימייל"
              rules={[
                { required: true, message: "חובה להזין אימייל" },
                { type: "email", message: "אימייל לא תקין" },
              ]}
              hasFeedback>
              <Input
                type="email"
                prefix={<EmailSvg />}
                size="large"
                placeholder="הכנס אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="סיסמה"
              rules={[
                { required: true, message: "חובה להזין סיסמה" },
                { min: 8, message: "הסיסמה חייבת להכיל לפחות 8 תווים" },
              ]}
              hasFeedback>
              <Input.Password
                prefix={<PasswordSvg />}
                size="large"
                placeholder="הכנס סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked" label={null}>
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                זכור אותי
              </Checkbox>
            </Form.Item>
            <a className="forgot-password" onClick={() => setShowForgotPassword(true)}>
              שכחת סיסמה?
            </a>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                התחבר
              </Button>
            </Form.Item>
            {errorMessage && <Alert className="server-error" message={errorMessage} type="error" showIcon />}
          </div>
        </Form>
      ) : showChangePassword ? (
        <Form
          form={changePasswordForm}
          onFinish={handleChangePassword}
          layout="vertical"
          className="change-password-form">
          <h2>שינוי סיסמה ראשונית</h2>
          <Form.Item
            name="newPassword"
            label="סיסמה חדשה"
            hasFeedback
            rules={[
              { required: true, message: "חובה להזין סיסמה חדשה" },
              { min: 8, message: "הסיסמה חייבת להכיל לפחות 8 תווים" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "הסיסמה חייבת להכיל אות גדולה, אות קטנה, מספר ותו מיוחד",
              },
            ]}>
            <Input.Password placeholder="הכנס סיסמה חדשה" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="אימות סיסמה"
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
            <Input.Password placeholder="אמת סיסמה" />
          </Form.Item>
          {tempUserData?.isAdvisor && (
            <Form.Item
              name="interests"
              label="תחומי עניין (ניתן לשנות אחר כך בפרופיל)"
              hasFeedback
              rules={[{ required: true, message: "חובה להזין תחומי עניין" }]}>
              <Input placeholder="הכנס תחומי עניין" />
            </Form.Item>
          )}
          <Form.Item className="change-password-button">
            <Button type="primary" htmlType="submit" loading={loading}>
              שנה סיסמה
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form
          form={forgotPasswordForm}
          onFinish={handleForgotPassword}
          layout="vertical"
          className="forgot-password-form">
          <span className="return-to-login" onClick={() => setShowForgotPassword(false)}>
            <ArrowRightOutlined /> חזור להתחברות
          </span>
          <h2>שחזור סיסמה</h2>
          <Form.Item
            name="email"
            label="אימייל"
            rules={[
              { required: true, message: "חובה להזין אימייל" },
              { type: "email", message: "אימייל לא תקין" },
            ]}
            hasFeedback>
            <Input type="email" size="large" placeholder="הכנס אימייל" />
          </Form.Item>
          <Form.Item className="forgot-password-button">
            <Button type="primary" htmlType="submit" loading={loading}>
              שלח קישור לאיפוס סיסמה
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Login;
