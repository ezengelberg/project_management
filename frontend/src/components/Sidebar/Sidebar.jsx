import "./Sidebar.scss";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  HomeOutlined,
  ProjectOutlined,
  FileSearchOutlined,
  ApartmentOutlined,
  FundProjectionScreenOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});
  const [openSubmenus, setOpenSubmenus] = useState({
    myProject: false,
    myProjects: false,
    manageUsers: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/get-user", { withCredentials: true });
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error(error);
      }
    };
    loadUser();
  }, []);

  const toggleSubmenu = (submenu) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [submenu]: !prev[submenu],
    }));
  };

  const isActive = (path) => {
    if (typeof path === "string") {
      return location.pathname === path;
    }
    return path.some((p) => location.pathname === p);
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-actions">
        <div className="sidebar-greeting">
          <h3>שלום, {user.name}</h3>
        </div>
        <ul>
          <li>
            <div className={`sidebar-option ${isActive("/home") ? "active" : ""}`} onClick={() => navigate("/home")}>
              <HomeOutlined />
              <span>בית</span>
            </div>
          </li>
          <li>
            <div className="sidebar-option" onClick={() => navigate("/projects")}>
              <ProjectOutlined />
              <span>פרוייקטים</span>
            </div>
          </li>
          <li>
            <div className="sidebar-option" onClick={() => navigate("/templates")}>
              <FileSearchOutlined />
              <span> תבנית דוחות</span>
            </div>
          </li>
          <li className={`${openSubmenus.myProject ? "open" : "closed"}`}>
            <div className="sidebar-option" onClick={() => toggleSubmenu("myProject")}>
              <ApartmentOutlined />
              <span>הפרוייקט שלי</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 10L12.35 15.65a.5.5 0 01-.7 0L6 10"
                  stroke="#0C0310"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className={`sidebar-drop-menu`}>
              <ul>
                <li>הפרוייקט שלי</li>
                <li>הצגת קבצים</li>
                <li>הגשות</li>
                <li>הערות מנחה</li>
                <li>הערות שופט</li>
                <li>צפיה בציון</li>
              </ul>
            </div>
          </li>
          <li className={`${openSubmenus.myProjects ? "open" : "closed"}`}>
            <div className="sidebar-option" onClick={() => toggleSubmenu("myProjects")}>
              <FundProjectionScreenOutlined />
              <span>פרוייקטים שלי</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 10L12.35 15.65a.5.5 0 01-.7 0L6 10"
                  stroke="#0C0310"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className={`sidebar-drop-menu ${openSubmenus.myProjects ? "open" : "closed"}`}>
              <ul>
                <li onClick={() => navigate("/create-project")}>הזנת פרוייקט</li>
                <li onClick={() => navigate("/list-projects")}>סטטוס פרוייקטים</li>
                <li onClick={() => {}}>סטטוס הגשות</li>
              </ul>
            </div>
          </li>
          <li>
            <div className="sidebar-option">
              <FundProjectionScreenOutlined />
              <span>ניהול פרוייקטים</span>
            </div>
          </li>
          <li className={`${openSubmenus.manageUsers ? "open" : "closed"}`}>
            <div className="sidebar-option" onClick={() => toggleSubmenu("manageUsers")}>
              <TeamOutlined />
              <span>ניהול משתמשים</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 10L12.35 15.65a.5.5 0 01-.7 0L6 10"
                  stroke="#0C0310"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className={`sidebar-drop-menu`}>
              <ul>
                <li onClick={() => navigate("/create-user")}>יצירת משתמשים</li>
                <li>עדכון הרשאות</li>
                <li onClick={() => navigate("display-users")}>הצגת משתמשים</li>
              </ul>
            </div>
          </li>
          <li>
            <div className="sidebar-option">
              <SettingOutlined />
              <span>ניהול מערכת</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
