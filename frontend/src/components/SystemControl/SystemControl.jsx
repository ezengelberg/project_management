import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SystemControl.scss";
import { Button, Switch, Form, Input, InputNumber, Table, Typography, message, Tooltip, Modal } from "antd";
import { EditOutlined, SaveOutlined, StopOutlined } from "@ant-design/icons";

const SystemControl = () => {
  const [createProject, setCreateProject] = useState(true);
  const [registerToProjects, setRegisterToProjects] = useState(true);
  const [manageStudents, setManageStudents] = useState(true);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [letterToNumber, setLetterToNumber] = useState({
    "A+": null,
    A: null,
    "A-": null,
    "B+": null,
    B: null,
    "B-": null,
    "C+": null,
    C: null,
    "C-": null,
    "D+": null,
    D: null,
    "D-": null,
    E: null,
    F: null,
  });
  const [submissions, setSubmissions] = useState([]);
  const [submissionGroups, setSubmissionGroups] = useState({});
  const [groupsData, setGroupsData] = useState([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [currentSubmissionName, setCurrentSubmissionName] = useState("");
  const [currentGroup, setCurrentGroup] = useState("");
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

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/grade/get-all-numeric-values`, {
        withCredentials: true,
      });
      setGroupsData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching grades:", error);
      message.error("שגיאה בטעינת הציונים");
      setLoading(false);
    }
  };

  const fetchConfigurations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/config/get-config`, {
        withCredentials: true,
      });
      console.log(response.data);
      setCreateProject(response.data.projectCreation);
      setRegisterToProjects(response.data.projectRegistration);
      setManageStudents(response.data.projectStudentManage);
    } catch (error) {
      console.error("Error fetching configurations:", error);
      message.error("שגיאה בטעינת ההגדרות");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchGrades();
    fetchConfigurations();
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-all`, {
          withCredentials: true,
        });
        setSubmissions(response.data);
        const groups = response.data.reduce((acc, submission) => {
          if (!acc[submission.name]) {
            acc[submission.name] = [];
          }
          acc[submission.name].push(submission);
          return acc;
        }, {});
        const filteredGroups = Object.keys(groups).reduce((acc, submissionName) => {
          const group = groups[submissionName];
          const checkForGraded = group.filter((submission) => submission.isGraded || submission.isReviewed);
          const allGroups = checkForGraded.every((submission) =>
            submission.gradesDetailed.every((grade) => grade.numericGrade !== undefined && grade.numericGrade !== null),
          );
          if (!allGroups) {
            acc[submissionName] = {
              submissions: group,
              status: group.some((submission) => submission.isGraded) ? "graded" : "reviewed",
            };
          }
          return acc;
        }, {});
        setSubmissionGroups(filteredGroups);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        message.error("שגיאה בטעינת ההגשות");
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const isEditing = (record) => record.key === editingKey;

  const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode = inputType === "number" ? <InputNumber min={0} max={100} /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: "שדה חובה",
              },
            ]}>
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
    form.resetFields();
  };

  const save = async (name) => {
    try {
      const row = await form.validateFields();
      const updatedValues = { ...row };
      delete updatedValues.name;

      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/grade/update-numeric-values`,
        { updatedValues, name },
        { withCredentials: true },
      );
      message.success("הציון עודכן בהצלחה");
      fetchGrades();
      setEditingKey("");
    } catch (error) {
      console.error("Error updating grade:", error);
      message.error("שגיאה בעדכון הציון");
    }
  };

  const publishGradesForSubmissions = async (submissionName, group) => {
    setLoading(true);
    setConfirmModalVisible(false);
    const groupSubmissions = submissionGroups[submissionName].submissions.filter((submission) => submission.editable);

    if (groupSubmissions[0].isGraded) {
      const gradedSubmissions = groupSubmissions.filter(
        (submission) =>
          submission.isGraded === true &&
          submission.gradesDetailed.some(
            (grade) => grade.editable === true && grade.grade !== null && grade.grade !== undefined,
          ),
      );
      if (gradedSubmissions.length === 0) {
        setLoading(false);
        return message.info("עדיין לא ניתן לפרסם כי אין ציונים");
      }
    }

    if (groupSubmissions[0].isReviewed) {
      const reviewedSubmissions = groupSubmissions.filter(
        (submission) =>
          submission.isReviewed === true &&
          submission.gradesDetailed.some(
            (grade) => grade.editable === true && grade.videoQuality !== undefined && grade.videoQuality !== null,
          ),
      );
      if (reviewedSubmissions.length === 0) {
        setLoading(false);
        return message.info("עדיין לא ניתן לפרסם כי אין ביקורות");
      }
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/grade/publish-grades`,
        { submissionName, group },
        { withCredentials: true },
      );
      message.success("הציונים/ביקורות הזמינים פורסמו בהצלחה");
    } catch (error) {
      console.error("Error ending judging period:", error);
      if (error.response.status === 400) {
        message.error(`חסר ערך נומרי עבור הציון ${error.response.data.grade}`);
      } else {
        message.error("שגיאה בפרסום הציונים");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkZeroGrades = (submissionName, group) => {
    const groupSubmissions = submissionGroups[submissionName].submissions.filter((submission) => submission.editable);
    const hasZeroGrade = groupSubmissions.some((submission) =>
      submission.numericValues.some((grade) => grade.value === 0),
    );

    if (hasZeroGrade) {
      setCurrentSubmissionName(submissionName);
      setCurrentGroup(group);
      setConfirmModalVisible(true);
      setLoading(false);
      return;
    }
    publishGradesForSubmissions(submissionName, group);
  };

  const columns = [
    {
      title: "הגשה",
      dataIndex: "name",
      key: "name",
      fixed: windowSize.width > 626 && "left",
      render: (text) => (
        <span>{text.length > 40 ? <Tooltip title={text}>{text.substring(0, 40)}...</Tooltip> : text}</span>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
      width:
        windowSize.width > 1920
          ? "15%"
          : windowSize.width <= 1920 && windowSize.width > 1024
          ? 300
          : windowSize.width > 768
          ? 250
          : 150,
    },
    ...Object.keys(letterToNumber).map((letter) => ({
      title: <p style={{ direction: "ltr", margin: "0", textAlign: "right" }}>{letter}</p>,
      dataIndex: letter,
      key: letter,
      editable: true,
      render: (text) => (text !== null ? text : ""),
      sorter: (a, b) => (a[letter] || 0) - (b[letter] || 0),
      width:
        windowSize.width > 1920
          ? `${80 / Object.keys(letterToNumber).length}%`
          : windowSize.width <= 1920 && windowSize.width > 1024
          ? 120
          : 120,
    })),
    {
      title: "פעולות",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.name)}
              style={{
                marginInlineEnd: 8,
              }}>
              <Tooltip title="שמירה">
                <SaveOutlined className="edit-icon" />
              </Tooltip>
            </Typography.Link>
            <Tooltip title="ביטול">
              <StopOutlined className="edit-icon cancel" onClick={cancel} />
            </Tooltip>
          </span>
        ) : (
          <Typography.Link onClick={() => edit(record)}>
            <Tooltip title="עריכה">
              <EditOutlined className="edit-icon" />
            </Tooltip>
          </Typography.Link>
        );
      },
      width: windowSize.width > 1920 ? "5%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 100 : 100,
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        inputType: "number",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className="system">
      <h1 className="system-title">לוח בקרת מערכת</h1>
      <div className="control-options">
        <div className="box switches">
          <h3 className="box-title">סוויטצ'ים להדלקה \ כיבוי מהירים</h3>
          <div className="switch">
            <label className="switch-label">הזנת פרויקטים חדשים</label>
            <Switch
              checked={createProject}
              onChange={() => {
                setCreateProject(!createProject);
                try {
                  axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/api/config/update-config`,
                    { projectCreation: !createProject },
                    { withCredentials: true },
                  );
                } catch (error) {
                  console.error("Error updating project creation:", error);
                  message.error("שגיאה בעדכון ההגדרה");
                }
              }}
            />
          </div>
          <Tooltip title="רישום של הסטודנטים עצמם לפרויקט">
            <div className="switch">
              <label className="switch-label">רישום לפרויקטים</label>
              <Switch
                checked={registerToProjects}
                onChange={() => {
                  setRegisterToProjects(!registerToProjects);
                  try {
                    axios.post(
                      `${process.env.REACT_APP_BACKEND_URL}/api/config/update-config`,
                      { projectRegistration: !registerToProjects },
                      { withCredentials: true },
                    );
                  } catch (error) {
                    console.error("Error updating project registration:", error);
                    message.error("שגיאה בעדכון ההגדרה");
                  }
                }}
              />
            </div>
          </Tooltip>
          <Tooltip title="אישור, דחיה והסרה של סטודנטים מפרויקט">
            <div className="switch">
              <label className="switch-label">ניהול סטודנטים בפרויקט</label>
              <Switch
                checked={manageStudents}
                onChange={() => {
                  setManageStudents(!manageStudents);
                  try {
                    axios.post(
                      `${process.env.REACT_APP_BACKEND_URL}/api/config/update-config`,
                      { projectStudentManage: !manageStudents },
                      { withCredentials: true },
                    );
                  } catch (error) {
                    console.error("Error updating project student manage:", error);
                    message.error("שגיאה בעדכון ההגדרה");
                  }
                }}
              />
            </div>
          </Tooltip>
          {/* <div className="switch">
            <label className="switch-label">pending action</label>
            <Switch />
          </div> */}
        </div>
        <div className="box publish-grades">
          <h3 className="box-title">פרסום ציונים/ביקורות</h3>
          {Object.keys(submissionGroups).map((submissionName) => (
            <div key={submissionName} className="publish-button">
              {submissionGroups[submissionName].status === "graded" && (
                <>
                  <label>
                    פרסם ציונים זמינים עבור{" "}
                    {submissionName.length > 20 ? (
                      <Tooltip title={submissionName}>{submissionName.substring(0, 20)}...</Tooltip>
                    ) : (
                      submissionName
                    )}
                  </label>
                  <Button
                    type="primary"
                    loading={loading}
                    onClick={() => checkZeroGrades(submissionName, submissionName)}>
                    פרסם ציונים
                  </Button>
                </>
              )}
              {submissionGroups[submissionName].status === "reviewed" && (
                <>
                  <label>
                    פרסם משובים זמינים עבור{" "}
                    {submissionName.length > 20 ? (
                      <Tooltip title={submissionName}>{submissionName.substring(0, 20)}...</Tooltip>
                    ) : (
                      submissionName
                    )}
                  </label>
                  <Button
                    type="primary"
                    loading={loading}
                    onClick={() => publishGradesForSubmissions(submissionName, submissionName)}>
                    פרסם משובים
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <Form form={form} component={false} loading={loading}>
        <Table
          style={{ width: "100%" }}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={groupsData.map((group) => ({ ...group, key: group.name }))}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
          scroll={{
            x: "max-content",
          }}
        />
      </Form>
      <Modal
        title={`פרסום ציונים ל${currentGroup}`}
        open={confirmModalVisible}
        onOk={() => publishGradesForSubmissions(currentSubmissionName, currentGroup)}
        onCancel={() => setConfirmModalVisible(false)}
        okText="אשר"
        cancelText="בטל">
        <p>ישנם ציונים עם ערך נומרי של 0. האם אתה בטוח שברצונך לפרסם את הציונים?</p>
      </Modal>
    </div>
  );
};

export default SystemControl;
