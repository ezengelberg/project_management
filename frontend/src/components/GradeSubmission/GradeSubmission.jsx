import React, { useEffect, useState } from "react";
import "./GradeSubmission.scss";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button, Form, Input, Select, Space, message, Spin } from "antd";

const GradeSubmission = () => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { submissionId } = useParams();
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/submission/get-submission/${submissionId}`,
          {
            withCredentials: true,
          }
        );
        setProject(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        message.error("שגיאה בטעינת נתוני הפרויקט");
        setLoading(false);
      }
      setLoading(false);
    };

    fetchProjectData();
  }, [submissionId]);

  const onFinish = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/grade/add-grade`,
        {
          submissionId: submissionId,
          ...values,
        },
        {
          withCredentials: true,
        }
      );
      message.success("הציון נשמר בהצלחה");
      form.resetFields();
    } catch (error) {
      console.error("Error submitting grade:", error);
      message.error("שגיאה בשמירת הציון");
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <div className="grade-project-container">
      {loading ? (
        <Spin />
      ) : (
        <div className="grade-project-form">
          <h2>
            שפטית פרויקט: <span style={{ textDecoration: "underline" }}>{project?.projectName}</span>
          </h2>
          <Form form={form} name="gradeProject" layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="כתבו משפט על איכות הסרטון"
              name="videoQuality"
              rules={[
                {
                  required: true,
                  message: "נא להזין תשובה",
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="כתבו פסקה על איכות העבודה שנעשתה"
              name="workQuality"
              rules={[
                {
                  required: true,
                  message: "נא להזין תשובה",
                },
              ]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              label="כתבו משפט או יותר על איכות הכתיבה"
              name="writingQuality"
              rules={[
                {
                  required: true,
                  message: "נא להזין תשובה",
                },
              ]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item label="למנחה בלבד - כמה קומיטים היו בגיט?" name="commits">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="למנחה בלבד - האם היומן פעיל?" name="journalActive">
              <Select>
                <Option value="yes">כן</Option>
                <Option value="no">לא</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="ציון לפרויקט"
              name="grade"
              rules={[
                {
                  required: true,
                  message: "נא להזין ציון",
                },
              ]}>
              <Select>
                <Option value="A+">A+</Option>
                <Option value="A">A</Option>
                <Option value="A-">A-</Option>
                <Option value="B+">B+</Option>
                <Option value="B">B</Option>
                <Option value="B-">B-</Option>
                <Option value="C+">C+</Option>
                <Option value="C">C</Option>
                <Option value="C-">C-</Option>
                <Option value="D+">D+</Option>
                <Option value="D">D</Option>
                <Option value="D-">D-</Option>
                <Option value="E">E</Option>
                <Option value="F">F</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  שמור ציון
                </Button>
                <Button htmlType="button" onClick={onReset}>
                  נקה טופס
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
};

export default GradeSubmission;
