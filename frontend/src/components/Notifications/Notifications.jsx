import React, { useContext, useState } from "react";
import "./Notifications.scss";
import { Tooltip, List, Skeleton, Modal, Tabs, message } from "antd";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { NotificationsContext } from "../../context/NotificationsContext";

const Notifications = () => {
  const navigate = useNavigate();
  const { newNotifications, oldNotifications, markNotificationAsRead, deleteNotification } =
    useContext(NotificationsContext);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  const handleDeleteNotification = async () => {
    await deleteNotification(notificationToDelete);
    message.success("ההתראה נמחקה בהצלחה");
    setConfirmDelete(false);
    setNotificationToDelete(null);
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
