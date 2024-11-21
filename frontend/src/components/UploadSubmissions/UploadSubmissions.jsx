import React, { useEffect, useState } from "react";
import { Badge, Table } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import "./UploadSubmissions.scss";

const UploadSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

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
        return (
          <span style={{ color: isPastDue ? "red" : "inherit", fontWeight: isPastDue ? "bold" : "normal" }}>
            {submissionDate.toLocaleString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })}
          </span>
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
      title: "פעולות",
      key: "action",
      render: (text, record) => (
        <span className="action-items">
          <a>
            <UploadOutlined className="edit-icon" />
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
      <Table dataSource={submissions} columns={columns} />
    </div>
  );
};

export default UploadSubmissions;
