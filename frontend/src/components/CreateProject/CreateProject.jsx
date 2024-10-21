import React, { useEffect, useState } from "react";
import "./CreateProject.scss";
import axios from "axios";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Switch, Flex, Button, Form, Input, InputNumber, Select } from "antd";

const CreateProject = () => {
  const { Option } = Select;
  const currentYear = new Date().getFullYear();
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [advisorUsers, setAdvisorUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [studentsNoProject, setStudentsNoProject] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    const fetchPrivileges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/privileges", { withCredentials: true });
        setPrivileges(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    const getAdvisorUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/advisor-users", { withCredentials: true });
        setAdvisorUsers(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    const getCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/get-user", { withCredentials: true });
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    const getUsersNoProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/users-no-projects", { withCredentials: true });
        setStudentsNoProject(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    fetchPrivileges();
    getAdvisorUsers();
    getCurrentUser();
    getUsersNoProjects();
  }, []);

  return (
    <div className="create-project">
      <h1>יצירת פרוייקט חדש</h1>
      <Form
        className="create-project-form"
        labelCol={{
          span: 3,
        }}
        initialValues={{
          remember: true,
          year: currentYear,
        }}
        autoComplete="off">
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
          name="select"
          label="מתאים ל"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה לבחור התאמה",
            },
          ]}>
          <Select placeholder="בחר יחיד/זוג/שניהם">
            <Option value="solo">יחיד</Option>
            <Option value="duo">זוג</Option>
            <Option value="both">שניהם</Option>
          </Select>
        </Form.Item>

        <Form.Item
          className="create-project-form-item"
          name="select"
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
                <Option key={user.id} value={user.id}>
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
            <Button danger>אפס טופס</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateProject;
