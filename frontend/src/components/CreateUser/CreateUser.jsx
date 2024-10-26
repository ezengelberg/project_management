import React from "react";
import "./CreateUser.scss";
import { Button, Form, Input, Select, message } from "antd";
import axios from "axios";

const CreateUser = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const registerValues = {
        name: values.name,
        email: values.email,
        id: values.userId,
        password: values.userId,
        isStudent: values.role.includes("student"),
        isAdvisor: values.role.includes("advisor"),
        isCoordinator: values.role.includes("coordinator"),
      };

      const response = await axios.post("http://localhost:5000/api/user/register", registerValues, {
        withCredentials: true,
      });
      message.success("משתמש נוצר בהצלחה");
      form.resetFields();
    } catch (error) {
      if (error.response.data === "Email already in use") {
        message.error("כתובת המייל כבר קיימת במערכת");
      } else if (error.response.data === "ID already in use") {
        message.error("תעודת הזהות כבר קיימת במערכת");
      } else {
        message.error("שגיאה ביצירת משתמש");
      }
      console.error("Error creating user:", error);
    }
  };

  return (
    <div className="create-user">
      <h1>צור משתמש חדש</h1>
      <Form className="create-user-form" form={form} name="createUser" layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="שם מלא"
          name="name"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין שם מלא",
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="ת.ז."
          name="userId"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין ת.ז.",
            },
            { pattern: /^\d{9}$/, message: "תעודת זהות חייבת להכיל 9 ספרות" },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="אימייל"
          name="email"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין כתובת מייל",
            },
            {
              type: "email",
              message: "נא להזין כתובת מייל תקינה",
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="תפקיד"
          name="role"
          rules={[
            {
              required: true,
              message: "חובה לבחור תפקיד",
            },
          ]}>
          <Select mode="multiple">
            <Select.Option value="student">סטודנט</Select.Option>
            <Select.Option value="advisor">מנחה</Select.Option>
            <Select.Option value="coordinator">מנהל</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item className="create-user-buttons">
          <Button type="primary" htmlType="submit">
            צור משתמש חדש
          </Button>
          <Button color="danger" variant="outlined" onClick={() => form.resetFields()}>
            אפס טופס
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateUser;
