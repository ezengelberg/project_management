import "./DownloadFile.scss";
import { DownloadOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

import React from "react";

const DownloadFile = () => {
  return (
    <div className="download-container">
      <div className="download-file-header">
        <div className="download-header-title">
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 17 17"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M9.667 0h-7.667v17h13v-11.692l-5.333-5.308zM10 1.742l3.273 3.258h-3.273v-3.258zM3 16v-15h6v5h5v10h-11z"
                fill="#000000"></path>{" "}
            </g>
          </svg>
          <h3 className="file-name">שם קובץ להורדה בלה </h3>
        </div>
        <hr></hr>
      </div>
      <div className="download-file-description">
        תיאור של הקובץ להורדה בלה בלה בלה בלה בלה עוד קצת תיאור בלה בלה בלה בלה
      </div>
      <Tooltip title="לחץ להורדה"><DownloadOutlined className="download-action" /></Tooltip>
    </div>
  );
};

export default DownloadFile;
