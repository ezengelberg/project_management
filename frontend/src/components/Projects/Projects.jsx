import React from "react";
import "./Projects.scss";
import { UserOutlined } from "@ant-design/icons";

const Projects = () => {
  return (
    <div className="list-projects">
      <h2>רשימת פרוייקטים</h2>

      <div className="project-box">
        <svg fill="#000000" width="32px" height="32px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path d="M280 752h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v464c0 4.4 3.6 8 8 8zm192-280h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v184c0 4.4 3.6 8 8 8zm192 72h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v256c0 4.4 3.6 8 8 8zm216-432H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z" />
        </svg>
        <div className="project-info">
          <h3 className="project-title">אתר לניהול פרויקטי גמר</h3>
          <p className="project-description">
            ניהול פרויקטי הגמר של המחלקה להנדסת תוכנה צפוי להיעשות בשנה הקרובה במודל, כמו הניהול של כל שאר הקורסים.
            למרות שהמודל הוא כלי גמיש, ישנם חלקים מפרויקטי הגמר שקשה לנהל דרכו. לדוגמה, פרסום הפרויקטים נעשה באמצעות
            מסמך pdf, וההרשמה נעשית ידנית דרך מיילים בין התלמידים, המנחים, ורכז הפרויקטים. הגרלת השופטים למטלות בקורס
            נעשית באמצעות מספר סקריפטים בפיתון. וכן הלאה.{" "}
          </p>

          <div className="project-actions">
            <div className="project-advisors-list">
              <div className="project-advisor">
                <UserOutlined />
                <div className="advisor-name">ד"ר אלי אנגלברג</div>
              </div>
            </div>
            <div className="more-info">[ למידע נוסף ]</div>
          </div>
        </div>
      </div>
      <div className="project-box">
        <svg fill="#000000" width="32px" height="32px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path d="M280 752h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v464c0 4.4 3.6 8 8 8zm192-280h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v184c0 4.4 3.6 8 8 8zm192 72h80c4.4 0 8-3.6 8-8V280c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v256c0 4.4 3.6 8 8 8zm216-432H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z" />
        </svg>
        <div className="project-info">
          <h3 className="project-title">עזרים לילד ולנער ברצף האוטיסטי בתפקוד גבוה</h3>
          <p className="project-description">
            עזרים שונים בשפה העברית לילד על הרצף האוטיסטי בתפקוד גבוה (ASD) שבעבר כונתה תסמונת אספרגר.
          </p>

          <div className="project-actions">
            <div className="project-advisors-list">
              <div className="project-advisor">
                <UserOutlined />
                <div className="advisor-name">רוג'ר כהן</div>
              </div>
              <div className="project-advisor">
                <UserOutlined />
                <div className="advisor-name">אבי אבי 12</div>
              </div>
            </div>
            <div className="more-info">[ למידע נוסף ]</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
