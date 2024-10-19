import React, { useState, useEffect } from "react";
import "./Templates.scss";
import axios from "axios";
import { InboxOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";

const Templates = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const { Dragger } = Upload;

  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/privileges", { withCredentials: true });
        setPrivileges(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    fetchPrivileges();
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file);
    });
    setUploading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setFileList([]);
      message.success("upload successfully.");
    } catch (error) {
      console.error("Error occurred:", error);
      message.error("upload failed.");
    } finally {
      setUploading(false);
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
      const isDuplicate = fileList.some((existingFile) => existingFile.name === file.name);
      if (isDuplicate) {
        message.error(`קובץ "${file.name}" כבר קיים`);
        return Upload.LIST_IGNORE;
      }

      if (fileList.length + fileListNew.length > 10) {
        message.error("You can only upload up to 10 files!");
        return Upload.LIST_IGNORE;
      }
      setFileList((prevList) => [...prevList, file]);
      return false;
    },
    fileList,
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
            <p className="ant-upload-hint">ניתן להעלות עד 10 קבצים בו זמנית</p>
          </Dragger>

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
    </div>
  );
};

export default Templates;
