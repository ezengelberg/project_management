import React, { useState, useEffect } from "react";
import "./FileCard.scss";
import {
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined,
  EditOutlined,
  HistoryOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Tooltip, Modal, Card, message, Descriptions } from "antd";
import axios from "axios";
import { processContent } from "../../utils/htmlProcessor";
import { downloadFile } from "../../utils/downloadFile";

const FileCard = ({ file, onEdit, onDelete, destination }) => {
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({});
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [showHistory, SetShowHistory] = useState(false);
  const [editRecord, setEditRecord] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-user`, {
          withCredentials: true,
        });
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
      await downloadFile(file._id, destination);
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

    const processedDescription = processContent(file.description);
    const truncatedDescription = processContent(file.description, 180);

    return (
      <div className="description-container">
        {file.description.length > 310 ? (
          <div
            onClick={() => setIsDescriptionModalVisible(true)}
            className="rich-text-content file-description clickable"
            dangerouslySetInnerHTML={{ __html: truncatedDescription }}
          />
        ) : (
          <div
            className="rich-text-content file-description"
            dangerouslySetInnerHTML={{ __html: processedDescription }}
          />
        )}
      </div>
    );
  };

  const renderFileContent = () => {
    if (file.filename.endsWith(".mp4")) {
      return (
        <Card.Meta
          className="file-card-meta"
          avatar={<VideoCameraOutlined className="file-icon" />}
          title={
            <Tooltip title={file.title}>
              <div className="file-title">{file.title}</div>
            </Tooltip>
          }
          description={
            <video controls className="file-video">
              <source
                src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${destination}/${encodeURIComponent(file.filename)}`}
                type="video/mp4"
              />
              הדפדפן לא תומך בהרצת וידאו, אפשר להוריד את הקובץ במקום.
            </video>
          }
        />
      );
    } else {
      return (
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
      );
    }
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
          (privileges.isCoordinator || user._id === file.user) && (
            <Tooltip title="היסטוריה">
              <HistoryOutlined
                key="history"
                className="action-icon"
                onClick={() => {
                  SetShowHistory(true);
                  setEditRecord(file.editRecord);
                }}
              />
            </Tooltip>
          ),
          <Tooltip title="הורדה">
            <DownloadOutlined key="download" className="action-icon" onClick={handleDownload} />
          </Tooltip>,
        ]}>
        {renderFileContent()}
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

      <Modal
        className="edit-record-modal"
        title="היסטורית עריכות"
        open={showHistory}
        onCancel={() => SetShowHistory(false)}
        footer={null}>
        {editRecord.map((record, index) => (
          <Descriptions key={index} bordered title={`עריכה ${index + 1}`}>
            <Descriptions.Item label="כותרת">
              <div className="edited-title-modal-item">
                <div>
                  <span>
                    <strong>ישן:</strong>
                  </span>
                  <p>{record.oldTitle}</p>
                </div>
                <div>
                  <span>
                    <strong>חדש:</strong>
                  </span>
                  <p>{record.newTitle}</p>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="תיאור" span={2}>
              <div className="edited-description-modal-item">
                <span>
                  <strong>ישן:</strong>
                </span>
                <div dangerouslySetInnerHTML={{ __html: processContent(record.oldDescription) }} />
              </div>
              <div className="edited-description-modal-item">
                <span>
                  <strong>חדש:</strong>
                </span>
                <div dangerouslySetInnerHTML={{ __html: processContent(record.newDescription) }} />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="פרטי עריכה" span={2}>
              <div>
                <span>
                  <strong>נערך על ידי:</strong>
                </span>
                <p>
                  {record.editedBy.name} - {new Date(record.editDate).toLocaleString("he-IL")}
                </p>
              </div>
            </Descriptions.Item>
          </Descriptions>
        ))}
      </Modal>
    </div>
  );
};

export default FileCard;
