import React, { useEffect, useState, useRef } from "react";
import "./Sidebar.scss";
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
  CloseOutlined,
  LogoutOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [user, setUser] = useState({});
  const [openSubmenus, setOpenSubmenus] = useState({
    myProject: false,
    myProjects: false,
    manageUsers: false,
    manageProjects: false,
  });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const HamburgerSVG = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M20 7L4 7" stroke="#001529" strokeWidth="1.5" strokeLinecap="round"></path>
        <path d="M20 12L4 12" stroke="#001529" strokeWidth="1.5" strokeLinecap="round"></path>
        <path d="M20 17L4 17" stroke="#001529" strokeWidth="1.5" strokeLinecap="round"></path>
      </g>
    </svg>
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-user`, {
          withCredentials: true,
        });
        console.log("User data:", response.data);
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

  const handleNavigate = (path) => {
    navigate(path);
    setIsSidebarVisible(false);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/logout`, null, {
        withCredentials: true,
      });
      navigate("/login", { replace: true });
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  return (
    <>
      {!isSidebarVisible && windowSize.width <= 1024 && (
        <button className="hamburger-button" onClick={toggleSidebar}>
          {!isSidebarVisible && <HamburgerSVG />}
        </button>
      )}
      <div ref={sidebarRef} className={`sidebar-container ${isSidebarVisible ? "open" : ""}`}>
        {isSidebarVisible && (
          <button className="close-button" onClick={toggleSidebar}>
            {isSidebarVisible && <CloseOutlined />}
          </button>
        )}
        <div className="sidebar-actions">
          <div className="sidebar-greeting">
            <h3>שלום, {user.name}</h3>
          </div>
          <ul>
            <li>
              <div
                className={`sidebar-option ${isActive("/home") ? "active" : ""}`}
                onClick={() => handleNavigate("/home")}
                onMouseDown={(e) => handleMouseDown(e, "/home")}>
                <HomeOutlined />
                <span>בית</span>
              </div>
            </li>
            {/* {(user.isStudent || user.isAdvisor || user.isCoordinator) && (
              <li>
                <div
                  className={`sidebar-option ${isActive("/announcements") ? "active" : ""}`}
                  onClick={() => handleNavigate("/announcements")}
                  onMouseDown={(e) => handleMouseDown(e, "/announcements")}>
                  <MessageOutlined />
                  <span>הודעות</span>
                </div>
              </li>
            )} */}
            {user.isStudent && (
              <li>
                <div
                  className={`sidebar-option ${isActive("/projects") ? "active" : ""}`}
                  onClick={() => handleNavigate("/projects")}
                  onMouseDown={(e) => handleMouseDown(e, "/projects")}>
                  <ProjectOutlined />
                  <span>פרויקטים</span>
                </div>
              </li>
            )}
            <li>
              <div
                className={`sidebar-option ${isActive("/templates") ? "active" : ""}`}
                onClick={() => handleNavigate("/templates")}
                onMouseDown={(e) => handleMouseDown(e, "/templates")}>
                <FileSearchOutlined />
                <span> תבנית דוחות</span>
              </div>
            </li>
            {user.isStudent && (
              <li>
                <div
                  className={`sidebar-option ${isActive("/my-submissions") ? "active" : ""}`}
                  onClick={() => handleNavigate("/my-submissions")}
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
                      onClick={() => handleNavigate("/create-project")}
                      onMouseDown={(e) => handleMouseDown(e, "/create-project")}>
                      הזנת פרויקט
                    </li>
                    <li
                      className={`${isActive("/list-projects") ? "active" : ""}`}
                      onClick={() => handleNavigate("/list-projects")}
                      onMouseDown={(e) => handleMouseDown(e, "/list-projects")}>
                      סטטוס פרויקטים
                    </li>
                    <li
                      className={`${isActive("/submission-status") ? "active" : ""}`}
                      onClick={() => handleNavigate("/submission-status")}
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
                      onClick={() => handleNavigate("/overview-projects")}
                      onMouseDown={(e) => handleMouseDown(e, "/overview-projects")}>
                      הצגת פרויקטים
                    </li>
                    <li
                      className={`sidebar-option ${isActive("/submissions") ? "active" : ""}`}
                      onClick={() => handleNavigate("/submissions")}
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
                      onClick={() => handleNavigate("/create-user")}
                      onMouseDown={(e) => handleMouseDown(e, "/create-user")}>
                      יצירת משתמשים
                    </li>
                    <li
                      className={`${isActive("/display-users") ? "active" : ""}`}
                      onClick={() => handleNavigate("/display-users")}
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
                  onClick={() => handleNavigate("/check-submissions")}
                  onMouseDown={(e) => handleMouseDown(e, "/check-submissions")}>
                  <JudgeSVG />
                  <span>בדיקת הגשות</span>
                </div>
              </li>
            )}
            {user.isStudent && (
              <li>
                <div
                  className={`sidebar-option ${isActive("/more-information") ? "active" : ""}`}
                  onClick={() => handleNavigate("/more-information")}
                  onMouseDown={(e) => handleMouseDown(e, "/more-information")}>
                  <InfoCircleOutlined />
                  <span>מידע לסטודנט</span>
                </div>
              </li>
            )}
            {user.isCoordinator && (
              <li>
                <div
                  className={`sidebar-option ${isActive("/system") ? "active" : ""}`}
                  onClick={() => handleNavigate("/system")}
                  onMouseDown={(e) => handleMouseDown(e, "/system")}>
                  <SettingOutlined />
                  <span>ניהול מערכת</span>
                </div>
              </li>
            )}
            {windowSize.width <= 768 && (
              <li>
                <div className="sidebar-option" onClick={handleLogout}>
                  <LogoutOutlined className="logout-icon" />
                  <span>התנתקות</span>
                </div>
              </li>
            )}
            {user.isCoordinator && (
              <li>
                <div
                  className={`sidebar-option ${isActive("/delete-all") ? "active" : ""}`}
                  onClick={() => handleNavigate("/delete-all")}
                  onMouseDown={(e) => handleMouseDown(e, "/delete-all")}>
                  <DeleteOutlined />
                  <span>מחיקת מערכת</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
