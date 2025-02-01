import React from "react";
import "./AnnouncementMessage.scss";
import { processContent } from "../../utils/htmlProcessor";

const AnnouncementMessage = ({ announcement }) => {
  console.log(announcement);
  return (
    <div className="announcement-container">
      <div class="announcement-top">
        <div class="announcement-top-wrapper">
          <div class="announcement-title">{announcement.title}</div>
          <div class="announcement-author">{announcement.writtenBy.name}</div>
          <div class="announcement-date">{announcement.createdAt}</div>
        </div>
      </div>
      <div class="announcement-content" dangerouslySetInnerHTML={{ __html: processContent(announcement.content, 750) }}/>
      <div class="announcement-footer">
        <div class="announcement-update-date">עודכן לאחרונה ב {announcement.updatedAt}</div>
        <a href="#" class="edit-button">
          עריכה
        </a>
      </div>
    </div>
  );
};

export default AnnouncementMessage;
