import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Highlighter from "react-highlight-words";
import { handleMouseDown } from "../../utils/mouseDown";
import axios from "axios";
import "./Submissions.scss";
import {
  Modal,
  DatePicker,
  Form,
  Input,
  Select,
  Table,
  Radio,
  message,
  Tooltip,
  Button,
  InputNumber,
  Col,
  Row,
  Badge,
  Space
} from "antd";
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/he_IL"; // Import Hebrew locale

const Submissions = () => {
  const navigate = useNavigate();
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
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/get-all-project-submissions`,
        {
          withCredentials: true
        }
      );

      console.log(response.data);
      setSubmissionData(response.data);
      // const submissionNames = [...new Set(response.data.map((submission) => submission.name))];
      // setSubmissionNames(submissionNames);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissionData([]);
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
        case "proposalReport":
          name = "דוח הצעה";
          break;
        case "alphaReport":
          name = "דוח אלפה";
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
        case "proposalReport":
          name = "דוח הצעה";
          break;
        case "alphaReport":
          name = "דוח אלפה";
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

  const columns = [
    {
      title: "שם הפרוייקט",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => {
        // Safely handle undefined values in sorting
        const titleA = (a.title || "").toString();
        const titleB = (b.title || "").toString();
        return titleA.localeCompare(titleB);
      },
      sortDirections: ["descend", "ascend"],
      defaultSortOrder: "ascend",
      render: (text, record) => {
        // Ensure text exists before rendering Highlighter
        const title = record.title || "";
        const displayText = title.length > 65 ? `${title.substring(0, 65)}...` : title;

        return (
          <a
            onClick={() => navigate(`/project/${record.projectid}`)}
            onMouseDown={(e) => handleMouseDown(e, `/project/${record.projectid}`)}>
            <Highlighter
              highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
              searchWords={[]} // Add your search words array here if needed
              autoEscape
              textToHighlight={displayText}
            />
          </a>
        );
      }
    },
    {
      title: "הגשות",
      key: "submissions",
      render: (_, record) => {
        // Ensure submissions array exists
        const submissions = record.submissions || [];
        const colSpan = Math.floor(24 / (submissions.length + 1));

        return (
          <Row gutter={[16, 16]} className="table-row">
            {submissions.map((sub, index) => {
              const grades = sub.grades || [];
              const waitingCheck = grades.some((grade) => grade.grade === null);

              return (
                <Col key={index} span={colSpan} className="table-col">
                  <div className="submission-title">{sub.name || ""}</div>
                  <span className="submission-date-time">
                    {sub.submissionDate
                      ? new Date(sub.submissionDate).toLocaleString("he-IL", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })
                      : ""}
                  </span>
                  <div className="table-col-info">
                    <Badge color={sub.submitted ? "green" : "orange"} text={sub.submitted ? "הוגש" : "מחכה להגשה"} />
                    <div>{waitingCheck && sub.submitted && <Badge color="blue" text="מחכה לבדיקה" />}</div>
                  </div>
                </Col>
              );
            })}
          </Row>
        );
      }
    }
  ];

  const submissionOptions = [
    { label: "דוח הצעה", value: "proposalReport", isGraded: false, isReviewed: false },
    { label: "דוח אלפה", value: "alphaReport", isGraded: true, isReviewed: true },
    { label: "דוח סופי", value: "finalReport", isGraded: false, isReviewed: true },
    { label: "מבחן סוף", value: "finalExam", isGraded: true, isReviewed: false },
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
      {/* {submissionData.map((submission) => {
        const colSpan = Math.floor(24 / (submission.submissions.length + 1)); // Calculate column span based on number of submissions
        return (
          <Row gutter={[16, 16]} className="table-row">
            <Col span={colSpan} className="table-col">
              {submission.title}
            </Col>
            {submission.submissions.map((sub, index) => {
              const waitingCheck = sub.grades.some((grade) => grade.grade === null);
              return (
                <Col key={index} className="table-col" span={colSpan}>
                  <div className="table-col-info">
                    <div className="submission-title">{sub.name}</div>
                    <Badge color={sub.submitted ? "green" : "orange"} text={sub.submitted ? "הוגש" : "מחכה להגשה"} />
                    {waitingCheck && sub.submitted && <Badge color="blue" text="מחכה לבדיקה" />}
                  </div>
                </Col>
              );
            })}
          </Row>
        );
      })} */}
      <Table
        columns={columns}
        dataSource={submissionData}
        // expandable={{
        //   expandedRowRender: (record) => (
        //     <Table columns={subColumns} dataSource={record.gradesDetailed} pagination={false} />
        //   ),
        //   rowExpandable: (record) => record.grades && record.grades.length > 0
        // }}
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
          {/* סוג הגשה */}
          <Form.Item label="סוג הגשה" name="submissionType" hasFeedback>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={submissionOptions}
              onChange={(e) => setSubmissionType(e.target.value)}
            />
          </Form.Item>

          {/* שם ההגשה */}
          {submissionType === "other" && (
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
          )}

          {/* תאריך הגשה */}
          <Form.Item
            label="תאריך הגשה"
            name="submissionDate"
            hasFeedback
            rules={[
              {
                type: "object", // Corrected the type from "array" to "object"
                required: true,
                message: "חובה להזין תאריך הגשה"
              }
            ]}>
            <DatePicker
              className="date-picker"
              locale={locale}
              direction="rtl"
              showTime={{ format: "HH:mm" }}
              format="DD-MM-YYYY HH:mm"
            />
          </Form.Item>

          {/* פרוייקטים */}
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
                <Select.Option key={project._id} value={project._id}>
                  {project.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Submissions;
