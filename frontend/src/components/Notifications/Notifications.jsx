import React, { useEffect, useState } from "react";
import "./Notifications.scss";
import axios from "axios";
import { Tooltip, List, Skeleton, Modal, Tabs, message } from "antd";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const [newNotifications, setNewNotifications] = useState([]);
  const [oldNotifications, setOldNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications/all`, {
          withCredentials: true,
        });
        const notifications = response.data;
        const sortedNotifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const newNotifications = sortedNotifications.filter((notification) => notification.read === false);
        const oldNotifications = sortedNotifications.filter((notification) => notification.read === true);
        setNewNotifications(newNotifications);
        setOldNotifications(oldNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    setLoading(false);
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications/read/${notificationId}`, null, {
        withCredentials: true,
      });
      setNewNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== notificationId)
      );
      setOldNotifications((prevNotifications) =>
        prevNotifications.concat(newNotifications.find((notification) => notification._id === notificationId))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/user/notifications/delete/${notificationToDelete}`, {
        withCredentials: true,
      });
      setOldNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== notificationToDelete)
      );
      message.success("ההתראה נמחקה בהצלחה");
      setConfirmDelete(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
      markNotificationAsRead(notification._id);
    }
  };

  const items = [
    {
      key: "1",
      label: "התראות חדשות",
      children: (
        <List
          itemLayout="horizontal"
          loading={loading}
          dataSource={newNotifications}
          pagination={{
            pageSize: 10,
          }}
          renderItem={(item) => (
            <List.Item
              className={`notification-item ${item.link ? "notification-with-link" : ""}`}
              onClick={() => handleNotificationClick(item)}>
              <Skeleton title={false} loading={item.loading} active>
                <List.Item.Meta
                  title={item.message}
                  description={new Date(item.createdAt).toLocaleString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                />
                <Tooltip title="סמן כנקרא">
                  <CloseOutlined onClick={() => markNotificationAsRead(item._id)} />
                </Tooltip>
              </Skeleton>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "2",
      label: "היסטוריית התראות",
      children: (
        <List
          itemLayout="horizontal"
          loading={loading}
          dataSource={oldNotifications}
          pagination={{
            pageSize: 10,
          }}
          renderItem={(item) => (
            <List.Item className="notification-item">
              <Skeleton title={false} loading={loading} active>
                <List.Item.Meta
                  title={item.message}
                  description={new Date(item.createdAt).toLocaleString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                />
                <Tooltip title="מחק התראה">
                  <DeleteOutlined
                    onClick={() => {
                      setConfirmDelete(true);
                      setNotificationToDelete(item._id);
                    }}
                  />
                </Tooltip>
              </Skeleton>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} />
      <Modal
        title="מחיקת התראה"
        open={confirmDelete}
        onOk={handleDeleteNotification}
        onCancel={() => setConfirmDelete(false)}
        okText="מחק"
        okButtonProps={{ danger: true }}
        cancelText="ביטול">
        <p>האם אתה בטוח שברצונך למחוק התראה זו?</p>
      </Modal>
    </div>
  );
};

export default Notifications;
