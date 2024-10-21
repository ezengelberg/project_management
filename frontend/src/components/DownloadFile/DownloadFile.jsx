import React from "react";
import "./DownloadFile.scss";
import { DownloadOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import axios from "axios";

const DownloadFile = ({ file }) => {
  const handleDownload = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/file-templates/download/${file._id}`, {
        responseType: "blob",
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="download-container">
      <div className="download-file-header">
        <div className="download-header-title">
          <FileOutlined />
          <h3 className="file-name">{file.title}</h3>
        </div>
        <hr></hr>
      </div>
      <div className="download-file-description">
        <p>{file.description}</p>
      </div>
      <div className="file-actions">
        <Tooltip title="לחץ למחיקה">
          <DeleteOutlined className="delete-action" />
        </Tooltip>
        <Tooltip title="לחץ להורדה">
          <DownloadOutlined className="download-action" onClick={handleDownload} />
        </Tooltip>
      </div>
    </div>
  );
};

export default DownloadFile;
