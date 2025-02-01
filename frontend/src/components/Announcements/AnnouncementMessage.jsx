import React, { useState } from "react";
import "./AnnouncementMessage.scss";
import { processContent } from "../../utils/htmlProcessor";

const AnnouncementMessage = ({ announcement, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  const formatDateWithoutSeconds = (date) => {
    return new Date(date).toLocaleString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {isEditing ? (
        <div className="announcement-edit-container">
          <textarea className="announcement-edit-content" defaultValue={announcement.content} />
          <div className="announcement-edit-actions">
            <button onClick={() => setIsEditing(false)}>שמור</button>
            <button onClick={() => setIsEditing(false)}>ביטול</button>
          </div>
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
              <a href="#" className="edit-button" onClick={() => setIsEditing(true)}>
                עריכה
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementMessage;
