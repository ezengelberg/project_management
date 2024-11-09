import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Submissions.scss";
import { FloatButton, Modal, DatePicker, Form, Input, Select, Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/he_IL"; // Import Hebrew locale
const { RangePicker } = DatePicker;

const Submissions = () => {
  const { Option } = Select;
  const [formAll] = Form.useForm();
  const [formSpecific] = Form.useForm();
  const [allSubmissions, setAllSubmissions] = useState(false);
  const [specificSubmission, setSpecificSubmission] = useState(false);
  const [submissionData, setSubmissionData] = useState([]);
  const [projects, setProjects] = useState([]);

  const fetchActiveProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/get-active-projects`, {
        withCredentials: true
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-all`, {
        withCredentials: true
      });
      setSubmissionData(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchActiveProjects();
  }, []);

  const handleOkAll = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/create`,
        {
          name: values.submissionName,
          startDate: values.submissionDate[0],
          endDate: values.submissionDate[1]
        },
        {
          withCredentials: true
        }
      );
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      handleClose();
      fetchSubmissions();
    }
  };

  const handleOkSpecific = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/create-specific`,
        {
          name: values.submissionName,
          startDate: values.submissionDate[0],
          endDate: values.submissionDate[1],
          projects: values.projects
        },
        {
          withCredentials: true
        }
      );
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      handleClose();
      fetchSubmissions();
    }
  };

  const handleClose = () => {
    formAll.resetFields();
    setAllSubmissions(false);

    formSpecific.resetFields();
    setSpecificSubmission(false);
  };

  const onOkHandlerSpecific = () => {
    formSpecific
      .validateFields()
      .then((values) => {
        handleOkSpecific(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  const onOkHandlerAll = () => {
    formAll
      .validateFields()
      .then((values) => {
        handleOkAll(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const column = [
    {
      title: "שם ההגשה",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend"]
    },
    {
      title: "ציון משוכלל",
      dataIndex: "gradesDetailed",
      key: "gradesDetailed",
      render: (text) => {
        const grades = text.map((grade) => grade.grade);
        if (grades.includes(null)) {
          return <span>מחכה לבדיקה</span>;
        }
        const sum = grades.reduce((acc, grade) => acc + grade, 0);
        return <span>{grades.length > 0 ? sum / grades.length : "לא הוזן"}</span>;
      }
    },
    {
      title: "תאריך פתיחת מטלה",
      dataIndex: "openDate",
      key: "openDate",
      sorter: (a, b) => new Date(a.openDate) - new Date(b.openDate),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend"],
      render: (text) => (
        <span>
          {new Date(text).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          })}
        </span>
      )
    },
    {
      title: "תאריך סגירת מטלה",
      dataIndex: "closeDate",
      key: "closeDate",
      sorter: (a, b) => new Date(a.closeDate) - new Date(b.closeDate),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend"],
      render: (text) => (
        <span>
          {new Date(text).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          })}
        </span>
      )
    },
    {
      title: "פרויקט",
      dataIndex: "projectName",
      key: "project",
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend"]
    },
    {
      title: "פעולות",
      key: "action",
      render: (text, record) => (
        <div>
          <EditOutlined />
          <DeleteOutlined />
        </div>
      )
    }
  ];

  const subColumns = [
    {
      title: "שם השופט",
      dataIndex: "judgeName",
      key: "judgeName"
    },
    {
      title: "ציון",
      dataIndex: "grade",
      key: "grade",
      render: (text) => <span>{text ? text : "לא הוזן"}</span>
    },
    {
      title: "הערות",
      dataIndex: "comment",
      key: "comment",
      render: (text) => <span>{text ? text : "לא הוזן"}</span>
    }
  ];

  return (
    <div>
      <Table
        columns={column}
        dataSource={submissionData}
        expandable={{
          expandedRowRender: (record) => (
            <Table columns={subColumns} dataSource={record.gradesDetailed} pagination={false} />
          ),
          rowExpandable: (record) => record.grades && record.grades.length > 0
        }}
      />
      <FloatButton.Group className="submission-actions" type="primary" trigger="click">
        <FloatButton shape="square" description="הגשה חדשה" onClick={() => setAllSubmissions(true)} />
        <FloatButton shape="square" description="הגשה לפרוייקט יחיד" onClick={() => setSpecificSubmission(true)} />
      </FloatButton.Group>
      <Modal
        title="פתיחת הגשה חדשה לכולם"
        open={allSubmissions}
        okText="יצירת הגשה"
        cancelText="סגור"
        onCancel={() => handleClose()}
        onOk={onOkHandlerAll}>
        <Form layout="vertical" form={formAll}>
          <Form.Item
            label="שם ההגשה"
            name="submissionName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין שם ההגשה"
              }
            ]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="תאריך הגשה"
            name="submissionDate"
            hasFeedback
            rules={[
              {
                type: "array",
                required: true,
                message: "חובה להזין תאריך הגשה"
              }
            ]}>
            <RangePicker
              className="date-picker"
              locale={locale} // Add the Hebrew locale here
              direction="rtl"
              showTime={{
                format: "HH:mm"
              }}
              format="DD-MM-YYYY HH:mm"
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="פתיחת הגשה ספציפית"
        open={specificSubmission}
        okText="יצירת הגשה"
        cancelText="סגור"
        onOk={() => onOkHandlerSpecific()}
        onCancel={() => handleClose()}>
        <Form layout="vertical" form={formSpecific}>
          <Form.Item
            label="שם ההגשה"
            name="submissionName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין שם ההגשה"
              }
            ]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="תאריך הגשה"
            name="submissionDate"
            hasFeedback
            rules={[
              {
                type: "array",
                required: true,
                message: "חובה להזין תאריך הגשה"
              }
            ]}>
            <RangePicker
              className="date-picker"
              locale={locale} // Add the Hebrew locale here
              direction="rtl"
              showTime={{
                format: "HH:mm"
              }}
              format="DD-MM-YYYY HH:mm"
            />
          </Form.Item>
          <Form.Item
            label="פרוייקטים"
            name="projects"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור פרוייקטים"
              }
            ]}>
            <Select mode="multiple" placeholder="בחר פרוייקטים">
              {projects.map((project) => (
                <Option key={project._id} value={project._id}>
                  {project.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Submissions;
