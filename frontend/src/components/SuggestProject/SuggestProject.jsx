import React, { useContext, useEffect, useState } from "react";
import "./SuggestProject.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Select, message, Steps, Spin, Result, Popconfirm } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { Editor } from "primereact/editor";
import DOMPurify from "dompurify";
import { processContent } from "../../utils/htmlProcessor";
import { handleMouseDown } from "../../utils/mouseDown";
import { NotificationsContext } from "../../utils/NotificationsContext";
import { getHebrewYearBundle } from "../../utils/dates/hebrewYears";

const SuggestProject = () => {
  const navigate = useNavigate();
  const { Option } = Select;
  const { fetchNotifications } = useContext(NotificationsContext);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [studentsNoProject, setStudentsNoProject] = useState([]);
  const [isOtherType, setIsOtherType] = useState(false);
  const [myProject, setMyProject] = useState(null);
  const [userDontHaveProject, setUserDontHaveProject] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [configYear, setConfigYear] = useState(null);
  const [current, setCurrent] = useState(0);
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
    getSuggestedProject();
    getConfigYear();
  }, [form]);

  const getConfigYear = async () => {
    setLoading(true);
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
      } else {
        setSelectedYear(currentHebrewYear);
      }
    } catch (error) {
      console.error("Error occurred:", error.response?.data?.message);
      message.error("שגיאה בטעינת הטופס");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedYear) {
      fetchUsersNoProjectsByYear(selectedYear);
    }
    getSuggestedProject();
  }, [selectedYear]);

  const fetchUsersNoProjectsByYear = async (year) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/users-no-projects-by-year/${year}`,
        {
          withCredentials: true,
        }
      );
      const onlyStudents = response.data.usersNoProjects.filter(
        (user) =>
          user.isStudent === true &&
          user.isAdvisor === false &&
          user.isCoordinator === false &&
          user.suspended === false
      );
      setStudentsNoProject(onlyStudents);
    } catch (error) {
      console.error("Error occurred:", error.response.data.message);
    }
    setLoading(false);
  };

  const getSuggestedProject = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/get-project-suggestions`, {
        withCredentials: true,
      });
      const myProject = response.data.find((project) => project.studentSuggestions.suggestedBy._id === currentUser._id);
      if (!myProject) {
        setUserDontHaveProject(true);
      } else {
        setUserDontHaveProject(false);
      }
      const stage = myProject ? myProject.studentSuggestions.stage : 0;
      setMyProject(myProject);
      setCurrent(stage);
    } catch (error) {
      console.error("Error occurred:", error.response?.data?.message);
      message.error("שגיאה בטעינת הטופס");
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
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

  const filterOption = (input, option) => {
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  const onFinish = async (values) => {
    setLoading(true);
    const processedDescription = processContent(values.description);
    const finalValues = {
      ...values,
      description: processedDescription,
      type: values.type === "אחר" ? values.customType : values.type,
      candidates: values.students
        ? [values.students, currentUser.id].flat().map(
            (studentId) =>
              studentsNoProject.find((student) => student.id === studentId) || {
                _id: currentUser._id,
                name: currentUser.name,
              }
          )
        : [{ _id: currentUser._id, name: currentUser.name }],
    };

    delete finalValues.customType;

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/project/suggest-project`, finalValues, {
        withCredentials: true,
      });
      message.success("הטופס נשלח בהצלחה");

      setStudentsNoProject((prevStudents) =>
        prevStudents.filter(
          (student) => !finalValues.candidates.some((selectedStudent) => selectedStudent._id === student.id)
        )
      );

      getSuggestedProject();
      form.resetFields();
      setIsOtherType(false);
      fetchNotifications();
    } catch (error) {
      console.error("Error occurred:", error.response?.data?.message);
      if (error.response?.data?.message === "This Project already exists in that year") {
        message.error("פרויקט עם אותו שם כבר קיים בשנה זו");
      } else {
        message.error("שגיאה בשליחת הטופס");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setIsOtherType(false);
  };

  const handleDeleteProject = async (fromCreateNewProject) => {
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/delete-project-suggestion/${myProject._id}`,
        {
          withCredentials: true,
        }
      );
      if (!fromCreateNewProject) {
        message.success("הצעת הפרויקט נמחקה בהצלחה");
      }
      setMyProject(null);
      setUserDontHaveProject(true);
      setCurrent(0);
    } catch (error) {
      console.error("Error occurred:", error.response?.data?.message);
      if (!fromCreateNewProject) {
        message.error("שגיאה במחיקת הצעת הפרויקט");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Spin tip="טוען..." size="large">
        <div
          style={{
            padding: 50,
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: 4,
          }}
        />
      </Spin>
    );
  }

  return (
    <div className="suggest-project">
      <Steps
        current={current}
        items={[{ title: "הזנת פרטי הפרויקט" }, { title: "בחינת הפרויקט" }, { title: "תשובת הרכז" }]}
      />
      {current === 0 && userDontHaveProject && (
        <Form
          className="suggest-project-form"
          form={form}
          initialValues={{ year: selectedYear }}
          onFinish={onFinish}
          layout={windowSize.width > 1024 ? "horizontal" : "vertical"}>
          <Form.Item
            className="suggest-project-form-item"
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
            className="suggest-project-form-item"
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
            className="suggest-project-form-item"
            label="שנת לימודים"
            name="year"
            rules={[{ required: true, message: "חובה לבחור שנה" }]}>
            <Select placeholder="בחר שנה" value={selectedYear} onChange={handleYearChange}>
              <Option value={nextHebrewYear}>{nextHebrewYear}</Option>
              <Option value={currentHebrewYear}>{currentHebrewYear}</Option>
              <Option value={previousHebrewYear}>{previousHebrewYear}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            className="suggest-project-form-item"
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
            className="suggest-project-form-item"
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
            className="suggest-project-form-item"
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
              className="suggest-project-form-item"
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
            className="suggest-project-form-item"
            label="בחירת סטודנט"
            name="students"
            hasFeedback
            rules={[
              {
                required: false,
              },
            ]}>
            <Select mode="single" placeholder="בחר סטודנט" showSearch filterOption={filterOption}>
              {studentsNoProject
                .filter((student) => student.id !== currentUser.id)
                .map((student) => (
                  <Option key={student.id} value={student.id}>
                    {student.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item className="suggest-project-form-item">
            <div className="form-buttons">
              <Button type="primary" htmlType="submit" loading={loading}>
                שלח טופס
              </Button>
              <Button danger onClick={onReset}>
                אפס טופס
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}
      {current === 0 && !userDontHaveProject && (
        <Result
          status="warning"
          title="קיים פרויקט פעיל במערכת שמשויך אליך או שאינך משוייך לשנה זאת."
          subTitle="לא ניתן להציע פרויקט חדש, ניתן לפנות לרכז הפרויקטים לשאלות."
        />
      )}
      {current === 1 && myProject && (
        <div className="suggested-project">
          <Result
            icon={<SmileOutlined />}
            title="הפרויקט הועבר לבדיקה"
            subTitle="אם אין תשובה במשך זמן רב, נא לפנות לרכז הפרויקטים."
            extra={[
              <Button
                key="view-project"
                type="primary"
                onClick={() => navigate(`/project/${myProject._id}`)}
                onMouseDown={(e) => handleMouseDown(e, `/project/${myProject._id}`)}>
                מעבר לעמוד הפרויקט
              </Button>,
              <Popconfirm
                key="delete-project"
                title="האם אתה בטוח שברצונך למחוק את הצעת הפרויקט?"
                onConfirm={() => handleDeleteProject(false)}
                okText="כן"
                okButtonProps={{ danger: true }}
                cancelText="לא">
                <Button type="primary" danger>
                  מחק הצעת פרויקט
                </Button>
              </Popconfirm>,
            ]}
          />
        </div>
      )}
      {current === 2 && myProject && myProject.studentSuggestions.acceptProject && !myProject.isTerminated && (
        <Result
          status="success"
          title="הפרויקט אושר, בהצלחה!"
          subTitle="שמרו על קשר עם רכז הפרויקטים לגבי שיבוץ מנחה לפרויקט."
        />
      )}
      {current === 2 && myProject && myProject.studentSuggestions.denyProject && (
        <Result
          className="rejected-project-result"
          status="error"
          title="הפרויקט נדחה"
          subTitle={`${
            myProject && myProject.studentSuggestions.denyReason
              ? "סיבת הדחייה: " + myProject.studentSuggestions.denyReason
              : ""
          }`}
          extra={[
            <Button key="new-project" type="primary" onClick={() => handleDeleteProject(true)}>
              הצעת פרויקט חדש
            </Button>,
          ]}
        />
      )}
      {current === 2 && myProject && myProject.isTerminated && !myProject.studentSuggestions.denyProject && (
        <Result
          status="error"
          title="הפרויקט בוטל"
          extra={[
            <Button key="new-project" type="primary" onClick={() => handleDeleteProject(true)}>
              הצעת פרויקט חדש
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default SuggestProject;
