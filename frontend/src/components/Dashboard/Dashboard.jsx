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
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [currentKey, setCurrentKey] = useState("2");

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
    fetchPrivileges();
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
    getItem("פרופיל", "1", <UserOutlined />),
    getItem("בית", "2", <HomeOutlined />),
    privileges.isStudent && getItem("פרוייקטים", "3", <ProjectOutlined />),
    privileges.isStudent &&
      getItem("תבנית דוחות", "sub1", <FileSearchOutlined />, [
        getItem("דוח אלפא", "4"),
        getItem("דוח בטא", "5"),
        getItem("דוח סופי", "6"),
      ]),
    privileges.isStudent &&
      getItem("הפרוייקט שלי", "sub2", <ApartmentOutlined />, [
        getItem("דף הפרוייקט", "7"),
        getItem("הצגת קבצים", "8"),
        getItem("הגשות", "9"),
        getItem("הערות מנחה", "10"),
        getItem("הערות שופט", "11"),
        getItem("צפייה בציון", "12"),
      ]),
    privileges.isStudent && getItem("הגשות", "13", <FileOutlined />),
    privileges.isAdvisor &&
      getItem("פרוייקטים שלי", "sub3", <FundProjectionScreenOutlined />, [
        getItem("הזנת פרוייקט", "14"),
        getItem("סטטוס פרוייקטים", "15"),
        getItem("סטטוס הגשות", "16"),
      ]),
    privileges.isCoordinator &&
      getItem("ניהול פרוייקטים", "sub4", <FundProjectionScreenOutlined />, [
        getItem("הזנת פרוייקט", "17"),
        getItem("הצגת פרוייקטים", "18"),
      ]),
    privileges.isCoordinator &&
      getItem("ניהול משתמשים", "sub5", <TeamOutlined />, [
        getItem("הזנת סטודנטים", "19"),
        getItem("הזנת משתמש צוות", "20"),
        getItem("עדכון הרשאות", "21"),
        getItem("הצגת משתמשים", "22"),
      ]),
    privileges.isCoordinator && getItem("ניהול מערכת", "23", <SettingOutlined />),
  ];

  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/user/logout", { withCredentials: true });
      console.log(response.data);
      navigate("/login", {replace: true});
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
          <Menu selectedKeys={[currentKey]} theme="dark" mode="inline" items={items} onClick={handleMenuClick} />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
            }}
          />
          <div className="site-upper-header">
            <h1>מערכת ניהול פרוייקטים</h1>
          </div>
          <LoginOutlined className="logout-icon" onClick={handleLogout} />
          <Content
            style={{
              margin: "16px 16px 0 16px",
            }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}>
              <p>Current Menu Key: {currentKey}</p>
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Dashboard;
