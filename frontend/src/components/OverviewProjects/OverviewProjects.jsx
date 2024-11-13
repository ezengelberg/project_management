import React, { useState, useEffect, useRef } from "react";
import "./OverviewProjects.scss";
import { useNavigate } from "react-router-dom";
import { Tabs, Table, Modal, Select, Button, message, Tooltip, Input, Space, Divider } from "antd";
import { DeleteOutlined, RollbackOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import Highlighter from "react-highlight-words";

const OverviewProjects = () => {
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
  const [isUpdateAdvisorsModalOpen, setIsUpdateAdvisorsModalOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [isUpdateStudentsModalOpen, setIsUpdateStudentsModalOpen] = useState(false);
  const [isJudgesModalOpen, setIsJudgesModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [isRestoreProjectModalOpen, setIsRestoreProjectModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [selectedAlphaReportJudges, setSelectedAlphaReportJudges] = useState([]);
  const [selectedFinalReportJudges, setSelectedFinalReportJudges] = useState([]);
  const [selectedExamJudges, setSelectedExamJudges] = useState([]);
  const [takenFilter, setTakenFilter] = useState("all");
  const [years, setYears] = useState([]);
  const [yearFilter, setYearFilter] = useState("");

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

        const years = Array.from(new Set(projectsRes.data.map((project) => project.year))).sort((a, b) => b - a);
        setYears(years);
        const currentYearIndex = years.indexOf(new Date().getFullYear());
        setYearFilter(currentYearIndex !== -1 ? years[currentYearIndex] : years[0]);

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
          if (updatedProject.students.length === 0) {
            updatedProject.isTaken = false;
          }
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

  const handleUpdateAdvisor = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/update-advisor`,
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
            advisors: [selectedAdvisor],
          };
          return updatedProject;
        }
        return project;
      });

      setProjects(updatedProjects);
      setIsUpdateAdvisorsModalOpen(false);
      setSelectedAdvisor(null);
      setSelectedProject(null);
      message.success("המנחה עודכן בהצלחה!");
    } catch (error) {
      console.error("Error updating advisor:", error);
      message.error("שגיאה בעדכון מנחה");
    }
  };

  const handleUpdateJudges = async () => {
    if (
      selectedAlphaReportJudges.length === 0 &&
      selectedFinalReportJudges.length === 0 &&
      selectedExamJudges.length === 0
    ) {
      message.error("יש לבחור שופט אחד לפחות");
      return;
    }
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/update-judges`,
        {
          projectID: selectedProject._id,
          alphaReportJudges: selectedAlphaReportJudges,
          finalReportJudges: selectedFinalReportJudges,
          examJudges: selectedExamJudges,
        },
        { withCredentials: true }
      );

      // Update local state
      const updatedProjects = projects.map((project) => {
        if (project._id === selectedProject._id) {
          return {
            ...project,
            alphaReportJudges: selectedAlphaReportJudges,
            finalReportJudges: selectedFinalReportJudges,
            examJudges: selectedExamJudges,
          };
        }
        return project;
      });

      setProjects(updatedProjects);
      setIsJudgesModalOpen(false);
      setSelectedAlphaReportJudges([]);
      setSelectedFinalReportJudges([]);
      setSelectedExamJudges([]);
      setSelectedProject(null);
      message.success("השופטים עודכנו בהצלחה!");
    } catch (error) {
      console.error("Error updating judges:", error);
      message.error("שגיאה בעדכון שופטים");
    }
  };

  const handleTerminateProject = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/terminate-project`,
        { projectID: selectedProject._id },
        { withCredentials: true }
      );

      // Update local state
      const updatedProjects = projects.map((project) => {
        if (project._id === selectedProject._id) {
          return {
            ...project,
            isTerminated: true,
            terminationRecord: project.students,
            students: [],
          };
        }
        return project;
      });

      setProjects(updatedProjects);
      setUsersWithoutProjects((prev) => [
        ...prev,
        ...selectedProject.students.map((s) => users.find((u) => u._id === s.student)).filter(Boolean),
      ]);

      setIsTerminateModalOpen(false);
      setSelectedProject(null);
      message.success("הפרויקט הופסק בהצלחה!");
    } catch (error) {
      console.error("Error terminating project:", error);
      message.error("שגיאה בהפסקת הפרויקט");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/project/delete-project/${selectedProject._id}`, {
        withCredentials: true,
      });

      // Update local state
      const updatedProjects = projects.filter((project) => project._id !== selectedProject._id);
      setProjects(updatedProjects);

      setIsDeleteProjectModalOpen(false);
      setSelectedProject(null);
      message.success("הפרויקט נמחק בהצלחה!");
    } catch (error) {
      console.error("Error deleting project:", error);
      message.error("שגיאה במחיקת הפרויקט");
    }
  };

  const handleRestoreProject = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/restore-project/${selectedProject._id}`,
        {},
        { withCredentials: true }
      );

      // Update local state
      const updatedProjects = projects.map((project) => {
        if (project._id === selectedProject._id) {
          return {
            ...project,
            isTerminated: false,
            terminationRecord: [],
          };
        }
        return project;
      });

      setProjects(updatedProjects);

      setIsRestoreProjectModalOpen(false);
      setSelectedProject(null);
      message.success("הפרויקט שוחזר בהצלחה!");
    } catch (error) {
      console.error("Error restoring project:", error);
      message.error("שגיאה בשחזור הפרויקט");
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

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}>
            חיפוש
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            איפוס
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}>
            סגור
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) => {
      if (dataIndex === "advisors") {
        return record[dataIndex].some((advisor) => {
          const advisorUser = users.find((u) => u._id === advisor);
          return advisorUser && advisorUser.name.toLowerCase().includes(value.toLowerCase());
        });
      }
      return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text, record) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text}
        />
      ) : (
        text
      ),
  });

  const handleAssignAdvisorsAutomatically = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/assign-advisors-automatically`,
        {},
        { withCredentials: true }
      );
      message.success("המנחים הוקצו בהצלחה!");
    } catch (error) {
      if (error.response.status === 304) {
        message.info("הוקצו כבר מנחים לכל הפרויקטים");
      } else {
        console.error("Error assigning advisors automatically:", error);
        message.error("שגיאה בהקצאת מנחים אוטומטית");
      }
    }
    setLoading(false);
  };

  const handleAssignJudgesAutomatically = async () => {};

  const expandedRowRender = (record) => {
    const expandColumns = [
      {
        title: "שופטים עבור דוח אלפה",
        dataIndex: "alphaReportJudges",
        key: "alphaReportJudges",
        render: (alphaReportJudges) => (
          <div className="judges-list">
            {alphaReportJudges.length > 0
              ? alphaReportJudges.map((judgeId) => {
                  const judgeUser = users.find((u) => u._id === judgeId);
                  return judgeUser ? (
                    <React.Fragment key={judgeId}>
                      <a onClick={() => navigate(`/profile/${judgeId}`)}>{judgeUser.name}</a>
                      {alphaReportJudges.indexOf(judgeId) !== alphaReportJudges.length - 1 &&
                        alphaReportJudges.length > 1 && <Divider type="vertical" style={{ borderColor: "black" }} />}
                    </React.Fragment>
                  ) : null;
                })
              : "לא משוייכים שופטים"}
          </div>
        ),
        width: "30%",
      },
      {
        title: "שופטים עבור דוח סופי",
        dataIndex: "finalReportJudges",
        key: "finalReportJudges",
        render: (finalReportJudges) => (
          <div className="judges-list">
            {finalReportJudges.length > 0
              ? finalReportJudges.map((judgeId) => {
                  const judgeUser = users.find((u) => u._id === judgeId);
                  return judgeUser ? (
                    <React.Fragment key={judgeId}>
                      <a onClick={() => navigate(`/profile/${judgeId}`)}>{judgeUser.name}</a>
                      {finalReportJudges.indexOf(judgeId) !== finalReportJudges.length - 1 &&
                        finalReportJudges.length > 1 && <Divider type="vertical" style={{ borderColor: "black" }} />}
                    </React.Fragment>
                  ) : null;
                })
              : "לא משוייכים שופטים"}
          </div>
        ),
        width: "30%",
      },
      {
        title: "שופטים עבור מבחן",
        dataIndex: "examJudges",
        key: "examJudges",
        render: (examJudges) => (
          <div className="judges-list">
            {examJudges.length > 0
              ? examJudges.map((judgeId) => {
                  const judgeUser = users.find((u) => u._id === judgeId);
                  return judgeUser ? (
                    <React.Fragment key={judgeId}>
                      <a onClick={() => navigate(`/profile/${judgeId}`)}>{judgeUser.name}</a>
                      {examJudges.indexOf(judgeId) !== examJudges.length - 1 && examJudges.length > 1 && (
                        <Divider type="vertical" style={{ borderColor: "black" }} />
                      )}
                    </React.Fragment>
                  ) : null;
                })
              : "לא משוייכים שופטים"}
          </div>
        ),
        width: "30%",
      },
      {
        title: "פעולות",
        key: "actions",
        render: () =>
          !record.isFinished && (
            <div className="project-manage-actions">
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsJudgesModalOpen(true);
                  setSelectedAlphaReportJudges(record.alphaReportJudges);
                  setSelectedFinalReportJudges(record.finalReportJudges);
                  setSelectedExamJudges(record.examJudges);
                }}>
                הוסף/עדכן שופטים
              </Button>
            </div>
          ),
        width: "10%",
      },
    ];

    const expandDataSource = [
      {
        key: "1",
        alphaReportJudges: record.alphaReportJudges,
        finalReportJudges: record.finalReportJudges,
        examJudges: record.examJudges,
      },
    ];

    return <Table columns={expandColumns} dataSource={expandDataSource} pagination={false} bordered={true} />;
  };

  const filteredTakenProjects = projects.filter((p) => {
    if (!p.isTaken || p.isFinished || p.isTerminated) return false;
    if (takenFilter === "missingJudges") {
      return p.alphaReportJudges.length < 3 || p.finalReportJudges.length < 3 || p.examJudges.length < 3;
    }
    return true;
  });

  const filteredOpenProjects = projects.filter((p) => {
    if (p.isTaken || p.isFinished || p.isTerminated) return false;
    if (yearFilter === "") return true;
    if (yearFilter === "all") return true;
    return p.year === yearFilter;
  });

  const filteredFinishedProjects = projects.filter((p) => {
    if (!p.isFinished || p.isTerminated) return false;
    if (yearFilter === "") return true;
    if (yearFilter === "all") return true;
    return p.year === yearFilter;
  });

  const filteredTerminatedProjects = projects.filter((p) => {
    if (!p.isTerminated) return false;
    if (yearFilter === "") return true;
    if (yearFilter === "all") return true;
    return p.year === yearFilter;
  });

  const columns = {
    open: [
      {
        title: "שם הפרויקט",
        dataIndex: "title",
        key: "title",
        ...getColumnSearchProps("title"),
        render: (text, record) => (
          <a onClick={() => navigate(`/project/${record._id}`)}>
            <Highlighter
              highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text.length > 65 ? `${text.substring(0, 65)}...` : text}
            />
          </a>
        ),
        width: "25%",
        sorter: (a, b) => a.title.localeCompare(b.title),
        defaultSortOrder: "ascend",
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "מנחה",
        dataIndex: "advisors",
        key: "advisors",
        ...getColumnSearchProps("advisors"),
        render: (advisors) => (
          <div>
            {advisors.length > 0
              ? advisors.map((advisor) => {
                  const advisorUser = users.find((u) => u._id === advisor);
                  return advisorUser ? (
                    <a key={advisor} onClick={() => navigate(`/profile/${advisor}`)}>
                      <Highlighter
                        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={advisorUser.name}
                      />
                    </a>
                  ) : null;
                })
              : "לא משוייך מנחה"}
          </div>
        ),
        width: "15%",
        sorter: (a, b) => {
          const advisorA = users.find((u) => u._id === a.advisors[0]);
          const advisorB = users.find((u) => u._id === b.advisors[0]);
          return advisorA && advisorB ? advisorA.name.localeCompare(advisorB.name) : 0;
        },
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "סטודנטים",
        dataIndex: "students",
        key: "students",
        render: (students) => (
          <div className="projects-student-list">
            {students.length > 0
              ? students.map(({ student }, index) => {
                  const studentUser = users.find((u) => u._id === student);
                  return studentUser ? (
                    <React.Fragment key={`student-${index}`}>
                      <a onClick={() => navigate(`/profile/${student}`)}>{studentUser.name}</a>
                      {index !== students.length - 1 && students.length > 1 && (
                        <Divider type="vertical" style={{ borderColor: "black" }} />
                      )}
                    </React.Fragment>
                  ) : null;
                })
              : "לא משוייכים סטודנטים"}
          </div>
        ),
        width: "15%",
        filters: [
          { text: "ללא סטודנטים", value: "ללא סטודנטים" },
          { text: "סטודנט אחד", value: "סטודנט אחד" },
          { text: "שני סטודנטים", value: "שני סטודנטים" },
        ],
        onFilter: (value, record) => {
          if (value === "ללא סטודנטים") {
            return record.students.length === 0;
          }
          if (value === "סטודנט אחד") {
            return record.students.length === 1;
          }
          if (value === "שני סטודנטים") {
            return record.students.length === 2;
          }
        },
      },
      {
        title: "מתאים ל...",
        dataIndex: "suitableFor",
        key: "suitableFor",
        width: "10%",
        ...getColumnSearchProps("suitableFor"),
        sorter: (a, b) => a.suitableFor.localeCompare(b.suitableFor),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "סוג",
        dataIndex: "type",
        key: "type",
        width: "10%",
        ...getColumnSearchProps("type"),
        sorter: (a, b) => a.type.localeCompare(b.type),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "פעולות",
        key: "actions",
        render: (_, record) => (
          <div className="project-manage-actions">
            {record.advisors.length === 0 ? (
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsAddAdvisorModalOpen(true);
                }}>
                הוסף מנחה
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsUpdateAdvisorsModalOpen(true);
                  setSelectedAdvisor(record.advisors[0]);
                }}>
                עדכן מנחה
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
        ...getColumnSearchProps("title"),
        render: (text, record) => (
          <a onClick={() => navigate(`/project/${record._id}`)}>
            <Highlighter
              highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text.length > 65 ? `${text.substring(0, 65)}...` : text}
            />
          </a>
        ),
        width: "25%",
        sorter: (a, b) => a.title.localeCompare(b.title),
        defaultSortOrder: "ascend",
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "מנחה",
        dataIndex: "advisors",
        key: "advisors",
        ...getColumnSearchProps("advisors"),
        render: (advisors) => (
          <div>
            {advisors.length > 0
              ? advisors.map((advisor) => {
                  const advisorUser = users.find((u) => u._id === advisor);
                  return advisorUser ? (
                    <a key={advisor} onClick={() => navigate(`/profile/${advisor}`)}>
                      <Highlighter
                        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={advisorUser.name}
                      />
                    </a>
                  ) : null;
                })
              : "לא משוייך מנחה"}
          </div>
        ),
        width: "7%",
        sorter: (a, b) => {
          const advisorA = users.find((u) => u._id === a.advisors[0]);
          const advisorB = users.find((u) => u._id === b.advisors[0]);
          return advisorA && advisorB ? advisorA.name.localeCompare(advisorB.name) : 0;
        },
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "סטודנטים",
        dataIndex: "students",
        key: "students",
        render: (students) => (
          <div className="projects-student-list">
            {students.length > 0
              ? students.map(({ student }, index) => {
                  const studentUser = users.find((u) => u._id === student);
                  return studentUser ? (
                    <React.Fragment key={`student-${index}`}>
                      <a onClick={() => navigate(`/profile/${student}`)}>{studentUser.name}</a>
                      {index !== students.length - 1 && students.length > 1 && (
                        <Divider type="vertical" style={{ borderColor: "black" }} />
                      )}
                    </React.Fragment>
                  ) : null;
                })
              : "לא משוייכים סטודנטים"}
          </div>
        ),
        width: "15%",
        filters: [
          { text: "ללא סטודנטים", value: "ללא סטודנטים" },
          { text: "סטודנט אחד", value: "סטודנט אחד" },
          { text: "שני סטודנטים", value: "שני סטודנטים" },
        ],
        onFilter: (value, record) => {
          if (value === "ללא סטודנטים") {
            return record.students.length === 0;
          }
          if (value === "סטודנט אחד") {
            return record.students.length === 1;
          }
          if (value === "שני סטודנטים") {
            return record.students.length === 2;
          }
        },
      },
      {
        title: "סוג",
        dataIndex: "type",
        key: "type",
        width: "9%",
        ...getColumnSearchProps("type"),
        sorter: (a, b) => a.type.localeCompare(b.type),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "ציון דוח אלפה",
        dataIndex: "alphaReportGrade",
        key: "alphaReportGrade",
        width: "8%",
        render: (grade) => (grade ? grade.grade : "אין ציון"),
        sorter: (a, b) =>
          (a.alphaReportGrade ? a.alphaReportGrade.grade : 0) - (b.alphaReportGrade ? b.alphaReportGrade.grade : 0),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "ציון דוח סופי",
        dataIndex: "finalReportGrade",
        key: "finalReportGrade",
        width: "8%",
        render: (grade) => (grade ? grade.grade : "אין ציון"),
        sorter: (a, b) =>
          (a.finalReportGrade ? a.finalReportGrade.grade : 0) - (b.finalReportGrade ? b.finalReportGrade.grade : 0),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "ציון מבחן",
        dataIndex: "examGrade",
        key: "examGrade",
        width: "8%",
        render: (grade) => (grade ? grade.grade : "אין ציון"),
        sorter: (a, b) => (a.examGrade ? a.examGrade.grade : 0) - (b.examGrade ? b.examGrade.grade : 0),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "פעולות",
        key: "actions",
        render: (_, record) => (
          <div className="project-manage-actions">
            <Button
              onClick={() => {
                setSelectedProject(record);
                setIsJudgesModalOpen(true);
                setSelectedAlphaReportJudges(record.alphaReportJudges);
                setSelectedFinalReportJudges(record.finalReportJudges);
                setSelectedExamJudges(record.examJudges);
              }}>
              הוסף/עדכן שופטים
            </Button>
            <Button
              onClick={() => {
                setSelectedProject(record);
                setIsUpdateAdvisorsModalOpen(true);
                setSelectedAdvisor(record.advisors[0]);
              }}>
              עדכן מנחה
            </Button>
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
    finished: [
      {
        title: "שם הפרויקט",
        dataIndex: "title",
        key: "title",
        ...getColumnSearchProps("title"),
        render: (text, record) => (
          <a onClick={() => navigate(`/project/${record._id}`)}>
            <Highlighter
              highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text.length > 65 ? `${text.substring(0, 65)}...` : text}
            />
          </a>
        ),
        width: "25%",
        sorter: (a, b) => a.title.localeCompare(b.title),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "מנחה",
        dataIndex: "advisors",
        key: "advisors",
        ...getColumnSearchProps("advisors"),
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
        width: "10%",
        sorter: (a, b) => {
          const advisorA = users.find((u) => u._id === a.advisors[0]);
          const advisorB = users.find((u) => u._id === b.advisors[0]);
          return advisorA && advisorB ? advisorA.name.localeCompare(advisorB.name) : 0;
        },
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "סטודנטים",
        dataIndex: "students",
        key: "students",
        render: (students) => (
          <div className="projects-student-list">
            {students.length > 0
              ? students.map(({ student }, index) => {
                  const studentUser = users.find((u) => u._id === student);
                  return studentUser ? (
                    <React.Fragment key={`student-${index}`}>
                      <a onClick={() => navigate(`/profile/${student}`)}>{studentUser.name}</a>
                      {index !== students.length - 1 && students.length > 1 && (
                        <Divider type="vertical" style={{ borderColor: "black" }} />
                      )}
                    </React.Fragment>
                  ) : null;
                })
              : "לא משוייכים סטודנטים"}
          </div>
        ),
        width: "20%",
        filters: [
          { text: "ללא סטודנטים", value: "ללא סטודנטים" },
          { text: "סטודנט אחד", value: "סטודנט אחד" },
          { text: "שני סטודנטים", value: "שני סטודנטים" },
        ],
        onFilter: (value, record) => {
          if (value === "ללא סטודנטים") {
            return record.students.length === 0;
          }
          if (value === "סטודנט אחד") {
            return record.students.length === 1;
          }
          if (value === "שני סטודנטים") {
            return record.students.length === 2;
          }
        },
      },
      {
        title: "סוג",
        dataIndex: "type",
        key: "type",
        width: "10%",
        ...getColumnSearchProps("type"),
        sorter: (a, b) => a.type.localeCompare(b.type),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "ציון דוח אלפה",
        dataIndex: "alphaReportGrade",
        key: "alphaReportGrade",
        render: (grade) => (grade ? grade.grade : "אין ציון"),
        width: "10%",
        sorter: (a, b) => a.alphaReportGrade - b.alphaReportGrade,
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "ציון דוח סופי",
        dataIndex: "finalReportGrade",
        key: "finalReportGrade",
        render: (grade) => (grade ? grade.grade : "אין ציון"),
        width: "10%",
        sorter: (a, b) => a.finalReportGrade - b.finalReportGrade,
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "ציון סופי",
        dataIndex: "finalGrade",
        key: "finalGrade",
        render: (grades) => (grades ? grades.finalGrade : "אין ציון"),
        width: "10%",
        sorter: (a, b) => a.grades.finalGrade - b.grades.finalGrade,
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "פעולות",
        key: "actions",
        render: (_, record) => (
          <a>
            <Tooltip title="מחק מהמערכת">
              <DeleteOutlined
                style={{ fontSize: "25px" }}
                onClick={() => {
                  setSelectedProject(record);
                  setIsDeleteProjectModalOpen(true);
                }}
              />
            </Tooltip>
          </a>
        ),
        width: "5%",
      },
    ],
    terminated: [
      {
        title: "שם הפרויקט",
        dataIndex: "title",
        key: "title",
        ...getColumnSearchProps("title"),
        render: (text, record) => (
          <a onClick={() => navigate(`/project/${record._id}`)}>
            <Highlighter
              highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text.length > 75 ? `${text.substring(0, 75)}...` : text}
            />
          </a>
        ),
        width: "35%",
        sorter: (a, b) => a.title.localeCompare(b.title),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "מנחה",
        dataIndex: "advisors",
        key: "advisors",
        ...getColumnSearchProps("advisors"),
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
        width: "10%",
        sorter: (a, b) => {
          const advisorA = users.find((u) => u._id === a.advisors[0]);
          const advisorB = users.find((u) => u._id === b.advisors[0]);
          return advisorA && advisorB ? advisorA.name.localeCompare(advisorB.name) : 0;
        },
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "סטודנטים",
        dataIndex: "terminationRecord",
        key: "terminationRecord",
        render: (terminationRecord) => (
          <div className="projects-student-list">
            {terminationRecord.length > 0
              ? terminationRecord.map(({ student }, index) => {
                  const studentUser = users.find((u) => u._id === student);
                  return studentUser ? (
                    <React.Fragment key={`student-${index}`}>
                      <a onClick={() => navigate(`/profile/${student}`)}>{studentUser.name}</a>
                      {index !== terminationRecord.length - 1 && terminationRecord.length > 1 && (
                        <Divider type="vertical" style={{ borderColor: "black" }} />
                      )}
                    </React.Fragment>
                  ) : null;
                })
              : "לא משוייכים סטודנטים"}
          </div>
        ),
        width: "20%",
        filters: [
          { text: "ללא סטודנטים", value: "ללא סטודנטים" },
          { text: "סטודנט אחד", value: "סטודנט אחד" },
          { text: "שני סטודנטים", value: "שני סטודנטים" },
        ],
        onFilter: (value, record) => {
          if (value === "ללא סטודנטים") {
            return record.terminationRecord.length === 0;
          }
          if (value === "סטודנט אחד") {
            return record.terminationRecord.length === 1;
          }
          if (value === "שני סטודנטים") {
            return record.terminationRecord.length === 2;
          }
        },
      },
      {
        title: "סוג",
        dataIndex: "type",
        key: "type",
        width: "10%",
        ...getColumnSearchProps("type"),
        sorter: (a, b) => a.type.localeCompare(b.type),
        sortDirections: ["descend", "ascend"],
      },
      {
        title: "פעולות",
        key: "actions",
        render: (_, record) => (
          <div className="termination-project-actions">
            <a>
              <Tooltip title="מחק מהמערכת">
                <DeleteOutlined
                  onClick={() => {
                    setSelectedProject(record);
                    setIsDeleteProjectModalOpen(true);
                  }}
                />
              </Tooltip>
            </a>
            <a>
              <Tooltip title="שחזר פרויקט">
                <RollbackOutlined
                  onClick={() => {
                    setSelectedProject(record);
                    setIsRestoreProjectModalOpen(true);
                  }}
                />
              </Tooltip>
            </a>
          </div>
        ),
        width: "5%",
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
          <span>פרויקטים ללא שיבוץ</span>
        </div>
      ),
      children: (
        <>
          <div className="upper-table-options">
            <Select value={yearFilter} onChange={setYearFilter} style={{ width: "200px" }}>
              <Select.Option value="all">כל השנים</Select.Option>
              {years.map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
            <Button type="primary" onClick={handleAssignAdvisorsAutomatically} loading={loading}>
              שיבוץ מנחים אוטומטי
            </Button>
          </div>
          <Table columns={columns.open} dataSource={filteredOpenProjects} loading={loading} rowKey="_id" />
        </>
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
          <span>פרויקטים פעילים</span>
        </div>
      ),
      children: (
        <>
          <div className="upper-table-options">
            <Select value={takenFilter} onChange={setTakenFilter} style={{ width: "200px" }}>
              <Select.Option value="all">כל הפרויקטים</Select.Option>
              <Select.Option value="missingJudges">פרויקטים שחסר שופטים</Select.Option>
            </Select>
            <Button type="primary" onClick={handleAssignJudgesAutomatically} loading={loading}>
              שיבוץ שופטים אוטומטי
            </Button>
          </div>
          <Table
            columns={columns.taken}
            dataSource={filteredTakenProjects}
            loading={loading}
            rowKey="_id"
            expandable={{
              expandedRowRender,
              defaultExpandedRowKeys: [],
            }}
          />
        </>
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
          <span>פרויקטים שהושלמו</span>
        </div>
      ),
      children: (
        <>
          <Select value={yearFilter} onChange={setYearFilter} style={{ width: "200px", marginBottom: "10px" }}>
            <Select.Option value="all">כל השנים</Select.Option>
            {years.map((year) => (
              <Select.Option key={year} value={year}>
                {year}
              </Select.Option>
            ))}
          </Select>
          <Table
            columns={columns.finished}
            dataSource={filteredFinishedProjects}
            loading={loading}
            rowKey="_id"
            expandable={{
              expandedRowRender,
              defaultExpandedRowKeys: [],
            }}
          />
        </>
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
          <span>פרויקטים שהופסקו</span>
        </div>
      ),
      children: (
        <>
          <Select value={yearFilter} onChange={setYearFilter} style={{ width: "200px", marginBottom: "10px" }}>
            <Select.Option value="all">כל השנים</Select.Option>
            {years.map((year) => (
              <Select.Option key={year} value={year}>
                {year}
              </Select.Option>
            ))}
          </Select>
          <Table columns={columns.terminated} dataSource={filteredTerminatedProjects} loading={loading} rowKey="_id" />
        </>
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

      {/* Update Advisors Modal */}
      <Modal
        open={isUpdateAdvisorsModalOpen}
        title={`עדכון מנחה לפרויקט: ${selectedProject?.title}`}
        onOk={handleUpdateAdvisor}
        onCancel={() => {
          setIsUpdateAdvisorsModalOpen(false);
          setSelectedProject(null);
          setSelectedAdvisor(null);
        }}
        okText="עדכן מנחה"
        cancelText="ביטול">
        <div className="modal-select-input">
          <p>בחר עד 3 שופטים לפרויקט:</p>
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

      {/* Update Judges Modal */}
      <Modal
        open={isJudgesModalOpen}
        title={`עדכון שופטים לפרויקט: ${selectedProject?.title}`}
        onOk={handleUpdateJudges}
        onCancel={() => {
          setIsJudgesModalOpen(false);
          setSelectedProject(null);
          setSelectedAlphaReportJudges([]);
          setSelectedFinalReportJudges([]);
          setSelectedExamJudges([]);
        }}
        okText="עדכן שופטים"
        okButtonProps={{
          disabled:
            selectedAlphaReportJudges.length > 3 ||
            selectedFinalReportJudges.length > 3 ||
            selectedExamJudges.length > 3,
        }}
        cancelText="ביטול">
        <div className="modal-select-input">
          <p>בחר עד 3 שופטים עבור דוח אלפה:</p>
          <Select
            mode="multiple"
            value={selectedAlphaReportJudges}
            onChange={setSelectedAlphaReportJudges}
            options={judges.map((user) => ({
              label: user.name,
              value: user._id,
            }))}
          />
          <p>בחר עד 3 שופטים עבור דוח סופי:</p>
          <Select
            mode="multiple"
            value={selectedFinalReportJudges}
            onChange={setSelectedFinalReportJudges}
            options={judges.map((user) => ({
              label: user.name,
              value: user._id,
            }))}
          />
          <p>בחר עד 3 שופטים עבור מבחן:</p>
          <Select
            mode="multiple"
            value={selectedExamJudges}
            onChange={setSelectedExamJudges}
            options={judges.map((user) => ({
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

      {/* Delete Project Modal */}
      <Modal
        open={isDeleteProjectModalOpen}
        title={`מחיקת פרויקט: ${selectedProject?.title}`}
        onOk={handleDeleteProject}
        onCancel={() => {
          setIsDeleteProjectModalOpen(false);
          setSelectedProject(null);
        }}
        okText="מחק פרויקט"
        okButtonProps={{ danger: true }}
        cancelText="ביטול">
        <div>
          <p>
            אתה בטוח שברצונך למחוק את הפרויקט?
            <br />
            פעולה זו היא בלתי הפיכה!
          </p>
        </div>
      </Modal>

      {/* Restore Project Modal */}
      <Modal
        open={isRestoreProjectModalOpen}
        title={`שחזור פרויקט: ${selectedProject?.title}`}
        onOk={handleRestoreProject}
        onCancel={() => {
          setIsRestoreProjectModalOpen(false);
          setSelectedProject(null);
        }}
        okText="שחזר פרויקט"
        cancelText="ביטול">
        <div>
          <p>
            הפרויקט ישוחזר ללא תלמידים.
            <br />
            אתה בטוח שברצונך לבצע פעולה זאת?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default OverviewProjects;
