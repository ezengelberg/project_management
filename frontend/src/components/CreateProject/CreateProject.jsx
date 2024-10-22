import React, { useEffect, useState } from "react";
import "./CreateProject.scss";
import axios from "axios";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Switch, Button, Form, Input, InputNumber, Select, message } from "antd";

const CreateProject = () => {
  const { Option } = Select;
  const currentYear = new Date().getFullYear();
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [advisorUsers, setAdvisorUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [studentsNoProject, setStudentsNoProject] = useState([]);
  const [isOtherType, setIsOtherType] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch data from the API
    const fetchPrivileges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/privileges", { withCredentials: true });
        setPrivileges(response.data);
      } catch (error) {
        console.error("Error occurred:", error.response.data.message);
      }
    };

    const getAdvisorUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/advisor-users", { withCredentials: true });
        setAdvisorUsers(response.data);
      } catch (error) {
        console.error("Error occurred:", error.response.data.message);
      }
    };

    const getCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/get-user", { withCredentials: true });
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error occurred:", error.response.data.message);
      }
    };

    const getUsersNoProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/users-no-projects", { withCredentials: true });
        setStudentsNoProject(response.data.usersNoProjects);
      } catch (error) {
        console.error("Error occurred:", error.response.data.message);
      }
    };

    fetchPrivileges();
    getAdvisorUsers();
    getCurrentUser();
    getUsersNoProjects();
  }, []);

  const handleTypeChange = (value) => {
    setIsOtherType(value === "other");
    if (value !== "other") {
      form.setFieldValue("customType", undefined);
    }
  };

  const onFinish = async (values) => {
    const finalValues = {
      ...values,
      type: values.type === "other" ? values.customType : values.type,
      advisors: values.advisors?.map((advisorId) => advisorUsers.find((user) => user._id === advisorId)) || [],
      students:
        values.students?.map((studentId) => studentsNoProject.find((student) => student.id === studentId)) || [],
    };

    delete finalValues.customType;

    try {
      const response = await axios.post("http://localhost:5000/api/project/create-project", finalValues, {
        withCredentials: true,
      });
      message.success("הפרוייקט נוצר בהצלחה");
      form.resetFields();
      setIsOtherType(false);
    } catch (error) {
      console.error("Error occurred:", error.response?.data?.message);
      if (error.response?.data?.message === "This Project already exists in that year") {
        message.error("פרוייקט עם אותו שם כבר קיים בשנה זו");
      } else {
        message.error("שגיאה ביצירת הפרוייקט");
      }
    }
  };

  const onReset = () => {
    form.resetFields();
    setIsOtherType(false);
  };

  return (
    <div className="create-project">
      <h1>יצירת פרוייקט חדש</h1>
      <Form
        className="create-project-form"
        form={form}
        labelCol={{
          span: 3,
        }}
        initialValues={{
          remember: true,
          year: currentYear,
        }}
        autoComplete="off"
        onFinish={onFinish}>
        <Form.Item
          className="create-project-form-item"
          label="כותרת"
          name="title"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין כותרת",
            },
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          className="create-project-form-item"
          label="תיאור"
          name="description"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין תיאור לפרוייקט",
            },
          ]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          className="create-project-form-item"
          label="שנה"
          name="year"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין שנה",
            },
          ]}>
          <InputNumber />
        </Form.Item>

        <Form.Item
          className="create-project-form-item"
          name="suitableFor"
          label="מתאים ל"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה לבחור התאמה",
            },
          ]}>
          <Select placeholder="בחר יחיד/זוג/שניהם">
            <Option value="יחיד">יחיד</Option>
            <Option value="זוג">זוג</Option>
            <Option value="יחיד \ זוג">יחיד \ זוג</Option>
          </Select>
        </Form.Item>

        <Form.Item
          className="create-project-form-item"
          name="type"
          label="סוג הפרוייקט"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה לבחור סוג",
            },
          ]}>
          <Select placeholder="בחר סוג" onChange={handleTypeChange}>
            <Option value="research">מחקר</Option>
            <Option value="development">פיתוח</Option>
            <Option value="hitech">הייטק</Option>
            <Option value="other">אחר</Option>
          </Select>
        </Form.Item>

        {isOtherType && (
          <Form.Item
            className="create-project-form-item"
            label="סוג מותאם"
            name="customType"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין סוג",
              },
            ]}>
            <Input placeholder="הזן סוג פרוייקט מותאם" />
          </Form.Item>
        )}

        <Form.Item
          className="create-project-form-item"
          label="ממשיך"
          name="continues"
          rules={[
            {
              required: false,
            },
          ]}>
          <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
        </Form.Item>

        {privileges.isCoordinator && (
          <Form.Item
            className="create-project-form-item"
            label="מאושר"
            name="isApproved"
            rules={[
              {
                required: false,
              },
            ]}>
            <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
          </Form.Item>
        )}

        {privileges.isCoordinator ? (
          <Form.Item
            className="create-project-form-item"
            label="מנחים"
            name="advisors"
            hasFeedback
            rules={[
              {
                required: false,
              },
            ]}>
            <Select mode="multiple" placeholder="בחר מנחים">
              {advisorUsers.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item
            className="create-project-form-item"
            label="מנחים"
            name="advisors"
            hasFeedback
            rules={[
              {
                required: false,
              },
            ]}>
            <Input disabled value={currentUser.name} placeholder={currentUser.name} />
          </Form.Item>
        )}

        <Form.Item
          className="create-project-form-item"
          label="סטודנטים"
          name="students"
          hasFeedback
          rules={[
            {
              required: false,
            },
          ]}>
          <Select mode="multiple" placeholder="בחר סטודנטים">
            {studentsNoProject.map((student) => (
              <Option key={student.id} value={student.id}>
                {student.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="create-project-form-item">
          <div className="form-buttons">
            <Button type="primary" htmlType="submit">
              צור פרוייקט
            </Button>
            <Button danger onClick={onReset}>
              אפס טופס
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateProject;
