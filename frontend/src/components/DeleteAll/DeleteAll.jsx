import React, { useState, useContext } from "react";
import "./DeleteAll.scss";
import axios from "axios";
import { Button, Divider, message, Modal } from "antd";
import { NotificationsContext } from "../../utils/NotificationsContext";

const DeleteAll = () => {
    const { fetchNotifications } = useContext(NotificationsContext);
    const [confirmDelete, setConfirmDelete] = useState({ visible: false, action: null });
    const [confirmDeleteUsers, setConfirmDeleteUsers] = useState(false);

    const handleDeleteSubmissions = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/submission/delete-all`, {
                withCredentials: true,
            });
            message.success("כל ההגשות נמחקו בהצלחה");
        } catch (error) {
            console.error("Error deleting submissions:", error);
            message.error("נכשל במחיקת הגשות");
        }
        setConfirmDelete({ visible: false, action: null });
    };

    const handleDeleteProjects = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/project/delete-all`, {
                withCredentials: true,
            });
            message.success("כל הפרויקטים נמחקו בהצלחה");
        } catch (error) {
            console.error("Error deleting projects:", error);
            message.error("נכשל במחיקת פרויקטים");
        }
        setConfirmDelete({ visible: false, action: null });
    };

    const handleDeleteFiles = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/uploads/delete-all`, {
                withCredentials: true,
            });
            message.success("כל הקבצים נמחקו בהצלחה");
        } catch (error) {
            console.error("Error deleting files:", error);
            message.error("נכשל במחיקת קבצים");
        }
        setConfirmDelete({ visible: false, action: null });
    };

    const handleDeleteUsers = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/user/delete-all`, {
                withCredentials: true,
            });
            message.success("כל המידע נמחק בהצלחה");
            fetchNotifications();
        } catch (error) {
            console.error("Error deleting users:", error);
            message.error("נכשל במחיקת המידע");
        }
        setConfirmDeleteUsers(false);
    };

    const handleDeleteChats = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/chat/delete-all`, {
                withCredentials: true,
            });
            message.success("כל השיחות נמחקו בהצלחה");
            
        } catch (error) {
            console.error("Error deleting chats:", error);
            message.error("נכשל במחיקת השיחות");
        }
    };

    const showConfirmModal = (action) => {
        setConfirmDelete({ visible: true, action });
    };

    return (
        <div className="delete-all">
            <h1>לא לגעת בטעות!!!!!</h1>
            <Divider />
            <h2>דברים שכנראה נצטרך למחוק</h2>
            <div className="delete-buttons">
                <Button type="primary" danger onClick={() => showConfirmModal(handleDeleteSubmissions)}>
                    מחיקת הגשות
                </Button>
                <Button type="primary" danger onClick={() => showConfirmModal(handleDeleteProjects)}>
                    מחיקת פרויקטים
                </Button>
                <Button type="primary" danger onClick={() => showConfirmModal(handleDeleteChats)}>
                    מחיקת צ'אטים
                </Button>
            </div>
            <Divider />
            <h2>דברים שכנראה לא נצטרך למחוק</h2>
            <div className="delete-buttons">
                <Button type="primary" danger onClick={() => showConfirmModal(handleDeleteFiles)}>
                    מחיקת קבצים
                </Button>
                <Button type="primary" danger onClick={() => setConfirmDeleteUsers(true)}>
                    מחיקת כל המידע
                </Button>
            </div>
            <Modal
                title="אישור מחיקה"
                open={confirmDelete.visible}
                onOk={confirmDelete.action}
                onCancel={() => setConfirmDelete({ visible: false, action: null })}
                okText="מחק"
                okButtonProps={{ danger: true }}
                cancelText="בטל">
                <p>האם אתה בטוח שברצונך למחוק את כל הפריטים?</p>
            </Modal>
            <Modal
                title="אישור מחיקת כל המידע"
                open={confirmDeleteUsers}
                onOk={handleDeleteUsers}
                onCancel={() => setConfirmDeleteUsers(false)}
                okText="מחק"
                okButtonProps={{ danger: true }}
                cancelText="בטל">
                <p>האם אתה בטוח שברצונך למחוק את כל הידע במערכת?</p>
            </Modal>
        </div>
    );
};

export default DeleteAll;
