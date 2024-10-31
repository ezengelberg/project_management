import React, { useState, useEffect } from "react";
import "./DownloadFile.scss";
import { DownloadOutlined, DeleteOutlined, FileOutlined, EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { Tooltip, Modal, Card, message } from "antd";
import axios from "axios";
import { processContent } from "../../utils/htmlProcessor";

const DownloadFile = ({ file, onEdit, onDelete }) => {
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({});
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user/get-user`, { withCredentials: true });
        setUser(response.data);
        setPrivileges({
          isStudent: response.data.isStudent,
          isAdvisor: response.data.isAdvisor,
          isCoordinator: response.data.isCoordinator,
        });
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    fetchUser();
  }, []);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/file-templates/download/${file._id}`, {
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

  const handleEdit = () => {
    try {
      setIsEditing(true);
      onEdit(file._id);
    } catch (error) {
      console.error("Error editing file:", error);
      message.error("שגיאה בעריכת הקובץ");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
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
          (privileges.isCoordinator || user._id === file.user) && (
            <Tooltip title="מחיקה">
              <DeleteOutlined key="delete" className="action-icon" onClick={handleDelete} spin={isDeleting} />
            </Tooltip>
          ),
          (privileges.isCoordinator || user._id === file.user) && (
            <Tooltip title="עריכה">
              <EditOutlined key="edit" className="action-icon" onClick={handleEdit} spin={isEditing} />
            </Tooltip>
          ),
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
        <div className="upload-date">{new Date(file.uploadDate).toLocaleDateString("he-IL")}</div>
        <div className="file-original-name">
          <Tooltip title={file.filename}>
            {file.filename.length > 40 ? `${file.filename.slice(0, 40)}...` : file.filename}
          </Tooltip>
        </div>
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
