import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  UserOutlined,
  HomeOutlined,
  ProjectOutlined,
  FileSearchOutlined,
  UsergroupAddOutlined,
  ApartmentOutlined,
  SelectOutlined,
  UnorderedListOutlined,
  LoginOutlined,
  SettingOutlined,
  FundProjectionScreenOutlined,
  TeamOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Avatar, Badge } from "antd";
import { useNavigate } from "react-router-dom";

import HomePage from "../HomePage/HomePage";

const Dashboard = () => {
  const navigate = useNavigate();
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [userName, setUserName] = useState("");
  const [currentKey, setCurrentKey] = useState("home");

  useEffect(() => {
    // Fetch data from the API
    const fetchPrivileges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/privileges", { withCredentials: true });
        setPrivileges(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    const fetchUserName = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/user-name", { withCredentials: true });
        setUserName(response.data.name);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    fetchPrivileges();
    fetchUserName();
  }, []);

  const { Header, Content, Sider } = Layout;
  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }

  const items = [
    getItem("בית", "home", <HomeOutlined />),
    privileges.isStudent && getItem("פרוייקטים", "projects", <ProjectOutlined />),
    privileges.isStudent && getItem("תבנית דוחות", "templates", <FileSearchOutlined />),
    privileges.isStudent &&
      getItem("הפרוייקט שלי", "sub1", <ApartmentOutlined />, [
        getItem("דף הפרוייקט", "project-page"),
        getItem("הצגת קבצים", "show-files"),
        getItem("הגשות", "submissions"),
        getItem("הערות מנחה", "advisor-comments"),
        getItem("הערות שופט", "judge-comments"),
        getItem("צפייה בציון", "grade"),
      ]),
    privileges.isAdvisor &&
      getItem("פרוייקטים שלי", "sub2", <FundProjectionScreenOutlined />, [
        getItem("הזנת פרוייקט", "create-project-advisor"),
        getItem("סטטוס פרוייקטים", "projects-status"),
        getItem("סטטוס הגשות", "submissions-status"),
      ]),
    privileges.isCoordinator &&
      getItem("ניהול פרוייקטים", "sub3", <FundProjectionScreenOutlined />, [
        getItem("הזנת פרוייקט", "create-project-coordinator"),
        getItem("הצגת פרוייקטים", "show-all-projects"),
      ]),
    privileges.isCoordinator &&
      getItem("ניהול משתמשים", "sub4", <TeamOutlined />, [
        getItem("הזנת סטודנטים", "create-student"),
        getItem("הזנת משתמש צוות", "create-team-member"),
        getItem("עדכון הרשאות", "update-privileges"),
        getItem("הצגת משתמשים", "show-all-users"),
      ]),
    privileges.isCoordinator && getItem("ניהול מערכת", "settings", <SettingOutlined />),
  ];

  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogOut = async () => {
    try {
      await axios.post("http://localhost:5000/api/user/logout", { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleMenuClick = ({ key }) => {
    setCurrentKey(key);
  };

  return (
    <div>
      <Layout
        style={{
          minHeight: "100vh",
          maxHeight: "100vh",
        }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <div className="user-welcome">
            <h3>ברוך הבא, {userName}</h3>
          </div>
          <Menu selectedKeys={[currentKey]} theme="dark" mode="inline" items={items} onClick={handleMenuClick} />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
            }}
          />

          <div className="site-upper-header-right">
            <h1>מערכת ניהול פרוייקטים</h1>
          </div>
          <div className="site-upper-header-left">
            <Avatar
              className="avatar-icon"
              size="large"
              icon={<UserOutlined />}
              onClick={() => setCurrentKey("profile")}
            />
            <Badge count={100}>
              <MessageOutlined className="notification-icon" />
            </Badge>
            <LoginOutlined className="logout-icon" onClick={handleLogOut} />
          </div>
          <Content
            style={{
              margin: "16px 16px 0 16px",
              overflowY: "auto",
              maxHeight: "92%",
            }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}>
              {currentKey === "home" && <HomePage />}
              {currentKey === "profile" && <h1>Profile</h1>}
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Dashboard;
