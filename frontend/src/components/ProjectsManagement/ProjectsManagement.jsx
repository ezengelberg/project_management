import React, { useState, useEffect } from "react";
import "./ProjectsManagement.scss";
import { useNavigate } from "react-router-dom";
import { Tabs, Table, Modal, Select, Badge, Button, message } from "antd";
import axios from "axios";

const ProjectsManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersWithoutProjects, setUsersWithoutProjects] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isAddAdvisorModalOpen, setIsAddAdvisorModalOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [isUpdateStudentsModalOpen, setIsUpdateStudentsModalOpen] = useState(false);
  const [isAddJudgeModalOpen, setIsAddJudgeModalOpen] = useState(false);
  const [isUpdateJudgesModalOpen, setIsUpdateJudgesModalOpen] = useState(false);
  const [selectedJudges, setSelectedJudges] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, usersRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/all-users`, { withCredentials: true }),
        ]);

        const activeUsers = usersRes.data.filter((user) => !user.suspended);
        setProjects(projectsRes.data);
        setUsers(activeUsers);

        // Filter users without projects
        const usersWithProject = new Set(
          projectsRes.data.flatMap((project) => project.students.map((student) => student.student.toString()))
        );

        setUsersWithoutProjects(
          activeUsers.filter(
            (user) =>
              !usersWithProject.has(user._id.toString()) && user.isStudent && !user.isAdvisor && !user.isCoordinator
          )
        );
        setAdvisors(activeUsers.filter((user) => user.isAdvisor));
        setJudges(activeUsers.filter((user) => user.isJudge));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAddStudents = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/add-student`,
        {
          projectID: selectedProject._id,
          students: selectedStudents,
        },
        { withCredentials: true }
      );

      // Update local state
      const updatedProjects = projects.map((project) => {
        if (project._id === selectedProject._id) {
          const updatedProject = {
            ...project,
            students: [...project.students, ...selectedStudents.map((id) => ({ student: id }))],
          };
          if (updatedProject.students.length > 0 && updatedProject.advisors.length > 0) {
            updatedProject.isTaken = true;
          }
          return updatedProject;
        }
        return project;
      });

      setProjects(updatedProjects);
      setUsersWithoutProjects(usersWithoutProjects.filter((user) => !selectedStudents.includes(user._id)));

      setIsAddStudentsModalOpen(false);
      setSelectedStudents([]);
      setSelectedProject(null);
      message.success("סטודנטים נוספו בהצלחה!");
    } catch (error) {
      console.error("Error adding students:", error);
      message.error("שגיאה בהוספת סטודנטים");
    }
  };

  const handleUpdateStudents = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/update-students`,
        {
          projectID: selectedProject._id,
          students: selectedStudents,
        },
        { withCredentials: true }
      );

      // Update local state
      const updatedProjects = projects.map((project) => {
        if (project._id === selectedProject._id) {
          const updatedProject = {
            ...project,
            students: selectedStudents.map((id) => ({ student: id })),
          };
          return updatedProject;
        }
        return project;
      });

      setProjects(updatedProjects);
      setUsersWithoutProjects(usersWithoutProjects.filter((user) => !selectedStudents.includes(user._id)));

      setIsUpdateStudentsModalOpen(false);
      setSelectedStudents([]);
      setSelectedProject(null);
      message.success("סטודנטים עודכנו בהצלחה!");
    } catch (error) {
      console.error("Error updating students:", error);
      message.error("שגיאה בעדכון סטודנטים");
    }
  };

  const handleAddAdvisor = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/add-advisor`,
        {
          projectID: selectedProject._id,
          advisorID: selectedAdvisor,
        },
        { withCredentials: true }
      );

      // Update local state
      const updatedProjects = projects.map((project) => {
        if (project._id === selectedProject._id) {
          const updatedProject = {
            ...project,
            advisors: [...project.advisors, selectedAdvisor],
          };
          if (updatedProject.students.length > 0 && updatedProject.advisors.length > 0) {
            updatedProject.isTaken = true;
          }
          return updatedProject;
        }
        return project;
      });

      setProjects(updatedProjects);

      setIsAddAdvisorModalOpen(false);
      setSelectedAdvisor(null);
      setSelectedProject(null);
      message.success("המנחה נוסף בהצלחה!");
    } catch (error) {
      console.error("Error adding advisor:", error);
      message.error("שגיאה בהוספת מנחה");
    }
  };

  const handleTerminateProject = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/${selectedProject._id}/terminate`,
        {},
        { withCredentials: true }
      );

      // Update local state
      const updatedProjects = projects.map((project) => {
        if (project._id === selectedProject._id) {
          const updatedProject = {
            ...project,
            isTerminated: true,
          };

          // Add terminated project's students back to available pool
          setUsersWithoutProjects((prev) =>
            [...prev, ...project.students.map((student) => users.find((u) => u._id === student.student))].filter(
              Boolean
            )
          );

          return updatedProject;
        }
        return project;
      });

      setProjects(updatedProjects);
      setIsTerminateModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Error terminating project:", error);
    }
  };

  const columns = {
    open: [
      {
        title: "שם הפרויקט",
        dataIndex: "title",
        key: "title",
        render: (text, record) => (
          <a onClick={() => navigate(`/project/${record._id}`)}>
            {text.length > 65 ? `${text.substring(0, 65)}...` : text}
          </a>
        ),
        width: "25%",
      },
      {
        title: "מנחה",
        dataIndex: "advisors",
        key: "advisors",
        render: (advisors) => (
          <div>
            {advisors.length > 0
              ? advisors.map((advisor) => {
                  const advisorUser = users.find((u) => u._id === advisor);
                  return advisorUser ? (
                    <a key={advisor} onClick={() => navigate(`/profile/${advisor}`)}>
                      {advisorUser.name}
                    </a>
                  ) : null;
                })
              : "לא משוייך מנחה"}
          </div>
        ),
        width: "15%",
      },
      {
        title: "סטודנטים",
        dataIndex: "students",
        key: "students",
        render: (students) => (
          <div className="projects-student-list">
            {students.length > 0
              ? students.map(({ student }) => {
                  const studentUser = users.find((u) => u._id === student);
                  return studentUser ? (
                    <a key={student} onClick={() => navigate(`/profile/${student}`)}>
                      {studentUser.name}
                    </a>
                  ) : null;
                })
              : "לא משוייכים סטודנטים"}
          </div>
        ),
        width: "15%",
      },
      {
        title: "מתאים ל...",
        dataIndex: "suitableFor",
        key: "suitableFor",
        width: "10%",
      },
      {
        title: "סוג",
        dataIndex: "type",
        key: "type",
        width: "10%",
      },
      {
        title: "פעולות",
        key: "actions",
        render: (_, record) => (
          <div className="project-manage-actions">
            {record.advisors.length === 0 && (
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsAddAdvisorModalOpen(true);
                }}>
                הוסף מנחה
              </Button>
            )}
            {record.students.length === 0 ? (
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsAddStudentsModalOpen(true);
                }}>
                הוסף סטודנטים
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsUpdateStudentsModalOpen(true);
                  setSelectedStudents(record.students.map((s) => s.student));
                  setUsersWithoutProjects((prev) => [
                    ...prev,
                    ...record.students.map((s) => users.find((u) => u._id === s.student)).filter(Boolean),
                  ]);
                }}>
                עדכן סטודנטים
              </Button>
            )}
            <Button
              danger
              onClick={() => {
                setSelectedProject(record);
                setIsTerminateModalOpen(true);
              }}>
              הפסקת פרויקט
            </Button>
          </div>
        ),
        width: "20%",
      },
    ],
    taken: [
      {
        title: "שם הפרויקט",
        dataIndex: "title",
        key: "title",
        render: (text, record) => (
          <a onClick={() => navigate(`/project/${record._id}`)}>
            {text.length > 65 ? `${text.substring(0, 65)}...` : text}
          </a>
        ),
        width: "25%",
      },
      {
        title: "מנחה",
        dataIndex: "advisors",
        key: "advisors",
        render: (advisors) => (
          <div>
            {advisors.length > 0
              ? advisors.map((advisor) => {
                  const advisorUser = users.find((u) => u._id === advisor);
                  return advisorUser ? (
                    <a key={advisor} onClick={() => navigate(`/profile/${advisor}`)}>
                      {advisorUser.name}
                    </a>
                  ) : null;
                })
              : "לא משוייך מנחה"}
          </div>
        ),
        width: "15%",
      },
      {
        title: "סטודנטים",
        dataIndex: "students",
        key: "students",
        render: (students) => (
          <div className="projects-student-list">
            {students.length > 0
              ? students.map(({ student }) => {
                  const studentUser = users.find((u) => u._id === student);
                  return studentUser ? (
                    <a key={student} onClick={() => navigate(`/profile/${student}`)}>
                      {studentUser.name}
                    </a>
                  ) : null;
                })
              : "לא משוייכים סטודנטים"}
          </div>
        ),
        width: "15%",
      },
      {
        title: "סוג",
        dataIndex: "type",
        key: "type",
        width: "10%",
      },
      {
        title: "שופטים",
        dataIndex: "judges",
        key: "judges",
        render: (judges) => (
          <div>
            {judges.length > 0
              ? judges.map((judge) => {
                  const judgeUser = users.find((u) => u._id === judge);
                  return judgeUser ? (
                    <a key={judge} onClick={() => navigate(`/profile/${judge}`)}>
                      {judgeUser.name}
                    </a>
                  ) : null;
                })
              : "לא משוייכים שופטים"}
          </div>
        ),
        width: "15%",
      },
      {
        title: "פעולות",
        key: "actions",
        render: (_, record) => (
          <div className="project-manage-actions">
            {record.judges.length === 0 ? (
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsAddJudgeModalOpen(true);
                }}>
                הוסף שופט
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsUpdateJudgesModalOpen(true);
                  setSelectedJudges(record.judges);
                }}>
                עדכן שופטים
              </Button>
            )}
            <Button
              danger
              onClick={() => {
                setSelectedProject(record);
                setIsTerminateModalOpen(true);
              }}>
              הפסקת פרויקט
            </Button>
          </div>
        ),
      },
    ],
    finished: [
      {
        title: "Project Name",
        dataIndex: "title",
        key: "title",
        render: (text, record) => (
          <Button variant="link" onClick={() => navigate(`/project/${record._id}`)}>
            {text}
          </Button>
        ),
      },
      {
        title: "Students",
        dataIndex: "students",
        key: "students",
        render: (students) => (
          <div className="space-y-1">
            {students.map(({ student }) => {
              const studentUser = users.find((u) => u._id === student);
              return studentUser ? (
                <Button key={student} variant="link" onClick={() => navigate(`/profile/${student}`)}>
                  {studentUser.name}
                </Button>
              ) : null;
            })}
          </div>
        ),
      },
      {
        title: "Advisor",
        dataIndex: "advisors",
        key: "advisors",
        render: (advisors) => (
          <div className="space-y-1">
            {advisors.map((advisor) => {
              const advisorUser = users.find((u) => u._id === advisor);
              return advisorUser ? (
                <Button key={advisor} variant="link" onClick={() => navigate(`/profile/${advisor}`)}>
                  {advisorUser.name}
                </Button>
              ) : null;
            })}
          </div>
        ),
      },
      {
        title: "Status",
        key: "status",
        render: () => <Badge className="bg-green-500">Completed</Badge>,
      },
    ],
    terminated: [
      {
        title: "Project Name",
        dataIndex: "title",
        key: "title",
        render: (text, record) => (
          <Button variant="link" onClick={() => navigate(`/project/${record._id}`)}>
            {text}
          </Button>
        ),
      },
      {
        title: "Previous Students",
        dataIndex: "students",
        key: "students",
        render: (students) => (
          <div className="space-y-1">
            {students.map(({ student }) => {
              const studentUser = users.find((u) => u._id === student);
              return studentUser ? (
                <Button key={student} variant="link" onClick={() => navigate(`/profile/${student}`)}>
                  {studentUser.name}
                </Button>
              ) : null;
            })}
          </div>
        ),
      },
      {
        title: "Advisor",
        dataIndex: "advisors",
        key: "advisors",
        render: (advisors) => (
          <div className="space-y-1">
            {advisors.map((advisor) => {
              const advisorUser = users.find((u) => u._id === advisor);
              return advisorUser ? (
                <Button key={advisor} variant="link" onClick={() => navigate(`/profile/${advisor}`)}>
                  {advisorUser.name}
                </Button>
              ) : null;
            })}
          </div>
        ),
      },
      {
        title: "Status",
        key: "status",
        render: () => <Badge className="bg-red-500">Terminated</Badge>,
      },
    ],
  };

  const tabs = [
    {
      key: "open",
      label: (
        <div className="lable-with-icon">
          <svg className="tab-icon-special" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M12.1999 11.8L10.7899 13.21C10.0099 13.99 10.0099 15.26 10.7899 16.04C11.5699 16.82 12.8399 16.82 13.6199 16.04L15.8399 13.82C17.3999 12.26 17.3999 9.72999 15.8399 8.15999C14.2799 6.59999 11.7499 6.59999 10.1799 8.15999L7.75988 10.58C6.41988 11.92 6.41988 14.09 7.75988 15.43"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"></path>
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"></path>
            </g>
          </svg>
          <span>פרוייקטים ללא שיבוץ</span>
        </div>
      ),
      children: (
        <Table
          columns={columns.open}
          dataSource={projects.filter((p) => !p.isTaken && !p.isFinished && !p.isTerminated)}
          loading={loading}
          rowKey="_id"
        />
      ),
    },
    {
      key: "taken",
      label: (
        <div className="lable-with-icon">
          <svg className="tab-icon" height="24" width="24" version="1.1" id="Capa_1" viewBox="0 0 363.868 363.868">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <g>
                <path
                  fill="#000000"
                  d="M92.723,274.945c-3.178,3.178-5.747,9.388-5.747,13.875v58.444h33.929v-92.373 c0-4.487-2.569-5.56-5.747-2.382L92.723,274.945z"></path>
                <path
                  fill="#000000"
                  d="M241.752,219.573c-3.17,3.178-5.747,9.389-5.747,13.884v113.816h33.929V199.487 c0-4.487-2.569-5.552-5.747-2.374L241.752,219.573z"></path>
                <path
                  fill="#000000"
                  d="M291.418,169.834c-3.178,3.17-5.755,9.38-5.755,13.867v163.563h31.547V152.212 c0-4.487-2.577-5.56-5.755-2.382L291.418,169.834z"></path>
                <path
                  fill="#000000"
                  d="M193.078,268.239c0,0-1.512,1.52-3.381,3.39c-1.861,1.87-3.373,7.031-3.373,11.518v64.118h33.929 v-98.047c0-4.487-2.577-5.56-5.755-2.382L193.078,268.239z"></path>
                <path
                  fill="#000000"
                  d="M142.405,250.998c-3.178-3.17-5.755-2.105-5.755,2.382v93.885h33.929v-60.03 c0-4.487-2.439-10.559-5.454-13.558l-5.454-5.43L142.405,250.998z"></path>
                <path
                  fill="#000000"
                  d="M50.023,317.669l-10.957,10.974c-3.17,3.178-5.739,8.633-5.739,12.193v6.438h37.871V304.59 c0-4.487-2.569-5.552-5.747-2.374L50.023,317.669z"></path>
                <path
                  fill="#000000"
                  d="M358.121,150.724c3.17,3.178,5.747,2.105,5.747-2.382V32.193c0-8.316-7.966-15.599-16.233-15.599 H232.16c-4.487,0-5.56,2.577-2.382,5.755l41.074,41.106l-16.753,16.68l-77.701,77.774L135.3,116.82 c-3.178-3.178-8.316-3.17-11.494,0L9.519,231.189C-3.178,243.894-3.17,264.484,9.527,277.18l0.797,0.805 c12.697,12.697,33.287,12.697,45.975-0.008l73.247-73.287l41.098,41.057c3.178,3.17,8.324,3.17,11.502,0l135.479-135.503 L358.121,150.724z"></path>
              </g>
            </g>
          </svg>
          <span>פרוייקטים בתהליך</span>
        </div>
      ),
      children: (
        <Table
          columns={columns.taken}
          dataSource={projects.filter((p) => p.isTaken && !p.isFinished && !p.isTerminated)}
          loading={loading}
          rowKey="_id"
        />
      ),
    },
    {
      key: "finished",
      label: (
        <div className="lable-with-icon">
          <svg className="tab-icon" viewBox="0 0 32 32" version="1.1" fill="#000000">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <title>checkmark-circle</title>
              <desc>Created with Sketch Beta.</desc>
              <defs></defs>
              <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Icon-Set" transform="translate(-100.000000, -1139.000000)" fill="#000000">
                  <path
                    d="M122.027,1148.07 C121.548,1147.79 120.937,1147.96 120.661,1148.43 L114.266,1159.51 L110.688,1156.21 C110.31,1155.81 109.677,1155.79 109.274,1156.17 C108.871,1156.54 108.85,1157.18 109.228,1157.58 L113.8,1161.8 C114.177,1162.2 114.81,1162.22 115.213,1161.84 C115.335,1161.73 122.393,1149.43 122.393,1149.43 C122.669,1148.96 122.505,1148.34 122.027,1148.07 L122.027,1148.07 Z M116,1169 C108.268,1169 102,1162.73 102,1155 C102,1147.27 108.268,1141 116,1141 C123.732,1141 130,1147.27 130,1155 C130,1162.73 123.732,1169 116,1169 L116,1169 Z M116,1139 C107.164,1139 100,1146.16 100,1155 C100,1163.84 107.164,1171 116,1171 C124.836,1171 132,1163.84 132,1155 C132,1146.16 124.836,1139 116,1139 L116,1139 Z"
                    id="checkmark-circle"></path>
                </g>
              </g>
            </g>
          </svg>
          <span>פרוייקטים שהושלמו</span>
        </div>
      ),
      children: (
        <Table
          columns={columns.finished}
          dataSource={projects.filter((p) => p.isFinished)}
          loading={loading}
          rowKey="_id"
        />
      ),
    },
    {
      key: "terminated",
      label: (
        <div className="lable-with-icon">
          <svg className="tab-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M10.0303 8.96965C9.73741 8.67676 9.26253 8.67676 8.96964 8.96965C8.67675 9.26255 8.67675 9.73742 8.96964 10.0303L10.9393 12L8.96966 13.9697C8.67677 14.2625 8.67677 14.7374 8.96966 15.0303C9.26255 15.3232 9.73743 15.3232 10.0303 15.0303L12 13.0607L13.9696 15.0303C14.2625 15.3232 14.7374 15.3232 15.0303 15.0303C15.3232 14.7374 15.3232 14.2625 15.0303 13.9696L13.0606 12L15.0303 10.0303C15.3232 9.73744 15.3232 9.26257 15.0303 8.96968C14.7374 8.67678 14.2625 8.67678 13.9696 8.96968L12 10.9393L10.0303 8.96965Z"
                fill="#000000"></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                fill="#000000"></path>
            </g>
          </svg>
          <span>פרוייקטים שהופסקו</span>
        </div>
      ),
      children: (
        <Table
          columns={columns.terminated}
          dataSource={projects.filter((p) => p.isTerminated)}
          loading={loading}
          rowKey="_id"
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs items={tabs} />

      {/* Add Students Modal */}
      <Modal
        open={isAddStudentsModalOpen}
        title={`הוספת סטודנטים לפרויקט: ${selectedProject?.title}`}
        onOk={handleAddStudents}
        onCancel={() => {
          setIsAddStudentsModalOpen(false);
          setSelectedStudents([]);
          setSelectedProject(null);
        }}
        okText="הוסף סטודנטים"
        okButtonProps={{ disabled: selectedStudents.length > 2 }}
        cancelText="ביטול">
        <div className="modal-select-input">
          <p>בחר עד 2 סטודנטים לפרויקט:</p>
          <Select
            mode="multiple"
            value={selectedStudents}
            onChange={setSelectedStudents}
            options={usersWithoutProjects.map((user) => ({
              label: user.name,
              value: user._id,
            }))}
          />
        </div>
      </Modal>

      {/* Update Students Modal */}
      <Modal
        open={isUpdateStudentsModalOpen}
        title={`עדכון סטודנטים לפרויקט: ${selectedProject?.title}`}
        onOk={handleUpdateStudents}
        onCancel={() => {
          setIsUpdateStudentsModalOpen(false);
          setSelectedStudents([]);
          setSelectedProject(null);
          setUsersWithoutProjects(usersWithoutProjects.filter((user) => !selectedStudents.includes(user._id)));
        }}
        okText="עדכן סטודנטים"
        okButtonProps={{ disabled: selectedStudents.length > 2 }}
        cancelText="ביטול">
        <div className="modal-select-input">
          <p>בחר עד 2 סטודנטים לפרויקט:</p>
          <Select
            mode="multiple"
            value={selectedStudents}
            onChange={setSelectedStudents}
            options={usersWithoutProjects.map((user) => ({
              label: user.name,
              value: user._id,
            }))}
          />
        </div>
      </Modal>

      {/* Add Advisor Modal */}
      <Modal
        open={isAddAdvisorModalOpen}
        title={`הוספת מנחה לפרויקט: ${selectedProject?.title}`}
        onOk={handleAddAdvisor}
        onCancel={() => {
          setIsAddAdvisorModalOpen(false);
          setSelectedProject(null);
          setSelectedAdvisor(null);
        }}
        okText="הוסף מנחה"
        okButtonProps={{ disabled: !selectedAdvisor }}
        cancelText="ביטול">
        <div className="modal-select-input">
          <p>בחר מנחה לפרויקט:</p>
          <Select
            value={selectedAdvisor}
            onChange={setSelectedAdvisor}
            options={advisors.map((user) => ({
              label: user.name,
              value: user._id,
            }))}
          />
        </div>
      </Modal>

      {/* Terminate Project Modal */}
      <Modal
        open={isTerminateModalOpen}
        title={`הפסקת פרויקט: ${selectedProject?.title}`}
        onOk={handleTerminateProject}
        onCancel={() => {
          setIsTerminateModalOpen(false);
          setSelectedProject(null);
        }}
        okText="הפסק פרויקט"
        okButtonProps={{ danger: true }}
        cancelText="ביטול">
        <div>
          <p>אתה בטוח שברצונך להפסיק את הפרויקט?</p>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsManagement;
