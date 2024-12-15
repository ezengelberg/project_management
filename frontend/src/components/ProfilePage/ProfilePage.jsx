import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ProfilePage.scss";
import axios from "axios";
import { Avatar, Modal, message, Button, Form, Input } from "antd";

const ProfilePage = () => {
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [user, setUser] = useState(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editDetailsForm] = Form.useForm();
  const [changePasswordForm] = Form.useForm();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${userId}`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUser();
  }, [userId]);

  const handleEditDetails = async (values) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/user/user-edit-profile/${userId}`, values, {
        withCredentials: true,
      });
      message.success("הפרטים עודכנו בהצלחה");
      setIsEditing(false);
      setUser({ ...user, ...values });
    } catch (error) {
      console.error("Failed to update details:", error);
      message.error("עדכון הפרטים נכשל");
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/change-password`,
        { oldPassword: changePasswordForm.getFieldValue("currentPassword"), newPassword },
        { withCredentials: true }
      );
      message.success("הסיסמה שונתה בהצלחה");
      setIsChangePasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      changePasswordForm.resetFields();
    } catch (error) {
      if (error.response.status === 401) {
        message.error("סיסמה נוכחית שגויה");
      } else if (error.response.status === 400) {
        message.error("הסיסמה החדשה צריכה להיות שונה מהסיסמה הנוכחית");
      } else {
        console.error("Failed to change password:", error);
        message.error("שינוי הסיסמה נכשל");
      }
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <Avatar size={240}>
          <span className="avatar-text">
            {user?.name && user.name[0]}
            {user?.name && user.name.split(" ")[1] ? user.name.split(" ")[1][0] : ""}
          </span>
        </Avatar>
        <div className="profile-page-header-info">
          <h1>{user?.name}</h1>
          <h3>{user?.email}</h3>
          <h3>תחומי עניין: {user?.interests}</h3>
          {(currentUser.isCoordinator || currentUser._id === user?._id) && <h3>{user?.id}</h3>}
          {currentUser._id === user?._id && (
            <div className="profile-page-header-buttons">
              <Button
                type="primary"
                onClick={() => {
                  setIsEditing(true);
                }}>
                ערוך פרטים
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setIsChangePasswordModalOpen(true);
                }}>
                שנה סיסמה
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="עריכת פרטים"
        open={isEditing}
        onCancel={() => setIsEditing(false)}
        onOk={() => {
          editDetailsForm
            .validateFields()
            .then(handleEditDetails)
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
        okText="שמור"
        cancelText="בטל">
        <Form form={editDetailsForm} layout="vertical" initialValues={user}>
          <Form.Item name="name" label="שם" hasFeedback rules={[{ required: true, message: "שדה חובה" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="אימייל"
            hasFeedback
            rules={[
              { required: true, message: "שדה חובה" },
              { type: "email", message: "אימייל לא תקין" },
            ]}>
            <Input type="email" placeholder="הכנס אימייל" />
          </Form.Item>
          <Form.Item name="interests" label="תחומי עניין" hasFeedback rules={[{ required: true, message: "שדה חובה" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="שינוי סיסמה"
        open={isChangePasswordModalOpen}
        onCancel={() => setIsChangePasswordModalOpen(false)}
        onOk={handleChangePassword}
        okText="שנה סיסמה"
        cancelText="בטל">
        <Form form={changePasswordForm} layout="vertical">
          <Form.Item
            name="currentPassword"
            label="סיסמה נוכחית"
            hasFeedback
            rules={[{ required: true, message: "חובה להזין סיסמה נוכחית" }]}>
            <Input.Password />
          </Form.Item>
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
            <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
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
            <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
