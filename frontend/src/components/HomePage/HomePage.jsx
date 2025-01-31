import React, { useContext, useEffect, useState } from "react";
import "./HomePage.scss";
import axios from "axios";
import { Alert, Calendar, Badge, Card } from "antd";
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
import dayjs from "dayjs";
import "dayjs/locale/he";
import { useNavigate } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";
import StudentSubmissions from "../UploadSubmissions/UploadSubmissions";
import AdvisorSubmissionsStatus from "../SubmissionsStatus/SubmissionsStatus";
import SubmissionsManagement from "../Submissions/Submissions";
import { NotificationsContext } from "../../utils/NotificationsContext";
import locale from "antd/es/date-picker/locale/he_IL";
import { HebrewCalendar } from "@hebcal/core";

const Homepage = () => {
  const navigate = useNavigate();
  const { newNotifications, markNotificationAsRead, fetchNotifications } = useContext(NotificationsContext);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [value, setValue] = useState(() => dayjs());
  const [selectedValue, setSelectedValue] = useState(() => dayjs());
  const [userProject, setUserProject] = useState(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [submissions, setSubmissions] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const JournalSVG = () => (
    <svg viewBox="0 0 16 16" fill="#000000" className="special-icons">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          fillRule="evenodd"
          d="M10.854 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 8.793l2.646-2.647a.5.5 0 0 1 .708 0z"></path>
        <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"></path>
        <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z"></path>
      </g>
    </svg>
  );

  useEffect(() => {
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

    fetchUserProject();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/submission/get-student-submissions`,
          {
            withCredentials: true,
          }
        );
        setSubmissions(response.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/zoom/meetings`, {
          withCredentials: true,
        });
        setMeetings(response.data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  const getListData = (value) => {
    let listData = [];
    submissions.forEach((submission) => {
      if (dayjs(submission.submissionDate).isSame(value, "day")) {
        listData.push({
          color: "purple",
          content: `${submission.name}`,
          time: submission.submissionDate,
        });
      }
    });
    return listData;
  };

  const getMeetingsData = (value) => {
    let meetingsData = [];
    meetings.forEach((meeting) => {
      if (dayjs(meeting.startTime).isSame(value, "day")) {
        meetingsData.push({
          color: "blue",
          content: `${meeting.topic}`,
          time: meeting.startTime,
          link: currentUser._id === meeting.creator ? meeting.startUrl : meeting.joinUrl,
          endTime: meeting.endTime,
        });
      }
    });
    return meetingsData;
  };

  const getJewishHolidays = (year) => {
    const holidays = HebrewCalendar.calendar({
      year,
      isHebrewYear: false,
      noMinorFast: true,
      noSpecialShabbat: true,
      noModern: true,
      noRoshChodesh: true,
      sedrot: false,
      omer: false,
      candlelighting: false,
      locale: "he",
    });
    return holidays;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    const meetingsData = getMeetingsData(value);
    const gregorianDate = value.toDate();
    const holidays = getJewishHolidays(gregorianDate.getFullYear());

    const holiday = holidays.find((h) => {
      const hDate = h.getDate().greg();
      return (
        hDate.getFullYear() === gregorianDate.getFullYear() &&
        hDate.getMonth() === gregorianDate.getMonth() &&
        hDate.getDate() === gregorianDate.getDate()
      );
    });

    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge
              color={item.color}
              text={
                windowSize.width > 1920
                  ? item.content.length > 18
                    ? `${item.content.substring(0, 18)}...`
                    : item.content
                  : windowSize.width > 1600
                  ? item.content.length > 10
                    ? `${item.content.substring(0, 10)}...`
                    : item.content
                  : windowSize.width > 1200
                  ? item.content.length > 8
                    ? `${item.content.substring(0, 8)}...`
                    : item.content
                  : windowSize.width > 768
                  ? item.content.length > 8
                    ? `${item.content.substring(0, 8)}...`
                    : item.content
                  : windowSize.width > 626
                  ? "הגשה"
                  : ""
              }
            />
          </li>
        ))}
        {meetingsData.map((item) => (
          <li key={item.content}>
            <Badge
              color={item.color}
              text={
                windowSize.width > 1920
                  ? item.content.length > 18
                    ? `${item.content.substring(0, 18)}...`
                    : item.content
                  : windowSize.width > 1600
                  ? item.content.length > 10
                    ? `${item.content.substring(0, 10)}...`
                    : item.content
                  : windowSize.width > 1200
                  ? item.content.length > 8
                    ? `${item.content.substring(0, 8)}...`
                    : item.content
                  : windowSize.width > 768
                  ? item.content.length > 8
                    ? `${item.content.substring(0, 8)}...`
                    : item.content
                  : windowSize.width > 626
                  ? "פגישה"
                  : ""
              }
            />
          </li>
        ))}
        {holiday ? (
          <Badge
            className="holiday-badge"
            color="gold"
            text={
              windowSize.width > 1920
                ? holiday.render().length > 25
                  ? `${holiday.render().substring(0, 25)}...`
                  : holiday.render()
                : windowSize.width > 1600
                ? holiday.render().length > 20
                  ? `${holiday.render().substring(0, 20)}...`
                  : holiday.render()
                : windowSize.width > 1200
                ? holiday.render().length > 15
                  ? `${holiday.render().substring(0, 15)}...`
                  : holiday.render()
                : windowSize.width > 768
                ? holiday.render().length > 10
                  ? `${holiday.render().substring(0, 10)}...`
                  : holiday.render()
                : windowSize.width > 626
                ? "חג"
                : ""
            }
          />
        ) : null}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    return info.originNode;
  };

  const onSelect = (newValue) => {
    setValue(newValue);
    setSelectedValue(newValue);
  };

  const selectedDateSubmissions = getListData(selectedValue);
  const selectedDateMeetings = getMeetingsData(selectedValue);
  const selectedDateHolidays = getJewishHolidays(selectedValue.year()).filter((holiday) => {
    const hDate = holiday.getDate().greg();
    return (
      hDate.getFullYear() === selectedValue.year() &&
      hDate.getMonth() === selectedValue.month() &&
      hDate.getDate() === selectedValue.date()
    );
  });

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
      markNotificationAsRead(notification._id);
    }
  };

  const handleNotificationClose = (notificationId) => {
    markNotificationAsRead(notificationId);
  };

  return (
    <div className="home-page">
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
                onClick={() => navigate("/journal")}
                onMouseDown={(e) => handleMouseDown(e, "/journal")}>
                <JournalSVG />
                <p>יומן עבודה</p>
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
            {(currentUser.isAdvisor || currentUser.isCoordinator) && (
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
            {newNotifications.length === 0 ? (
              <p style={{ fontSize: "20px" }}>אין התראות חדשות</p>
            ) : (
              newNotifications.slice(0, 3).map((notification) => (
                <Alert
                  key={notification._id}
                  description={
                    <div className="notification-list-message">
                      {notification.link ? (
                        <a onClick={() => handleNotificationClick(notification)}>
                          <p>
                            {windowSize.width > 1200
                              ? notification.message.length > 125
                                ? `${notification.message.slice(0, 125)}...`
                                : notification.message
                              : windowSize.width > 1024
                              ? notification.message.length > 115
                                ? `${notification.message.slice(0, 115)}...`
                                : notification.message
                              : notification.message.length > 90
                              ? `${notification.message.slice(0, 90)}...`
                              : notification.message}
                            <br />
                            <span className="notification-list-date">
                              {new Date(notification.createdAt).toLocaleString("he-IL", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </p>
                        </a>
                      ) : (
                        <p>
                          {windowSize.width > 1200
                            ? notification.message.length > 125
                              ? `${notification.message.slice(0, 125)}...`
                              : notification.message
                            : windowSize.width > 1024
                            ? notification.message.length > 115
                              ? `${notification.message.slice(0, 115)}...`
                              : notification.message
                            : notification.message.length > 105
                            ? `${notification.message.slice(0, 105)}...`
                            : notification.message}
                          <br />
                          <span className="notification-list-date">
                            {new Date(notification.createdAt).toLocaleString("he-IL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      )}
                      <CloseOutlined
                        className="notification-list-close-icon"
                        onClick={() => handleNotificationClose(notification._id)}
                      />
                    </div>
                  }
                  type="info"
                  showIcon
                />
              ))
            )}
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
      <div className="home-page-upcoming-events">
        <Calendar className="calendar" locale={locale} value={value} onSelect={onSelect} cellRender={cellRender} />
        <Alert
          className="list-info"
          message={`${selectedValue?.format("DD-MM-YYYY")}`}
          description={
            selectedDateSubmissions.length > 0 || selectedDateHolidays.length > 0 || selectedDateMeetings.length > 0 ? (
              <ul>
                {selectedDateSubmissions.map((item) => (
                  <Badge.Ribbon key={item.content} text="הגשה" color="purple">
                    <Card title="יום אחרון להגשה" size="small">
                      {item.content} - <strong>עד השעה: {dayjs(item.time).format("HH:mm")}</strong>
                    </Card>
                  </Badge.Ribbon>
                ))}
                {selectedDateMeetings.map((item) => (
                  <Badge.Ribbon key={item.content} text="פגישה" color="blue">
                    <Card title="פגישת זום" size="small">
                      נושא: {item.content} - <strong>בשעה: {dayjs(item.time).format("HH:mm")}</strong> -{" "}
                      {dayjs().isAfter(dayjs(item.endTime)) ? (
                        "הפגישה הסתיימה"
                      ) : item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          הצטרף לפגישה
                        </a>
                      ) : (
                        ""
                      )}
                    </Card>
                  </Badge.Ribbon>
                ))}
                {selectedDateHolidays.map((holiday) => (
                  <Badge.Ribbon key={holiday.render()} text="חג" color="gold">
                    <Card title="חג" size="small">
                      {holiday.render()}
                    </Card>
                  </Badge.Ribbon>
                ))}
              </ul>
            ) : (
              "אין אירועים מתוזמנים"
            )
          }
        />
      </div>
    </div>
  );
};

export default Homepage;
