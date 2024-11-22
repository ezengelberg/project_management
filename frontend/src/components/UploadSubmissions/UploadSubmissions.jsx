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
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
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

  const showConfirmModal = (sub) => {
    setCurrentSubmission(sub);
    setIsConfirmModalVisible(true);
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

  const confirmDeleteSubmission = async () => {
    try {
      // Send POST request to delete the file & remove its' schema reference
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/uploads/delete/${currentSubmission.file}?destination=submissions`,
        { withCredentials: true }
      );
      // POST request to remove file form submission schema
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/update-submission-file/${currentSubmission._id}`,
        {
          file: null
        },
        { withCredentials: true }
      );
      const submissionsUpdated = submissions.map((submission) =>
        submission._id === currentSubmission._id ? { ...submission, file: null } : submission
      );
      setSubmissions(submissionsUpdated);
      message.info(`הגשה עבור ${currentSubmission.name} נמחקה בהצלחה`);
      setIsConfirmModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPendingSubmissions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-student-submissions`, {
        withCredentials: true
      });

      setSubmissions(response.data);
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
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/uploads?destination=submissions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-Filename-Encoding": "url"
          },
          withCredentials: true
        }
      );
      // Show success message and reset file
      const uploadedFile = response.data.files[0]._id;

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/update-submission-file/${currentSubmission._id}`,
        {
          file: uploadedFile
        },
        { withCredentials: true }
      );

      const submissionsUpdated = submissions.map((submission) =>
        submission._id === currentSubmission._id ? { ...submission, file: uploadedFile } : submission
      );
      setSubmissions(submissionsUpdated);
      setFile(null); // Clear the selected file
      closeModal(); // Close the modal
      message.success(`הגשה עבור ${currentSubmission.name} הועלתה בהצלחה`);
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
          <Tooltip
            title={`${
              !record.file && isPastDue
                ? "תאריך ההגשה עבר, ההגשה באיחור"
                : !record.file && isDateClose
                ? "תאריך הגשה מתקרב"
                : ""
            }`}>
            <span
              style={{
                color: !record.file && isPastDue ? "red" : !record.file && isDateClose ? "#f58623" : "inherit",
                fontWeight: !record.file && (isPastDue || isDateClose) ? "bold" : "normal"
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
        <span>
          {!record.file ? (
            <a>
              <UploadOutlined className="edit-icon" onClick={() => showUploadModal(record)} />
            </a>
          ) : (
            <a>
              <DeleteOutlined className="edit-icon" onClick={() => showConfirmModal(record)} />
            </a>
          )}
        </span>
      )
    }
  ];

  return (
    <div>
      <Modal
        title={`מחיקת הגשה עבור ${currentSubmission?.name}`}
        open={isConfirmModalVisible}
        width="20%"
        footer={null}>
        <p>האם אתה בטוח שברצונך למחוק את ההגשה?</p>
        <div className="confirm-modal">
          <Button type="primary" onClick={() => confirmDeleteSubmission()}>
            כן
          </Button>
          <Button type="default" onClick={() => setIsConfirmModalVisible(false)}>
            לא
          </Button>
        </div>
      </Modal>
      <Modal
        title={`הגשת מטלה - ${currentSubmission?.name}`}
        open={isModalVisible}
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
