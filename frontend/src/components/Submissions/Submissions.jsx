import React, { useEffect, useState, useRef, useContext } from "react";
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
  Checkbox,
  Button,
  InputNumber,
  Badge,
  Space,
  Divider,
  Tooltip,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/he_IL"; // Import Hebrew locale
import { getColumnSearchProps as getColumnSearchPropsUtil } from "../../utils/tableUtils";
import { NotificationsContext } from "../../context/NotificationsContext";

const Submissions = () => {
  const navigate = useNavigate();
  const { TextArea } = Input;
  const { Option } = Select;
  const { fetchNotifications } = useContext(NotificationsContext);
  const [formAll] = Form.useForm();
  const [formJudges] = Form.useForm();
  const [editSubmission] = Form.useForm();
  const [editSpecificSubmission] = Form.useForm();
  const [formSpecific] = Form.useForm();
  const [gradeForm] = Form.useForm();
  const [deleteSubmissionsForm] = Form.useForm();
  const [allSubmissions, setAllSubmissions] = useState(false);
  const [specificSubmission, setSpecificSubmission] = useState(false);
  const [editSubmissions, setEditSubmissions] = useState(false);
  const [copyJudges, setCopyJudges] = useState(false);
  const [gradeFormOpen, setGradeFormOpen] = useState(false);
  const [gradeToOverride, setGradeToOverride] = useState(null);
  const [submissionData, setSubmissionData] = useState([]);
  const [submissionDetails, setSubmissionDetails] = useState([]);
  const [submissionType, setSubmissionType] = useState(null);
  const [showReview, setShowReview] = useState(null);
  const [deleteAllSubmissions, setDeleteAllSubmissions] = useState(false);
  const [deleteAllSubmissionsConfirm, setDeleteAllSubmissionsConfirm] = useState(null);
  const [deleteSubmission, setDeleteSubmission] = useState(null);
  const [projects, setProjects] = useState([]);
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [specificSubmissionInfo, setSpecificSubmissionInfo] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [filters, setSelectedFilters] = useState({
    submitted: false,
    notSubmitted: false,
    waitingCheck: false,
    waitingPublish: false,
    finalGrade: false,
  });

  const fetchActiveProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/get-active-projects`, {
        withCredentials: true,
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
          withCredentials: true,
        }
      );

      response.data.map((project) => {
        project.submissions.map((submission) => {
          submission.isLate = new Date(submission.submissionDate) < new Date(submission.uploadDate);
          return submission;
        });
        return project;
      });
      setSubmissionData(response.data);
      const submissionDetails = [
        ...new Map(
          response.data
            .flatMap((submission) =>
              submission.submissions.map((sub) => ({
                name: sub.name,
                info: sub.info,
              }))
            )
            .map((sub) => [
              sub.name, // Use the name as key
              sub, // Keep the object with name and info as the value
            ])
        ).values(),
      ];

      const filteredSubmissionDetails = submissionDetails.map((submission, index, self) => {
        const existing = self.find(
          (otherSubmission) => otherSubmission.name === submission.name && otherSubmission !== submission
        );

        if (!existing) return submission;

        // If both have info, select the one with the longer info
        if (submission.info && existing.info) {
          return submission.info.length > existing.info.length ? submission : existing;
        }

        // If one has info, return the one with info
        return submission.info ? submission : existing;
      });

      setSubmissionDetails(filteredSubmissionDetails);
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
          destinationSubmission: values.destinationSubmission,
        },
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "success",
        content: "העתקת השופטים הושלמה בהצלחה",
      });
    } catch (error) {
      console.error("Error copying judges:", error);
    } finally {
      formJudges.resetFields();
      setCopyJudges(false);
      fetchSubmissions();
    }
  };

  const overrideGrade = async (values) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/grade/update/${gradeToOverride.key}`,
        {
          grade: values.newGrade,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error overriding grade:", error);
    }
  };

  const handleDeleteSpecific = async (values) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/delete-specific-submission/${values.submission.key}`,
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "success",
        content: "הגשה נמחקה בהצלחה",
      });
      setDeleteSubmission(null);
      setSubmissionInfo(null);
    } catch (error) {
      console.error("Error deleting submission:", error);
    } finally {
      fetchSubmissions();
    }
  };
  const handleOkDelete = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/delete-active-submissions`,
        {
          submissionName: values.submissionName,
        },
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "info",
        content: "הגשות נמחקו בהצלחה",
      });
      setDeleteAllSubmissionsConfirm(null);
      setDeleteAllSubmissions(false);
    } catch (error) {
      console.error("Error deleting submissions:", error);
    } finally {
      fetchSubmissions();
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
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/create`,
        {
          name: name,
          submissionDate: values.submissionDate,
          submissionInfo: values.submissionInfo,
          isGraded: isGraded,
          isReviewed: isReviewed,
        },
        {
          withCredentials: true,
        }
      );
      if (submissionDetails.some((submission) => submission.name === name)) {
        message.open({
          type: "warning",
          content: "הגשה עם שם זה כבר קיימת לחלק מהפרויקטים",
        });
      }
      message.open({
        type: "success",
        content: "הגשה נפתחה בהצלחה",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      formAll.resetFields();
      setAllSubmissions(false);
      fetchSubmissions();
    }
  };

  const handleOkEditSpecific = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/update-specific-submission/${specificSubmissionInfo.submission.key}`,
        {
          name: values.submissionName,
          submissionDate: values.submissionDate,
          isGraded: Array.isArray(values.submissionChecklist) ? values.submissionChecklist.includes("isGraded") : false,
          isReviewed: Array.isArray(values.submissionChecklist)
            ? values.submissionChecklist.includes("isReviewed")
            : false,
        },
        {
          withCredentials: true,
        }
      );
      message.info(`הגשה ${specificSubmissionInfo.submission.name} עודכנה בהצלחה`);
    } catch (error) {
      console.error("Error updating submission:", error);
      message.error("שגיאה בעדכון ההגשה");
    } finally {
      editSpecificSubmission.resetFields();
      setSpecificSubmissionInfo(null);
      fetchSubmissions();
    }
  };

  const handleOkEdit = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/update-submission-information`,
        {
          submissionOldName: values.submissionOldName,
          SubmissionName: values.SubmissionName,
          submissionDate: values.submissionDate,
          submissionInfo: values.submissionInfo,
        },
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "success",
        content: "הגשה עודכנה בהצלחה",
      });
    } catch (error) {
      console.error("Error updating submission:", error);
    } finally {
      editSubmission.resetFields();
      setEditSubmissions(false);
      fetchSubmissions();
    }
  };

  const handleOkSpecific = async (values) => {
    try {
      let name = "";
      let isGraded = false;
      let isReviewed = false;

      switch (values.submissionType) {
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
          isReviewed: isReviewed,
        },
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "success",
        content: "הגשה נפתחה בהצלחה",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      formSpecific.resetFields();
      setSpecificSubmission(false);
      fetchSubmissions();
    }
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

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) =>
    getColumnSearchPropsUtil(dataIndex, searchInput, handleSearch, handleReset, searchText);

  const columns = [
    {
      title: "שם הפרויקט",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
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
              searchWords={[searchText]}
              autoEscape
              textToHighlight={displayText}
            />
          </a>
        );
      },
      width: "25%",
    },
    {
      title: "הגשות",
      key: "submissions",
      render: (_, record) => {
        // Ensure submissions array exists
        const submissions = record.submissions || [];
        return (
          <div className="table-row">
            {submissions.map((sub, index) => {
              const grades = sub.grades || [];
              const waitingCheck =
                (sub.isGraded && grades.some((grade) => grade.grade === null)) ||
                (sub.isReviewed &&
                  sub.editable === false &&
                  grades.some((grade) => grade.videoQuality === undefined || grade.videoQuality === undefined));
              return (
                <div className="table-col-div" key={index}>
                  <div
                    className="table-col"
                    onClick={() => {
                      setSubmissionInfo({ project: record, submission: sub });
                    }}>
                    <div className="submission-title">
                      {(sub.name.length > 25 ? `${sub.name.substring(0, 25)}...` : sub.name) || ""}
                    </div>
                    <span className="submission-date-time">
                      <strong>הגשה עד:</strong>{" "}
                      {sub.submissionDate
                        ? new Date(sub.submissionDate).toLocaleString("he-IL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                    <div className="table-col-info">
                      <Badge
                        color={sub.submitted ? (sub.isLate ? "darkgreen" : "green") : "orange"}
                        text={
                          sub.submitted
                            ? `הוגש${
                                sub.isLate
                                  ? ` באיחור - ${Math.ceil(
                                      (new Date(sub.uploadDate) - new Date(sub.submissionDate)) / (1000 * 60 * 60 * 24)
                                    )} ימים`
                                  : ""
                              }`
                            : "ממתין להגשה"
                        }
                      />
                      <div>
                        {waitingCheck && sub.submitted ? (
                          <Badge color="blue" text="מחכה לבדיקה" />
                        ) : !waitingCheck && sub.submitted && (sub.isGraded || sub.isReviewed) ? (
                          <Badge color="purple" text="מחכה לפרסום" />
                        ) : (
                          sub.editable === false &&
                          sub.finalGrade !== null &&
                          sub.isGraded && (
                            <Badge
                              color="pink"
                              text={`ציון סופי: ${sub.overridden?.newGrade ? sub.overridden.newGrade : sub.finalGrade}`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  {index !== submissions.length - 1 && submissions.length > 1 && (
                    <Divider type="vertical" style={{ height: "100%" }} />
                  )}
                </div>
              );
            })}
          </div>
        );
      },
      width: "75%",
      filters: [
        { text: "הוגש", value: "submitted" },
        { text: "לא הוגש", value: "notSubmitted" },
        { text: "מחכה לבדיקה", value: "waitingCheck" },
        { text: "מחכה לפרסום", value: "waitingPublish" },
        { text: "פורסם", value: "finalGrade" },
      ],
      onFilter: (value) => {
        setSelectedFilters((prevFilters) => ({
          ...prevFilters,
          [value]: !prevFilters[value],
        }));
      },
    },
  ];

  const submissionOptions = [
    { label: "דוח הצעה", value: "proposalReport", isGraded: false, isReviewed: false },
    { label: "דוח אלפה", value: "alphaReport", isGraded: true, isReviewed: true },
    { label: "דוח סופי", value: "finalReport", isGraded: false, isReviewed: true },
    { label: "מבחן סוף", value: "finalExam", isGraded: true, isReviewed: false },
    { label: "אחר", value: "other" },
  ];

  const gradeColumns = [
    {
      title: "שופט",
      dataIndex: "judgeName",
      key: "judgeName",
    },
    {
      title: "ציון",
      dataIndex: "grade",
      key: "grade",
      render: (text, record) => (
        <Space className="grade-table">{record.grade !== null ? record.grade : "טרם נבדק"}</Space>
      ),
    },
    {
      title: "משוב",
      dataIndex: "comments",
      key: "comments",
      render: (text, record) => (
        <Space>
          {record.grade !== null ? (
            submissionInfo.submission.isReviewed ? (
              <a href="#">
                <Tooltip title="לצפיה במשוב">
                  <EyeOutlined style={{ fontSize: "2.5rem" }} onClick={() => setShowReview(record)} />
                </Tooltip>
              </a>
            ) : (
              <span>הגשה ללא משוב</span>
            )
          ) : (
            "טרם נבדק"
          )}
        </Space>
      ),
    },
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
        {/* work in progress, doesn't work */}
        <Button type="primary" onClick={() => setCopyJudges(true)}>
          העתקת שופטים
        </Button>
        <div className="action-buttons-end">
          <Button type="primary" onClick={() => setEditSubmissions(true)}>
            עריכת הגשות
          </Button>
          <Button color="danger" variant="solid" onClick={() => setDeleteAllSubmissions(true)}>
            מחיקת הגשות
          </Button>
        </div>
      </div>
      <Table columns={columns} dataSource={submissionData} />
      <Modal
        title={`האם הינך בטוח שברצונך למחוק את ההגשה ${deleteAllSubmissionsConfirm?.submissionName} לכולם?`}
        open={deleteAllSubmissionsConfirm !== null}
        okText="מחק"
        cancelText="ביטול"
        onOk={() => {
          handleOkDelete(deleteAllSubmissionsConfirm);
        }}
        onCancel={() => setDeleteAllSubmissionsConfirm(null)}></Modal>
      <Modal
        title="מחיקת הגשות"
        open={deleteAllSubmissions}
        cancelText="בטל"
        okText="אשר מחיקה"
        okButtonProps={{ danger: true }}
        onCancel={() => {
          setDeleteAllSubmissions(false);
          deleteSubmissionsForm.resetFields();
        }}
        onOk={() => {
          deleteSubmissionsForm
            .validateFields()
            .then((values) => {
              setDeleteAllSubmissionsConfirm(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}>
        <Form layout="vertical" form={deleteSubmissionsForm}>
          <p>
            <span style={{ color: "red", fontWeight: 600 }}>שים לב</span> - המחיקה מוחקת את כל ההגשות עם שם זה
          </p>
          <Form.Item
            label="בחר הגשה"
            name="submissionName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור הגשה",
              },
            ]}>
            <Select placeholder="בחר הגשה">
              {submissionDetails.map((submission, index) => (
                <Option key={index} value={submission.name}>
                  {submission.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="מחיקת הגשה"
        open={deleteSubmission != null}
        cancelText="בטל"
        okText="מחיקה"
        okButtonProps={{ danger: true }}
        onCancel={() => setDeleteSubmission(null)}
        onOk={() => {
          handleDeleteSpecific(deleteSubmission);
        }}>
        <p>
          <span style={{ color: "red", fontWeight: 600 }}>שים לב</span> - הינך מוחק את ההגשה{" "}
          <span style={{ backgroundColor: "#e4eafc", padding: "1px 2px", borderRadius: "5px" }}>
            {deleteSubmission?.submission.name}
          </span>
          <br />
          עבור הפרויקט -
          <span style={{ backgroundColor: "#e4eafc", padding: "1px 2px", borderRadius: "5px" }}>
            {deleteSubmission?.project.title}
          </span>
        </p>
      </Modal>
      <Modal
        title={`עריכת פרטי הגשה`}
        open={specificSubmissionInfo !== null}
        cancelText="סגור"
        okText="ערוך"
        onCancel={() => {
          editSpecificSubmission.resetFields();
          setSpecificSubmissionInfo(null);
        }}
        onOk={() => {
          editSpecificSubmission
            .validateFields()
            .then((values) => {
              handleOkEditSpecific(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}>
        <Form layout="vertical" form={editSpecificSubmission}>
          <Form.Item label="שם הפרויקט" name="projectName">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="שם ההגשה"
            name="submissionName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין שם ההגשה",
              },
            ]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="תאריך הגשה"
            name="submissionDate"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין תאריך הגשה",
              },
            ]}>
            <DatePicker
              className="date-picker"
              locale={locale} // Add the Hebrew locale here
              direction="rtl"
              showTime={{
                format: "HH:mm",
              }}
              format="DD-MM-YYYY HH:mm"
            />
          </Form.Item>
          <Form.Item name="submissionChecklist">
            <Checkbox.Group>
              <Checkbox value="isGraded">מתן ציון</Checkbox>
              <Checkbox value="isReviewed">מתן משוב</Checkbox>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={`פרטי ההגשה עבור: ${submissionInfo?.project.title} - ${submissionInfo?.submission.name}`}
        open={submissionInfo !== null}
        onCancel={() => setSubmissionInfo(null)}
        footer={
          <div className="footer-submission-actions">
            <Tooltip title="מחיקת הגשה">
              <DeleteOutlined className="delete-icon" onClick={() => setDeleteSubmission(submissionInfo)} />
            </Tooltip>
            <Button type="primary" key="back" onClick={() => setSubmissionInfo(null)}>
              סגור
            </Button>
          </div>
        }
        width={800}>
        {submissionInfo && (
          <div className="submission-info-modal">
            <div className="submission-header">
              <div className="header-title">
                <h2>{submissionInfo.project.title}</h2>
                <Tooltip
                  title={`עריכת פרטי הגשה עבור ${submissionInfo.submission.name} של ${submissionInfo.project.title}`}>
                  <a href="#">
                    <EditOutlined
                      className="edit-icon"
                      onClick={() => {
                        editSpecificSubmission.setFieldsValue({
                          projectName: submissionInfo.project.title,
                          submissionName: submissionInfo.submission.name,
                          submissionDate: dayjs(submissionInfo.submission.submissionDate),
                          submissionChecklist: [
                            submissionInfo.submission.isGraded ? "isGraded" : null,
                            submissionInfo.submission.isReviewed ? "isReviewed" : null,
                          ].filter((value) => value !== null),
                        });
                        setSpecificSubmissionInfo(submissionInfo);
                        setSubmissionInfo(null);
                      }}
                    />
                  </a>
                </Tooltip>
              </div>
            </div>
            <div className="submission-details">
              <div className="detail-item">
                <div className="detail-item-header">שם ההגשה:</div>
                <div className="detail-item-content">{submissionInfo.submission.name}</div>
              </div>
              {submissionInfo.submission.info && (
                <div className="detail-item">
                  <div className="detail-item-header">הנחיות הגשה:</div>
                  <div className="detail-item-content">{submissionInfo.submission.info}</div>
                </div>
              )}
              <div className="detail-item">
                <div className="detail-item-header">סטטוס ההגשה:</div>
                <div className="detail-item-content">
                  <Badge
                    color={
                      submissionInfo.submission.submitted
                        ? submissionInfo.submission.isLate
                          ? "darkgreen"
                          : "green"
                        : "orange"
                    }
                    text={
                      submissionInfo.submission.submitted
                        ? `הוגש${
                            submissionInfo.submission.isLate
                              ? ` באיחור - ${Math.ceil(
                                  (new Date(submissionInfo.submission.uploadDate) -
                                    new Date(submissionInfo.submission.submissionDate)) /
                                    (1000 * 60 * 60 * 24)
                                )} ימים`
                              : ""
                          }`
                        : "ממתין להגשה"
                    }
                  />
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-item-header">סטטוס בדיקה:</div>
                <div className="detail-item-content">
                  {submissionInfo.submission.submitted &&
                  submissionInfo.submission.grades.some((grade) => grade.grade === null)
                    ? "ממתין לבדיקה"
                    : submissionInfo.submission.submitted
                    ? "נבדק"
                    : "לא הוגש"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-item-header">תאריך הגשה אחרון:</div>
                <div className="detail-item-content">
                  {new Date(submissionInfo.submission.submissionDate).toLocaleString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-item-header">הוגש ב:</div>
                <div className="detail-item-content">
                  {submissionInfo.submission.uploadDate
                    ? new Date(submissionInfo.submission?.uploadDate).toLocaleString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "ממתין להגשה"}
                </div>
              </div>
              {submissionInfo.submission.finalGrade && (
                <div className="detail-item">
                  <div className="detail-item-header">ציון סופי</div>
                  <div className="detail-item-content">
                    {submissionInfo.submission?.overridden?.newGrade
                      ? submissionInfo.submission?.overridden?.newGrade
                      : submissionInfo?.submission?.finalGrade}
                  </div>
                </div>
              )}
            </div>

            <div className="submission-grades">
              <h3>ציונים ומשובים</h3>
              <Table
                columns={gradeColumns}
                dataSource={submissionInfo?.submission?.grades.map((grade, index) => ({
                  ...grade,
                  key: grade._id || index,
                }))}
                pagination={false}
              />
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title={`משוב עבור הגשה ${submissionInfo?.submission?.name} של ${submissionInfo?.project?.title}`}
        open={showReview !== null}
        cancelText="סגור"
        onCancel={() => setShowReview(null)}
        okButtonProps={{ style: { display: "none" } }}>
        <div className="details-title">
          <h3>{submissionInfo?.project?.title}</h3>
          <p>הגשה - {submissionInfo?.submission?.name}</p>
          <p>נבדק ע"י: {showReview?.judgeName}</p>
        </div>
        <div className="details-grade">
          {submissionInfo?.submission?.isGraded && (
            <>
              <span>ציון:</span> <p>{showReview?.grade ? showReview?.grade : "לא ניתן ציון"}</p>
            </>
          )}
        </div>
        {submissionInfo?.submission?.isReviewed && (
          <>
            <p>
              <strong>איכות הוידאו:</strong> {showReview?.videoQuality}
            </p>
            <p>
              <strong>איכות העבודה:</strong> {showReview?.workQuality}
            </p>
            <p>
              <strong>איכות הכתיבה:</strong> {showReview?.writingQuality}
            </p>
            {submissionDetails?.commits && (
              <p>
                <strong>מספר הקומיטים:</strong> {showReview?.commits}
              </p>
            )}
            {showReview?.journalActive && (
              <p>
                <strong>האם היומן פעיל:</strong>{" "}
                {showReview?.journalActive === "yes" ? "כן" : showReview?.journalActive === "no" ? "לא" : ""}
              </p>
            )}
          </>
        )}
      </Modal>
      <Modal
        title="שנה ציון"
        open={gradeFormOpen}
        okText="ערוך ציון"
        cancelText="סגור"
        onOk={() => onOkHandlerGrade()}
        onCancel={() => {
          gradeForm.resetFields();
          setGradeFormOpen(false);
          setGradeToOverride(null);
        }}>
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
                message: "חובה להזין ציון בין (0) ל (100)",
              },
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
          <p>
            <span style={{ color: "red", fontWeight: 600 }}>שים לב</span> - העריכה משנה את כל ההגשות הזמינות עם שם זה
          </p>
          <Form.Item
            label="בחירת הגשה"
            name="submissionOldName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור הגשת מקור",
              },
            ]}>
            <Select
              placeholder="בחר הגשה"
              onChange={(value) => {
                // Find the selected submission details
                const selectedSubmission = submissionDetails.find((submission) => submission.name === value);

                // Set form fields with the selected submission details
                editSubmission.setFieldsValue({
                  SubmissionName: value,
                  submissionInfo: selectedSubmission?.info || "", // Populate `submissionInfo` if available
                });
              }}>
              {submissionDetails.map((submission, index) => (
                <Option key={index} value={submission.name}>
                  {submission.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="שם הגשה חדש"
            name="SubmissionName"
            hasFeedback
            rules={[{ required: true, message: "חובה להזין שם הגשה" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="תאריך הגשה"
            name="submissionDate"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה להזין תאריך הגשה",
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
                },
              },
            ]}>
            <DatePicker
              className="date-picker"
              locale={locale} // Add the Hebrew locale here
              direction="rtl"
              showTime={{
                format: "HH:mm",
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
        onCancel={() => {
          formJudges.resetFields();
          setCopyJudges(false);
        }}>
        <Form layout="vertical" form={formJudges}>
          <Form.Item
            label="הגשת מקור"
            name="sourceSubmission"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור הגשת מקור",
              },
            ]}>
            <Select placeholder="בחר הגשת מקור">
              {submissionDetails.map((submission, index) => (
                <Option key={index} value={submission.name}>
                  {submission.name}
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
                message: "חובה לבחור הגשת יעד",
              },
            ]}>
            <Select placeholder="בחר הגשת יעד">
              {submissionDetails.map((submission, index) => (
                <Option key={index} value={submission.name}>
                  {submission.name}
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
        onCancel={() => {
          formAll.resetFields();
          setAllSubmissions(false);
          setSubmissionType(null);
        }}
        onOk={onOkHandlerAll}>
        <Form
          layout="vertical"
          form={formAll} // Ensure this line is present
        >
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
                  message: "חובה להזין שם ההגשה",
                },
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
                message: "חובה להזין תאריך הגשה",
              },
            ]}>
            <DatePicker
              className="date-picker"
              locale={locale} // Add the Hebrew locale here
              direction="rtl"
              showTime={{
                format: "HH:mm",
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
        onCancel={() => {
          formSpecific.resetFields();
          setSpecificSubmission(false);
          setSubmissionType(null);
        }}>
        <Form layout="vertical" form={formSpecific}>
          {/* סוג הגשה */}
          <Form.Item label="סוג הגשה" name="submissionType" hasFeedback>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={submissionOptions}
              onChange={(e) => {
                const selectedName = submissionOptions.find((option) => option.value === e.target.value).value;
                setSubmissionType(selectedName);
                const selectedSubmission = submissionDetails.find((submission) => submission.name === selectedName);

                // If a submission is found, update additional state or handle accordingly
                if (selectedSubmission) {
                  formSpecific.setFieldsValue({
                    submissionInfo: selectedSubmission.info,
                  });
                }
              }}
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
                  message: "חובה להזין שם ההגשה",
                },
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
                message: "חובה להזין תאריך הגשה",
              },
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

          {/* פרויקטים */}
          <Form.Item
            label="פרויקטים"
            name="projects"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור פרויקטים",
              },
            ]}>
            <Select mode="multiple" placeholder="בחר פרויקטים">
              {projects.map((project) => (
                <Select.Option key={project._id} value={project._id}>
                  {project.title}
                </Select.Option>
              ))}
            </Select>
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
    </div>
  );
};

export default Submissions;
