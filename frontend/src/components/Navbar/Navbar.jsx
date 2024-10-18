import React, { useState } from "react";
import "./Navbar.css";
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
} from "@ant-design/icons";
import { Layout, Menu } from "antd";

const Navbar = () => {
  const { Sider } = Layout;
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
    getItem("בית", "1", <HomeOutlined />),
    getItem("פרוייקטים", "2", <ProjectOutlined />),
    getItem("תבנית דוחות", "sub1", <FileSearchOutlined />, [
      getItem("דוח אלפא", "3"),
      getItem("דוח בטא", "4"),
      getItem("דוח סופי", "5"),
    ]),
    getItem("הפרוייקט שלי", "6", <ApartmentOutlined />, [
      getItem("דף הפרוייקט", "7"),
      getItem("הצגת קבצים", "8"),
      getItem("הגשות", "9"),
      getItem("הערות מנחה", "10"),
      getItem("הערות שופט", "11"),
      getItem("צפייה בציון", "12"),
    ]),
    getItem("Files", "6", <FileOutlined />),
  ];

  const coordinatorItems = [
    getItem("הזנת סטודנטים", "6", <UsergroupAddOutlined />),
    getItem("מנחים", "sub2", <PieChartOutlined />, [
      getItem("מנחה חדש", "7"),
      getItem("הצגת מנחים", "8"),
      getItem("עדכון הרשאות", "9"),
    ]),
    getItem("בחירת שופטים", "10", <SelectOutlined />),
    getItem("הצגת משתמשים", "11", <UnorderedListOutlined />),
  ];

  const advisorItems = [getItem("הזנת פרוייקט", "6", <DesktopOutlined />)];

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <Layout
        style={{
          minHeight: "100vh",
        }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items} />
          <hr />
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={coordinatorItems} />
          <hr />
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={advisorItems} />
        </Sider>
      </Layout>
    </div>
  );
};

export default Navbar;
