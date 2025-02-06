import React, { useEffect, useState, useRef } from "react";
import "./Sidebar.scss";
import "../../index.css";
import axios from "axios";
import { io } from "socket.io-client";
import { FloatButton, Drawer, Badge } from "antd";
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
    CommentOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";
import Chat from "../Chat/Chat";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);
    const [user, setUser] = useState({});
    const [chats, setChats] = useState([]);
    const [openSubmenus, setOpenSubmenus] = useState({
        myProject: false,
        myProjects: false,
        manageUsers: false,
        manageProjects: false,
        zoomMeetings: false,
    });
    const [open, setOpen] = useState(false);
    const [chatTarget, setChatTarget] = useState(null);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const socket = io(process.env.REACT_APP_BACKEND_URL, { withCredentials: true });
    const socketRef = useRef();

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

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

    useEffect(() => {
        // Only create socket if it doesn't exist
        if (!socketRef.current) {
            socketRef.current = io(process.env.REACT_APP_BACKEND_URL, {
                withCredentials: true,
                transports: ["websocket", "polling"],
            });

            socketRef.current.on("connect", () => {
                fetchChats().then((userChats) => {
                    console.log("User chats:", userChats);
                    if (userChats?.length) {
                        socketRef.current.emit(
                            "join_chats",
                            userChats.map((chat) => chat._id),
                        );
                    }
                });
            });

            socketRef.current.on("receive_chat", (updatedChat) => {
                setChats((prevChats) =>
                    prevChats
                        .map((chat) =>
                            chat._id === updatedChat._id
                                ? {
                                      ...updatedChat,
                                      unreadTotal:
                                          updatedChat.lastMessage.sender === user._id
                                              ? chat.unreadTotal
                                              : chat.unreadTotal + 1,
                                  }
                                : chat,
                        )
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
                );
            });

            socketRef.current.on("new_message", (data) => {
                console.log("New message received:", data);
                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat._id === data.chatID
                            ? {
                                  ...chat,
                                  lastMessage: data, // Update last message
                              }
                            : chat,
                    ),
                );
            });
        }

        // Cleanup socket only when component unmounts
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []); // Empty dependency array

    const fetchChats = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/chat/`, {
                withCredentials: true,
            });
            setChats(response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            // returning for socket purposes
            return response.data;
        } catch (error) {
            console.error("Error occurred:", error);
        }
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

    const JournalSVG = () => (
        <svg viewBox="0 0 16 16" fill="#e4dede" className="special-sidebar-icon" style={{ height: "16px" }}>
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

    const ZoomMeetingSVG = () => (
        <svg
            className="special-sidebar-icon zoom-icon"
            viewBox="0 0 192 192"
            xmlns="http://www.w3.org/2000/svg"
            fill="none">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    stroke="#e4dede"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="11.997"
                    d="M16.869 60.973v53.832c.048 12.173 10.87 21.965 24.072 21.925h85.406c2.42 0 4.385-1.797 4.385-3.978V78.92c-.064-12.164-10.887-21.965-24.073-21.917H21.237c-2.412 0-4.368 1.79-4.368 3.97zm119.294 21.006 35.27-23.666c3.06-2.332 5.432-1.749 5.432 2.468v72.171c0 4.8-2.9 4.217-5.432 2.468l-35.27-23.618V81.98z"></path>
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
        fetchChats();
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
                        {(user.isStudent || user.isAdvisor || user.isCoordinator) && (
                            <li>
                                <div
                                    className={`sidebar-option ${isActive("/announcements") ? "active" : ""}`}
                                    onClick={() => handleNavigate("/announcements")}
                                    onMouseDown={(e) => handleMouseDown(e, "/announcements")}>
                                    <MessageOutlined />
                                    <span>הודעות</span>
                                </div>
                            </li>
                        )}

                        {user.isStudent && (
                            <li>
                                <div
                                    className={`sidebar-option ${isActive("/journal") ? "active" : ""}`}
                                    onClick={() => handleNavigate("/journal")}
                                    onMouseDown={(e) => handleMouseDown(e, "/journal")}>
                                    <JournalSVG />
                                    <span>יומן עבודה</span>
                                </div>
                            </li>
                        )}
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
                        {user.isCoordinator && !user.isAdvisor && (
                            <li>
                                <div
                                    className={`sidebar-option ${isActive("/create-project") ? "active" : ""}`}
                                    onClick={() => handleNavigate("/create-project")}
                                    onMouseDown={(e) => handleMouseDown(e, "/create-project")}>
                                    <ApartmentOutlined />
                                    יצירת פרויקט חדש
                                </div>
                            </li>
                        )}
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
                                            className={`${isActive("/journal-status") ? "active" : ""}`}
                                            onClick={() => handleNavigate("/journal-status")}
                                            onMouseDown={(e) => handleMouseDown(e, "/journal-status")}>
                                            מעקב עבודה
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
                                            className={`${isActive("/groups") ? "active" : ""}`}
                                            onClick={() => handleNavigate("/groups")}
                                            onMouseDown={(e) => handleMouseDown(e, "/groups")}>
                                            קבוצות
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
                        {(user.isCoordinator || user.isAdvisor) && (
                            <li className={`${openSubmenus.zoomMeetings ? "open" : "closed"}`}>
                                <div
                                    className="sidebar-option"
                                    onClick={() => toggleSubmenu("zoomMeetings")}
                                    onMouseDown={(e) => handleMouseDown(e, "/zoom-scheduler")}>
                                    <ZoomMeetingSVG />
                                    <span>ניהול פגישות</span>
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
                                            className={`${isActive("/zoom-scheduler") ? "active" : ""}`}
                                            onClick={() => handleNavigate("/zoom-scheduler")}
                                            onMouseDown={(e) => handleMouseDown(e, "/zoom-scheduler")}>
                                            קביעת פגישה חדשה
                                        </li>
                                        <li
                                            className={`${isActive("/list-zoom-meetings") ? "active" : ""}`}
                                            onClick={() => handleNavigate("/list-zoom-meetings")}
                                            onMouseDown={(e) => handleMouseDown(e, "/list-zoom-meetings")}>
                                            רשימת פגישות
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        )}
                        {!user.isAdvisor && !user.isCoordinator && (
                            <li>
                                <div
                                    className={`sidebar-option ${isActive("/list-zoom-meetings") ? "active" : ""}`}
                                    onClick={() => handleNavigate("/list-zoom-meetings")}
                                    onMouseDown={(e) => handleMouseDown(e, "/list-zoom-meetings")}>
                                    <ZoomMeetingSVG />
                                    <span>רשימת פגישות</span>
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
                        <li>
                            <div
                                className={`sidebar-option ${isActive("/more-information") ? "active" : ""}`}
                                onClick={() => handleNavigate("/more-information")}
                                onMouseDown={(e) => handleMouseDown(e, "/more-information")}>
                                <InfoCircleOutlined />
                                <span>מידע לסטודנט</span>
                            </div>
                        </li>
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
            <FloatButton
                icon={<CommentOutlined />}
                onClick={showDrawer}
                badge={{
                    count: chats.reduce((acc, chat) => acc + chat.unreadTotal, 0),
                    overflowCount: 999,
                    style: { direction: "ltr" },
                }}
                style={{ direction: "ltr" }}
            />
            <Drawer title="צ'אטים" onClose={onClose} open={open} mask={false} maskClosable={false}>
                <div className="chat-drawer-container">
                    <div
                        className="chat-item"
                        onClick={() => {
                            setChatTarget("new");
                        }}>
                        <div className="chat-header-wrapper">
                            <PlusCircleOutlined /> <span className="chat-title">יצירת צ'אט חדש</span>
                        </div>
                    </div>
                    {chats.map((chat) => {
                        return (
                            <div key={chat._id} className="chat-item" onClick={() => setChatTarget(chat)}>
                                {chat?.unreadTotal > 0 && (
                                    <Badge
                                        count={chat?.unreadTotal}
                                        className="unread-total"
                                        style={{
                                            backgroundColor: "#1daa61",
                                        }}
                                    />
                                )}
                                <div className="chat-header-wrapper">
                                    <span className="chat-title">
                                        {chat.chatName
                                            ? chat.chatName
                                            : chat.participants.map((p, index) => (
                                                  <span key={p._id}>
                                                      {p.name}
                                                      {index < chat.participants.length - 1 ? ", " : ""}
                                                  </span>
                                              ))}
                                    </span>
                                </div>
                                <div className="message-description">
                                    <div className="last-message">
                                        <div
                                            className={`seen ${
                                                chat.lastMessage?.seenBy?.length === chat.participants.length
                                                    ? "all"
                                                    : ""
                                            }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960">
                                                <g transform="translate(0, 960)">
                                                    <path
                                                        d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z"
                                                        fill="#666"
                                                    />
                                                </g>
                                            </svg>
                                        </div>
                                        <span className="last-message-content">
                                            {chat?.lastMessage?.sender?.name}:{" "}
                                            {chat?.lastMessage?.message?.length > 10
                                                ? `${chat?.lastMessage?.message?.substring(0, 50)}...`
                                                : chat?.lastMessage?.message}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Drawer>
            {chatTarget && (
                <Chat
                    key={chatTarget._id || "new"}
                    chatID={chatTarget}
                    onClose={() => {
                        setChatTarget(null);
                    }}
                    socket={socketRef.current}
                />
            )}
        </>
    );
};

export default Sidebar;
