import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Submissions.scss";
import { Modal, DatePicker, Form, Input, Select, Table, Radio, message, Tooltip, Button, InputNumber } from "antd";
import { EditOutlined, DeleteOutlined, NodeExpandOutlined } from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/he_IL"; // Import Hebrew locale

const Submissions = () => {
  const { Option } = Select;
  const [formAll] = Form.useForm();
  const [formJudges] = Form.useForm();
  const [formSpecific] = Form.useForm();
  const [gradeForm] = Form.useForm();
  const [allSubmissions, setAllSubmissions] = useState(false);
  const [specificSubmission, setSpecificSubmission] = useState(false);
  const [copyJudges, setCopyJudges] = useState(false);
  const [gradeFormOpen, setGradeFormOpen] = useState(false);
  const [gradeToOverride, setGradeToOverride] = useState(null);
  const [submissionData, setSubmissionData] = useState([]);
  const [submissionNames, setSubmissionNames] = useState([]);
  const [submissionType, setSubmissionType] = useState(null);
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

      // console.log(response.data);
      const gradesData = response.data.map((submission) => {
        submission.gradesDetailed = submission.gradesDetailed.map((grade) => {
          // console.log(grade);
          return {
            ...grade,
            grade: grade.overridden ? grade.overridden?.newGrade : grade.grade
            // grade: grade.overridden !== null ? grade.overridden.grade : grade.grade,
          };
        });
        return submission;
      });
      console.log(gradesData);
      setSubmissionData(gradesData);
      const submissionNames = [...new Set(response.data.map((submission) => submission.name))];
      setSubmissionNames(submissionNames);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchActiveProjects();
  }, []);

  const handleJudgeCopy = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/copy-judges`,
        {
          sourceSubmission: values.sourceSubmission,
          destinationSubmission: values.destinationSubmission
        },
        {
          withCredentials: true
        }
      );
      message.open({
        type: "success",
        content: "העתקת השופטים הושלמה בהצלחה"
      });
    } catch (error) {
      console.error("Error copying judges:", error);
    } finally {
      handleClose();
      fetchSubmissions();
    }
  };

  const overrideGrade = async (values) => {
    console.log(values);
    console.log(gradeToOverride);
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/grade/update/${gradeToOverride.key}`,
        {
          grade: values.newGrade
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error overriding grade:", error);
    }
  };

  const handleOkAll = async (values) => {
    try {
      let name = "";
      switch (submissionType) {
        case "alphaReport":
          name = "דוח אלפא";
          break;
        case "finalReport":
          name = "דוח סופי";
          break;
        case "finalExam":
          name = "מבחן סוף";
          break;
        default: // other...
          name = values.submissionName;
          break;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/create`,
        {
          name: name,
          submissionDate: values.submissionDate
        },
        {
          withCredentials: true
        }
      );
      message.open({
        type: "success",
        content: "הגשה נפתחה בהצלחה"
      });
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      handleClose();
      fetchSubmissions();
    }
  };

  const handleOkSpecific = async (values) => {
    try {
      let name = "";
      switch (submissionType) {
        case "alphaReport":
          name = "דוח אלפא";
          break;
        case "finalReport":
          name = "דוח סופי";
          break;
        case "finalExam":
          name = "מבחן סוף";
          break;
        default: // other...
          name = values.submissionName;
          break;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/create-specific`,
        {
          name: name,
          submissionDate: values.submissionDate,
          projects: values.projects
        },
        {
          withCredentials: true
        }
      );
      message.open({
        type: "success",
        content: "הגשה נפתחה בהצלחה"
      });
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      handleClose();
      fetchSubmissions();
    }
  };

  const handleClose = () => {
    console.log("close!");
    formAll.resetFields();
    setAllSubmissions(false);

    formSpecific.resetFields();
    setSpecificSubmission(false);

    formJudges.resetFields();
    setCopyJudges(false);

    setSubmissionType(null);

    gradeForm.resetFields();
    setGradeFormOpen(false);
    setGradeToOverride(null);
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

  const onOkHandlerJudges = () => {
    formJudges
      .validateFields()
      .then((values) => {
        handleJudgeCopy(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const onOkHandlerGrade = () => {
    gradeForm
      .validateFields()
      .then((values) => {
        overrideGrade(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const column = [
    {
      title: "פרויקט",
      dataIndex: "projectName",
      key: "project",
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend"]
    },
    {
      title: "שם ההגשה",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend"]
    },
    {
      title: "ציון משוקלל",
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
      title: "תאריך הגשה",
      dataIndex: "submissionDate",
      key: "submissionDate",
      sorter: (a, b) => new Date(a.submissionDate) - new Date(b.submissionDate),
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
      title: "פעולות",
      key: "action",
      render: (text, record) => (
        <div className="submission-table-actions">
          <Tooltip title="ערוך פרטי הגשה">
            <EditOutlined className="submission-icon" />
          </Tooltip>
          <Tooltip title="מחק הגשה">
            <DeleteOutlined className="submission-icon" />
          </Tooltip>
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
      render: (text) => {
        console.log(text);
        return <span>{text ? text : "לא הוזן"}</span>;
      }
    },
    {
      title: "הערות",
      dataIndex: "comment",
      key: "comment",
      render: (text) => <span>{text ? text : "לא הוזן"}</span>
    },
    {
      title: "פעולות",
      key: "action",
      render: (text, record) => (
        <div className="submission-table-actions">
          <Tooltip title="ערוך ציון">
            <EditOutlined
              className="submission-icon"
              onClick={() => {
                setGradeToOverride(record);
                setGradeFormOpen(true);
                gradeForm.setFieldsValue({ oldGrade: record?.grade ? record.grade : "לא הוזן" });
              }}
            />
          </Tooltip>
        </div>
      )
    }
  ];

  const submissionOptions = [
    { label: "דוח אלפא", value: "alphaReport" },
    { label: "דוח סופי", value: "finalReport" },
    { label: "מבחן סוף", value: "finalExam" },
    { label: "אחר", value: "other" }
  ];

  return (
    <div>
      <div className="action-buttons">
        <Button type="primary" onClick={() => setAllSubmissions(true)}>
          פתיחת הגשה חדשה
        </Button>
        <Button type="primary" onClick={() => setSpecificSubmission(true)}>
          פתיחת הגשה לפרויקטים נבחרים
        </Button>
        <Button type="primary" onClick={() => setCopyJudges(true)}>
          העתקת שופטים
        </Button>
      </div>
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
      {/* <div className="float-button-actions">
      </div> */}
      <Modal
        title="שנה ציון"
        open={gradeFormOpen}
        okText="ערוך ציון"
        cancelText="סגור"
        onOk={() => onOkHandlerGrade()}
        onCancel={() => handleClose()}>
        <Form layout="vertical" form={gradeForm}>
          <Form.Item label="ציון קודם" name="oldGrade">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="ציון חדש"
            name="newGrade"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין ציון בין (0) ל (100)"
              }
            ]}>
            <InputNumber className="input-field-override-grade" min={0} max={100} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="העתקת שופטים"
        open={copyJudges}
        okText="העתק שופטים"
        cancelText="סגור"
        onOk={() => onOkHandlerJudges()}
        onCancel={() => handleClose()}>
        <Form layout="vertical" form={formJudges}>
          <Form.Item
            label="הגשת מקור"
            name="sourceSubmission"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור הגשת מקור"
              }
            ]}>
            <Select placeholder="בחר הגשת מקור">
              {submissionNames.map((submission, index) => (
                <Option key={index} value={submission.name}>
                  {submission}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="הגשת יעד"
            name="destinationSubmission"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור הגשת יעד"
              }
            ]}>
            <Select placeholder="בחר הגשת יעד">
              {submissionNames.map((submission, index) => (
                <Option key={index} value={submission.name}>
                  {submission}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="פתיחת הגשה חדשה לכולם"
        open={allSubmissions}
        okText="יצירת הגשה"
        cancelText="סגור"
        onCancel={() => handleClose()}
        onOk={onOkHandlerAll}>
        <Form layout="vertical" form={formAll}>
          <Form.Item label="סוג הגשה" name="submissionType" hasFeedback>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={submissionOptions}
              onChange={(e) => {
                setSubmissionType(e.target.value);
              }}
            />
          </Form.Item>
          {submissionType === "other" && (
            <Form.Item
              label="שם ההגשה"
              name="submissionName"
              hasFeedback
              rules={[
                {
                  required: submissionType === "other",
                  message: "חובה להזין שם ההגשה"
                }
              ]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item
            label="תאריך הגשה"
            name="submissionDate"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין תאריך הגשה"
              }
            ]}>
            <DatePicker
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
          <Form.Item label="סוג הגשה" name="submissionType" hasFeedback>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={submissionOptions}
              onChange={(e) => {
                setSubmissionType(e.target.value);
              }}
            />
          </Form.Item>
          {submissionType === "other" && (
            <Form.Item
              label="שם ההגשה"
              name="submissionName"
              hasFeedback
              rules={[
                {
                  required: submissionType === "other",
                  message: "חובה להזין שם ההגשה"
                }
              ]}>
              <Input />
            </Form.Item>
          )}
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
            <DatePicker
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
