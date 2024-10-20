import React from "react";
import { UserOutlined, StarFilled, ProjectOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

const ProjectBox = ({ markFavorite, ...props }) => {
  return (
    <div className="project-box">
      <ProjectOutlined />
      <div className="project-info">
        <div className="project-header">
          <h3 className="project-title">{props.title}</h3>
          <div className="project-suitable">{props.suitableFor}</div>
          {props.isFavorite ? (
            <StarFilled className="favorite-star star-marked" onClick={() => markFavorite()} />
          ) : (
            <StarFilled
              className="favorite-star"
              onClick={() => {
                markFavorite();
              }}
            />
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
  );
};

export default ProjectBox;
