import React, { useState, useEffect } from "react";
import "./ResetPassword.scss";
import collegeLogo from "../../assets/CollegeLogo.png";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Input, Button, message, Result } from "antd";

const ResetPassword = () => {
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

  // Check if token is valid
  useEffect(() => {
    const checkResetPasswordToken = async () => {
      try {
        await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/check-reset-password-token/${token}`);
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
      }
    };
    checkResetPasswordToken();
  }, [token]);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      message.error("הסיסמאות אינן תואמות.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/reset-password`, {
        token,
        password,
      });
      setResetPasswordSuccess(true);
    } catch (error) {
      message.error("שגיאה בעת שינוי הסיסמה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password">
      <img src={collegeLogo} alt="collage logo" className="collage-logo" />
      {isValid && !resetPasswordSuccess ? (
        <Form layout="vertical" onFinish={handleSubmit} className="reset-password-form">
          <h2>איפוס סיסמה</h2>
          <Form.Item
            label="סיסמה חדשה"
            name="password"
            hasFeedback
            rules={[
              { required: true, message: "אנא הזן סיסמה חדשה" },
              { min: 8, message: "הסיסמה חייבת להכיל לפחות 8 תווים" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "הסיסמה חייבת להכיל אות גדולה, אות קטנה, מספר ותו מיוחד",
              },
            ]}>
            <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Item>
          <Form.Item
            label="אימות סיסמה"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "אנא אשר את הסיסמה" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("הסיסמאות אינן תואמות"));
                },
              }),
            ]}>
            <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            איפוס סיסמה
          </Button>
        </Form>
      ) : (
        !resetPasswordSuccess && (
          <Result
            className="reset-password-expired"
            status="404"
            title="404"
            subTitle="לינק לא תקין או שפג תוקפו."
            extra={
              <Button type="primary" onClick={() => navigate("/login")}>
                חזרה להתחברות
              </Button>
            }
          />
        )
      )}
      {resetPasswordSuccess && (
        <Result
          className="reset-password-success"
          status="success"
          title="הסיסמה שונתה בהצלחה!"
          extra={
            <Button type="primary" key="back-to-login" onClick={() => navigate("/login")}>
              חזרה להתחברות
            </Button>
          }
        />
      )}
    </div>
  );
};

export default ResetPassword;
