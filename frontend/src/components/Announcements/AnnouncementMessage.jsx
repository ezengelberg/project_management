import React, { useState } from "react";
import axios from "axios";
import "./AnnouncementMessage.scss";
import { processContent } from "../../utils/htmlProcessor";
import { Editor } from "primereact/editor";
import { Input, Button, Modal, message, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";

const AnnouncementMessage = ({ announcement, canEdit, updateAnnouncement }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [viewPermissions, setViewPermissions] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");

    const formatDateWithoutSeconds = (date) => {
        return new Date(date).toLocaleString("he-IL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleEditorChange = (e) => {
        setDescription(e.htmlValue || "");
    };

    const deleteAnnouncement = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/announcement/delete/${announcement._id}`, {
                withCredentials: true,
            });
            message.success("ההודעה נמחקה בהצלחה");
            updateAnnouncement();
        } catch (error) {
            console.error("Error occurred:", error);
            message.error("מחיקת ההודעה נכשלה");
        }
    };

    const editAnnouncement = async () => {
        console.log("Editing announcement");
        console.log(description);
        console.log(title);
        try {
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/announcement/edit/${announcement._id}`,
                {
                    title,
                    content: description,
                },
                {
                    withCredentials: true,
                },
            );
            message.success("ההודעה עודכנה בהצלחה");
            updateAnnouncement();
        } catch (error) {
            console.error("Error occurred:", error);
        }
    };

    return (
        <>
            <Modal
                title={
                    <>
                        <EyeOutlined /> {"הרשאות צפיה"}
                    </>
                }
                open={viewPermissions}
                okText="סגור"
                cancelButtonProps={{ style: { display: "none" } }}
                onCancel={() => setViewPermissions(false)}
                onOk={() => setViewPermissions(false)}>
                <div className="view-permissions">
                    {announcement.forStudent && (
                        <div className="permission-option">
                            <div className="permission-field">צפייה לתלמידים:</div>
                            <div className="permission-value">כן</div>
                        </div>
                    )}
                    {announcement.forAdvisor && (
                        <div className="permission-option">
                            <div className="permission-field">צפייה למנחים:</div>
                            <div className="permission-value">כן</div>
                        </div>
                    )}
                    {announcement.forJudge && (
                        <div className="permission-option">
                            <div className="permission-field">צפייה לשופטים:</div>
                            <div className="permission-value">כן</div>
                        </div>
                    )}
                    {announcement.forCoordinator && (
                        <div className="permission-option">
                            <div className="permission-field">צפייה לרכזים:</div>
                            <div className="permission-value">כן</div>
                        </div>
                    )}
                    <div className="permission-option">
                        <div className="permission-field">קבוצה רשאית לצפיה:</div>
                        {announcement.group ? (
                            <div className="permission-value">{announcement?.group?.name}</div>
                        ) : (
                            <div className="permission-value">כל הקבוצות</div>
                        )}
                    </div>
                </div>
            </Modal>
            <Modal
                title={
                    <>
                        <DeleteOutlined /> {"מחיקת הודעה"}
                    </>
                }
                open={deleting}
                okText="מחק"
                cancelText="ביטול"
                onCancel={() => setDeleting(false)}
                onOk={() => {
                    setDeleting(false);
                    deleteAnnouncement();
                }}
                okButtonProps={{ danger: true }}>
                האם הינך בטוח שברצונך למחוק את ההודעה <span style={{ fontWeight: 600 }}>{announcement.title}</span>,
                ההודעה תימחק לצמיתות
                <br />
                תוכן ההודעה:{" "}
                <div
                    className="announcement-content"
                    dangerouslySetInnerHTML={{ __html: processContent(announcement.content, 750) }}
                />
            </Modal>
            {isEditing ? (
                <div className="announcement-edit-container">
                    <Input
                        type="text"
                        id="announcement-title"
                        placeholder="כותרת"
                        rules={[{ required: true, message: "שדה חובה" }]}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="form-input-group template-input-group">
                        <Editor
                            placeholder="תוכן ההודעה"
                            value={description}
                            onTextChange={handleEditorChange}
                            style={{ height: "320px", wordBreak: "break-word" }}
                        />
                    </div>
                    <div className="update-announcement-actions">
                        <Button className="update-announcement-button" onClick={() => setIsEditing(false)}>
                            בטל
                        </Button>
                        <Button
                            className="update-announcement-button"
                            type="primary"
                            onClick={() => {
                                setIsEditing(false);
                                editAnnouncement();
                            }}
                            disabled={description === announcement.content && title === announcement.title}>
                            עדכן הודעה
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="announcement-container">
                    <div className="announcement-top">
                        <div className="announcement-top-wrapper">
                            <div className="announcement-title">{announcement.title}</div>
                            <div className="announcement-top-end">
                                <div className="announcement-info-field">
                                    <UserOutlined />
                                    <div className="announcement-author">פורסם ע"י {announcement.writtenBy.name}</div>
                                </div>
                                <div className="announcement-info-field">
                                    <CalendarOutlined />
                                    <div className="announcement-date">
                                        פורסם ב {formatDateWithoutSeconds(announcement.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="announcement-content"
                        dangerouslySetInnerHTML={{ __html: processContent(announcement.content, 750) }}
                    />
                    <div className="announcement-footer">
                        {announcement.updatedAt !== announcement.createdAt && (
                            <div className="announcement-update-date">
                                <CalendarOutlined />
                                <div className="update-date-content">
                                    עודכן לאחרונה ב {formatDateWithoutSeconds(announcement.updatedAt)}
                                </div>
                            </div>
                        )}
                        {canEdit && (
                            <div className="edit-actions">
                                <a
                                    href="#"
                                    className="edit-button"
                                    onClick={() => {
                                        setTitle(announcement.title);
                                        setDescription(announcement.content);
                                        setIsEditing(true);
                                    }}>
                                    <Tooltip title="עריכת הודעה">
                                        <EditOutlined />
                                    </Tooltip>
                                </a>
                                <a
                                    href="#"
                                    className="edit-button"
                                    onClick={() => {
                                        setViewPermissions(true);
                                    }}>
                                    <Tooltip title="הרשאות צפיה">
                                        <EyeOutlined />
                                    </Tooltip>
                                </a>
                                <a
                                    href="#"
                                    className="edit-button delete-button"
                                    onClick={() => {
                                        setDeleting(true);
                                    }}>
                                    <Tooltip title="מחיקת הודעה">
                                        <DeleteOutlined />
                                    </Tooltip>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AnnouncementMessage;
