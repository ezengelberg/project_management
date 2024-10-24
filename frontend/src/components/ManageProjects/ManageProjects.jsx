import React, { useEffect, useState } from "react";
import { Badge, Table, Tooltip } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import "./ManageProjects.scss";

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/project/get-self-projects/`, {
          withCredentials: true
        });

        // Assuming `project.candidates` contains the array of student objects
        const projectData = response.data.projects.map((project) => ({
          key: project._id, // Assuming there's an `_id` field
          title: project.title,
          isApproved: project.isApproved ? (
            <Badge status="success" text="מאושר" />
          ) : (
            <Badge status="error" text="לא מאושר" />
          ),
          candidates: project.candidates // candidates should be an array of student objects
        }));

        projectData.forEach(async (project) => {
          project.candidatesData = [];
          project.candidates.forEach(async (candidate) => {
            console.log(candidate.student);
            const studentResponse = await axios.get(
              `http://localhost:5000/api/user/get-user-info/${candidate.student}`,
              {
                withCredentials: true
              }
            );
            console.log(studentResponse.data);
            project.candidatesData.push({
              key: candidate.student,
              name: studentResponse.data.name,
              date: candidate.joinDate,
              status: false
            });
          });
        });

        setProjects(projectData);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: "שם הפרוייקט",
      dataIndex: "title",
      key: "title"
    },
    {
      title: "סטטוס אישור",
      dataIndex: "isApproved",
      key: "isApproved"
    },
    {
      title: "מספר רשומים",
      dataIndex: "candidates",
      key: "candidates",
      render: (candidates) => candidates.length // Display the number of candidates
    },
    {
      title: "פעולות",
      key: "action",
      render: (text, record) => (
        <span>
          {record.isTaken ? <a>פתח הרשמה</a> : <a>סגור הרשמה</a>}
        </span>
      )
    }
  ];

  const expandedRender = (record) => {
    const expandColumns = [
      {
        title: "שם הסטודנט",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "תאריך רישום",
        dataIndex: "date",
        key: "date",
        render: (date) => new Date(date).toLocaleString("he-IL") // Display the date in
      },
      {
        title: "סטטוס",
        dataIndex: "status",
        key: "status",
        render: (status) =>
          status ? <Badge status="success" text="מאושר" /> : <Badge status="error" text="לא מאושר" />
      },
      {
        title: "פעולה",
        key: "action",
        width: 250,
        render: () => (
          <div className="approve-decline-student">
            <Tooltip title="אשר רישום לסטודנט זה">
              <CheckCircleOutlined />
            </Tooltip>
            <Tooltip title="דחה רישום לסטודנט זה">
              <CloseCircleOutlined />
            </Tooltip>
          </div>
        )
      }
    ];
    return <Table columns={expandColumns} dataSource={record.candidatesData} pagination={false} />;
  };

  return (
    <div>
      <Table columns={columns} dataSource={projects} expandable={{ expandedRowRender: expandedRender }} />
    </div>
  );
};

export default ManageProjects;
