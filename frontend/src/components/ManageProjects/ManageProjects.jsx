import React, { useEffect, useState } from "react";
import { Badge, Table, Tooltip, Switch, message, Divider, Modal, Form, Input, InputNumber, Select } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, UserDeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import "./ManageProjects.scss";

const ManageProjects = () => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [projects, setProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectData, setEditProjectData] = useState({});

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
          isTaken: project.isTaken,
          candidates: project.candidates, // candidates should be an array of student objects
          students: project.students, // Assuming `project.students` contains the array of student objects
          registered: project.students.length + project.candidates.length,
          projectInfo: project,
          candidatesData: []
        }));

        for (const project of projectData) {
          const candidatesData = [];
          for (const stud of project.students) {
            try {
              const studentResponse = await axios.get(`http://localhost:5000/api/user/get-user-info/${stud.student}`, {
                withCredentials: true
              });
              candidatesData.push({
                key: `student-${stud.student}`,
                name: studentResponse.data.name,
                date: stud.joinDate,
                status: true,
                candidateInfo: studentResponse.data,
                projectID: project.key
              });
            } catch (error) {
              console.error("Error fetching student data:", error);
            }
          }

          for (const candidate of project.candidates) {
            try {
              const studentResponse = await axios.get(
                `http://localhost:5000/api/user/get-user-info/${candidate.student}`,
                { withCredentials: true }
              );
              candidatesData.push({
                key: `candidate-${candidate.student}`,
                name: studentResponse.data.name,
                date: candidate.joinDate,
                status: false,
                candidateInfo: studentResponse.data,
                projectID: project.key
              });
            } catch (error) {
              console.error("Error fetching candidate data:", error);
            }
          }

          project.candidatesData = candidatesData;

          setProjects(projectData);
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isEditing) {
      form.setFieldsValue(editProjectData);
    }
  }, [editProjectData]);

  const closeRegistration = (record) => async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/project/switch-registration`,
        {
          projectID: record.key
        },
        {
          withCredentials: true
        }
      );
      if (record.isTaken) {
        message.open({
          type: "info",
          content: "הפרויקט נפתח להרשמה",
          duration: 2
        });
      } else {
        message.open({
          type: "info",
          content: "הפרויקט נסגר להרשמה",
          duration: 2
        });
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
    // TODO: update in database
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.key === record.key) {
          return {
            ...project,
            isTaken: !project.isTaken
          };
        }
        return project;
      })
    );
  };

  const approveStudent = (record) => async () => {
    try {
      const intialResponse = await axios.get(
        `http://localhost:5000/api/user/check-user-has-projects/${record.candidateInfo._id}`,
        {
          withCredentials: true
        }
      );
      if (intialResponse.data.hasProject) {
        message.open({
          type: "error",
          content: "לסטודנט כבר יש פרויקט",
          duration: 2
        });
        return;
      }
      await axios.post(
        `http://localhost:5000/api/project/approve-candidate`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id
        },
        {
          withCredentials: true
        }
      );

      message.open({
        type: "success",
        content: "הסטודנט אושר לפרויקט",
        duration: 2
      });
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.key === record.projectID) {
            return {
              ...project,
              candidatesData: project.candidatesData.map((candidate) => {
                if (candidate.key === record.key) {
                  return {
                    ...candidate,
                    status: true
                  };
                }
                return candidate;
              })
            };
          }
          return project;
        })
      );
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const declineStudent = (record) => async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/project/remove-candidate`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id
        },
        {
          withCredentials: true
        }
      );
      message.open({
        type: "info",
        content: "הסטודנט נדחה מהפרויקט",
        duration: 2
      });
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.key === record.projectID) {
            return {
              ...project,
              registered: project.registered - 1, // Decrement the number of registered students
              candidatesData: project.candidatesData.filter((candidate) => candidate.key !== record.key) // Remove the declined candidate
            };
          }
          return project;
        })
      );
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const removeStudent = (record) => async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/project/remove-student`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id
        },
        {
          withCredentials: true
        }
      );

      message.open({
        type: "info",
        content: "הסטודנט הוסר מהפרויקט",
        duration: 2
      });
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.key === record.projectID) {
            return {
              ...project,
              candidatesData: project.candidatesData.map((candidate) => {
                if (candidate.key === record.key) {
                  return {
                    ...candidate,
                    status: false
                  };
                }
                return candidate;
              })
            };
          }
          return project;
        })
      );
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleEditProject = (project) => {
    console.log(project);
    setEditProjectData({
      _id: project.projectInfo._id,
      title: project.projectInfo.title,
      description: project.projectInfo.description,
      suitableFor: project.projectInfo.suitableFor,
      year: project.projectInfo.year,
      type: project.projectInfo.type
    });
    setIsEditing(true);
  };

  const columns = [
    {
      title: "שם הפרויקט",
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
      dataIndex: "registered",
      key: "registered",
      render: (registered) => registered // Display the number of candidates
    },
    {
      title: "פעולות",
      key: "action",
      render: (record) => (
        <span className="project-management-actions">
          <Tooltip title="עריכת פרויקט">
            <EditOutlined
              onClick={() => {
                handleEditProject(record);
              }}
            />
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title={record.isTaken ? "פתח להרשמה" : "סגור להרשמה"}>
            <Switch checked={!record.isTaken} onChange={closeRegistration(record)} />
          </Tooltip>
          {record.isTaken ? "פרויקט סגור להרשמה" : "פרויקט פתוח להרשמה"}
        </span>
      )
    }
  ];

  const handleCancel = () => {
    console.log("do stuff");
    setEditProjectData({});
    form.resetFields();
    setIsEditing(false);
  };

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
        render: (record) =>
          record.status ? (
            <div className="approve-decline-student">
              <Tooltip title="הסר סטודנט מפרויקט">
                <UserDeleteOutlined onClick={removeStudent(record)} />
              </Tooltip>
            </div>
          ) : (
            <div className="approve-decline-student">
              <Tooltip title="אשר רישום לסטודנט זה">
                <CheckCircleOutlined onClick={approveStudent(record)} />
              </Tooltip>
              <Tooltip title="דחה רישום לסטודנט זה">
                <CloseCircleOutlined onClick={declineStudent(record)} />
              </Tooltip>
            </div>
          )
      }
    ];
    return <Table columns={expandColumns} dataSource={record.candidatesData} pagination={false} />;
  };

  return (
    <div>
      <Modal
        title={`עריכת פרויקט: ${editProjectData["title"]}`}
        open={isEditing}
        onCancel={() => {
          handleCancel();
        }}
        okText="שמור שינויים"
        cancelText="בטל">
        <Form form={form} layout="vertical" initialValues={editProjectData}>
          <Form.Item name="title" label="שם הפרויקט">
            <Input />
          </Form.Item>
          {/* <Form.Item label="תיאור הפרויקט">
              <Input value={editProjectData["description"]} />
            </Form.Item> */}
          <Form.Item name="year" label="שנה">
            <InputNumber />
          </Form.Item>
          <Form.Item
            className="create-project-form-item"
            name="suitableFor"
            label="מתאים ל"
            hasFeedback
            rules={[
              {
                required: true,
                message: "חובה לבחור התאמה"
              }
            ]}>
            <Select placeholder="בחר יחיד/זוג/שניהם">
              <Option value="יחיד">יחיד</Option>
              <Option value="זוג">זוג</Option>
              <Option value="יחיד \ זוג">יחיד \ זוג</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Table columns={columns} dataSource={projects} expandable={{ expandedRowRender: expandedRender }} />
    </div>
  );
};

export default ManageProjects;
