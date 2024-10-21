import React from "react";
import { UserOutlined, StarFilled, ProjectOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

const ProjectBox = ({ markFavorite, ...props }) => {
  return (
    <div className={`project-overlay ${props.isTaken ? "project-overlay-taken" : ""}`}>
      <div className={`project-box ${props.isTaken ? "project-box-taken" : ""}`}>
        <svg fill="#000000" width="32px" height="32px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path d="M280 752h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v464c0 4.4 3.6 8 8 8zm192-280h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v184c0 4.4 3.6 8 8 8zm192 72h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v256c0 4.4 3.6 8 8 8zm216-432H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z" />
        </svg>
        <div className="project-info">
          <div className="project-header">
            <h3 className="project-title">{props.title}</h3>
            <div className="project-suitable">{props.suitableFor}</div>
            {props.isFavorite ? (
              <Tooltip title="הסר ממועדפים">
                <StarFilled className="favorite-star star-marked" onClick={() => markFavorite()} />
              </Tooltip>
            ) : (
              <Tooltip title="הוסף למועדפים">
                <StarFilled
                  className="favorite-star"
                  onClick={() => {
                    markFavorite();
                  }}
                />
              </Tooltip>
            )}
          </div>
          <p className="project-description">{props.description}</p>

          <div className="project-actions">
            <div className="project-advisors-list">
              <div className="project-advisor">
                <UserOutlined />
                <div className="advisor-name">ד"ר אלי אנגלברג</div>
              </div>
            </div>
            <div className="more-info">
              <Tooltip title="לפירוט נוסף על הפרוייקט">[ למידע נוסף ורישום ]</Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBox;
