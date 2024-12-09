import React, { useEffect, useState } from "react";
import "./HomePage.scss";
import axios from "axios";
import { Statistic, Alert, Calendar } from "antd";
import {
  ApartmentOutlined,
  ProjectOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  BarChartOutlined,
  UserAddOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import dayjs from "dayjs";
import "dayjs/locale/he";
import localeData from "dayjs/plugin/localeData";
import { useNavigate } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";
import StudentSubmissions from "../UploadSubmissions/UploadSubmissions";
import AdvisorSubmissionsStatus from "../SubmissionsStatus/SubmissionsStatus";
import SubmissionsManagement from "../Submissions/Submissions";

const Homepage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [numOfOpenProjects, setNumOfOpenProjects] = useState(0);
  const [numOfTakenProjects, setNumOfTakenProjects] = useState(0);
  const [numOfFinishedProjects, setNumOfFinishedProjects] = useState(0);
  const [value, setValue] = useState(() => dayjs());
  const [selectedValue, setSelectedValue] = useState(() => dayjs());
  const [notifications, setNotifications] = useState([]);
  const [userProject, setUserProject] = useState(null);
  const CreateProjectSVG = () => (
    <svg className="special-icons" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <rect x="0" fill="none" width="24" height="24"></rect>
        <g>
          <path d="M21 14v5c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2V5c0-1.105.895-2 2-2h5v2H5v14h14v-5h2z"></path>
          <path d="M21 7h-4V3h-2v4h-4v2h4v4h2V9h4"></path>
        </g>
      </g>
    </svg>
  );
  const ProjectsStatusSVG = () => (
    <svg className="special-icons" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M6.87988 18.1501V16.0801" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round"></path>
        <path d="M12 18.15V14.01" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round"></path>
        <path d="M17.1201 18.1499V11.9299" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round"></path>
        <path
          d="M17.1199 5.8501L16.6599 6.3901C14.1099 9.3701 10.6899 11.4801 6.87988 12.4301"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeLinecap="round"></path>
        <path
          d="M14.1899 5.8501H17.1199V8.7701"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"></path>
        <path
          d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"></path>
      </g>
    </svg>
  );
  const JudgeSVG = () => (
    <svg className="special-icons" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M20.01 19.26C19.82 19.26 19.63 19.19 19.48 19.04L14.53 14.09C14.24 13.8 14.24 13.32 14.53 13.03C14.82 12.74 15.3 12.74 15.59 13.03L20.54 17.98C20.83 18.27 20.83 18.75 20.54 19.04C20.39 19.19 20.2 19.26 20.01 19.26Z"
          fill="#000000"></path>
        <path
          d="M10.1099 18.43C9.37995 18.43 8.67995 18.14 8.16995 17.62L3.92994 13.38C2.85994 12.31 2.85994 10.56 3.92994 9.49003L10.9999 2.42005C12.0699 1.35005 13.8199 1.35005 14.8899 2.42005L19.13 6.66004C19.65 7.18004 19.94 7.87005 19.94 8.60005C19.94 9.33005 19.65 10.03 19.13 10.54L12.0599 17.61C11.5399 18.15 10.8499 18.43 10.1099 18.43ZM12.94 3.12004C12.62 3.12004 12.2999 3.24003 12.0599 3.49003L4.98995 10.56C4.49995 11.05 4.49995 11.84 4.98995 12.33L9.22994 16.57C9.69994 17.04 10.5199 17.04 10.9999 16.57L18.07 9.50004C18.31 9.26004 18.44 8.95004 18.44 8.62004C18.44 8.29004 18.31 7.97003 18.07 7.74003L13.83 3.50004C13.58 3.24004 13.26 3.12004 12.94 3.12004Z"
          fill="#000000"></path>
        <path
          d="M8 21.75H2C1.59 21.75 1.25 21.41 1.25 21C1.25 20.59 1.59 20.25 2 20.25H8C8.41 20.25 8.75 20.59 8.75 21C8.75 21.41 8.41 21.75 8 21.75Z"
          fill="#000000"></path>
        <path
          d="M13.63 15.74C13.44 15.74 13.25 15.67 13.1 15.52L6.03 8.44998C5.74 8.15998 5.74 7.67999 6.03 7.38999C6.32 7.09999 6.8 7.09999 7.09 7.38999L14.16 14.46C14.45 14.75 14.45 15.23 14.16 15.52C14.02 15.67 13.82 15.74 13.63 15.74Z"
          fill="#000000"></path>
      </g>
    </svg>
  );

  useEffect(() => {
    dayjs.locale("he");
    dayjs.extend(localeData);
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/status`, {
          withCredentials: true,
        });
        setNumOfOpenProjects(response.data.numOfOpenProjects);
        setNumOfTakenProjects(response.data.numOfTakenProjects);
        setNumOfFinishedProjects(response.data.numOfFinishedProjects);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications`, {
          withCredentials: true,
        });
        setNotifications(response.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const fetchUserProject = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/user-project`, {
          withCredentials: true,
        });
        setUserProject(response.data);
      } catch (error) {
        console.error("Error fetching user project:", error);
      }
    };

    fetchData();
    fetchNotifications();
    fetchUserProject();
  }, []);

  const onSelect = (newValue) => {
    setValue(newValue);
    setSelectedValue(newValue);
  };
  const onPanelChange = (newValue) => {
    setValue(newValue);
  };

  const getMonthLabel = (month, value) => {
    const monthLables = {
      0: "ינואר",
      1: "פברואר",
      2: "מרץ",
      3: "אפריל",
      4: "מאי",
      5: "יוני",
      6: "יולי",
      7: "אוגוסט",
      8: "ספטמבר",
      9: "אוקטובר",
      10: "נובמבר",
      11: "דצמבר",
    };
    return monthLables[month];
  };

  const formatter = (value) => <CountUp end={value} separator="," />;

  const handleNotificationClick = async (notification) => {
    if (notification.link) {
      try {
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications/read/${notification._id}`, null, {
          withCredentials: true,
        });
        navigate(notification.link);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  return (
    <div className="home-page">
      {currentUser.isCoordinator && (
        <div className="home-page-statistics">
          <Statistic title="פרויקטים פתוחים" value={numOfOpenProjects} formatter={formatter} />
          <Statistic title="פרויקטים לקוחים" value={numOfTakenProjects} formatter={formatter} />
          <Statistic title="פרויקטים שהושלמו" value={numOfFinishedProjects} formatter={formatter} />
        </div>
      )}
      <div className="home-page-info">
        <div className="home-page-quick-links">
          <h2>קישורים מהירים</h2>
          <div className="home-page-quick-links-list">
            {currentUser.isCoordinator && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/overview-projects")}
                onMouseDown={(e) => handleMouseDown(e, "/overview-projects")}>
                <BarChartOutlined />
                <p>ניהול פרויקטים</p>
              </div>
            )}
            {currentUser.isCoordinator && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/create-user")}
                onMouseDown={(e) => handleMouseDown(e, "/create-user")}>
                <UserAddOutlined />
                <p>הוספת משתמשים</p>
              </div>
            )}
            {currentUser.isCoordinator && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/display-users")}
                onMouseDown={(e) => handleMouseDown(e, "/display-users")}>
                <TeamOutlined />
                <p>ניהול משתמשים</p>
              </div>
            )}
            {currentUser.isCoordinator && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/system")}
                onMouseDown={(e) => handleMouseDown(e, "/system")}>
                <SettingOutlined />
                <p>ניהול מערכת</p>
              </div>
            )}
            {userProject && (
              <div
                className="quick-link-item"
                onClick={() => navigate(`/project/${userProject._id}`)}
                onMouseDown={(e) => handleMouseDown(e, `/project/${userProject._id}`)}>
                <ApartmentOutlined />
                <p>דף הפרויקט</p>
              </div>
            )}
            {currentUser.isStudent && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/templates")}
                onMouseDown={(e) => handleMouseDown(e, "/templates")}>
                <FileSearchOutlined />
                <p>תבנית דוחות הגשה</p>
              </div>
            )}
            {currentUser.isAdvisor && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/create-project")}
                onMouseDown={(e) => handleMouseDown(e, "/create-project")}>
                <CreateProjectSVG />
                <p>הוספת פרויקט חדש</p>
              </div>
            )}
            {currentUser.isAdvisor && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/list-projects")}
                onMouseDown={(e) => handleMouseDown(e, "/list-projects")}>
                <ProjectsStatusSVG />
                <p>סטטוס פרויקטים</p>
              </div>
            )}
            {currentUser.isJudge && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/check-submissions")}
                onMouseDown={(e) => handleMouseDown(e, "/check-submissions")}>
                <JudgeSVG />
                <p>בדיקת הגשות</p>
              </div>
            )}
            {currentUser.isStudent && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/projects")}
                onMouseDown={(e) => handleMouseDown(e, "/projects")}>
                <ProjectOutlined />
                <p>כל הפרויקטים</p>
              </div>
            )}
            {currentUser.isStudent && (
              <div
                className="quick-link-item"
                onClick={() => navigate("/more-information")}
                onMouseDown={(e) => handleMouseDown(e, "/more-information")}>
                <InfoCircleOutlined />
                <p>מידע נוסף</p>
              </div>
            )}
          </div>
        </div>
        <div className="home-page-notifications">
          <div className="home-page-notifications-header">
            <h2>התראות</h2>
            <span onClick={() => navigate("/notifications")} onMouseDown={(e) => handleMouseDown(e, "/notifications")}>
              כל ההתראות
            </span>
          </div>
          <div className="home-page-notifications-list">
            {notifications.map((notification) => (
              <Alert
                key={notification._id}
                description={
                  <div className="notification-list-message">
                    {notification.link ? (
                      <a onClick={() => handleNotificationClick(notification)}>{notification.message}</a>
                    ) : (
                      notification.message
                    )}
                    <CloseOutlined className="notification-list-close-icon" />
                  </div>
                }
                type="info"
                showIcon
              />
            ))}
          </div>
        </div>
      </div>

      <div className="home-page-main-content">
        {currentUser.isStudent && (
          <>
            <h2 style={{ marginBottom: "10px" }}>הגשת דוחות</h2>
            <StudentSubmissions />
          </>
        )}
        {currentUser.isAdvisor && (
          <>
            <h2 style={{ marginBottom: "10px" }}>סטטוס הגשות</h2>
            <AdvisorSubmissionsStatus />
          </>
        )}
        {currentUser.isCoordinator && (
          <>
            <h2 style={{ marginBottom: "10px" }}>ניהול הגשות</h2>
            <SubmissionsManagement />
          </>
        )}
      </div>

      {/* <div className="home-page-upcoming-events">
        <h2>אירועים קרובים</h2>
        <div className="home-page-upcoming-events-list">
          <Calendar
            className="list-calendar"
            value={value}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            locale={{
              lang: {
                locale: "he",
                month: getMonthLabel(value.month(), value),
                year: value.year(),
                day: value.day(),
                shortWeekDays: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
              },
            }}
            firstDayOfWeek={0}
          />
          <Alert className="list-info" message={`You selected date: ${selectedValue?.format("DD-MM-YYYY")}`} />
        </div>
      </div> */}
    </div>
  );
};

export default Homepage;
