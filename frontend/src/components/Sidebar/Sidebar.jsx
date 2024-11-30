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
  FilePdfOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});
  const [openSubmenus, setOpenSubmenus] = useState({
    myProject: false,
    myProjects: false,
    manageUsers: false,
    manageProjects: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-user`, {
          withCredentials: true,
        });
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error(error);
      }
    };
    loadUser();
  }, []);

  const toggleSubmenu = (submenu) => {
    setOpenSubmenus((prev) => {
      const newSubmenus = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === submenu ? !prev[key] : false;
        return acc;
      }, {});
      return newSubmenus;
    });
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
            <div
              className={`sidebar-option ${isActive("/home") ? "active" : ""}`}
              onClick={() => navigate("/home")}
              onMouseDown={(e) => handleMouseDown(e, "/home")}>
              <HomeOutlined />
              <span>בית</span>
            </div>
          </li>
          {user.isStudent && (
            <li>
              <div
                className={`sidebar-option ${isActive("/projects") ? "active" : ""}`}
                onClick={() => navigate("/projects")}
                onMouseDown={(e) => handleMouseDown(e, "/projects")}>
                <ProjectOutlined />
                <span>פרויקטים</span>
              </div>
            </li>
          )}
          <li>
            <div
              className={`sidebar-option ${isActive("/templates") ? "active" : ""}`}
              onClick={() => navigate("/templates")}
              onMouseDown={(e) => handleMouseDown(e, "/templates")}>
              <FileSearchOutlined />
              <span> תבנית דוחות</span>
            </div>
          </li>
          {user.isStudent && (
            <li className={`${openSubmenus.myProject ? "open" : "closed"}`}>
              <div
                className="sidebar-option"
                onClick={() => toggleSubmenu("myProject")}
                onMouseDown={(e) => handleMouseDown(e, "/my-project")}>
                <ApartmentOutlined />
                <span>הפרויקט שלי</span>
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
                  <li className={`${isActive("/my-project") ? "active" : ""}`}>הפרויקט שלי</li>
                  <li
                    className={`${isActive("/my-submissions") ? "active" : ""}`}
                    onClick={() => navigate("/my-submissions")}
                    onMouseDown={(e) => handleMouseDown(e, "/my-submissions")}>
                    הגשות
                  </li>
                </ul>
              </div>
            </li>
          )}
          {user.isAdvisor && (
            <li className={`${openSubmenus.myProjects ? "open" : "closed"}`}>
              <div
                className="sidebar-option"
                onClick={() => toggleSubmenu("myProjects")}
                onMouseDown={(e) => handleMouseDown(e, "/create-project")}>
                <FundProjectionScreenOutlined />
                <span>פרויקטים שלי</span>
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
                  <li
                    className={`${isActive("/create-project") ? "active" : ""}`}
                    onClick={() => navigate("/create-project")}
                    onMouseDown={(e) => handleMouseDown(e, "/create-project")}>
                    הזנת פרויקט
                  </li>
                  <li
                    className={`${isActive("/list-projects") ? "active" : ""}`}
                    onClick={() => navigate("/list-projects")}
                    onMouseDown={(e) => handleMouseDown(e, "/list-projects")}>
                    סטטוס פרויקטים
                  </li>
                  <li
                    className={`${isActive("/submission-status") ? "active" : ""}`}
                    onClick={() => navigate("/submission-status")}
                    onMouseDown={(e) => handleMouseDown(e, "/submission-status")}>
                    סטטוס הגשות
                  </li>
                </ul>
              </div>
            </li>
          )}

          {user.isCoordinator && (
            <li className={`sidebar-drop-menu ${openSubmenus.manageProjects ? "open" : "closed"}`}>
              <div
                className="sidebar-option"
                onClick={() => toggleSubmenu("manageProjects")}
                onMouseDown={(e) => handleMouseDown(e, "/overview-projects")}>
                <BarChartOutlined />
                <span>ניהול פרויקטים</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 10L12.35 15.65a.5.5 0 01-.7 0L6 10"
                    stroke="#0C0310"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className={`sidebar-drop-menu ${openSubmenus.manageProjects ? "open" : "closed"}`}>
                <ul>
                  <li
                    className={`${isActive("/overview-projects") ? "active" : ""}`}
                    onClick={() => navigate("/overview-projects")}
                    onMouseDown={(e) => handleMouseDown(e, "/overview-projects")}>
                    רשימת פרויקטים
                  </li>
                  <li
                    className={`sidebar-option ${isActive("/submissions") ? "active" : ""}`}
                    onClick={() => navigate("/submissions")}
                    onMouseDown={(e) => handleMouseDown(e, "/submissions")}>
                    ניהול הגשות
                  </li>
                </ul>
              </div>
            </li>
          )}
          {user.isCoordinator && (
            <li className={`${openSubmenus.manageUsers ? "open" : "closed"}`}>
              <div
                className="sidebar-option"
                onClick={() => toggleSubmenu("manageUsers")}
                onMouseDown={(e) => handleMouseDown(e, "/create-user")}>
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
                  <li
                    className={`${isActive("/create-user") ? "active" : ""}`}
                    onClick={() => navigate("/create-user")}
                    onMouseDown={(e) => handleMouseDown(e, "/create-user")}>
                    יצירת משתמשים
                  </li>
                  <li
                    className={`${isActive("/display-users") ? "active" : ""}`}
                    onClick={() => navigate("display-users")}
                    onMouseDown={(e) => handleMouseDown(e, "/display-users")}>
                    הצגת משתמשים
                  </li>
                </ul>
              </div>
            </li>
          )}
          {user.isJudge && (
            <li>
              <div
                className={`sidebar-option ${isActive("/check-submissions") ? "active" : ""}`}
                onClick={() => navigate("/check-submissions")}
                onMouseDown={(e) => handleMouseDown(e, "/check-submissions")}>
                <CheckCircleOutlined />
                <span>בדיקת הגשות</span>
              </div>
            </li>
          )}
          <li>
            <div
              className={`sidebar-option ${isActive("/more-information") ? "active" : ""}`}
              onClick={() => navigate("/more-information")}
              onMouseDown={(e) => handleMouseDown(e, "/more-information")}>
              <InfoCircleOutlined />
              <span>מידע לסטודנט</span>
            </div>
          </li>
          {user.isCoordinator && (
            <li>
              <div
                className={`sidebar-option ${isActive("/system") ? "active" : ""}`}
                onClick={() => navigate("/system")}
                onMouseDown={(e) => handleMouseDown(e, "/system")}>
                <SettingOutlined />
                <span>ניהול מערכת</span>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
