import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Highlighter from "react-highlight-words";
import { handleMouseDown } from "../../utils/mouseDown";
import axios from "axios";
import dayjs from "dayjs";
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
  Statistic,
  Checkbox,
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
  const { TextArea } = Input;
  const { Option } = Select;
  const [formAll] = Form.useForm();
  const [formJudges] = Form.useForm();
  const [editSubmission] = Form.useForm();
  const [formSpecific] = Form.useForm();
  const [gradeForm] = Form.useForm();
  const [allSubmissions, setAllSubmissions] = useState(false);
  const [specificSubmission, setSpecificSubmission] = useState(false);
  const [editSubmissions, setEditSubmissions] = useState(false);
  const [copyJudges, setCopyJudges] = useState(false);
  const [gradeFormOpen, setGradeFormOpen] = useState(false);
  const [gradeToOverride, setGradeToOverride] = useState(null);
  const [submissionData, setSubmissionData] = useState([]);
  const [submissionNames, setSubmissionNames] = useState([]);
  const [submissionType, setSubmissionType] = useState(null);
  const [projects, setProjects] = useState([]);
  const [submissionInfo, setSubmissionInfo] = useState(null);

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
      const submissionNames = [
        ...new Set(response.data.flatMap((submission) => submission.submissions.map((sub) => sub.name)))
      ];
      setSubmissionNames(submissionNames);
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
      let isGraded = false;
      let isReviewed = false;
      switch (submissionType) {
        case "proposalReport":
          name = "דוח הצעה";
          isGraded = submissionOptions.find((option) => option.value === "proposalReport").isGraded;
          isReviewed = submissionOptions.find((option) => option.value === "proposalReport").isReviewed;
          break;
        case "alphaReport":
          name = "דוח אלפה";
          isGraded = submissionOptions.find((option) => option.value === "alphaReport").isGraded;
          isReviewed = submissionOptions.find((option) => option.value === "alphaReport").isReviewed;
          break;
        case "finalReport":
          name = "דוח סופי";
          isGraded = submissionOptions.find((option) => option.value === "finalReport").isGraded;
          isReviewed = submissionOptions.find((option) => option.value === "finalReport").isReviewed;
          break;
        case "finalExam":
          name = "מבחן סוף";
          isGraded = submissionOptions.find((option) => option.value === "finalExam").isGraded;
          isReviewed = submissionOptions.find((option) => option.value === "finalExam").isReviewed;
          break;
        default: // other...
          name = values.submissionName || "ללא שם";
          isGraded = Array.isArray(values.submissionChecklist)
            ? values.submissionChecklist.includes("isGraded")
            : false;
          isReviewed = Array.isArray(values.submissionChecklist)
            ? values.submissionChecklist.includes("isReviewed")
            : false;
          break;
      }
      console.log(isReviewed, isGraded);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/create`,
        {
          name: name,
          submissionDate: values.submissionDate,
          submissionInfo: values.submissionInfo,
          isGraded: isGraded,
          isReviewed: isReviewed
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

  const handleOkEdit = async (values) => {
    console.log(values);
    console.log("sending edit request");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/update-submission-information`,
        {
          submissionName: values.submissionName,
          submissionDate: values.submissionDate,
          submissionInfo: values.submissionInfo
        },
        {
          withCredentials: true
        }
      );
      message.open({
        type: "success",
        content: "הגשה עודכנה בהצלחה"
      });
    } catch (error) {
      console.error("Error updating submission:", error);
    }
  };

  const handleOkSpecific = async (values) => {
    try {
      let name = "";
      let isGraded = false;
      let isReviewed = false;

      switch (submissionType) {
        case "proposalReport":
          name = "דוח הצעה";
          isGraded = submissionOptions.find((option) => option.value === "proposalReport").isGraded;
          isReviewed = submissionOptions.find((option) => option.value === "proposalReport").isReviewed;
          break;
        case "alphaReport":
          name = "דוח אלפה";
          isGraded = submissionOptions.find((option) => option.value === "alphaReport").isGraded;
          isReviewed = submissionOptions.find((option) => option.value === "alphaReport").isReviewed;
          break;
        case "finalReport":
          name = "דוח סופי";
          isGraded = submissionOptions.find((option) => option.value === "finalReport").isGraded;
          isReviewed = submissionOptions.find((option) => option.value === "finalReport").isReviewed;
          break;
        case "finalExam":
          name = "מבחן סוף";
          isGraded = submissionOptions.find((option) => option.value === "finalExam").isGraded;
          isReviewed = submissionOptions.find((option) => option.value === "finalExam").isReviewed;
          break;
        default: // other...
          name = values.submissionName || "ללא שם";
          isGraded = Array.isArray(values.submissionChecklist)
            ? values.submissionChecklist.includes("isGraded")
            : false;
          isReviewed = Array.isArray(values.submissionChecklist)
            ? values.submissionChecklist.includes("isReviewed")
            : false;
          break;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/create-specific`,
        {
          name: name,
          submissionDate: values.submissionDate,
          submissionInfo: values.submissionInfo,
          projects: values.projects,
          isGraded: isGraded,
          isReviewed: isReviewed
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
    if (allSubmissions) {
      formAll.resetFields();
      setAllSubmissions(false);
    }

    if (specificSubmission) {
      formSpecific.resetFields();
      setSpecificSubmission(false);
    }

    if (copyJudges) {
      formJudges.resetFields();
      setCopyJudges(false);
    }

    if (gradeFormOpen) {
      gradeForm.resetFields();
      setGradeFormOpen(false);
      setGradeToOverride(null);
    }

    setSubmissionType(null);
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

  const onOkHandlerEdit = () => {
    editSubmission
      .validateFields()
      .then((values) => {
        handleOkEdit(values);
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
              const isLate = new Date(sub.submissionDate) < new Date(sub.uploadDate);
              return (
                <Col
                  key={index}
                  span={colSpan}
                  className="table-col"
                  onClick={() => setSubmissionInfo({ project: record, submission: sub })}>
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
                    <Badge
                      color={sub.submitted ? "green" : "orange"}
                      text={sub.submitted ? `הוגש${isLate ? " באיחור" : ""}` : "מחכה להגשה"}
                    />
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

  const gradeColumns = [
    {
      title: "שופט",
      dataIndex: "judgeName",
      key: "judgeName"
    },
    {
      title: "ציון",
      dataIndex: "grade",
      key: "grade",
      render: (text, record) => (
        <Space>
          {record.grade !== null ? record.grade : "טרם נבדק"}
          {record.grade !== null && (
            <EditOutlined
              onClick={(e) => {
                e.stopPropagation();
                setGradeToOverride(record);
                setGradeFormOpen(true);
                gradeForm.setFieldsValue({
                  oldGrade: record.grade,
                  newGrade: record.grade
                });
              }}
            />
          )}
        </Space>
      )
    },
    {
      title: "הערות",
      dataIndex: "comments",
      key: "comments",
      render: (text) => text || "אין הערות"
    }
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
        <Button type="primary" className="action-button-end" onClick={() => setEditSubmissions(true)}>
          עריכת פרטי הגשה
        </Button>
      </div>
      <Table columns={columns} dataSource={submissionData} />
      <Modal
        title="פרטי הגשה"
        open={submissionInfo !== null}
        onCancel={() => setSubmissionInfo(null)}
        footer={[
          <Button key="close" onClick={() => setSubmissionInfo(null)}>
            סגור
          </Button>
        ]}
        width={800}>
        {submissionInfo && (
          <div className="submission-info-modal">
            <div className="submission-header">
              <h2>{submissionInfo.project.title}</h2>
              <Badge
                status={submissionInfo.submission.submitted ? "success" : "warning"}
                text={submissionInfo.submission.submitted ? "הוגש" : "ממתין להגשה"}
              />
            </div>

            <div className="submission-details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="detail-item">
                    <strong>סוג הגשה:</strong> {submissionInfo.submission.name}
                  </div>
                  <div className="detail-item">
                    <strong>תאריך הגשה:</strong>{" "}
                    {new Date(submissionInfo.submission.submissionDate).toLocaleString("he-IL")}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <strong>סטטוס הגשה:</strong> {submissionInfo.submission.submitted ? "הוגש" : "ממתין להגשה"}
                  </div>
                  <div className="detail-item">
                    <strong>סטטוס בדיקה:</strong>{" "}
                    {submissionInfo.submission.submitted &&
                    submissionInfo.submission.grades.some((grade) => grade.grade === null)
                      ? "ממתין לבדיקה"
                      : submissionInfo.submission.submitted
                      ? "נבדק"
                      : "לא הוגש"}
                  </div>
                </Col>
              </Row>
            </div>

            <div className="submission-grades">
              <h3>ציונים ומשובים</h3>
              <Table
                columns={gradeColumns}
                dataSource={submissionInfo.submission.grades.map((grade, index) => ({
                  key: grade._id || index,
                  judgeName: grade.judgeName,
                  grade: grade.grade,
                  comments: grade.comments
                }))}
                pagination={false}
              />
            </div>

            {submissionInfo.submission.grades.length > 0 && (
              <div className="grade-summary">
                <h3>סיכום ציונים</h3>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic
                      title="ממוצע"
                      value={
                        submissionInfo.submission.grades
                          .filter((grade) => grade.grade !== null)
                          .reduce((acc, curr) => acc + curr.grade, 0) /
                        submissionInfo.submission.grades.filter((grade) => grade.grade !== null).length
                      }
                      precision={1}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="ציון מקסימלי"
                      value={Math.max(
                        ...submissionInfo.submission.grades
                          .filter((grade) => grade.grade !== null)
                          .map((grade) => grade.grade)
                      )}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="ציון מינימלי"
                      value={Math.min(
                        ...submissionInfo.submission.grades
                          .filter((grade) => grade.grade !== null)
                          .map((grade) => grade.grade)
                      )}
                    />
                  </Col>
                </Row>
              </div>
            )}
          </div>
        )}
      </Modal>
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
        title="עריכת פרטי הגשה"
        open={editSubmissions}
        okText="ערוך"
        cancelText="סגור"
        onOk={() => onOkHandlerEdit()}
        onCancel={() => setEditSubmissions(false)}>
        <Form layout="vertical" form={editSubmission}>
          <Form.Item
            label="שם ההגשה"
            name="submissionName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור הגשת מקור"
              }
            ]}>
            <Select placeholder="בחר הגשת מקור">
              {submissionNames.map((submission, index) => (
                <Option key={index} value={submission}>
                  {submission}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="תאריך הגשה"
            name="submissionDate"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין תאריך הגשה"
              },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve(); // Skip validation if no value is selected (handled by `required`)
                  }
                  // Check if the selected date is in the past
                  const now = dayjs(); // Or dayjs(), if you're using dayjs
                  if (value.isBefore(now)) {
                    return Promise.reject(new Error("לא ניתן לבחור תאריך ושעה שעברו"));
                  }
                  return Promise.resolve();
                }
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
          <Form.Item label="פרטים נוספים" name="submissionInfo">
            <TextArea rows={4} />
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

          <Form.Item label="פרטים נוספים" name="submissionInfo">
            <TextArea rows={4} />
          </Form.Item>

          {submissionType === "other" && (
            <Form.Item name="submissionChecklist">
              <Checkbox.Group>
                <Checkbox value="isGraded">מתן ציון</Checkbox>
                <Checkbox value="isReviewed">מתן משוב</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          )}
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

          <Form.Item label="פרטים נוספים" name="submissionInfo">
            <TextArea rows={4} />
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

          {submissionType === "other" && (
            <Form.Item>
              <Checkbox.Group>
                <Checkbox value="isGraded">מתן ציון</Checkbox>
                <Checkbox value="isReviewed">מתן משוב</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Submissions;
