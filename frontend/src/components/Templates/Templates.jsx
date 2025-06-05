import React, { useState, useEffect, useContext } from "react";
import "./Templates.scss";
import axios from "axios";
import FileCard from "../FileCard/FileCard";
import { InboxOutlined } from "@ant-design/icons";
import { Button, message, Upload, Input, Modal, Spin, Progress } from "antd";
import { Editor } from "primereact/editor";
import { NotificationsContext } from "../../utils/NotificationsContext";

const Templates = () => {
  const { fetchNotifications } = useContext(NotificationsContext);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [templateFiles, setTemplateFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [currentFile, setCurrentFile] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { Dragger } = Upload;

  useEffect(() => {
    setLoading(true);
    const fetchPrivileges = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/privileges`, {
          withCredentials: true,
        });
        setPrivileges(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    const fetchTemplateFiles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/uploads?destination=templates`, {
          withCredentials: true,
        });
        setTemplateFiles(response.data);
      } catch (error) {
        console.error("Error fetching template files:", error);
      }
    };

    fetchPrivileges();
    fetchTemplateFiles();
    fetchNotifications();
    setLoading(false);
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file, encodeURIComponent(file.name));
    });
    formData.append("title", title);
    formData.append("description", description);
    formData.append("destination", "templates"); // Set destination for dynamic pathing
    setUploading(true);
    setUploadProgress(0);

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/uploads?destination=templates`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Filename-Encoding": "url",
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      message.success("הקובץ הועלה בהצלחה");
      setFileList([]);
      clearForm();
      setUploadProgress(0);

      const updatedFiles = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/uploads?destination=templates`, {
        withCredentials: true,
      });
      setTemplateFiles(updatedFiles.data);
    } catch (error) {
      console.error("Error occurred:", error);
      if (error.response?.status === 500 || error.response?.status === 409) {
        message.error("קובץ עם שם זה כבר קיים");
      } else {
        message.error("העלאת הקובץ נכשלה");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const props = {
    multiple: true,
    maxCount: 10,
    listType: "picture",
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file, fileListNew) => {
      if (file.name.length > 50) {
        message.error(`שם קובץ יכול להכיל עד 50 תווים (רווח גם נחשב כתו)`);
        return Upload.LIST_IGNORE;
      }
      // Check if file with same name already exists in the list of uploaded files
      const isDuplicate = fileList.some((existingFile) => existingFile.name === file.name);
      if (isDuplicate) {
        message.error(`קובץ "${file.name}" כבר קיים`);
        return Upload.LIST_IGNORE;
      }

      if (fileList.length + fileListNew.length > 10) {
        message.error("ניתן להעלות עד 10 קבצים בו זמנית");
        return Upload.LIST_IGNORE;
      }
      setFileList((prevList) => [...prevList, file]);
      return false;
    },
    fileList,
  };

  const setEditing = (fileId) => {
    try {
      const file = templateFiles.find((file) => file._id === fileId);
      setCurrentFile(file);
      setEditTitle(file.title);
      setEditDescription(file.description);
    } catch (error) {
      console.error("Error setting editing file:", error);
    }
    setIsEditing(true);
  };

  const handleEdit = async (fileId) => {
    try {
      const oldFile = templateFiles.find((file) => file._id === fileId);
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/uploads/update/${fileId}?destination=templates`,
        {
          title: editTitle,
          description: editDescription,
          oldTitle: oldFile.title,
          oldDescription: oldFile.description,
        },
        { withCredentials: true }
      );
      message.success("קובץ עודכן בהצלחה");

      // Refresh updated files based on dynamic destination
      const updatedFiles = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/uploads?destination=templates`, {
        withCredentials: true,
      });
      setTemplateFiles(updatedFiles.data);
    } catch (error) {
      console.error("Error updating file:", error);
      message.error("שגיאה בעדכון הקובץ");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/uploads/delete/${fileId}?destination=templates`, {
        withCredentials: true,
      });
      message.success("קובץ נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setTemplateFiles((prevFiles) => prevFiles.filter((file) => file._id !== fileId));
    }
  };

  const clearForm = () => {
    setFileList([]);
    setTitle("");
    setDescription("");
  };

  const handleEditorChange = (e) => {
    setDescription(e.htmlValue || "");
  };

  const handleEditEditorChange = (e) => {
    setEditDescription(e.htmlValue || "");
  };

  return (
    <div>
      {loading ? (
        <Spin className="template-loading" size="large" />
      ) : (
        <>
          {privileges.isCoordinator && (
            <div className="upload-container">
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">לחצו או גררו כדי להעלות קבצים</p>
                <p className="ant-upload-hint">
                  ניתן להעלות עד 10 קבצים בו זמנית (הזנת כותרת/תיאור ישוייכו לכל הקבצים אם הועלאו ביחד)
                </p>
              </Dragger>
              <hr />
              <div className="form-input-group template-input-group">
                <label htmlFor="title">כותרת</label>
                <Input
                  type="text"
                  id="title"
                  placeholder="כותרת לקובץ (אם לא הוכנס שם הקובץ יהיה גם הכותרת)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-input-group template-input-group">
                <Editor
                  placeholder="תיאור לקובץ"
                  value={description}
                  onTextChange={handleEditorChange}
                  style={{ height: "320px", wordBreak: "break-word" }}
                />
              </div>
              <div className="templates-button-interaction">
                <Button type="primary" onClick={handleUpload} disabled={fileList.length === 0} loading={uploading}>
                  {uploading ? "מעלה" : "התחל העלאה"}
                </Button>
                {uploading && <p>נא לא לצאת מהדף עד שההעלאה תושלם</p>}
              </div>
              {uploading && (
                <Progress percent={uploadProgress} size="small" status={uploadProgress < 100 ? "active" : "success"} />
              )}
            </div>
          )}
          <div className="template-content">
            {templateFiles.length === 0 && <h2>לא הועלו עדיין קבצים</h2>}
            {templateFiles.map((file) => (
              <FileCard
                key={file._id}
                file={file}
                destination={"templates"}
                onDelete={handleDelete}
                onEdit={() => setEditing(file._id)}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        className="edit-modal"
        title="תיאור הקובץ"
        open={isEditing}
        onOk={() => handleEdit(currentFile._id)}
        onCancel={() => setIsEditing(false)}
        okText="שמירה"
        cancelText="ביטול">
        <div className="form-input-group template-input-group">
          <label htmlFor="title">כותרת</label>
          <Input
            type="text"
            id="title"
            placeholder="כותרת לקובץ"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </div>
        <div className="form-input-group template-input-group">
          <label htmlFor="description">תיאור</label>
          <Editor
            placeholder="תיאור לקובץ"
            value={editDescription}
            onTextChange={handleEditEditorChange}
            style={{ height: "320px", wordBreak: "break-word" }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Templates;
