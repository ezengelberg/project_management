import React, { useEffect, useState } from "react";
import "./CreateProject.scss";
import axios from "axios";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Switch, Button, Form, Input, InputNumber, Select } from "antd";

const CreateProject = () => {
  const { Option } = Select;
  const currentYear = new Date().getFullYear();
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [advisorUsers, setAdvisorUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [studentsNoProject, setStudentsNoProject] = useState([]);
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

  const onFinish = async (values) => {
    values.advisors = values.advisors.map((advisorId) => advisorUsers.find((user) => user._id === advisorId));
    values.students = values.students.map((studentId) => studentsNoProject.find((student) => student.id === studentId));
    try {
      const response = await axios.post("http://localhost:5000/api/project/create-project", values, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error occurred:", error.response.data.message);
    }
  };

  const onReset = () => {
    form.resetFields();
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
          <Select placeholder="בחר סוג">
            <Option value="research">מחקר</Option>
            <Option value="development">פיתוח</Option>
            <Option value="hitech">הייטק</Option>
            <Option value="other">אחר</Option>
          </Select>
        </Form.Item>

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
            <Input disabled value={currentUser.name} />
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
