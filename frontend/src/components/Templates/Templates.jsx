import React, { useState, useEffect } from "react";
import "./Templates.scss";
import axios from "axios";
import DownloadFile from "../DownloadFile/DownloadFile";
import { InboxOutlined } from "@ant-design/icons";
import { Button, message, Upload, Input, Modal } from "antd";
import { Editor } from "primereact/editor";

const Templates = () => {
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
  const { Dragger } = Upload;

  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        const response = await axios.get("/api/user/privileges", { withCredentials: true });
        setPrivileges(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    const fetchTemplateFiles = async () => {
      try {
        const response = await axios.get("/api/file-templates", { withCredentials: true });
        setTemplateFiles(response.data);
      } catch (error) {
        console.error("Error fetching template files:", error);
      }
    };

    fetchPrivileges();
    fetchTemplateFiles();
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      // Encode the filename to handle non-English characters
      const encodedFilename = encodeURIComponent(file.name);
      formData.append("files", file, encodedFilename);
    });
    formData.append("title", title);
    formData.append("description", description);
    setUploading(true);

    try {
      const response = await axios.post("/api/file-templates", formData, {
        headers: { "Content-Type": "multipart/form-data", "X-Filename-Encoding": "url" },
        withCredentials: true,
      });
      setFileList([]);
      message.success("הקובץ הועלה בהצלחה");
      // Refresh the template files list after successful upload
      const updatedFiles = await axios.get("/api/file-templates", { withCredentials: true });
      setTemplateFiles(updatedFiles.data);
    } catch (error) {
      console.error("Error occurred:", error);
      if (error.response.status === 500) {
        message.error("קובץ עם שם זה כבר קיים");
      }
      message.error("העלאת הקובץ נכשלה");
    } finally {
      setUploading(false);
      clearForm();
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
      // Check if file with same name already exists
      if (file.name.length > 50) {
        message.error(`שם קובץ יכול להכיל עד 50 תווים (רווח גם נחשב כתו)`);
        return Upload.LIST_IGNORE;
      }
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
      const response = await axios.put(
        `/api/file-templates/update/${fileId}`,
        {
          title: editTitle,
          description: editDescription,
        },
        { withCredentials: true }
      );
      message.success("קובץ עודכן בהצלחה");
    } catch (error) {
      console.error("Error updating file:", error);
    } finally {
      setIsEditing(false);
      const updatedFiles = await axios.get("/api/file-templates", { withCredentials: true });
      setTemplateFiles(updatedFiles.data);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`/api/file-templates/delete/${fileId}`, { withCredentials: true });
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
              style={{ height: "320px" }}
            />
          </div>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{ marginTop: 16 }}>
            {uploading ? "מעלה" : "התחל העלאה"}
          </Button>
        </div>
      )}
      <div className="template-content">
        {templateFiles.map((file) => (
          <DownloadFile key={file._id} file={file} onDelete={handleDelete} onEdit={() => setEditing(file._id)} />
        ))}
      </div>
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
            style={{ height: "320px" }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Templates;
