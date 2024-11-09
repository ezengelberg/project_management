import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Submissions.scss";
import { FloatButton, Modal, DatePicker, Form, Input, Select } from "antd";
import locale from "antd/es/date-picker/locale/he_IL"; // Import Hebrew locale
const { RangePicker } = DatePicker;

const Submissions = () => {
  const { Option } = Select;
  const [formAll] = Form.useForm();
  const [formSpecific] = Form.useForm();
  const [allSubmissions, setAllSubmissions] = useState(false);
  const [specificSubmission, setSpecificSubmission] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
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
      console.log(response);
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      handleClose();
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
      console.log(response)
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    console.log("closing");
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

  return (
    <div>
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
