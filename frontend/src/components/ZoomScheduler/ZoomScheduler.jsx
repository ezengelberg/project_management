import React, { useState, useEffect } from "react";
import "./ZoomScheduler.scss";
import axios from "axios";
import {
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Switch,
  Button,
  message,
  FloatButton,
  InputNumber,
  Tabs,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/he_IL";
import dayjs from "dayjs";

const ZoomScheduler = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [form] = Form.useForm();
  const [generalMeeting] = Form.useForm();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yearFilter, setYearFilter] = useState("all");
  const [years, setYears] = useState([]);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [recurrenceType, setRecurrenceType] = useState(null);
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/years`, {
          withCredentials: true,
        });
        setYears(response.data.sort((a, b) => b.localeCompare(a)));
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/all-users`, {
          withCredentials: true,
        });

        const usersWithoutCurrent = response.data.filter((user) => user._id !== currentUser._id && !user.suspended);

        setAllUsers(usersWithoutCurrent);
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    };

    fetchYears();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/get-self-projects/`, {
          withCredentials: true,
        });
        const projects = response.data.projects.filter((project) => project.students.length > 0);

        const studentPromises = projects.map((project) =>
          Promise.all(
            project.students.map((student) =>
              axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${student.student}`, {
                withCredentials: true,
              })
            )
          )
        );

        const studentResponses = await Promise.all(studentPromises);

        const projectsWithStudents = projects.map((project, index) => ({
          ...project,
          students: studentResponses[index].map((response) => response.data),
        }));

        const filteredProjects = projectsWithStudents.filter((project) => project.year === yearFilter);
        setProjects(filteredProjects);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };

    if (yearFilter !== "all") {
      fetchProjects();
    }
  }, [yearFilter]);

  const handleProjectChange = (projectId) => {
    const project = projects.find((proj) => proj._id === projectId);
    form.setFieldsValue({
      students: project.students.map((student) => student.name).join(", "),
    });
  };

  const handleYearChange = (year) => {
    setYearFilter(year);
    form.resetFields(["project", "students", "topic", "date", "time", "recurring"]);
    setRecurrenceType(null);
  };

  const handleClear = (formType) => {
    if (formType === "project") {
      form.resetFields();
    } else {
      generalMeeting.resetFields();
    }
    setRecurrenceType(null);
  };

  const handleSubmit = async (values, formType) => {
    setLoading(true);
    try {
      const formattedDate = dayjs(values.date).format("YYYY-MM-DD");
      const formattedTime = dayjs(values.time).format("HH:mm");

      const meetingData = {
        topic: values.topic,
        date: formattedDate,
        time: formattedTime,
        recurring: values.recurring || false,
        projectId: formType === "project" ? values.project : null,
        participants: formType === "general" ? values.participants : null,
        recurrenceType: values.recurrenceType,
        recurrenceInterval: values.recurrenceInterval,
      };
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/zoom/create-meeting`, meetingData, {
        withCredentials: true,
      });

      setGeneratedLink(response.data.meeting.joinUrl);
      message.success("הפגישה נוצרה בהצלחה");
      handleClear(formType);
    } catch (error) {
      console.error("Error creating meeting:", error);
      message.error("שגיאה ביצירת הפגישה");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    message.success("הקישור הועתק");
    setGeneratedLink(null);
  };

  const handleTabChange = () => {
    setGeneratedLink(null);
  };

  const filterOption = (input, option) => {
    return option.children.toLowerCase().includes(input.toLowerCase());
  };

  const tabs = [
    {
      key: "1",
      label: "פגישה עם פרויקט",
      children: (
        <Form layout="vertical" onFinish={(values) => handleSubmit(values, "project")} form={form}>
          <Form.Item label="שנה" name="year" rules={[{ required: true, message: "בחר שנה" }]}>
            <Select value={yearFilter} onChange={handleYearChange} placeholder="בחר שנה">
              {years.map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="פרויקט" name="project" rules={[{ required: true, message: "בחר פרויקט" }]}>
            <Select onChange={handleProjectChange} loading={loading} placeholder="בחר פרויקט">
              {projects.map((project) => (
                <Select.Option key={project._id} value={project._id}>
                  {project.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="סטודנטים" name="students">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="נושא הפגישה"
            name="topic"
            rules={[{ max: 200, message: "נושא הפגישה לא יכול לעלות על 200 תווים" }]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="תאריך" name="date" rules={[{ required: true, message: "בחר תאריך" }]}>
            <DatePicker locale={locale} style={{ width: "200px" }} />
          </Form.Item>
          <Form.Item label="שעה" name="time" rules={[{ required: true, message: "בחר שעה" }]}>
            <TimePicker locale={locale} format="HH:mm" style={{ width: "200px" }} />
          </Form.Item>
          <Form.Item label="פגישה חוזרת?" name="recurring" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.recurring !== currentValues.recurring}>
            {({ getFieldValue }) =>
              getFieldValue("recurring") && (
                <>
                  <Form.Item label="תדירות" name="recurrenceType" rules={[{ required: true, message: "בחר תדירות" }]}>
                    <Select
                      placeholder="בחר סוג חוזרת"
                      style={{ width: "200px" }}
                      value={recurrenceType}
                      onChange={(value) => setRecurrenceType(value)}>
                      <Select.Option value="daily">ימים</Select.Option>
                      <Select.Option value="weekly">שבועות</Select.Option>
                      <Select.Option value="monthly">חודשים</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={`כל כמה זמן? (בין 1 ל-12) ${
                      recurrenceType === "daily"
                        ? "ימים"
                        : recurrenceType === "weekly"
                        ? "שבועות"
                        : recurrenceType === "monthly"
                        ? "חודשים"
                        : ""
                    }`}
                    name="recurrenceInterval"
                    rules={[
                      {
                        required: true,
                        message: "הזן מרווח בין פגישות",
                        type: "number",
                        min: 1,
                        max: 12,
                      },
                    ]}>
                    <InputNumber
                      min={1}
                      max={12}
                      value={recurrenceInterval}
                      onChange={(value) => {
                        setRecurrenceInterval(value);
                        form.setFieldsValue({ recurrenceInterval: value });
                      }}
                      style={{ width: "200px" }}
                    />
                  </Form.Item>
                </>
              )
            }
          </Form.Item>
          <Form.Item className="form-buttons">
            <Button type="primary" htmlType="submit" loading={loading}>
              קבע פגישה
            </Button>
            <Button type="default" onClick={() => handleClear("project")}>
              נקה טופס
            </Button>
            {generatedLink && (
              <FloatButton
                className="copy-button"
                icon={<CopyOutlined />}
                type="primary"
                tooltip="העתק קישור פגישה"
                onClick={copyToClipboard}
              />
            )}
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "2",
      label: "פגישה כללית",
      children: (
        <Form layout="vertical" onFinish={(values) => handleSubmit(values, "general")} form={generalMeeting}>
          <Form.Item
            label="נושא הפגישה"
            name="topic"
            rules={[
              { required: true, message: "הזן נושא פגישה" },
              { max: 200, message: "נושא הפגישה לא יכול לעלות על 200 תווים" },
            ]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="משתתפים" name="participants" rules={[{ required: true, message: "בחר משתתפים" }]}>
            <Select mode="multiple" placeholder="בחר משתתפים" style={{ width: "100%" }} filterOption={filterOption}>
              {allUsers.map((user) => (
                <Select.Option key={user._id} value={user._id}>
                  {user.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="תאריך" name="date" rules={[{ required: true, message: "בחר תאריך" }]}>
            <DatePicker locale={locale} style={{ width: "200px" }} />
          </Form.Item>
          <Form.Item label="שעה" name="time" rules={[{ required: true, message: "בחר שעה" }]}>
            <TimePicker locale={locale} format="HH:mm" style={{ width: "200px" }} />
          </Form.Item>
          <Form.Item label="פגישה חוזרת?" name="recurring" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.recurring !== currentValues.recurring}>
            {({ getFieldValue }) =>
              getFieldValue("recurring") && (
                <>
                  <Form.Item label="תדירות" name="recurrenceType" rules={[{ required: true, message: "בחר תדירות" }]}>
                    <Select
                      placeholder="בחר סוג חוזרת"
                      style={{ width: "200px" }}
                      value={recurrenceType}
                      onChange={(value) => setRecurrenceType(value)}>
                      <Select.Option value="daily">ימים</Select.Option>
                      <Select.Option value="weekly">שבועות</Select.Option>
                      <Select.Option value="monthly">חודשים</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={`כל כמה זמן? (בין 1 ל-12) ${
                      recurrenceType === "daily"
                        ? "ימים"
                        : recurrenceType === "weekly"
                        ? "שבועות"
                        : recurrenceType === "monthly"
                        ? "חודשים"
                        : ""
                    }`}
                    name="recurrenceInterval"
                    rules={[
                      {
                        required: true,
                        message: "הזן מרווח בין פגישות",
                        type: "number",
                        min: 1,
                        max: 12,
                      },
                    ]}>
                    <InputNumber
                      min={1}
                      max={12}
                      value={recurrenceInterval}
                      onChange={(value) => {
                        setRecurrenceInterval(value);
                        form.setFieldsValue({ recurrenceInterval: value });
                      }}
                      style={{ width: "200px" }}
                    />
                  </Form.Item>
                </>
              )
            }
          </Form.Item>
          <Form.Item className="form-buttons">
            <Button type="primary" htmlType="submit" loading={loading}>
              קבע פגישה
            </Button>
            <Button type="default" onClick={() => handleClear("general")}>
              נקה טופס
            </Button>
            {generatedLink && (
              <FloatButton
                className="copy-button"
                icon={<CopyOutlined />}
                type="primary"
                tooltip="העתק קישור פגישה"
                onClick={copyToClipboard}
              />
            )}
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="zoom-scheduler-container">
      <Tabs items={tabs} defaultActiveKey="1" onChange={handleTabChange} />
    </div>
  );
};

export default ZoomScheduler;
