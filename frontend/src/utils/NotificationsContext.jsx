import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotifications, setNewNotifications] = useState([]);
  const [oldNotifications, setOldNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        return;
      }
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications/all`, {
        withCredentials: true,
      });
      const sortedNotifications = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUnreadCount(sortedNotifications.filter((notification) => !notification.read).length);
      setNewNotifications(sortedNotifications.filter((notification) => !notification.read));
      setOldNotifications(sortedNotifications.filter((notification) => notification.read));
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
      setUnreadCount((prevCount) => prevCount - 1);
      setNewNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== notificationId)
      );
      setOldNotifications((prevNotifications) =>
        prevNotifications.map((notification) => {
          if (notification._id === notificationId) {
            return { ...notification, read: true };
          }
          return notification;
        })
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications/clear`, null, {
        withCredentials: true,
      });
      setUnreadCount(0);
      setNewNotifications([]);
      setOldNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications/delete/${notificationId}`, {
        withCredentials: true,
      });
      setOldNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        newNotifications,
        oldNotifications,
        markNotificationAsRead,
        deleteNotification,
        setNewNotifications,
        setOldNotifications,
        fetchNotifications,
        markAllNotificationsAsRead,
      }}>
      {children}
    </NotificationsContext.Provider>
  );
};
