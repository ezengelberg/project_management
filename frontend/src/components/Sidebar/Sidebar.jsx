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
  InfoCircleOutlined,
  BarChartOutlined,
  MessageOutlined,
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
  const JudgeSVG = () => (
    <svg className="special-sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M20.01 19.26C19.82 19.26 19.63 19.19 19.48 19.04L14.53 14.09C14.24 13.8 14.24 13.32 14.53 13.03C14.82 12.74 15.3 12.74 15.59 13.03L20.54 17.98C20.83 18.27 20.83 18.75 20.54 19.04C20.39 19.19 20.2 19.26 20.01 19.26Z"
          fill="#e4dede"></path>
        <path
          d="M10.1099 18.43C9.37995 18.43 8.67995 18.14 8.16995 17.62L3.92994 13.38C2.85994 12.31 2.85994 10.56 3.92994 9.49003L10.9999 2.42005C12.0699 1.35005 13.8199 1.35005 14.8899 2.42005L19.13 6.66004C19.65 7.18004 19.94 7.87005 19.94 8.60005C19.94 9.33005 19.65 10.03 19.13 10.54L12.0599 17.61C11.5399 18.15 10.8499 18.43 10.1099 18.43ZM12.94 3.12004C12.62 3.12004 12.2999 3.24003 12.0599 3.49003L4.98995 10.56C4.49995 11.05 4.49995 11.84 4.98995 12.33L9.22994 16.57C9.69994 17.04 10.5199 17.04 10.9999 16.57L18.07 9.50004C18.31 9.26004 18.44 8.95004 18.44 8.62004C18.44 8.29004 18.31 7.97003 18.07 7.74003L13.83 3.50004C13.58 3.24004 13.26 3.12004 12.94 3.12004Z"
          fill="#e4dede"></path>
        <path
          d="M8 21.75H2C1.59 21.75 1.25 21.41 1.25 21C1.25 20.59 1.59 20.25 2 20.25H8C8.41 20.25 8.75 20.59 8.75 21C8.75 21.41 8.41 21.75 8 21.75Z"
          fill="#e4dede"></path>
        <path
          d="M13.63 15.74C13.44 15.74 13.25 15.67 13.1 15.52L6.03 8.44998C5.74 8.15998 5.74 7.67999 6.03 7.38999C6.32 7.09999 6.8 7.09999 7.09 7.38999L14.16 14.46C14.45 14.75 14.45 15.23 14.16 15.52C14.02 15.67 13.82 15.74 13.63 15.74Z"
          fill="#e4dede"></path>
      </g>
    </svg>
  );

  const MegaphoneSVG = () => (
    <svg
      style={{
        transform: "scaleX(-1)",
        transformOrigin: "center",
      }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M11,16H5c-2.7,0-5-2.2-5-5c0-2.8,2.2-5,5-5h6c0.6,0,1,0.4,1,1v8C12,15.6,11.6,16,11,16z M5,8c-1.6,0-3,1.3-3,3 c0,1.7,1.3,3,3,3h5V8H5z"
          fill="#e4dede"></path>
        <path
          d="M23,20c-0.1,0-0.2,0-0.3-0.1l-12-4C10.3,15.8,10,15.4,10,15V7c0-0.4,0.3-0.8,0.7-0.9l12-4C23,1.9,23.3,2,23.6,2.2 C23.8,2.4,24,2.7,24,3v16c0,0.3-0.2,0.6-0.4,0.8C23.4,19.9,23.2,20,23,20z M12,14.3l10,3.3V4.4L12,7.7V14.3z"
          fill="#e4dede"></path>
        <path
          d="M8,22H4c-0.3,0-0.6-0.2-0.8-0.4C3,21.3,2.9,21,3.1,20.7l2-6C5.2,14.3,5.6,14,6,14h4c0.3,0,0.6,0.2,0.8,0.4 c0.2,0.3,0.2,0.6,0.1,0.9l-2,6C8.8,21.7,8.4,22,8,22z M5.4,20h1.9l1.3-4H6.7L5.4,20z"
          fill="#e4dede"></path>
      </g>
    </svg>
  );

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
          {(user.isStudent || user.isAdvisor || user.isCoordinator) && (
            <li>
              <div
                className={`sidebar-option ${isActive("/announcements") ? "active" : ""}`}
                onClick={() => navigate("/announcements")}
                onMouseDown={(e) => handleMouseDown(e, "/announcements")}>
                <MessageOutlined />
                <span>הודעות</span>
              </div>
            </li>
          )}
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
            <li>
              <div
                className={`sidebar-option ${isActive("/my-submissions") ? "active" : ""}`}
                onClick={() => navigate("/my-submissions")}
                onMouseDown={(e) => handleMouseDown(e, "/my-submissions")}>
                <ApartmentOutlined />
                הגשות
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
                    הצגת פרויקטים
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
                <JudgeSVG />
                <span>בדיקת הגשות</span>
              </div>
            </li>
          )}
          {user.isStudent && <li>
            <div
              className={`sidebar-option ${isActive("/more-information") ? "active" : ""}`}
              onClick={() => navigate("/more-information")}
              onMouseDown={(e) => handleMouseDown(e, "/more-information")}>
              <InfoCircleOutlined />
              <span>מידע לסטודנט</span>
            </div>
          </li>}
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
