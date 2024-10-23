import React from "react";
import "./DownloadFile.scss";
import { DownloadOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons";
import { Tooltip, Collapse } from "antd";
import axios from "axios";
import { processContent } from "../../utils/htmlProcessor";

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
          <FileOutlined className="file-icon" />
          <Tooltip title={file.title}>
            <h3 className="file-name">{file.title}</h3>
          </Tooltip>
        </div>
        <hr />
      </div>
      <div className="download-file-description">
        {!file.description || file.description.length === 0 ? (
          <p>אין פרטים נוספים</p>
        ) : (
          <Collapse
            size="large"
            items={[
              {
                key: "1",
                label: "פרטים נוספים",
                children: (
                  <div
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: processContent(file.description) }}
                  />
                ),
              },
            ]}
          />
        )}
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
