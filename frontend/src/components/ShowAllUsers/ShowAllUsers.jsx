import React, { useState, useEffect } from "react";
import "./ShowAllUsers.scss";
import axios from "axios";
import { Space, Table, Tag, Spin, Avatar } from "antd";
import { useNavigate } from "react-router-dom";

const ShowAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all users
        const usersResponse = await axios.get("http://localhost:5000/api/user/all-users", { withCredentials: true });
        const userData = usersResponse.data;

        // Create a set of unique project IDs
        const projectIds = new Set(userData.filter((user) => user.selectedProject).map((user) => user.selectedProject));

        // Fetch project details for all selected projects
        const projectDetails = {};
        for (const projectId of projectIds) {
          try {
            const projectResponse = await axios.get(`http://localhost:5000/api/project/get-project/${projectId}`, {
              withCredentials: true,
            });
            projectDetails[projectId] = projectResponse.data;
          } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            projectDetails[projectId] = { title: "Error loading project" };
          }
        }

        setProjects(projectDetails);
        setUsers(userData);
      } catch (error) {
        console.error("Error occurred:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: "שם",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a className="column-name" onClick={() => navigate(`/dashboard/profile/${record.userId}`)}>
          <Avatar size="medium">
            {text[0].toUpperCase()}
            {text.split(" ")[1] ? text.split(" ")[1][0].toUpperCase() : ""}
          </Avatar>
          {text}
        </a>
      ),
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
      width: "20%",
    },
    {
      title: "ת.ז.",
      dataIndex: "userId",
      key: "userId",
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.userId - b.userId,
      sortDirections: ["descend", "ascend"],
      width: "10%",
    },
    {
      title: "תאריך הרשמה",
      dataIndex: "registerDate",
      key: "registerDate",
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => new Date(a.registerDate) - new Date(b.registerDate),
      sortDirections: ["descend", "ascend"],
      width: "10%",
    },
    {
      title: "פרוייקט נבחר",
      dataIndex: "selectedProject",
      key: "selectedProject",
      render: (text, record) => {
        if (!record.projectId) {
          return "לא נבחר פרוייקט";
        }
        const project = projects[record.projectId];
        if (!project) {
          return "טוען...";
        }
        return <a onClick={() => navigate(`/dashboard/project/${record.projectId}`)}>{project.title}</a>;
      },
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => {
        const projectA = projects[a.projectId]?.title || "לא נבחר פרוייקט";
        const projectB = projects[b.projectId]?.title || "לא נבחר פרוייקט";
        return projectA.localeCompare(projectB);
      },
      sortDirections: ["descend", "ascend"],
      filters: [
        { text: "נבחר פרוייקט", value: "נבחר פרוייקט" },
        { text: "לא נבחר פרוייקט", value: "לא נבחר פרוייקט" },
      ],
      onFilter: (value, record) => {
        if (value === "נבחר פרוייקט") {
          return record.selectedProject !== "לא נבחר פרוייקט";
        }
        return record.selectedProject === "לא נבחר פרוייקט";
      },
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
      width: "12%",
    },
    {
      title: "אימייל",
      dataIndex: "email",
      key: "email",
      showSorterTooltip: {
        target: "full-header",
      },
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["descend", "ascend"],
      width: "15%",
    },
    {
      title: "פעולות",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record.key)}>ערוך</a>
          <a onClick={() => handleDelete(record.key)}>מחק</a>
        </Space>
      ),
      width: "5%",
    },
  ];

  const handleEdit = (userId) => {
    console.log("Edit user:", userId);
  };

  const handleDelete = (userId) => {
    console.log("Delete user:", userId);
  };

  const dataSource = users.map((user) => ({
    key: user._id,
    name: user.name,
    userId: user.id,
    registerDate: new Date(user.registerDate).toLocaleDateString("he-IL"),
    projectId: user.selectedProject || null,
    email: user.email,
    isStudent: user.isStudent,
    isAdvisor: user.isAdvisor,
    isCoordinator: user.isCoordinator,
  }));

  return (
    <div>
      <div className="active-users">
        <h2>משתמשים רשומים</h2>
        {loading && <Spin />}
        <Table columns={columns} dataSource={dataSource} />
      </div>
      <div className="watiting-users">
        <h2>מחכים להרשמה</h2>
      </div>
      <div className="banned-users">
        <h2>משתמשים חסומים</h2>
      </div>
    </div>
  );
};

export default ShowAllUsers;
