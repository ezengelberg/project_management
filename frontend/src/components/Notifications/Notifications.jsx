import React, { useContext } from "react";
import "./Notifications.scss";
import { Tooltip, List, Skeleton, Tabs, message } from "antd";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { NotificationsContext } from "../../utils/NotificationsContext";

const Notifications = () => {
  const navigate = useNavigate();
  const { newNotifications, oldNotifications, markNotificationAsRead, deleteNotification } =
    useContext(NotificationsContext);

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
    message.success("ההתראה נמחקה בהצלחה");
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
      markNotificationAsRead(notification._id);
    }
  };

  const handleNotificationClose = (e, notificationId) => {
    e.stopPropagation();
    markNotificationAsRead(notificationId);
  };

  const items = [
    {
      key: "1",
      label: "התראות חדשות",
      children: (
        <List
          itemLayout="horizontal"
          dataSource={newNotifications}
          pagination={{ pageSize: 10 }}
          renderItem={(item) => (
            <List.Item
              className={`notification-item ${item.link ? "notification-with-link" : ""}`}
              onClick={() => handleNotificationClick(item)}>
              <Skeleton title={false} loading={false} active>
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
                  <CloseOutlined onClick={(e) => handleNotificationClose(e, item._id)} />
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
          dataSource={oldNotifications}
          pagination={{ pageSize: 10 }}
          renderItem={(item) => (
            <List.Item className="notification-item">
              <Skeleton title={false} loading={false} active>
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
                  <DeleteOutlined onClick={() => handleDeleteNotification(item._id)} />
                </Tooltip>
              </Skeleton>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div className="notifications-page">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default Notifications;
