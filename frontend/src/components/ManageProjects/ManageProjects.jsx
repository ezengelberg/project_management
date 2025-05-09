import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Table, Tooltip, Switch, message, Divider, Modal, Form, Input, Select, Tabs, Descriptions } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserDeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Editor } from "primereact/editor";
import DOMPurify from "dompurify";
import axios from "axios";
import "./ManageProjects.scss";
import Highlighter from "react-highlight-words";
import { handleMouseDown } from "../../utils/mouseDown";
import { getColumnSearchProps as getColumnSearchPropsUtil } from "../../utils/tableUtils";
import { NotificationsContext } from "../../utils/NotificationsContext";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";

const ManageProjects = () => {
  const navigate = useNavigate();
  const { Option } = Select;
  const { fetchNotifications } = useContext(NotificationsContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectData, setEditProjectData] = useState({});
  const [isOtherType, setIsOtherType] = useState(false);
  const [studentInitiative, setStudentInitiative] = useState(false);
  const [studentsNoProject, setStudentsNoProject] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [yearFilter, setYearFilter] = useState(null);
  const [years, setYears] = useState([]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({});
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showHistory, setShowHistory] = useState(false);
  const [editRecord, setEditRecord] = useState([]);

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

  const getUsersNoProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/users-no-projects`, {
        withCredentials: true,
      });
      setStudentsNoProject(response.data.usersNoProjects);
      setLoading(false);
    } catch (error) {
      console.error("Error occurred:", error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/years`, {
          withCredentials: true,
        });
        const sortedYears = response.data.sort((a, b) => b.localeCompare(a));
        setYears(sortedYears);

        const currentHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date())).split(" ").pop().replace(/^ה/, "");
        const currentHebrewYearIndex = sortedYears.indexOf(currentHebrewYear);
        setYearFilter(currentHebrewYearIndex !== -1 ? sortedYears[currentHebrewYearIndex] : sortedYears[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error occurred:", error);
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/get-self-projects-by-year/`,
        { year: yearFilter },
        { withCredentials: true }
      );

      // Assuming `project.candidates` contains the array of student objects
      const projectData = response.data.projects.map((project) => ({
        key: project._id, // Assuming there's an `_id` field
        title: project.title,
        isTaken: project.isTaken,
        candidates: project.candidates, // candidates should be an array of student objects
        students: project.students, // Assuming `project.students` contains the array of student objects
        registered: project.students.length + project.candidates.length,
        projectInfo: project,
        year: project.year,
        candidatesData: [],
        isTerminated: project.isTerminated,
        terminationRecord: project.terminationRecord,
        suitableFor: project.suitableFor,
      }));

      for (const project of projectData) {
        const candidatesData = [];
        const terminationRecord = [];
        for (const stud of project.students) {
          try {
            const studentResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${stud.student._id}`,
              {
                withCredentials: true,
              }
            );
            candidatesData.push({
              key: `student-${stud.student._id}`,
              name: studentResponse.data.name,
              date: stud.joinDate,
              status: true,
              candidateInfo: studentResponse.data,
              projectID: project.key,
            });
          } catch (error) {
            console.error("Error fetching student data:", error);
            setLoading(false);
          }
        }

        for (const candidate of project.candidates) {
          try {
            const studentResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${candidate.student}`,
              { withCredentials: true }
            );
            const hasProjectResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/user/check-user-has-projects/${candidate.student}`,
              { withCredentials: true }
            );
            candidatesData.push({
              key: `candidate-${candidate.student}`,
              name: studentResponse.data.name,
              date: candidate.joinDate,
              status: false,
              candidateInfo: studentResponse.data,
              projectID: project.key,
              hasProject: hasProjectResponse.data.hasProject,
            });
          } catch (error) {
            console.error("Error fetching candidate data:", error);
            setLoading(false);
          }
        }

        for (const record of project.terminationRecord) {
          try {
            const studentResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${record.student}`,
              { withCredentials: true }
            );
            terminationRecord.push({
              key: `terminated-${record.student}`,
              name: studentResponse.data.name,
              date: record.joinDate,
              projectID: project.key,
            });
          } catch (error) {
            console.error("Error fetching terminated student data:", error);
            setLoading(false);
          }
        }
        project.candidatesData = candidatesData;
        project.terminationRecord = terminationRecord;
      }
      setProjects(projectData);
      setLoading(false);
    } catch (error) {
      console.error("Error occurred:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (yearFilter === null) return;
    fetchData();
    getUsersNoProjects();
    fetchNotifications();
  }, [yearFilter]);

  useEffect(() => {
    if (isEditing) {
      form.setFieldsValue(editProjectData);
    }
  }, [editProjectData]);

  const handleTypeChange = (value) => {
    setIsOtherType(value === "אחר");
    setStudentInitiative(value === "יוזמת סטודנט");
    if (value !== "אחר") {
      form.setFieldValue("customType", undefined);
    }
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

  const closeRegistration = (record) => async () => {
    if (record.students && record.students.length === 0 && record.isTaken === false) {
      message.open({
        type: "warning",
        content: "לא ניתן לסגור פרויקט להרשמה ללא סטודנטים",
      });
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/switch-registration`,
        {
          projectID: record.key,
        },
        {
          withCredentials: true,
        }
      );
      if (response.data.hasSubmission) {
        message.open({
          type: "warning",
          content: "לא ניתן לשנות סטטוס הרשמה לפרויקט עם הגשות פתוחות",
        });
        return;
      }
      if (record.isTaken) {
        message.open({
          type: "info",
          content: "הפרויקט נפתח להרשמה",
          duration: 2,
        });
      } else {
        message.open({
          type: "info",
          content: "הפרויקט נסגר להרשמה",
          duration: 2,
        });
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }

    // TODO: update in database
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.key === record.key) {
          return {
            ...project,
            isTaken: !project.isTaken,
          };
        }
        return project;
      })
    );
  };

  const showConfirmModal = (title, onOk) => {
    setConfirmModalContent({ title, onOk });
    setIsConfirmModalVisible(true);
  };

  const handleConfirmModalOk = async () => {
    await confirmModalContent.onOk();
    setIsConfirmModalVisible(false);
  };

  const handleConfirmModalCancel = () => {
    setIsConfirmModalVisible(false);
  };

  const approveStudent = (record) => async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/approve-candidate`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id,
        },
        {
          withCredentials: true,
        }
      );

      message.open({
        type: "success",
        content: "הסטודנט אושר לפרויקט",
        duration: 2,
      });
      fetchNotifications();
      await fetchData();
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.key === record.projectID) {
            const updatedCandidatesData = project.candidatesData.map((candidate) => {
              if (candidate.key === record.key) {
                return {
                  ...candidate,
                  status: true,
                };
              }
              return candidate;
            });

            const registeredCount = updatedCandidatesData.filter((candidate) => candidate.status).length;

            if (
              (project.suitableFor === "יחיד" && registeredCount === 1 && !project.isTaken) ||
              (project.suitableFor === "זוג" && registeredCount === 2 && !project.isTaken) ||
              (project.suitableFor === "יחיד / זוג" && registeredCount >= 1 && registeredCount <= 2 && !project.isTaken)
            ) {
              showConfirmModal("האם ברצונך לסגור את ההרשמה לפרויקט זה?", async () => {
                await closeRegistration(project)();
              });
            }

            return {
              ...project,
              candidatesData: updatedCandidatesData,
            };
          }
          return project;
        })
      );
    } catch (error) {
      message.open({
        type: "error",
        content: error.response.data.message,
        duration: 2,
      });
    }
  };

  const declineStudent = (record) => async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/remove-candidate`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id,
        },
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "info",
        content: "הסטודנט נדחה מהפרויקט",
        duration: 2,
      });
      fetchNotifications();
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.key === record.projectID) {
            return {
              ...project,
              registered: project.registered - 1, // Decrement the number of registered students
              candidatesData: project.candidatesData.filter((candidate) => candidate.key !== record.key), // Remove the declined candidate
            };
          }
          return project;
        })
      );
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const removeStudent = (record) => async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/remove-student`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id,
        },
        {
          withCredentials: true,
        }
      );

      message.open({
        type: "info",
        content: "הסטודנט הוסר מהפרויקט",
        duration: 2,
      });
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.key === record.projectID) {
            const updatedCandidatesData = project.candidatesData.map((candidate) => {
              if (candidate.key === record.key) {
                return {
                  ...candidate,
                  status: false,
                };
              }
              return candidate;
            });

            const registeredCount = updatedCandidatesData.filter((candidate) => candidate.status).length;

            if (
              (project.suitableFor === "יחיד" && registeredCount < 1 && project.isTaken) ||
              (project.suitableFor === "זוג" && registeredCount < 2 && project.isTaken) ||
              (project.suitableFor === "יחיד / זוג" && registeredCount < 2 && project.isTaken)
            ) {
              showConfirmModal("האם ברצונך לפתוח את ההרשמה לפרויקט זה?", async () => {
                await closeRegistration(project)();
              });
            }

            return {
              ...project,
              candidatesData: updatedCandidatesData,
            };
          }
          return project;
        })
      );
      await fetchData();
      fetchNotifications();
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleEditProject = (project) => {
    getUsersNoProjects();
    setEditProjectData({
      ...project.projectInfo,
    });
    setIsEditing(true);
  };

  const handleShowHistory = (record) => {
    setEditRecord(record.projectInfo.editRecord);
    setShowHistory(true);
  };

  const columns = [
    {
      title: "שם הפרויקט",
      dataIndex: "title",
      key: "title",
      fixed: windowSize.width > 626 && "left",
      ...getColumnSearchProps("title"),
      render: (title, record) => (
        <a
          onClick={() => navigate(`/project/${record.key}`)}
          onMouseDown={(e) => handleMouseDown(e, `/project/${record.key}`)}>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={
              windowSize.width > 1920
                ? title.length > 130
                  ? `${title.substring(0, 130)}...`
                  : title
                : windowSize.width > 1600
                ? title.length > 80
                  ? `${title.substring(0, 80)}...`
                  : title
                : windowSize.width > 1200
                ? title.length > 70
                  ? `${title.substring(0, 70)}...`
                  : title
                : windowSize.width > 1024
                ? title.length > 50
                  ? `${title.substring(0, 50)}...`
                  : title
                : windowSize.width > 768
                ? title.length > 40
                  ? `${title.substring(0, 40)}...`
                  : title
                : title.length > 35
                ? `${title.substring(0, 35)}...`
                : title
            }
          />
        </a>
      ),
      width:
        windowSize.width > 1920
          ? "55%"
          : windowSize.width > 1600
          ? "50%"
          : windowSize.width > 1200
          ? 450
          : windowSize.width > 1024
          ? 250
          : 200,
    },
    {
      title: "מתאים ל...",
      dataIndex: "suitableFor",
      key: "suitableFor",
      filters: [
        { text: "יחיד", value: "יחיד" },
        { text: "זוג", value: "זוג" },
        { text: "יחיד / זוג", value: "יחיד / זוג" },
      ],
      onFilter: (value, record) => record.suitableFor === value,
      width: windowSize.width > 1600 ? "10%" : windowSize.width > 1200 ? 150 : 150,
    },
    {
      title: "מספר רשומים",
      dataIndex: "registered",
      key: "registered",
      render: (registered) => registered,
      sorter: (a, b) => a.registered - b.registered,
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "10%" : windowSize.width > 1600 ? "13%" : windowSize.width > 1200 ? 150 : 150,
    },
    {
      title: "פעולות",
      key: "action",
      render: (record) => (
        <span className="project-management-actions">
          <Tooltip title="עריכת פרויקט">
            <EditOutlined
              onClick={() => {
                handleEditProject(record);
              }}
            />
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="היסטוריית עריכות">
            <HistoryOutlined onClick={() => handleShowHistory(record)} />
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title={record.isTaken ? "פתח להרשמה" : "סגור להרשמה"}>
            <Switch checked={!record.isTaken} onChange={closeRegistration(record)} />
          </Tooltip>
          {record.isTaken ? "פרויקט סגור להרשמה" : "פרויקט פתוח להרשמה"}
        </span>
      ),
      filters: [
        { text: "פרויקט סגור להרשמה", value: true },
        { text: "פרויקט פתוח להרשמה", value: false },
      ],
      onFilter: (value, record) => record.isTaken === value,
      width: windowSize.width > 1920 ? "25%" : windowSize.width > 1600 ? "28%" : windowSize.width > 1200 ? 350 : 400,
    },
  ];

  const handleCancel = () => {
    setEditProjectData({});
    form.resetFields();
    setIsEditing(false);
    setIsOtherType(false);
    setStudentInitiative(false);
  };

  const handleEditorChange = (e) => {
    const sanitizedHtml = DOMPurify.sanitize(e.htmlValue || "");
    form.setFieldsValue({ description: sanitizedHtml });
  };

  const onConfirmEdit = async () => {
    const { title, description, year, suitableFor, type, externalEmail, continues } = form.getFieldsValue();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/edit-project/${editProjectData._id}`,
        { title, description, year, suitableFor, type, externalEmail, continues },
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "success",
        content: `הפרויקט עודכן בהצלחה`,
        duration: 2,
      });
      const projectUpdate = projects.map(
        (project) =>
          project.key === editProjectData._id
            ? {
                ...project,
                title,
                projectInfo: {
                  ...project.projectInfo,
                  title,
                  description,
                  year,
                  suitableFor,
                  type,
                  externalEmail,
                  continues,
                },
              }
            : project // Return the original project if not edited
      );
      setProjects(projectUpdate);
      handleCancel();
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const expandedRender = (record) => {
    const expandColumns = [
      {
        title: "שם הסטודנט",
        dataIndex: "name",
        key: "name",
        fixed: windowSize.width > 626 && "left",
        render: (name) =>
          windowSize.width > 1600 ? (
            name.length > 80 ? (
              <Tooltip title={name}>{name.substring(0, 80)}...</Tooltip>
            ) : (
              name
            )
          ) : windowSize.width > 1200 ? (
            name.length > 60 ? (
              <Tooltip title={name}>{name.substring(0, 60)}...</Tooltip>
            ) : (
              name
            )
          ) : windowSize.width > 1024 ? (
            name.length > 40 ? (
              <Tooltip title={name}>{name.substring(0, 40)}...</Tooltip>
            ) : (
              name
            )
          ) : windowSize.width > 768 ? (
            name.length > 35 ? (
              <Tooltip title={name}>{name.substring(0, 35)}...</Tooltip>
            ) : (
              name
            )
          ) : name.length > 25 ? (
            <Tooltip title={name}>{name.substring(0, 25)}...</Tooltip>
          ) : (
            name
          ),
        width: windowSize.width > 1200 ? "40%" : windowSize.width > 1024 ? 350 : windowSize.width > 768 ? 270 : 230,
      },
      {
        title: "תאריך רישום",
        dataIndex: "date",
        key: "date",
        render: (date) => new Date(date).toLocaleString("he-IL"), // Display the date in
        width: windowSize.width > 1200 ? "15%" : windowSize.width > 1024 ? 200 : windowSize.width > 768 ? 170 : 170,
      },
      {
        title: "סטטוס",
        dataIndex: "status",
        key: "status",
        render: (status, record) => {
          if (status) {
            return <Badge status="success" text="מאושר" />;
          } else if (record.hasProject) {
            return <Badge color="purple" text="לא מאושר - משוייך לפרויקט אחר" />;
          } else {
            return <Badge status="error" text="לא מאושר" />;
          }
        },
        width: windowSize.width > 1200 ? "25%" : windowSize.width > 1024 ? 250 : windowSize.width > 768 ? 220 : 250,
      },
      {
        title: "פעולה",
        key: "action",
        width: 250,
        render: (record) =>
          record.status ? (
            <div className="approve-decline-student">
              <Tooltip title="הסר סטודנט מפרויקט">
                <UserDeleteOutlined onClick={removeStudent(record)} />
              </Tooltip>
            </div>
          ) : (
            <div className="approve-decline-student">
              {!record.hasProject && (
                <Tooltip title="אשר רישום לסטודנט זה">
                  <CheckCircleOutlined onClick={approveStudent(record)} />
                </Tooltip>
              )}
              <Tooltip title="דחה רישום לסטודנט זה">
                <CloseCircleOutlined onClick={declineStudent(record)} />
              </Tooltip>
            </div>
          ),
        width: windowSize.width > 1200 ? "20%" : windowSize.width > 1024 ? 150 : 100,
      },
    ];
    return (
      <Table
        columns={expandColumns}
        dataSource={record.candidatesData}
        pagination={false}
        loading={loading}
        scroll={{
          x: "max-content",
        }}
      />
    );
  };

  const filteredProjects = projects.filter((project) => {
    if (yearFilter === "all") return !project.isTerminated;
    return project.year === yearFilter && !project.isTerminated;
  });

  const terminatedProjectsColumns = [
    {
      title: "שם הפרויקט",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
      render: (title) => (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={
            windowSize.width > 1600
              ? title.length > 135
                ? `${title.substring(0, 135)}...`
                : title
              : windowSize.width > 1200
              ? title.length > 110
                ? `${title.substring(0, 110)}...`
                : title
              : windowSize.width > 1024
              ? title.length > 65
                ? `${title.substring(0, 65)}...`
                : title
              : windowSize.width > 768
              ? title.length > 60
                ? `${title.substring(0, 60)}...`
                : title
              : title.length > 45
              ? `${title.substring(0, 45)}...`
              : title
          }
        />
      ),
      width: windowSize.width > 1200 ? "70%" : windowSize.width > 1024 ? 550 : windowSize.width > 768 ? 500 : 400,
    },
    {
      title: "היסטורית סטודנטים",
      dataIndex: "terminationRecord",
      key: "terminationRecord",
      render: (terminationRecord) =>
        terminationRecord?.map((record, index) => (
          <span key={record.key}>
            {record.name.length > 40 ? (
              <Tooltip title={record.name}>{record.name.substring(0, 40)}...</Tooltip>
            ) : (
              record.name
            )}
            {index < terminationRecord.length - 1 && <Divider type="vertical" style={{ borderColor: "black" }} />}
          </span>
        )),
    },
  ];

  const terminatedProjects = projects.filter((project) => {
    if (yearFilter === "all") return project.isTerminated;
    return project.year === yearFilter && project.isTerminated;
  });

  const tabs = [
    {
      key: "1",
      label: "פרויקטים פעילים",
      children: (
        <Table
          columns={columns}
          dataSource={filteredProjects}
          loading={loading}
          expandable={{ expandedRowRender: expandedRender }}
          scroll={{
            x: "max-content",
          }}
        />
      ),
    },
    {
      key: "2",
      label: "פרויקטים מושהים",
      children: (
        <Table
          columns={terminatedProjectsColumns}
          dataSource={terminatedProjects}
          loading={loading}
          scroll={{
            x: "max-content",
          }}
        />
      ),
    },
  ];

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;

  const currentHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date(currentYear, 10, 10)))
    .split(" ")
    .pop()
    .replace(/^ה/, "");

  const previousHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date(previousYear, 10, 10)))
    .split(" ")
    .pop()
    .replace(/^ה/, "");

  const nextHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date(nextYear, 10, 10)))
    .split(" ")
    .pop()
    .replace(/^ה/, "");

  return (
    <div>
      <Modal
        title={confirmModalContent.title}
        open={isConfirmModalVisible}
        onOk={handleConfirmModalOk}
        onCancel={handleConfirmModalCancel}
        okText="כן"
        cancelText="לא"
      />
      <div className="upper-table-options">
        <Modal
          title={`עריכת פרויקט: ${editProjectData["title"]}`}
          open={isEditing}
          onCancel={() => {
            handleCancel();
          }}
          onOk={onConfirmEdit}
          okText="שמור שינויים"
          cancelText="בטל"
          width={"70rem"}>
          <Form form={form} layout="vertical" initialValues={editProjectData}>
            <Form.Item
              name="title"
              label="שם הפרויקט"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "חובה להזין שם לפרויקט",
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item
              className="create-project-form-item"
              label="תיאור"
              name="description"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "חובה להזין תיאור לפרויקט",
                },
              ]}>
              <Editor style={{ height: "320px", wordBreak: "break-word" }} onTextChange={handleEditorChange} />
            </Form.Item>
            <Form.Item
              className="create-project-form-item"
              label="שנה"
              name="year"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "חובה להזין שנה",
                },
              ]}>
              <Select>
                <Option value={nextHebrewYear}>{nextHebrewYear}</Option>
                <Option value={currentHebrewYear}>{currentHebrewYear}</Option>
                <Option value={previousHebrewYear}>{previousHebrewYear}</Option>
              </Select>
            </Form.Item>
            <Form.Item
              className="create-project-form-item"
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
                <Option value="יחיד \ זוג">יחיד \ זוג</Option>
              </Select>
            </Form.Item>
            <Form.Item
              className="create-project-form-item"
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
                <Option value="אחר">אחר</Option>
              </Select>
            </Form.Item>
            {editProjectData.externalEmail && (
              <Form.Item
                className="create-project-form-item"
                label="מייל גורם חיצוני"
                name="externalEmail"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "חובה להזין מייל גורם חיצוני",
                  },
                ]}>
                <Input type="email" placeholder="הזן מייל גורם חיצוני" />
              </Form.Item>
            )}

            {isOtherType && (
              <Form.Item
                className="create-project-form-item"
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
              className="create-project-form-item"
              label="ממשיך"
              name="continues"
              rules={[
                {
                  required: false,
                },
              ]}>
              <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
            </Form.Item>
          </Form>
        </Modal>

        <Select value={yearFilter} placeholder="בחר שנה" onChange={setYearFilter} style={{ width: "200px" }}>
          <Select.Option value="all">כל השנים</Select.Option>
          {years.map((year) => (
            <Select.Option key={year} value={year}>
              {year}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Tabs items={tabs} defaultActiveKey="1" />
      <Modal
        className="manage-projects-edit-record-modal"
        width={windowSize.width > 1600 ? "70%" : windowSize.width > 1200 ? "80%" : "90%"}
        title="היסטורית עריכות"
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={null}>
        {editRecord.map((record, index) => (
          <Descriptions key={index} bordered title={`עריכה ${index + 1}`} column={windowSize.width > 768 ? 2 : 1}>
            <Descriptions.Item label="כותרת" span={1}>
              <div className="edited-title-modal-item">
                <div>
                  <span>
                    <strong>ישן:</strong>
                  </span>
                  <p>{record.oldTitle}</p>
                </div>
                <div>
                  <span>
                    <strong>חדש:</strong>
                  </span>
                  <p>{record.newTitle}</p>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="תיאור" span={2}>
              <div className="edited-description-modal-item">
                <span>
                  <strong>ישן:</strong>
                </span>
                <div dangerouslySetInnerHTML={{ __html: record.oldDescription }} />
              </div>
              <div className="edited-description-modal-item">
                <span>
                  <strong>חדש:</strong>
                </span>
                <div dangerouslySetInnerHTML={{ __html: record.newDescription }} />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="שנה" span={1}>
              <div className="edited-year-modal-item">
                <div>
                  <span>
                    <strong>ישן:</strong>
                  </span>
                  <p>{record.oldYear}</p>
                </div>
                <div>
                  <span>
                    <strong>חדש:</strong>
                  </span>
                  <p>{record.newYear}</p>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="מתאים ל" span={1}>
              <div className="edited-suitableFor-modal-item">
                <div>
                  <span>
                    <strong>ישן:</strong>
                  </span>
                  <p>{record.oldSuitableFor}</p>
                </div>
                <div>
                  <span>
                    <strong>חדש:</strong>
                  </span>
                  <p>{record.newSuitableFor}</p>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="סוג" span={1}>
              <div className="edited-type-modal-item">
                <div>
                  <span>
                    <strong>ישן:</strong>
                  </span>
                  <p>{record.oldType}</p>
                </div>
                <div>
                  <span>
                    <strong>חדש:</strong>
                  </span>
                  <p>{record.newType}</p>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="מייל גורם חיצוני" span={2}>
              <div className="edited-externalEmail-modal-item">
                <div>
                  <span>
                    <strong>ישן:</strong>
                  </span>
                  <p>{record.oldExternalEmail}</p>
                </div>
                <div>
                  <span>
                    <strong>חדש:</strong>
                  </span>
                  <p>{record.newExternalEmail}</p>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="ממשיך" span={1}>
              <div className="edited-continues-modal-item">
                <div>
                  <span>
                    <strong>ישן:</strong>
                  </span>
                  <p>{record.oldContinues}</p>
                </div>
                <div>
                  <span>
                    <strong>חדש:</strong>
                  </span>
                  <p>{record.newContinues}</p>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="פרטי עריכה" span={2}>
              <div>
                <span>
                  <strong>נערך על ידי:</strong>
                </span>
                <p>
                  {record.editedBy.name} - {new Date(record.editDate).toLocaleString("he-IL")}
                </p>
              </div>
            </Descriptions.Item>
          </Descriptions>
        ))}
      </Modal>
    </div>
  );
};

export default ManageProjects;
