import React, { useContext, useEffect, useState } from "react";
import "./CreateProject.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Switch, Button, Form, Input, Select, message, FloatButton } from "antd";
import { Editor } from "primereact/editor";
import DOMPurify from "dompurify";
import { handleMouseDown } from "../../utils/mouseDown";
import { NotificationsContext } from "../../utils/NotificationsContext";
import { getHebrewYearBundle } from "../../utils/dates/hebrewYears";

const CreateProject = () => {
  const { Option } = Select;
  const { fetchNotifications } = useContext(NotificationsContext);
  const [selectedYear, setSelectedYear] = useState("");
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [advisorUsers, setAdvisorUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [studentsNoProject, setStudentsNoProject] = useState([]);
  const [isOtherType, setIsOtherType] = useState(false);
  const [projectCreated, setProjectCreated] = useState(false);
  const [projectCreatedId, setProjectCreatedId] = useState("");
  const [configYear, setConfigYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const today = new Date();
  const { currentLabel: currentHebrewYear, previousLabel: previousHebrewYear, nextLabel: nextHebrewYear } = getHebrewYearBundle(today);

  useEffect(() => {
    // Fetch data from the API
    const fetchPrivileges = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/privileges`, {
          withCredentials: true,
        });
        setPrivileges(response.data);
      } catch (error) {
        console.error("Error occurred:", error.response.data.message);
      }
    };

    const getAdvisorUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/advisor-users`, {
          withCredentials: true,
        });
        setAdvisorUsers(response.data);
      } catch (error) {
        console.error("Error occurred:", error.response.data.message);
      }
    };

    const getCurrentUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-user`, {
          withCredentials: true,
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error occurred:", error.response.data.message);
      }
    };

    const getConfigYear = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/config/get-config`, {
          withCredentials: true,
        });
        setConfigYear(response.data.currentYear);
        if (
          response.data.currentYear === previousHebrewYear ||
          response.data.currentYear === currentHebrewYear ||
          response.data.currentYear === nextHebrewYear
        ) {
          setSelectedYear(response.data.currentYear);
          form.setFieldValue("year", response.data.currentYear);
        } else {
          setSelectedYear(currentHebrewYear);
          form.setFieldValue("year", currentHebrewYear);
        }
      } catch (error) {
        console.error("Error occurred:", error.response?.data?.message);
        message.error("שגיאה בטעינת הטופס");
      }
    };

    fetchPrivileges();
    getAdvisorUsers();
    getCurrentUser();
    getConfigYear();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      getUsersNoProjectsByYear(selectedYear);
    }
  }, [selectedYear]);

  const getUsersNoProjectsByYear = async (year) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/users-no-projects-by-year/${year}`, {
        withCredentials: true,
      });

      const onlyStudents = res.data.usersNoProjects.filter(
        (user) =>
          user.isStudent === true &&
          user.isAdvisor === false &&
          user.isCoordinator === false &&
          user.suspended === false
      );

      setStudentsNoProject(onlyStudents);
    } catch (error) {
      console.error("Error occurred:", error.response.data.message);
      message.error("שגיאה בטעינת הסטודנטים ללא פרויקטים");
    }
  };

  const handleTypeChange = (value) => {
    setIsOtherType(value === "אחר");
    if (value !== "אחר") {
      form.setFieldValue("customType", undefined);
    }
  };

  const handleEditorChange = (e) => {
    const sanitizedHtml = DOMPurify.sanitize(e.htmlValue || "");
    form.setFieldsValue({ description: sanitizedHtml });
  };

  const processEditorContent = (content) => {
    if (!content) return content;

    const div = document.createElement("div");
    div.innerHTML = content;

    // Fix URLs in the content before saving
    const urlRegex = /(?<=^|\s)((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/g;

    const processTextNode = (node) => {
      const text = node.textContent;
      if (urlRegex.test(text)) {
        const span = document.createElement("span");
        let lastIndex = 0;

        text.replace(urlRegex, (match, url, offset) => {
          // Add text before the URL
          if (offset > lastIndex) {
            span.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
          }

          // Create the link if it's not already a link
          const href = url.startsWith("http") ? url : `https://${url}`;
          const link = document.createElement("a");
          link.href = href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = url;
          span.appendChild(link);

          lastIndex = offset + match.length;
        });

        // Add remaining text
        if (lastIndex < text.length) {
          span.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        return span;
      }
      return node;
    };

    const walkTreeAndProcess = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const processedNode = processTextNode(node);
        if (processedNode !== node) {
          node.parentNode.replaceChild(processedNode, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "A") {
        Array.from(node.childNodes).forEach(walkTreeAndProcess);
      }
    };

    walkTreeAndProcess(div);
    return div.innerHTML;
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const filterOption = (input, option) => {
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  const onFinish = async (values) => {
    setLoading(true);
    const processedDescription = processEditorContent(values.description);
    const finalValues = {
      ...values,
      description: processedDescription,
      type: values.type === "אחר" ? values.customType : values.type,
      advisors: values.advisors ? [values.advisors] : [],
      students:
        values.students?.map((studentId) => studentsNoProject.find((student) => student.id === studentId)) || [],
    };

    delete finalValues.customType;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/create-project`,
        finalValues,
        {
          withCredentials: true,
        }
      );
      message.success("הפרויקט נוצר בהצלחה");

      setStudentsNoProject((prevStudents) =>
        prevStudents.filter(
          (student) => !finalValues.students.some((selectedStudent) => selectedStudent.id === student.id)
        )
      );
      setProjectCreated(true);
      setProjectCreatedId(response.data.project._id);
      form.resetFields();
      setIsOtherType(false);
      fetchNotifications();
    } catch (error) {
      console.error("Error occurred:", error.response?.data?.message);
      if (error.response?.data?.message === "This Project already exists in that year") {
        message.error("פרויקט עם אותו שם כבר קיים בשנה זו");
      } else {
        message.error("שגיאה ביצירת הפרויקט");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setIsOtherType(false);
    setProjectCreated(false);
  };

  return (
    <div className="create-project">
      <h1>יצירת פרויקט חדש</h1>
      <Form
        className="create-project-form"
        form={form}
        name="createProject"
        onFinish={onFinish}
        layout={windowSize.width > 1024 ? "horizontal" : "vertical"}>
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
              message: "חובה להזין תיאור לפרויקט",
            },
          ]}>
          <Editor style={{ height: "320px" }} onTextChange={handleEditorChange} />
        </Form.Item>

        <Form.Item
          className="create-project-form-item"
          label="שנת לימודים"
          name="year"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין שנה",
            },
          ]}>
          <Select placeholder="בחר שנה" value={selectedYear} onChange={handleYearChange}>
            <Option value={nextHebrewYear}>{nextHebrewYear}</Option>
            <Option value={currentHebrewYear}>{currentHebrewYear}</Option>
            <Option value={previousHebrewYear}>{previousHebrewYear}</Option>
          </Select>
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
            <Option value="יחיד / זוג">יחיד / זוג</Option>
          </Select>
        </Form.Item>

        <Form.Item
          className="create-project-form-item"
          name="type"
          label="סוג הפרויקט"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה לבחור סוג",
            },
          ]}>
          <Select placeholder="בחר סוג" onChange={handleTypeChange}>
            <Option value="מחקרי">מחקרי</Option>
            <Option value="תעשייתי הייטק">תעשייתי הייטק</Option>
            <Option value="תעשייתי לא הייטק">תעשייתי לא הייטק</Option>
            <Option value="יוזמת מנחה">יוזמת מנחה</Option>
            <Option value="יוזמת סטודנט">יוזמת סטודנט</Option>
            <Option value="סטאז'">סטאז'</Option>
            <Option value="אחר">אחר</Option>
          </Select>
        </Form.Item>

        <Form.Item
          className="create-project-form-item"
          label="מייל גורם חיצוני"
          name="externalEmail"
          hasFeedback
          rules={[
            {
              type: "email",
              message: "נא להזין כתובת מייל תקינה",
            },
          ]}>
          <Input type="email" placeholder="הזן מייל גורם חיצוני" />
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
            <Input placeholder="הזן סוג פרויקט מותאם" />
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
            <Select placeholder="בחר מנחה" showSearch filterOption={filterOption}>
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
          <Select mode="multiple" placeholder="בחר סטודנטים" filterOption={filterOption}>
            {studentsNoProject.map((student) => (
              <Option key={student.id} value={student.id}>
                {student.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="create-project-form-item">
          <div className="form-buttons">
            <Button type="primary" htmlType="submit" loading={loading}>
              צור פרויקט
            </Button>
            <Button danger onClick={onReset}>
              אפס טופס
            </Button>
          </div>
        </Form.Item>
      </Form>
      {projectCreated && (
        <div className="project-created">
          <FloatButton
            type="primary"
            shape="square"
            onClick={() => navigate(`/project/${projectCreatedId}`)}
            onMouseDown={(e) => handleMouseDown(e, `/project/${projectCreatedId}`)}
            description={
              <div className="float-button-text">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  transform="rotate(0)matrix(-1, 0, 0, 1, 0, 0)"
                  stroke="#ffffff">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M4 17V15.8C4 14.1198 4 13.2798 4.32698 12.638C4.6146 12.0735 5.07354 11.6146 5.63803 11.327C6.27976 11 7.11984 11 8.8 11H20M20 11L16 7M20 11L16 15"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"></path>
                  </g>
                </svg>
                עבור לדף הפרויקט
              </div>
            }
            style={{
              insetInlineEnd:
                windowSize.width > 1600
                  ? 150
                  : windowSize.width > 1200
                  ? 90
                  : windowSize.width > 1024
                  ? 800
                  : windowSize.width > 768
                  ? 800
                  : windowSize.width > 626
                  ? 550
                  : 250,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CreateProject;
