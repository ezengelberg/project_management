import React, { useState, useEffect } from "react";
import "./HeaderMenu.scss";
import collegeLogo from "../../assets/CollegeLogo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tooltip, Avatar, Badge, Popover, Divider } from "antd";
import { LogoutOutlined, CommentOutlined, CloseOutlined } from "@ant-design/icons";
import { handleMouseDown } from "../../utils/mouseDown";

const HeaderMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications`, {
        withCredentials: true,
      });
      setUnreadNotifications(response.data.length);
      setNotifications(response.data.slice(0, 5)); // Show only the 5 most recent notifications
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications/read/${notificationId}`, null, {
        withCredentials: true,
      });
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
      markNotificationAsRead(notification._id);
      hide();
    }
  };

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  const formatDate = (dateString) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Date(dateString).toLocaleString("he-IL", options);
  };

  const content = (
    <div className="headermenu-popover-content">
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <div className="notification-list" key={index}>
            <CloseOutlined className="notification-close" onClick={() => markNotificationAsRead(notification._id)} />
            {notification.link ? (
              <div className="notification-with-link">
                <a onClick={() => handleNotificationClick(notification)}>
                  {notification.message.length > 40
                    ? `${notification.message.substring(0, 45)}...`
                    : notification.message}
                </a>
              </div>
            ) : (
              <p className="notification-no-link">
                {notification.message.length > 40
                  ? `${notification.message.substring(0, 45)}...`
                  : notification.message}
              </p>
            )}
            <p className="notification-date">{formatDate(notification.createdAt)}</p>
            <Divider />
          </div>
        ))
      ) : (
        <p>אין התראות חדשות</p>
      )}
      <Divider className="last-divider" />
      <a
        className="show-all-notifications"
        onClick={() => {
          navigate("/notifications");
          hide();
        }}>
        כל ההתראות
      </a>
    </div>
  );

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
    <div className="header-container">
      <div className="site-upper-header-right">
        <img src={collegeLogo} alt="collage logo" className="collage-logo" onClick={() => navigate("/home")} />
        <h1>מערכת לניהול פרויקטים</h1>
      </div>
      <div className="site-upper-header-left">
        <Popover
          content={content}
          title={<div style={{ textAlign: "center" }}>התראות אחרונות</div>}
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}>
          <Badge count={unreadNotifications} style={{ transform: "translate(90%, -50%)" }}>
            <Tooltip title="התראות" placement="right">
              <CommentOutlined className="notification-icon" />
            </Tooltip>
          </Badge>
        </Popover>
        <Tooltip title="פרופיל">
          <Avatar
            className="avatar-icon"
            size="large"
            onClick={() => navigate(`/profile/${user.id}`)}
            onMouseDown={(e) => handleMouseDown(e, `/profile/${user.id}`)}>
            {user.name && user.name[0]}
            {user.name && user.name.split(" ")[1] ? user.name.split(" ")[1][0] : ""}
          </Avatar>
        </Tooltip>
        <Tooltip title="התנתק">
          <LogoutOutlined className="logout-icon" onClick={handleLogout} />
        </Tooltip>
      </div>
    </div>
  );
};

export default HeaderMenu;
