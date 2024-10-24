import React, { useState } from "react";
import "./DownloadFile.scss";
import { DownloadOutlined, DeleteOutlined, FileOutlined, EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { Tooltip, Modal, Card, message } from "antd";
import axios from "axios";
import { processContent } from "../../utils/htmlProcessor";

const DownloadFile = ({ file, onDelete }) => {
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:5000/api/file-templates/${file._id}`, { withCredentials: true });
      message.success("קובץ נמחק בהצלחה");
      onDelete(file._id);
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error("שגיאה במחיקת הקובץ");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDescription = () => {
    if (!file.description || file.description.length === 0) {
      return "אין פרטים נוספים";
    }

    return (
      <div className="description-container">
        <div
          className="rich-text-content file-description"
          dangerouslySetInnerHTML={{ __html: processContent(file.description) }}
        />
        <div className="ellipsis-container">
          <EllipsisOutlined className="ellipsis-icon" onClick={() => setIsDescriptionModalVisible(true)} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <Card
        className="file-card"
        actions={[
          <Tooltip title="מחיקה">
            <DeleteOutlined key="delete" className="action-icon" onClick={handleDelete} spin={isDeleting} />
          </Tooltip>,
          <Tooltip title="עריכה">
            <EditOutlined key="edit" className="action-icon" />
          </Tooltip>,
          <Tooltip title="הורדה">
            <DownloadOutlined key="download" className="action-icon" onClick={handleDownload} />
          </Tooltip>,
        ]}
        style={{
          height: "230px",
          minWidth: "450px",
          maxWidth: "450px",
        }}>
        <Card.Meta
          className="file-card-meta"
          avatar={<FileOutlined className="file-icon" />}
          title={
            <Tooltip title={file.title}>
              <div className="file-title">{file.title}</div>
            </Tooltip>
          }
          description={renderDescription()}
        />
      </Card>
      <Modal
        className="description-modal"
        title={<div className="modal-title">{file.title}</div>}
        open={isDescriptionModalVisible}
        onCancel={() => setIsDescriptionModalVisible(false)}
        footer={null}>
        <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: processContent(file.description) }} />
      </Modal>
    </div>
  );
};

export default DownloadFile;
