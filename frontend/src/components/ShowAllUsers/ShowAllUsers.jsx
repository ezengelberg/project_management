import React, { useState, useEffect, useRef, useContext } from "react";
import "./ShowAllUsers.scss";
import axios from "axios";
import {
  Space,
  Table,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Switch,
  Tabs,
  Descriptions,
} from "antd";
import { EditOutlined, UserDeleteOutlined, UserAddOutlined, DeleteOutlined, HistoryOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Highlighter from "react-highlight-words";
import { handleMouseDown } from "../../utils/mouseDown";
import { getColumnSearchProps as getColumnSearchPropsUtil } from "../../utils/tableUtils";
import { NotificationsContext } from "../../utils/NotificationsContext";
import { getHebrewYearBundle } from "../../utils/dates/hebrewYears";

const ShowAllUsers = () => {
  const { fetchNotifications } = useContext(NotificationsContext);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserDetails, setEditUserDetails] = useState({});
  const navigate = useNavigate();
  const { Option } = Select;
  const [form] = Form.useForm();
  const [suspensionForm] = Form.useForm();
  const [componentDisabled, setComponentDisabled] = useState(true);
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspensionDetails, setSuspensionDetails] = useState({});
  const [openSuspensionReason, setOpenSuspensionReason] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [suspensionHistory, setSuspensionHistory] = useState([]);
  const [openSuspensionHistory, setOpenSuspensionHistory] = useState(false);
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

  const today = new Date();
  const { currentLabel: currentHebrewYear, previousLabel: previousHebrewYear, nextLabel: nextHebrewYear } = getHebrewYearBundle(today);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all users
        const usersResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/all-users`, {
          withCredentials: true,
        });
        const userData = usersResponse.data;
        setAllUsers(userData);
        const suspendedUsersData = userData.filter((user) => user.suspended);
        const activeUsers = userData.filter((user) => !user.suspended);

        // Fetch all projects
        const projectsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project`, {
          withCredentials: true,
        });
        const projectsData = projectsResponse.data;

        // Create a map of student ID to project
        const studentProjectMap = new Map();
        projectsData.forEach((project) => {
          project.students.forEach((studentId) => {
            studentProjectMap.set(studentId.student, project);
          });
        });

        setProjects(projectsData);
        // Add project information to users
        const usersWithProjects = activeUsers.map((user) => ({
          ...user,
          projectInfo: studentProjectMap.get(user._id),
        }));

        const suspendedUsersWithProjects = suspendedUsersData.map((user) => ({
          ...user,
          projectInfo: studentProjectMap.get(user._id),
        }));

        setUsers(usersWithProjects);
        setSuspendedUsers(suspendedUsersWithProjects);
      } catch (error) {
        console.error("Error occurred:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isEditing) {
      form.setFieldsValue(editUserDetails);
    }
  }, [editUserDetails]);

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

  const dataSource = users.map((user) => ({
    key: user._id,
    name: user.name,
    userId: user.id,
    registerDate: new Date(user.registerDate).toLocaleDateString("he-IL"),
    projectId: user.projectInfo?._id || null,
    projectTitle: user.projectInfo?.title || "לא נבחר פרויקט",
    email: user.email,
    isStudent: user.isStudent,
    isAdvisor: user.isAdvisor,
    isJudge: user.isJudge,
    isCoordinator: user.isCoordinator,
    participationYear: user.participationYear,
  }));

  // Get unique participation years for filter options
  const participationYears = Array.from(new Set(users.map((user) => user.participationYear).filter(Boolean))).sort(
    (a, b) => b - a
  );

  const columns = [
    {
      title: "שם",
      dataIndex: "name",
      key: "name",
      fixed: windowSize.width > 626 && "left",
      ...getColumnSearchProps("name"),
      render: (text, record) => (
        <a
          className="column-name"
          onClick={() => navigate(`/profile/${record.key}`)}
          onMouseDown={(e) => handleMouseDown(e, `/profile/${record.key}`)}>
          <Avatar size="medium">
            {text[0].toUpperCase()}
            {text.split(" ")[1] ? text.split(" ")[1][0].toUpperCase() : ""}
          </Avatar>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={
              windowSize.width > 1920
                ? text.length > 40
                  ? `${text.slice(0, 40)}...`
                  : text
                : windowSize.width <= 1920
                ? text.length > 25
                  ? `${text.slice(0, 25)}...`
                  : text
                : text
            }
          />
        </a>
      ),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "19%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 300 : 300,
    },
    {
      title: "ת.ז.",
      dataIndex: "userId",
      key: "userId",
      ...getColumnSearchProps("userId"),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.userId - b.userId,
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "9%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 120 : 120,
    },
    {
      title: "שנת לימוד",
      dataIndex: "participationYear",
      key: "participationYear",
      showSorterTooltip: {
        target: "full-header",
      },
      render: (year) => (year == null ? "ללא" : year),
      sorter: (a, b) => {
        if (a.participationYear === null && b.participationYear !== null) return 1;
        if (a.participationYear !== null && b.participationYear === null) return -1;
        return (a.participationYear || 0) - (b.participationYear || 0);
      },
      sortDirections: ["descend", "ascend"],
      filters: [...participationYears.map((year) => ({ text: year, value: year })), { text: "ללא", value: "ללא" }],
      onFilter: (value, record) => {
        if (value === "ללא") {
          return record.participationYear === null || record.participationYear === undefined;
        }
        return record.participationYear === value;
      },
      width: windowSize.width > 1920 ? "10%" : 130,
    },
    {
      title: "תאריך הרשמה",
      dataIndex: "registerDate",
      key: "registerDate",
      ...getColumnSearchProps("registerDate"),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => {
        const [dayA, monthA, yearA] = a.registerDate.split(".");
        const [dayB, monthB, yearB] = b.registerDate.split(".");
        return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
      },
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "10%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 170 : 170,
    },
    {
      title: "פרויקט נבחר",
      dataIndex: "selectedProject",
      key: "selectedProject",
      render: (text, record) => {
        if (!record.projectId) {
          return "לא נבחר פרויקט";
        }
        return (
          <a
            onClick={() => navigate(`/project/${record.projectId}`)}
            onMouseDown={(e) => handleMouseDown(e, `/project/${record.projectId}`)}>
            {record.projectTitle.length > 50 ? `${record.projectTitle.slice(0, 50)}...` : record.projectTitle}
          </a>
        );
      },
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.projectTitle.localeCompare(b.projectTitle),
      sortDirections: ["descend", "ascend"],
      filters: [
        { text: "נבחר פרויקט", value: "נבחר פרויקט" },
        { text: "לא נבחר פרויקט", value: "לא נבחר פרויקט" },
      ],
      onFilter: (value, record) => {
        if (value === "נבחר פרויקט") {
          return record.projectId !== null;
        }
        return record.projectId === null;
      },
      width: windowSize.width > 1920 ? "18%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 250 : 250,
    },
    {
      title: "תפקיד",
      key: "role",
      render: (_, record) => (
        <Space>
          {record.isStudent && <Tag color="blue">סטודנט</Tag>}
          {record.isAdvisor && <Tag color="green">מנחה</Tag>}
          {record.isJudge && <Tag color="orange">שופט</Tag>}
          {record.isCoordinator && <Tag color="purple">מנהל</Tag>}
        </Space>
      ),
      filters: [
        { text: "סטודנט", value: "סטודנט" },
        { text: "מנחה", value: "מנחה" },
        { text: "שופט", value: "שופט" },
        { text: "מנהל", value: "מנהל" },
      ],
      onFilter: (value, record) => {
        if (value === "סטודנט") {
          return record.isStudent;
        } else if (value === "מנחה") {
          return record.isAdvisor;
        } else if (value === "שופט") {
          return record.isJudge;
        } else if (value === "מנהל") {
          return record.isCoordinator;
        }
        return false;
      },
      width: windowSize.width > 1920 ? "15%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 150 : 150,
    },
    {
      title: "אימייל",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "14%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 200 : 200,
    },
    {
      title: "פעולות",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              setIsEditing(true);
              setEditUserDetails({
                key: record.key,
                name: record.name,
                email: record.email,
                id: record.userId,
                isStudent: record.isStudent,
                isAdvisor: record.isAdvisor,
                isJudge: record.isJudge,
                isCoordinator: record.isCoordinator,
                participationYear: record.participationYear,
              });
            }}>
            <Tooltip title="עריכה">
              <EditOutlined className="column-icons" />
            </Tooltip>
          </a>
          <a
            onClick={() => {
              setIsSuspending(true);
              setSuspensionDetails({
                key: record.key,
                name: record.name,
                id: record.userId,
              });
            }}>
            <Tooltip title="להשעות משתמש">
              <UserDeleteOutlined className="column-icons" />
            </Tooltip>
          </a>
        </Space>
      ),
      width: windowSize.width > 1920 ? "5%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 100 : 100,
    },
  ];

  const handleEdit = async (userId) => {
    try {
      const values = await form.validateFields();

      if (values.id.length !== 9) {
        throw new Error("תעודת זהות חייבת להכיל 9 ספרות");
      }

      const updatedUser = {
        name: values.name,
        email: values.email,
        id: values.id,
        isStudent: values.isStudent,
        isAdvisor: values.isAdvisor,
        isJudge: values.isJudge,
        isCoordinator: values.isCoordinator,
        participationYear: values.participationYear ? values.participationYear : null,
      };

      try {
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/user/edit-user-coordinator/${userId}`,
          updatedUser,
          { withCredentials: true }
        );

        if (response.data) {
          const updatedUsers = users.map((user) => (user._id === userId ? { ...user, ...updatedUser } : user));

          setUsers(updatedUsers);
          setIsEditing(false);
          form.resetFields();
          setEditUserDetails({});
          message.success("פרטי המשתמש עודכנו בהצלחה");
        }
      } catch (error) {
        if (error.response?.status === 500) {
          const errorMessage = error.response?.data?.message || "שגיאה בעדכון פרטי המשתמש";
          if (errorMessage.includes("email")) {
            throw new Error("כתובת האימייל כבר קיימת במערכת");
          } else if (errorMessage.includes("id")) {
            throw new Error("תעודת זהות כבר קיימת במערכת");
          } else {
            throw new Error(errorMessage);
          }
        } else if (error.response?.status === 404) {
          throw new Error("שגיאה בעדכון פרטי המשתמש");
        } else if (error.response?.status === 403) {
          const errorMessage = error.response?.data?.message || "שגיאה בעדכון פרטי המשתמש";
          if (errorMessage.includes("projects")) {
            throw new Error("המשתמש משוייך לפרויקט ולכן לא ניתן לשנות את התפקיד שלו");
          } else if (errorMessage.includes("submissions")) {
            throw new Error("המשתמש משוייך להגשות ולכן לא ניתן לשנות את התפקיד שלו");
          } else {
            throw new Error(errorMessage);
          }
        } else {
          throw new Error(error.response?.data?.message || "שגיאה בעדכון פרטי המשתמש");
        }
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSuspend = async () => {
    if (currentUser._id === suspensionDetails.key) {
      message.error("לא ניתן להשעות את עצמך");
      return;
    }
    try {
      const values = await suspensionForm.validateFields();

      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/suspend-user/${suspensionDetails.key}`,
        {
          reason: values.reason || "לא ניתנה סיבה",
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const suspendedUser = users.find((user) => user._id === suspensionDetails.key);
        const updatedUsers = users.filter((user) => user._id !== suspensionDetails.key);

        const newSuspendedUser = {
          ...suspendedUser,
          suspendedReason: values.reason || "לא ניתנה סיבה",
          suspendedAt: new Date(),
        };

        setUsers(updatedUsers);
        setSuspendedUsers([...suspendedUsers, newSuspendedUser]);

        suspensionForm.resetFields();
        setIsSuspending(false);
        setSuspensionDetails({});

        message.success("המשתמש הושעה בהצלחה");
      }
    } catch (error) {
      if (error.response) {
        message.error(error.response.data || "שגיאה בהשעיית המשתמש");
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error("שגיאה בהשעיית המשתמש");
      }
    }
  };

  const handleViewSuspensionHistory = (record) => {
    if (!record.suspensionRecords || record.suspensionRecords.length === 0) {
      setSuspensionHistory([]);
      setOpenSuspensionHistory(true);
      return;
    }

    const userSuspensionHistory = record.suspensionRecords.map((record) => {
      const suspendedByUser = allUsers.find((user) => user._id === record.suspendedBy);
      return {
        ...record,
        suspendedByName: suspendedByUser ? suspendedByUser.name : "Unknown",
      };
    });
    setSuspensionHistory(userSuspensionHistory);
    setOpenSuspensionHistory(true);
  };

  const suspendedColumns = [
    {
      title: "שם",
      dataIndex: "name",
      key: "name",
      fixed: windowSize.width > 626 && "left",
      ...getColumnSearchProps("name"),
      render: (text, record) => (
        <a
          className="column-name"
          onClick={() => navigate(`/profile/${record.key}`)}
          onMouseDown={(e) => handleMouseDown(e, `/profile/${record.key}`)}>
          <Avatar size="medium">
            {text[0].toUpperCase()}
            {text.split(" ")[1] ? text.split(" ")[1][0].toUpperCase() : ""}
          </Avatar>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={
              windowSize.width > 1920
                ? text.length > 40
                  ? `${text.slice(0, 40)}...`
                  : text
                : windowSize.width <= 1920
                ? text.length > 25
                  ? `${text.slice(0, 25)}...`
                  : text
                : text
            }
          />
        </a>
      ),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "15%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 300 : 300,
    },
    {
      title: "ת.ז.",
      dataIndex: "userId",
      key: "userId",
      ...getColumnSearchProps("userId"),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.userId - b.userId,
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "6%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 120 : 120,
    },
    {
      title: "שנת לימוד",
      dataIndex: "participationYear",
      key: "participationYear",
      showSorterTooltip: {
        target: "full-header",
      },
      render: (year) => (year == null ? "ללא" : year),
      sorter: (a, b) => {
        if (a.participationYear === null && b.participationYear !== null) return 1;
        if (a.participationYear !== null && b.participationYear === null) return -1;
        return (a.participationYear || 0) - (b.participationYear || 0);
      },
      sortDirections: ["descend", "ascend"],
      filters: [...participationYears.map((year) => ({ text: year, value: year })), { text: "ללא", value: "ללא" }],
      onFilter: (value, record) => {
        if (value === "ללא") {
          return record.participationYear === null || record.participationYear === undefined;
        }
        return record.participationYear === value;
      },
      width: windowSize.width > 1920 ? "10%" : 130,
    },
    {
      title: "תאריך הרשמה",
      dataIndex: "registerDate",
      key: "registerDate",
      ...getColumnSearchProps("registerDate"),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => {
        const [dayA, monthA, yearA] = a.registerDate.split(".");
        const [dayB, monthB, yearB] = b.registerDate.split(".");
        return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
      },
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "8%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 170 : 170,
    },
    {
      title: "פרויקט נבחר",
      dataIndex: "selectedProject",
      key: "selectedProject",
      render: (text, record) => {
        if (!record.projectId) {
          return "לא נבחר פרויקט";
        }
        return (
          <a
            onClick={() => navigate(`/project/${record.projectId}`)}
            onMouseDown={(e) => handleMouseDown(e, `/project/${record.projectId}`)}>
            {record.projectTitle.length > 50 ? `${record.projectTitle.slice(0, 50)}...` : record.projectTitle}
          </a>
        );
      },
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.projectTitle.localeCompare(b.projectTitle),
      sortDirections: ["descend", "ascend"],
      filters: [
        { text: "נבחר פרויקט", value: "נבחר פרויקט" },
        { text: "לא נבחר פרויקט", value: "לא נבחר פרויקט" },
      ],
      onFilter: (value, record) => {
        if (value === "נבחר פרויקט") {
          return record.projectId !== null;
        }
        return record.projectId === null;
      },
      width: windowSize.width > 1920 ? "18%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 250 : 250,
    },
    {
      title: "תפקיד",
      key: "role",
      render: (_, record) => (
        <Space>
          {record.isStudent && <Tag color="blue">סטודנט</Tag>}
          {record.isAdvisor && <Tag color="green">מנחה</Tag>}
          {record.isCoordinator && <Tag color="purple">מנהל</Tag>}
        </Space>
      ),
      filters: [
        { text: "סטודנט", value: "סטודנט" },
        { text: "מנחה", value: "מנחה" },
        { text: "מנהל", value: "מנהל" },
      ],
      onFilter: (value, record) => {
        if (value === "סטודנט") {
          return record.isStudent;
        } else if (value === "מנחה") {
          return record.isAdvisor;
        } else if (value === "מנהל") {
          return record.isCoordinator;
        }
        return false;
      },
      width: windowSize.width > 1920 ? "10%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 150 : 150,
    },
    {
      title: "אימייל",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "10%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 200 : 200,
    },
    {
      title: "סיבת השעיה",
      dataIndex: "suspensionReason",
      key: "suspensionReason",
      ...getColumnSearchProps("suspensionReason"),
      render: (text) => (
        <div>
          <Tooltip title={text}>
            <span
              className="suspension-reason"
              onClick={() => {
                setOpenSuspensionReason(true);
                setSuspensionReason(text);
              }}>
              {text.length > 25 ? `${text.slice(0, 25)}...` : text}
            </span>
          </Tooltip>
        </div>
      ),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.suspensionReason.localeCompare(b.suspensionReason),
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "15%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 200 : 200,
    },
    {
      title: "תאריך השעיה",
      dataIndex: "suspensionDate",
      key: "suspensionDate",
      ...getColumnSearchProps("suspensionDate"),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => new Date(a.suspensionDate) - new Date(b.suspensionDate),
      sortDirections: ["descend", "ascend"],
      width: windowSize.width > 1920 ? "10%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 170 : 170,
    },
    {
      title: "פעולות",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleViewSuspensionHistory(record)}>
            <Tooltip title="היסטורית השעיות">
              <HistoryOutlined className="column-icons" />
            </Tooltip>
          </a>
          <a onClick={() => handleUnsuspend(record.key)}>
            <Tooltip title="ביטול השעיה">
              <UserAddOutlined className="column-icons" />
            </Tooltip>
          </a>
          <a
            onClick={() => {
              setConfirmDelete(true);
              setUserToDelete(record.key);
            }}>
            <Tooltip title="מחק מהמערכת">
              <DeleteOutlined className="column-icons" />
            </Tooltip>
          </a>
        </Space>
      ),
      width: windowSize.width > 1920 ? "8%" : windowSize.width <= 1920 && windowSize.width > 1024 ? 100 : 100,
    },
  ];

  const suspendedDataSource = suspendedUsers.map((user) => ({
    key: user._id,
    name: user.name,
    userId: user.id,
    registerDate: new Date(user.registerDate).toLocaleDateString("he-IL"),
    projectId: user.projectInfo?._id || null,
    projectTitle: user.projectInfo?.title || "לא נבחר פרויקט",
    email: user.email,
    isStudent: user.isStudent,
    isAdvisor: user.isAdvisor,
    isCoordinator: user.isCoordinator,
    suspensionReason: user.suspendedReason,
    suspensionDate: new Date(user.suspendedAt).toLocaleDateString("he-IL"),
    suspensionRecords: user.suspensionRecords,
    participationYear: user.participationYear,
  }));

  const handleUnsuspend = async (userId) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/unsuspend-user/${userId}`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        const unsuspendedUser = suspendedUsers.find((user) => user._id === userId);
        const { suspendedReason, suspendedAt, suspended, ...activeUser } = unsuspendedUser;

        setUsers([...users, activeUser]);
        setSuspendedUsers(suspendedUsers.filter((user) => user._id !== userId));
        message.success("השעיה בוטלה בהצלחה");
      }
    } catch (error) {
      let errorMessage = "שגיאה בביטול השעיה";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    }
  };

  const handleDelete = (userId) => {
    try {
      axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/user/delete-suspended-user/${userId}`, {
        withCredentials: true,
      });
      setConfirmDelete(false);
      setSuspendedUsers(suspendedUsers.filter((user) => user._id !== userId));
      message.success("המשתמש נמחק בהצלחה");
    } catch (error) {
      let errorMessage = "שגיאה במחיקת המשתמש";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
    setEditUserDetails({});
  };

  const handleCancelSuspend = () => {
    setIsSuspending(false);
    suspensionForm.resetFields();
    setSuspensionDetails({});
  };

  const tabs = [
    {
      key: "1",
      label: "משתמשים רשומים",
      children: (
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{ x: "max-content" }}
          sticky={{
            offsetHeader: -27,
            offsetScroll: -27,
            getContainer: () => window,
          }}
        />
      ),
    },
    {
      key: "2",
      label: "משתמשים מושעים",
      children: (
        <Table
          columns={suspendedColumns}
          dataSource={suspendedDataSource}
          loading={loading}
          scroll={{ x: "max-content" }}
          sticky={{
            offsetHeader: -27,
            offsetScroll: -27,
            getContainer: () => window,
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs items={tabs} defaultActiveKey="1" />
      <Modal
        title={`עריכת משתמש: ${editUserDetails.name}`}
        open={isEditing}
        onOk={() => handleEdit(editUserDetails.key)}
        onCancel={handleCancel}
        okText="שמור שינויים"
        cancelText="בטל"
        width={400}>
        <div className="edit-switch">
          <Switch onChange={() => setComponentDisabled((prev) => !prev)} style={{ margin: "10px 0" }} />
          <p>עריכת פרטים אישיים</p>
        </div>
        <Form form={form} layout="vertical" initialValues={editUserDetails}>
          <Form.Item
            label="שם"
            name="name"
            hasFeedback={true}
            rules={[
              { required: true, message: "חובה להזין שם" },
              { min: 2, message: "שם חייב להכיל לפחות 2 תווים" },
            ]}>
            <Input disabled={componentDisabled} />
          </Form.Item>
          <Form.Item
            label="אימייל"
            name="email"
            hasFeedback={true}
            rules={[
              { required: true, message: "חובה להזין אימייל" },
              { type: "email", message: "אנא הכנס כתובת אימייל תקינה" },
            ]}>
            <Input disabled={componentDisabled} />
          </Form.Item>
          <Form.Item
            label="תעודת זהות"
            name="id"
            hasFeedback={true}
            rules={[
              { required: true, message: "חובה להזין תעודת זהות" },
              { pattern: /^\d{9}$/, message: "תעודת זהות חייבת להכיל 9 ספרות" },
            ]}>
            <Input disabled={componentDisabled} />
          </Form.Item>
          <Form.Item label="שנת לימוד" name="participationYear" hasFeedback={true}>
            <Select disabled={componentDisabled}>
              <Option value={nextHebrewYear}>{nextHebrewYear}</Option>
              <Option value={currentHebrewYear}>{currentHebrewYear}</Option>
              <Option value={previousHebrewYear}>{previousHebrewYear}</Option>
              <Option value={null}>ללא</Option>
            </Select>
          </Form.Item>
          <Form.Item label="סטודנט" name="isStudent" hasFeedback={true}>
            <Select>
              <Option value={true}>כן</Option>
              <Option value={false}>לא</Option>
            </Select>
          </Form.Item>
          <Form.Item label="מנחה" name="isAdvisor" hasFeedback={true}>
            <Select>
              <Option value={true}>כן</Option>
              <Option value={false}>לא</Option>
            </Select>
          </Form.Item>
          <Form.Item label="שופט" name="isJudge" hasFeedback={true}>
            <Select>
              <Option value={true}>כן</Option>
              <Option value={false}>לא</Option>
            </Select>
          </Form.Item>
          <Form.Item label="מנהל" name="isCoordinator" hasFeedback={true}>
            <Select>
              <Option value={true}>כן</Option>
              <Option value={false}>לא</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`השעית משתמש: ${suspensionDetails.name}`}
        open={isSuspending}
        onOk={() => handleSuspend()}
        onCancel={() => handleCancelSuspend()}
        okText="השעה"
        okButtonProps={{ danger: true }}
        cancelText="בטל"
        width={500}>
        <Form form={suspensionForm} layout="vertical" name="suspention_form">
          <Form.Item label="סיבת השעיה" name="reason">
            <Input.TextArea rows={6} placeholder="נא לפרט את סיבת ההשעיה..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="סיבת השעיה"
        open={openSuspensionReason}
        onCancel={() => setOpenSuspensionReason(false)}
        okButtonProps={{ style: { display: "none" } }}
        cancelText="סגור">
        <p>{suspensionReason}</p>
      </Modal>

      <Modal
        title="מחיקת משתמש"
        open={ConfirmDelete}
        onOk={() => handleDelete(userToDelete)}
        onCancel={() => setConfirmDelete(false)}
        okText="מחק משתמש"
        okButtonProps={{ danger: true }}
        cancelText="בטל">
        <p>האם אתה בטוח שברצונך למחוק את המשתמש?</p>
      </Modal>

      <Modal
        width={windowSize.width > 1600 ? "70%" : windowSize.width > 1200 ? "80%" : "90%"}
        title="היסטורית השעיות"
        open={openSuspensionHistory}
        onCancel={() => setOpenSuspensionHistory(false)}
        footer={null}>
        {suspensionHistory.map((record, index) => (
          <Descriptions key={index} bordered title={`השעיה ${index + 1}`} column={windowSize.width > 768 ? 2 : 1}>
            <Descriptions.Item label="תאריך השעיה" span={2}>
              {new Date(record.suspendedAt).toLocaleDateString("he-IL")}
            </Descriptions.Item>
            <Descriptions.Item label="סיבת השעיה" span={2}>
              {record.reason}
            </Descriptions.Item>
            <Descriptions.Item label='הושעה ע"י'>{record.suspendedByName}</Descriptions.Item>
          </Descriptions>
        ))}
      </Modal>
    </div>
  );
};

export default ShowAllUsers;
