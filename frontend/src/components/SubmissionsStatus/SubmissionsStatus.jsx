import React, { useState, useEffect, useRef } from "react";
import "./SubmissionsStatus.scss";
import axios from "axios";
import Highlighter from "react-highlight-words";
import { handleMouseDown } from "../../utils/mouseDown";
import { getColumnSearchProps as getColumnSearchPropsUtil } from "../../utils/tableUtils";
import { useNavigate } from "react-router-dom";
import { Table, Divider, Badge, Button, Tooltip, Select } from "antd";
import { downloadFile } from "../../utils/downloadFile";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";

const SubmissionsStatus = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [years, setYears] = useState([]);
  const searchInput = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsResponse, yearsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/get-self-projects/`, {
            withCredentials: true,
          }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/years`, {
            withCredentials: true,
          }),
        ]);

        const projects = projectsResponse.data.projects.filter((project) => project.students.length > 0);

        const submissionsPromises = projects.map((project) =>
          axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/submission/get-specific-project-submissions/${project._id}`,
            {
              withCredentials: true,
            }
          )
        );

        const studentPromises = projects.map((project) =>
          Promise.all(
            project.students.map((student) =>
              axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${student.student}`, {
                withCredentials: true,
              })
            )
          )
        );

        const [submissionsResponses, studentResponses] = await Promise.all([
          Promise.all(submissionsPromises),
          Promise.all(studentPromises),
        ]);

        const projectsWithSubmissionsAndStudents = projects.map((project, index) => ({
          ...project,
          submissions: submissionsResponses[index].data
            .map((submission) => {
              const { grades, ...rest } = submission;
              return rest;
            })
            .sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate)),
          students: studentResponses[index].map((response) => response.data),
        }));

        setProjects(projectsWithSubmissionsAndStudents);
        setYears(yearsResponse.data.sort((a, b) => b.localeCompare(a)));

        const currentHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date())).split(" ").pop().replace(/^ה/, "");
        const currentHebrewYearIndex = yearsResponse.data.indexOf(currentHebrewYear);
        setYearFilter(
          currentHebrewYearIndex !== -1 ? yearsResponse.data[currentHebrewYearIndex] : yearsResponse.data[0]
        );

        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getBadgeStatus = (submission) => {
    if (!submission.fileNeeded) {
      return { color: "green", text: "לא נדרש קובץ" };
    } else if (!submission.submitted) {
      return { color: "red", text: "לא הוגש" };
    } else if (submission.submitted && new Date(submission.submissionDate) < new Date(submission.uploadDate)) {
      return {
        color: "darkgreen",
        text: `הוגש באיחור - ${Math.ceil(
          (new Date(submission.uploadDate) - new Date(submission.submissionDate)) / (1000 * 60 * 60 * 24)
        )} ימים`,
      };
    } else {
      return { color: "green", text: "הוגש" };
    }
  };

  const columns = [
    {
      title: "שם פרויקט",
      dataIndex: "projectName",
      key: "projectName",
      width: "25%",
      ...getColumnSearchProps("projectName"),
      render: (text, record) => (
        <a
          onClick={() => navigate(`/project/${record.key}`)}
          onMouseDown={(e) => handleMouseDown(e, `/project/${record.key}`)}>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={
              record.projectName && record.projectName.length > 65
                ? `${record.projectName.slice(0, 65)}...`
                : record.projectName
            }
          />
        </a>
      ),
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "שם סטודנט",
      dataIndex: "studentName",
      key: "studentName",
      width: "20%",
      render: (text, record) => (
        <div className="submission-status-students">
          {record.students.map((student, index) => (
            <div key={index}>
              {student.name}
              {index !== record.students.length - 1 && record.students.length > 1 && (
                <Divider type="vertical" style={{ borderColor: "black" }} />
              )}
            </div>
          ))}
        </div>
      ),
      filters: [
        { text: "סטודנט יחיד", value: 1 },
        { text: "זוג סטודנטים", value: 2 },
      ],
      onFilter: (value, record) => record.students.length === value,
    },
    {
      title: "הגשות",
      dataIndex: "submissions",
      key: "submissions",
      width: "55%",
      render: (text, record) => (
        <div className="submission-status-submissions">
          {record.submissions.map((submission, index) => (
            <div key={index} className="submission-status-submission">
              <div className="submission-status-submission-details">
                <div className="submission-title">
                  {submission.name.length > 25 ? (
                    <Tooltip title={submission.name}>{submission.name.substring(0, 25)}...</Tooltip>
                  ) : (
                    submission.name
                  )}
                </div>
                <div className="submission-date">
                  <strong>הגשה עד:</strong>{" "}
                  {submission.submissionDate
                    ? new Date(submission.submissionDate).toLocaleString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "לא נקבע תאריך הגשה"}
                </div>
                <div className="submission-late-status">
                  {submission.submissionDate &&
                    new Date(submission.submissionDate) < new Date() &&
                    submission.fileNeeded &&
                    !submission.submitted &&
                    `הגשה באיחור! - ${Math.ceil(
                      (new Date() - new Date(submission.submissionDate)) / (1000 * 60 * 60 * 24)
                    )} ימים`}
                </div>
                <Badge color={getBadgeStatus(submission).color} text={getBadgeStatus(submission).text} />
                {submission.submitted && submission.file && (
                  <Button color="primary" variant="filled" onClick={() => downloadFile(submission.file, "submissions")}>
                    הורד הגשה
                  </Button>
                )}
                {submission.submitted && submission.editable && new Date(submission.submissionDate) > new Date() && (
                  <Badge color="orange" text="ניתן לשינוי" />
                )}
                {submission.submitted && submission.editable && new Date(submission.submissionDate) < new Date() && (
                  <Badge color="blue" text="בבדיקה" />
                )}
                {submission.isGraded && !submission.editable && (
                  <p style={{ margin: "0" }}>
                    <strong>ציון:</strong> {submission.finalGrade}
                  </p>
                )}
                {submission.isReviewed && !submission.isGraded && !submission.editable && <strong>הגשה נבדקה</strong>}
              </div>
              {index !== record.submissions.length - 1 && record.submissions.length > 1 && (
                <Divider type="vertical" style={{ height: "100%" }} />
              )}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const filteredProjects = projects.filter((project) => {
    if (yearFilter === "all") return true;
    return project.year === yearFilter;
  });

  const dataSource = filteredProjects.map((project) => {
    return {
      key: project._id,
      projectName: project.title,
      students: project.students,
      projectYear: project.year,
      submissions: project.submissions,
    };
  });

  return (
    <div className="submission-status-container">
      <div className="upper-table-options">
        <Select value={yearFilter} onChange={setYearFilter} style={{ width: "200px" }}>
          <Select.Option value="all">כל השנים</Select.Option>
          {years.map((year) => (
            <Select.Option key={year} value={year}>
              {year}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Table columns={columns} dataSource={dataSource} loading={loading} />
    </div>
  );
};

export default SubmissionsStatus;
