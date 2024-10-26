import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import {
  HomeOutlined,
  ProjectOutlined,
  FileSearchOutlined,
  ApartmentOutlined,
  LogoutOutlined,
  SettingOutlined,
  FundProjectionScreenOutlined,
  TeamOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Avatar, Badge, Tooltip } from "antd";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import collegeLogo from "../../assets/CollegeLogo.png";
import HomePage from "../HomePage/HomePage";
import Templates from "../Templates/Templates";
import Projects from "../Projects/Projects";
import ProjectPage from "../ProjectPage/ProjectPage";
import CreateProject from "../CreateProject/CreateProject";
import ShowAllUsers from "../ShowAllUsers/ShowAllUsers";
import CreateUser from "../CreateUser/CreateUser";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [user, setUser] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  const getCurrentKeyFromPath = () => {
    const path = location.pathname.split("/").pop();
    return path === "dashboard" ? "home" : path;
  };

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

    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/get-user", { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    fetchPrivileges();
    fetchUser();
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
    getItem("תבנית דוחות", "templates", <FileSearchOutlined />),
    privileges.isStudent &&
      getItem("הפרוייקט שלי", "sub1", <ApartmentOutlined />, [
        getItem("דף הפרוייקט", "project-page"),
        getItem("הצגת קבצים", "show-files"),
        getItem("הגשות", "submissions"),
        getItem("הערות מנחה", "advisor-comments"),
        getItem("הערות שופט", "judge-comments"),
        getItem("צפייה בציון", "grade"),
      ]),

    (privileges.isAdvisor || privileges.isCoordinator) &&
      getItem("פרוייקטים שלי", "sub2", <FundProjectionScreenOutlined />, [
        getItem("הזנת פרוייקט", "create-project"),
        getItem("סטטוס פרוייקטים", "projects-status"),
        getItem("סטטוס הגשות", "submissions-status"),
      ]),
    privileges.isCoordinator && getItem("ניהול פרוייקטים", "project-managment", <FundProjectionScreenOutlined />),
    privileges.isCoordinator &&
      getItem("ניהול משתמשים", "sub4", <TeamOutlined />, [
        getItem("יצירת משתמש חדש", "create-user"),
        getItem("עדכון הרשאות", "update-privileges"),
        getItem("הצגת משתמשים", "show-all-users"),
      ]),
    privileges.isCoordinator && getItem("ניהול מערכת", "settings", <SettingOutlined />),
  ];

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/user/logout", { withCredentials: true });
      console.log(response.data);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleMenuClick = ({ key }) => {
    navigate(`/dashboard/${key}`);
  };

  return (
    <div>
      <Layout
        style={{
          minHeight: "100vh",
          maxHeight: "100vh",
        }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          {!collapsed ? (
            <div className="user-welcome">
              <h3>ברוך הבא, {user.name}</h3>
            </div>
          ) : (
            <div className="placeholder" />
          )}
          <Menu
            selectedKeys={[getCurrentKeyFromPath()]}
            theme="dark"
            mode="inline"
            items={items}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
            }}
          />

          <div className="site-upper-header-right">
            <img
              src={collegeLogo}
              alt="collage logo"
              className="collage-logo"
              onClick={() => navigate("/dashboard/home")}
            />
            <h1>מערכת ניהול פרוייקטים</h1>
          </div>
          <div className="site-upper-header-left">
            <Tooltip title="פרופיל">
              <Avatar className="avatar-icon" size="large" onClick={() => navigate(`/dashboard/profile/${user.id}`)}>
                {user.name && user.name[0]}
                {user.name && user.name.split(" ")[1] ? user.name.split(" ")[1][0] : ""}
              </Avatar>
            </Tooltip>
            <Badge count={100}>
              <Tooltip title="התראות">
                <MessageOutlined className="notification-icon" />
              </Tooltip>
            </Badge>
            <Tooltip title="התנתק">
              <LogoutOutlined className="logout-icon" onClick={handleLogout} />
            </Tooltip>
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
                minHeight: "100%",
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}>
              <Routes>
                <Route path="/" element={<Navigate to="home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/profile/:userId" element={<h1>Profile</h1>} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/create-project" element={<CreateProject />} />
                <Route path="/project/:projectID" element={<ProjectPage />} />
                <Route path="/show-all-users" element={<ShowAllUsers />} />
                <Route path="/create-user" element={<CreateUser />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Dashboard;
