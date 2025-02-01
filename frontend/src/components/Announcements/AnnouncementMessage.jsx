import React, { useState } from "react";
import axios from "axios";
import "./AnnouncementMessage.scss";
import { processContent } from "../../utils/htmlProcessor";
import { Editor } from "primereact/editor";
import { Input, Button, Modal, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const AnnouncementMessage = ({ announcement, canEdit, updateAnnouncement }) => {
  const [isEditing, setIsEditing] = useState(false);
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

  return (
    <>
      <Modal
        title={"מחיקת הודעה"}
        open={deleting}
        okText="מחק"
        cancelText="ביטול"
        onCancel={() => setDeleting(false)}
        onOk={() => {
          setDeleting(false);
          deleteAnnouncement();
        }}
        okButtonProps={{ danger: true }}>
        האם הינך בטוח שברצונך למחוק את ההודעה <span style={{ fontWeight: 600 }}>{announcement.title}</span>
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
          <Button
            className="update-announcement-button"
            type="primary"
            onClick={() => setIsEditing(false)}
            disabled={description === announcement.content || title === announcement.content}>
            עדכן הודעה
          </Button>
        </div>
      ) : (
        <div className="announcement-container">
          <div className="announcement-top">
            <div className="announcement-top-wrapper">
              <div className="announcement-title">{announcement.title}</div>
              <div className="announcement-top-end">
                <div className="announcement-author">פורסם ע"י {announcement.writtenBy.name}</div>
                <div className="announcement-date">פורסם ב{formatDateWithoutSeconds(announcement.createdAt)}</div>
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
                עודכן לאחרונה ב {formatDateWithoutSeconds(announcement.updatedAt)}
              </div>
            )}
            {canEdit && (
              <div class="edit-actions">
                <a
                  href="#"
                  className="edit-button"
                  onClick={() => {
                    setIsEditing(true);
                    setTitle(announcement.title);
                    setDescription(announcement.content);
                  }}>
                  <EditOutlined />
                </a>
                <a
                  href="#"
                  className="edit-button delete-button"
                  onClick={() => {
                    setDeleting(true);
                  }}>
                  <DeleteOutlined />
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
