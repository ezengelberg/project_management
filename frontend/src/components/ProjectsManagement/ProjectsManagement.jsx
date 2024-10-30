import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, Table, Modal, Select, Badge, Button } from "antd";
import axios from "axios";

const ProjectsManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersWithoutProjects, setUsersWithoutProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, usersRes] = await Promise.all([
          axios.get("/api/project", { withCredentials: true }),
          axios.get("/api/user/all-users", { withCredentials: true }),
        ]);

        const activeUsers = usersRes.data.filter((user) => !user.suspended && user.isStudent);
        setProjects(projectsRes.data);
        setUsers(activeUsers);

        // Filter users without projects
        const usersWithProject = new Set(
          projectsRes.data.flatMap((project) => project.students.map((student) => student.student.toString()))
        );

        setUsersWithoutProjects(activeUsers.filter((user) => !usersWithProject.has(user._id.toString())));
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
        `/api/project/${selectedProject._id}/students`,
        {
          students: selectedStudents,
        },
        { withCredentials: true }
      );

      // Update local state
      setProjects(
        projects.map((project) => {
          if (project._id === selectedProject._id) {
            return {
              ...project,
              students: [
                ...project.students,
                ...selectedStudents.map((studentId) => ({
                  student: studentId,
                  joinDate: new Date(),
                })),
              ],
              isTaken: true,
            };
          }
          return project;
        })
      );

      setUsersWithoutProjects(usersWithoutProjects.filter((user) => !selectedStudents.includes(user._id)));

      setIsAddStudentsModalOpen(false);
      setSelectedStudents([]);
      setSelectedProject(null);
    } catch (error) {
      console.error("Error adding students:", error);
    }
  };

  const handleTerminateProject = async () => {
    try {
      await axios.post(
        `/api/project/${selectedProject._id}/terminate`,
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
        title: "Suitable For",
        dataIndex: "suitableFor",
        key: "suitableFor",
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <div className="space-x-2">
            <Button
              onClick={() => {
                setSelectedProject(record);
                setIsAddStudentsModalOpen(true);
              }}>
              Add Students
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setSelectedProject(record);
                setIsTerminateModalOpen(true);
              }}>
              Terminate
            </Button>
          </div>
        ),
      },
    ],
    taken: [
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
        render: () => <Badge className="bg-blue-500">Active</Badge>,
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Button
            variant="destructive"
            onClick={() => {
              setSelectedProject(record);
              setIsTerminateModalOpen(true);
            }}>
            Terminate
          </Button>
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
      label: "Open Projects",
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
      label: "Taken Projects",
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
      label: "Finished Projects",
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
      label: "Terminated Projects",
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
    <div className="p-6">
      <Tabs items={tabs} />

      {/* Add Students Modal */}
      <Modal
        open={isAddStudentsModalOpen}
        title="Add Students to Project"
        onClose={() => {
          setIsAddStudentsModalOpen(false);
          setSelectedStudents([]);
          setSelectedProject(null);
        }}>
        <div className="space-y-4">
          <p>Select up to 2 students for this project:</p>
          <Select
            mode="multiple"
            maxTagCount={2}
            value={selectedStudents}
            onChange={setSelectedStudents}
            options={usersWithoutProjects.map((user) => ({
              label: user.name,
              value: user._id,
            }))}
            className="w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddStudentsModalOpen(false);
                setSelectedStudents([]);
                setSelectedProject(null);
              }}>
              Cancel
            </Button>
            <Button onClick={handleAddStudents} disabled={selectedStudents.length === 0 || selectedStudents.length > 2}>
              Add Students
            </Button>
          </div>
        </div>
      </Modal>

      {/* Terminate Project Modal */}
      <Modal
        open={isTerminateModalOpen}
        title="Terminate Project"
        onClose={() => {
          setIsTerminateModalOpen(false);
          setSelectedProject(null);
        }}>
        <div className="space-y-4">
          <p>Are you sure you want to terminate this project? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsTerminateModalOpen(false);
                setSelectedProject(null);
              }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTerminateProject}>
              Terminate Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsManagement;
