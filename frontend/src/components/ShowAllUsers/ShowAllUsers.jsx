import React, { useState, useEffect } from "react";
import "./ShowAllUsers.scss";
import axios from "axios";
import { Space, Table, Tag, Spin } from "antd";

const ShowAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/user/all-users", { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        console.error("Error occurred:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    {
      title: "שם",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "ת.ז.",
      dataIndex: "userId",
      key: "userId",
    },
    { title: "תאריך הרשמה", dataIndex: "registerDate", key: "registerDate" },
    {
      title: "פרוייקט נבחר",
      dataIndex: "selectedProject",
      key: "selectedProject",
    },
    {
      title: "תפקיד",
      key: "role",
      render: (_, record) => (
        <Space>
          {record.isStudent && <Tag color="blue">סטודנט</Tag>}
          {record.isAdvisor && <Tag color="green">מנחה</Tag>}
          {record.isCoordinator && <Tag color="purple">מתאם</Tag>}
        </Space>
      ),
    },
    {
      title: "פעולות",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record._id)}>ערוך</a>
          <a onClick={() => handleDelete(record._id)}>מחק</a>
        </Space>
      ),
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
    userId: user.userId,
    registerDate: user.registerDate,
    selectedProject: user.selectedProject,
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
