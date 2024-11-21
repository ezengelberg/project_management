import React, { useEffect, useState } from "react";
import { Badge, Table, Tooltip, Modal, Upload, message, Button } from "antd";
import { UploadOutlined, DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import "./UploadSubmissions.scss";

const UploadSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  const showUploadModal = (sub) => {
    setCurrentSubmission(sub);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setFile(null); // Clear the file state when closing the modal
    setFileList([]); // Clear the file list
  };

  const { Dragger } = Upload;

  const props = {
    name: "file",
    multiple: false,
    accept: ".pdf",
    fileList, // Bind the fileList state
    beforeUpload: (file) => {
      if (file.name.length > 50) {
        message.error(`שם קובץ יכול להכיל עד 50 תווים (רווח גם נחשב כתו)`);
        return Upload.LIST_IGNORE;
      }

      if (!file.type.includes("pdf")) {
        message.error("יש להעלות קובץ מסוג PDF בלבד");
        return Upload.LIST_IGNORE;
      }

      setFile(file); // Store the file
      setFileList([file]); // Update the file list
      return false; // Prevent auto-upload
    },
    onRemove: () => {
      setFile(null); // Clear the selected file
      setFileList([]); // Clear the file list
      message.info("הקובץ הוסר בהצלחה");
    },
    onChange: (info) => {
      const { fileList: newFileList } = info;
      setFileList(newFileList); // Update file list
    }
  };

  const fetchPendingSubmissions = async () => {
    try {
      console.log("fetching");
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-student-submissions`, {
        withCredentials: true
      });

      setSubmissions(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      message.error("לא נבחר קובץ להעלאה");
      return;
    }

    const formData = new FormData();

    formData.append("files", file, encodeURIComponent(file.name));
    formData.append("title", "");
    formData.append("description", "");
    formData.append("destination", "submissions"); // Set destination for dynamic pathing

    setUploading(true);

    try {
      // Send POST request to upload the file
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/uploads?destination=submissions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Filename-Encoding": "url"
        },
        withCredentials: true
      });

      console.log("response sent?");

      // Show success message and reset file
      message.success("הקובץ הועלה בהצלחה");
      setFile(null); // Clear the selected file

      // Optionally, fetch the updated list of files
      const updatedFiles = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/uploads?destination=submissions`, {
        withCredentials: true
      });

      console.log("Updated files:", updatedFiles.data);
      // You can set the updated files to a state if needed
      // setTemplateFiles(updatedFiles.data);
    } catch (error) {
      console.error("Error occurred:", error);
      if (error.response?.status === 500 || error.response?.status === 409) {
        message.error("קובץ עם שם זה כבר קיים");
      } else {
        message.error("העלאת הקובץ נכשלה");
      }
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  const columns = [
    {
      title: "שם ההגשה",
      dataIndex: "submissionName",
      key: "submissionName"
    },
    {
      title: "תאריך הגשה",
      dataIndex: "submissionDate",
      key: "submissionDate",
      render: (text, record) => {
        const submissionDate = new Date(record.submissionDate);
        const isPastDue = submissionDate < new Date();
        const isDateClose = submissionDate - new Date() < 2 * 24 * 60 * 60 * 1000;
        return (
          <Tooltip title={`${isPastDue ? "תאריך ההגשה עבר, ההגשה באיחור" : isDateClose ? "תאריך הגשה מתקרב" : ""}`}>
            <span
              style={{
                color: isPastDue ? "red" : isDateClose ? "#f58623" : "inherit",
                fontWeight: isPastDue || isDateClose ? "bold" : "normal"
              }}>
              {submissionDate.toLocaleString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: "סטטוס הגשה",
      dataIndex: "submissionStatus",
      key: "submissionStatus",
      render: (_, record) => {
        console.log(record);
        return (
          <span>{record.file ? <Badge color="green" text="הוגש" /> : <Badge color="orange" text="לא הוגש" />}</span>
        );
      }
    },
    {
      title: "הערות",
      dataIndex: "submissionInfo",
      key: "info"
    },
    {
      title: "פעולות",
      key: "action",
      render: (text, record) => (
        <span className="action-items">
          <a>
            <UploadOutlined className="edit-icon" onClick={() => showUploadModal(record)} />
          </a>
          <a>
            <DeleteOutlined className="edit-icon" />
          </a>
        </span>
      )
    }
  ];

  return (
    <div>
      <Modal
        title={`הגשת מטלה - ${currentSubmission?.name}`}
        visible={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="ok" type="primary" onClick={closeModal}>
            סגור
          </Button>
        ]}
        width="50%">
        <div className="submission-modal">
          {currentSubmission?.submissionInfo && (
            <div>
              <b>הנחיות</b>: {currentSubmission.submissionInfo}
            </div>
          )}
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">לחצו או גררו כדי להעלות קובץ</p>
            <p className="ant-upload-hint">
              עבור פרויקטים בזוגות רק על אחד השותפים להגיש את הנדרש. שימו לב שיש להגיש בקובץ PDF בלבד
            </p>
          </Dragger>
          {file && (
            <Button type="primary" onClick={handleUpload} loading={uploading}>
              {uploading ? "מעלה" : "התחל העלאה"}
            </Button>
          )}
        </div>
      </Modal>
      <Table dataSource={submissions} columns={columns} />
    </div>
  );
};

export default UploadSubmissions;
