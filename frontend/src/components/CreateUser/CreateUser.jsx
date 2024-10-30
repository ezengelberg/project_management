import React, { useState } from "react";
import "./CreateUser.scss";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import Papa from "papaparse";
import { Button, Form, Input, Select, message, Upload, Table, Checkbox, Tooltip } from "antd";
const { Dragger } = Upload;

const CreateUser = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);

  const onFinish = async (values) => {
    try {
      const registerValues = {
        name: values.name,
        email: values.email,
        id: values.userId,
        password: values.userId,
        isStudent: values.role.includes("student"),
        isAdvisor: values.role.includes("advisor"),
        isCoordinator: values.role.includes("coordinator")
      };

      const response = await axios.post("/api/user/register", registerValues, {
        withCredentials: true
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

  const handleUploadFile = async (file) => {
    Papa.parse(file, {
      header: true,
      complete: async (result) => {
        const parsedData = result.data
          .map((row) => ({
            email: row['דוא"ל'],
            firstName: row["שם פרטי"],
            lastName: row["שם משפחה"],
            name: `${row["שם פרטי"]} ${row["שם משפחה"]}`,
            groups: row["קבוצות"]
          }))
          .filter((row) => row.email && row.firstName && row.lastName); // Filter out rows with undefined or empty values

        console.log(parsedData); // Processed CSV data with English keys
        setUsers(parsedData);

        // try {
        //   const response = await axios.post("/api/user/register-many", result.data, {
        //     withCredentials: true
        //   });
        //   message.success("משתמשים נוצרו בהצלחה");
        //   form.resetFields();
        // } catch (error) {
        //   message.error("שגיאה ביצירת משתמשים");
        //   console.error("Error creating users:", error);
        // }
      }
    });
  };

  const props = {
    name: "file",
    maxCount: 1,
    accept: ".csv",
    beforeUpload: handleUploadFile,
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    }
  };

  const roleOptions = [
    { label: "סטודנט", value: "סטודנט" },
    { label: "מנחה", value: "מנחה" },
    { label: "אדמין", value: "אדמין" }
  ];

  const columns = [
    {
      title: "שם מלא",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "ת.ז.",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "אימייל",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "תפקיד",
      dataIndex: "role",
      key: "role",
      render: () => (
        <div>
          <Checkbox.Group options={roleOptions} defaultValue={["סטודנט"]} />
        </div>
      )
    },
    {
      title: "פעולות",
      key: "action",
      render: (text, record) => (
        <span className="user-actions">
          <Tooltip title="הסר משתמש מרשימה">
            <DeleteOutlined />
          </Tooltip>
        </span>
      )
    }
  ];
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
              message: "חובה להזין שם מלא"
            }
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
              message: "חובה להזין ת.ז."
            },
            { pattern: /^\d{9}$/, message: "תעודת זהות חייבת להכיל 9 ספרות" }
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
              message: "חובה להזין כתובת מייל"
            },
            {
              type: "email",
              message: "נא להזין כתובת מייל תקינה"
            }
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="תפקיד"
          name="role"
          rules={[
            {
              required: true,
              message: "חובה לבחור תפקיד"
            }
          ]}>
          <Select mode="multiple">
            <Select.Option value="student">סטודנט</Select.Option>
            <Select.Option value="advisor">מנחה</Select.Option>
            <Select.Option value="coordinator">מנהל</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item className="create-user-buttons">
          <Button color="danger" variant="outlined" onClick={() => form.resetFields()}>
            אפס טופס
          </Button>
          <Button type="primary" htmlType="submit">
            צור משתמש חדש
          </Button>
        </Form.Item>
      </Form>
      {/* <Upload maxCount={1} accept=".csv" beforeUpload={handleUploadFile}>
        <Button color="primary" variant="outlined" icon={<UploadOutlined />}>
          העלה קובץ משתמשים
        </Button>
      </Upload> */}
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="uploader-title">יצירת משתמשים מקובץ</p>
        <p className="ant-upload-text">לחצו או גררו כדי להעלות קובץ</p>
        <p className="ant-upload-hint">יש להעלות קובץ CSV יחיד עם השורות הבאות: דוא"ל, שם פרטי, שם משפחה, ת"ז</p>
      </Dragger>
      {users.length > 0 && <Table columns={columns} dataSource={users} />}
    </div>
  );
};

export default CreateUser;
