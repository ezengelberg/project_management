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
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";

const Dashboard = () => {
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
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

  const { Header, Sider } = Layout;
  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }
  const items = [
    getItem("פרופיל", "0", <UserOutlined />),
    privileges.isStudent && getItem("בית", "1", <HomeOutlined />),
    privileges.isStudent && getItem("פרוייקטים", "2", <ProjectOutlined />),
    privileges.isStudent &&
      getItem("תבנית דוחות", "sub1", <FileSearchOutlined />, [
        getItem("דוח אלפא", "3"),
        getItem("דוח בטא", "4"),
        getItem("דוח סופי", "5"),
      ]),
    privileges.isStudent &&
      getItem("הפרוייקט שלי", "6", <ApartmentOutlined />, [
        getItem("דף הפרוייקט", "7"),
        getItem("הצגת קבצים", "8"),
        getItem("הגשות", "9"),
        getItem("הערות מנחה", "10"),
        getItem("הערות שופט", "11"),
        getItem("צפייה בציון", "12")
      ]),
    privileges.isStudent && getItem("הגשות", "13", <FileOutlined />),
    privileges.isAdvisor &&
      getItem("פרוייקטים שלי", "20", <FundProjectionScreenOutlined />, [
        getItem("הזנת פרוייקט", "21"),
        getItem("סטטוס פרוייקטים", "22"),
        getItem("סטטוס הגשות", "23")
      ]),
    privileges.isCoordinator &&
      getItem("ניהול פרוייקטים", "24", <FundProjectionScreenOutlined />, [
        getItem("הזנת פרוייקט", "25"),
        getItem("הצגת פרוייקטים", "26")
      ]),
    privileges.isCoordinator &&
      getItem("ניהול משתמשים", "27", <FundProjectionScreenOutlined />, [
        getItem("הזנת סטודנטים", "28"),
        getItem("הזנת משתמש צוות", "29"),
        getItem("עדכון הרשאות", "30"),
        getItem("הצגת משתמשים", "31")
      ]),
      privileges.isCoordinator && getItem("ניהול מערכת", "99", <SettingOutlined />),
  ];

  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <div>
      <Layout
        style={{
          minHeight: "100vh",
        }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items} />
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
          <LoginOutlined className="logout-icon" />
        </Layout>
      </Layout>
    </div>
  );
};

export default Dashboard;
