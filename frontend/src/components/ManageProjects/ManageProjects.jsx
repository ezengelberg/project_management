import React, { useEffect, useState, useRef, useContext } from "react";
import { Badge, Table, Tooltip, Switch, message, Divider, Modal, Form, Input, InputNumber, Select, Tabs } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserDeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { Editor } from "primereact/editor";
import DOMPurify from "dompurify";
import axios from "axios";
import "./ManageProjects.scss";
import Highlighter from "react-highlight-words";
import { getColumnSearchProps as getColumnSearchPropsUtil } from "../../utils/tableUtils";
import { NotificationsContext } from "../../context/NotificationsContext";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";

const ManageProjects = () => {
  const { Option } = Select;
  const { fetchNotifications } = useContext(NotificationsContext);
  const [form] = Form.useForm();
  const [projects, setProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectData, setEditProjectData] = useState({});
  const [isOtherType, setIsOtherType] = useState(false);
  const [studentInitiative, setStudentInitiative] = useState(false);
  const [studentsNoProject, setStudentsNoProject] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [yearFilter, setYearFilter] = useState("all");
  const [years, setYears] = useState([]);

  const getUsersNoProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/users-no-projects`, {
        withCredentials: true,
      });
      setStudentsNoProject(response.data.usersNoProjects);
    } catch (error) {
      console.error("Error occurred:", error.response.data.message);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/get-self-projects/`, {
        withCredentials: true,
      });

      // Assuming `project.candidates` contains the array of student objects
      const projectData = response.data.projects.map((project) => ({
        key: project._id, // Assuming there's an `_id` field
        title: project.title,
        isTaken: project.isTaken,
        candidates: project.candidates, // candidates should be an array of student objects
        students: project.students, // Assuming `project.students` contains the array of student objects
        registered: project.students.length + project.candidates.length,
        projectInfo: project,
        year: project.year,
        candidatesData: [],
      }));

      for (const project of projectData) {
        const candidatesData = [];
        for (const stud of project.students) {
          try {
            const studentResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${stud.student}`,
              {
                withCredentials: true,
              }
            );
            candidatesData.push({
              key: `student-${stud.student}`,
              name: studentResponse.data.name,
              date: stud.joinDate,
              status: true,
              candidateInfo: studentResponse.data,
              projectID: project.key,
            });
          } catch (error) {
            console.error("Error fetching student data:", error);
          }
        }

        for (const candidate of project.candidates) {
          try {
            const studentResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${candidate.student}`,
              { withCredentials: true }
            );
            const hasProjectResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/user/check-user-has-projects/${candidate.student}`,
              { withCredentials: true }
            );
            candidatesData.push({
              key: `candidate-${candidate.student}`,
              name: studentResponse.data.name,
              date: candidate.joinDate,
              status: false,
              candidateInfo: studentResponse.data,
              projectID: project.key,
              hasProject: hasProjectResponse.data.hasProject,
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

  const fetchYears = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/years`, {
        withCredentials: true,
      });
      const sortedYears = response.data.sort((a, b) => b.localeCompare(a));
      setYears(sortedYears);

      const currentHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date())).split(" ").pop().replace(/^ה/, "");
      const currentHebrewYearIndex = sortedYears.indexOf(currentHebrewYear);
      setYearFilter(currentHebrewYearIndex !== -1 ? sortedYears[currentHebrewYearIndex] : sortedYears[0]);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  useEffect(() => {
    fetchData();
    getUsersNoProjects();
    fetchYears();
  }, []);

  useEffect(() => {
    if (isEditing) {
      form.setFieldsValue(editProjectData);
    }
  }, [editProjectData]);

  const handleTypeChange = (value) => {
    setIsOtherType(value === "אחר");
    setStudentInitiative(value === "יוזמת סטודנט");
    if (value !== "אחר") {
      form.setFieldValue("customType", undefined);
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) =>
    getColumnSearchPropsUtil(dataIndex, searchInput, handleSearch, handleReset, searchText);

  const closeRegistration = (record) => async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/switch-registration`,
        {
          projectID: record.key,
        },
        {
          withCredentials: true,
        }
      );
      if (record.isTaken) {
        message.open({
          type: "info",
          content: "הפרויקט נפתח להרשמה",
          duration: 2,
        });
      } else {
        message.open({
          type: "info",
          content: "הפרויקט נסגר להרשמה",
          duration: 2,
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
            isTaken: !project.isTaken,
          };
        }
        return project;
      })
    );
  };

  const approveStudent = (record) => async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/approve-candidate`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id,
        },
        {
          withCredentials: true,
        }
      );

      message.open({
        type: "success",
        content: "הסטודנט אושר לפרויקט",
        duration: 2,
      });
      fetchNotifications();
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.key === record.projectID) {
            return {
              ...project,
              candidatesData: project.candidatesData.map((candidate) => {
                if (candidate.key === record.key) {
                  return {
                    ...candidate,
                    status: true,
                  };
                }
                return candidate;
              }),
            };
          }
          return project;
        })
      );
    } catch (error) {
      message.open({
        type: "error",
        content: error.response.data.message,
        duration: 2,
      });
    }
  };

  const declineStudent = (record) => async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/remove-candidate`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id,
        },
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "info",
        content: "הסטודנט נדחה מהפרויקט",
        duration: 2,
      });
      fetchNotifications();
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.key === record.projectID) {
            return {
              ...project,
              registered: project.registered - 1, // Decrement the number of registered students
              candidatesData: project.candidatesData.filter((candidate) => candidate.key !== record.key), // Remove the declined candidate
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
        `${process.env.REACT_APP_BACKEND_URL}/api/project/remove-student`,
        {
          projectID: record.projectID,
          userID: record.candidateInfo._id,
        },
        {
          withCredentials: true,
        }
      );

      message.open({
        type: "info",
        content: "הסטודנט הוסר מהפרויקט",
        duration: 2,
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
                    status: false,
                  };
                }
                return candidate;
              }),
            };
          }
          return project;
        })
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleEditProject = (project) => {
    getUsersNoProjects();
    setEditProjectData({
      ...project.projectInfo,
    });
    setIsEditing(true);
  };

  const columns = [
    {
      title: "שם הפרויקט",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
      render: (title) => (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={title.length > 90 ? title.substring(0, 90) + "..." : title}
        />
      ),
      width: "70%",
    },
    {
      title: "מספר רשומים",
      dataIndex: "registered",
      key: "registered",
      render: (registered) => registered,
      sorter: (a, b) => a.registered - b.registered,
      sortDirections: ["descend", "ascend"],
      width: "10%",
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
      ),
      filters: [
        { text: "פרויקט סגור להרשמה", value: true },
        { text: "פרויקט פתוח להרשמה", value: false },
      ],
      onFilter: (value, record) => record.isTaken === value,
      width: "20%",
    },
  ];

  const handleCancel = () => {
    setEditProjectData({});
    form.resetFields();
    setIsEditing(false);
    setIsOtherType(false);
    setStudentInitiative(false);
  };

  const handleEditorChange = (e) => {
    const sanitizedHtml = DOMPurify.sanitize(e.htmlValue || "");
    form.setFieldsValue({ description: sanitizedHtml });
  };

  const onConfirmEdit = async () => {
    const { title, description, year, suitableFor, type, externalEmail, continues } = form.getFieldsValue();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/edit-project/${editProjectData._id}`,
        { title, description, year, suitableFor, type, externalEmail, continues },
        {
          withCredentials: true,
        }
      );
      message.open({
        type: "success",
        content: `הפרויקט ${response.data.project.title} עודכן בהצלחה`,
        duration: 2,
      });
      const projectUpdate = projects.map(
        (project) =>
          project.key === editProjectData._id
            ? {
                ...project,
                title,
                projectInfo: {
                  ...project.projectInfo,
                  title,
                  description,
                  year,
                  suitableFor,
                  type,
                  externalEmail,
                  continues,
                },
              }
            : project // Return the original project if not edited
      );
      setProjects(projectUpdate);
      handleCancel();
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const expandedRender = (record) => {
    const expandColumns = [
      {
        title: "שם הסטודנט",
        dataIndex: "name",
        key: "name",
        width: "50%",
      },
      {
        title: "תאריך רישום",
        dataIndex: "date",
        key: "date",
        render: (date) => new Date(date).toLocaleString("he-IL"), // Display the date in
        width: "10%",
      },
      {
        title: "סטטוס",
        dataIndex: "status",
        key: "status",
        render: (status, record) => {
          if (status) {
            return <Badge status="success" text="מאושר" />;
          } else if (record.hasProject) {
            return <Badge color="purple" text="לא מאושר - משוייך לפרויקט אחר" />;
          } else {
            return <Badge status="error" text="לא מאושר" />;
          }
        },
        width: "20%",
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
              {!record.hasProject && (
                <Tooltip title="אשר רישום לסטודנט זה">
                  <CheckCircleOutlined onClick={approveStudent(record)} />
                </Tooltip>
              )}
              <Tooltip title="דחה רישום לסטודנט זה">
                <CloseCircleOutlined onClick={declineStudent(record)} />
              </Tooltip>
            </div>
          ),
        width: "20%",
      },
    ];
    return <Table columns={expandColumns} dataSource={record.candidatesData} pagination={false} />;
  };

  const filteredProjects = projects.filter((project) => {
    if (yearFilter === "all") return true;
    return project.year === yearFilter;
  });

  const tabs = [
    {
      key: "1",
      label: "פרויקטים פעילים",
      children: (
        <Table columns={columns} dataSource={filteredProjects} expandable={{ expandedRowRender: expandedRender }} />
      ),
    },
    {
      key: "2",
      label: "פרויקטים מושהים",
      children: <p>nothing for now</p>,
    },
  ];

  return (
    <div>
      <div className="upper-table-options">
        <Modal
          title={`עריכת פרויקט: ${editProjectData["title"]}`}
          open={isEditing}
          onCancel={() => {
            handleCancel();
          }}
          onOk={onConfirmEdit}
          okText="שמור שינויים"
          cancelText="בטל"
          width={"70rem"}>
          <Form form={form} layout="vertical" initialValues={editProjectData}>
            <Form.Item
              name="title"
              label="שם הפרויקט"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "חובה להזין שם לפרויקט",
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item
              className="create-project-form-item"
              label="תיאור"
              name="description"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "חובה להזין תיאור לפרויקט",
                },
              ]}>
              <Editor style={{ height: "320px", wordBreak: "break-word" }} onTextChange={handleEditorChange} />
            </Form.Item>
            <Form.Item
              className="create-project-form-item"
              label="שנה"
              name="year"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "חובה להזין שנה",
                },
              ]}>
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
                  message: "חובה לבחור התאמה",
                },
              ]}>
              <Select placeholder="בחר יחיד/זוג/שניהם">
                <Option value="יחיד">יחיד</Option>
                <Option value="זוג">זוג</Option>
                <Option value="יחיד \ זוג">יחיד \ זוג</Option>
              </Select>
            </Form.Item>
            <Form.Item
              className="create-project-form-item"
              name="type"
              label="סוג הפרויקט"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "חובה לבחור סוג",
                },
              ]}>
              <Select placeholder="בחר סוג" onChange={handleTypeChange}>
                <Option value="מחקרי">מחקרי</Option>
                <Option value="תעשייתי הייטק">תעשייתי הייטק</Option>
                <Option value="תעשייתי לא הייטק">תעשייתי לא הייטק</Option>
                <Option value="יוזמת מנחה">יוזמת מנחה</Option>
                <Option value="יוזמת סטודנט">יוזמת סטודנט</Option>
                <Option value="אחר">אחר</Option>
              </Select>
            </Form.Item>
            {editProjectData.externalEmail && (
              <Form.Item
                className="create-project-form-item"
                label="מייל גורם חיצוני"
                name="externalEmail"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "חובה להזין מייל גורם חיצוני",
                  },
                ]}>
                <Input type="email" placeholder="הזן מייל גורם חיצוני" />
              </Form.Item>
            )}

            {isOtherType && (
              <Form.Item
                className="create-project-form-item"
                label="סוג מותאם"
                name="customType"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "חובה להזין סוג",
                  },
                ]}>
                <Input placeholder="הזן סוג פרויקט מותאם" />
              </Form.Item>
            )}

            <Form.Item
              className="create-project-form-item"
              label="ממשיך"
              name="continues"
              rules={[
                {
                  required: false,
                },
              ]}>
              <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
            </Form.Item>
          </Form>
        </Modal>

        <Select value={yearFilter} onChange={setYearFilter} style={{ width: "200px" }}>
          <Select.Option value="all">כל השנים</Select.Option>
          {years.map((year) => (
            <Select.Option key={year} value={year}>
              {year}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Tabs items={tabs} defaultActiveKey="1" />
    </div>
  );
};

export default ManageProjects;
