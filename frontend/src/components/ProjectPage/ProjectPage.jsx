import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { InfoCircleOutlined, BookOutlined, UserOutlined } from "@ant-design/icons";
import { Tooltip, message } from "antd";
import "./ProjectPage.scss";
import { processContent } from "../../utils/htmlProcessor";

const ProjectPage = () => {
  const { projectID } = useParams();
  const [projectData, setProjectData] = useState({});
  const [page, setPage] = useState({
    Information: true,
    Grades: false,
    Other: false
  });
  const [advisors, setAdvisors] = useState([]);
  const [isCandidate, setIsCandidate] = useState(false);
  const [hasProject, setHasProject] = useState(false);

  useEffect(() => {
    const checkIfUserCandidate = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/project/check-if-candidate/${projectID}`, {
          withCredentials: true
        });
        setIsCandidate(response.data.isCandidate);
        console.log(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };
    const getAdvisorInfo = async () => {
      if (projectData.advisors) {
        try {
          if (projectData.advisors.length === 0) return;
          const advisors = [];
          for (const advisor of projectData.advisors) {
            const response = await axios.get(`http://localhost:5000/api/user/get-user-info/${advisor}`, {
              withCredentials: true
            });
            advisors.push(response.data);
            console.log(response.data);
          }
          setAdvisors(advisors);
        } catch (error) {
          console.error("Error occurred:", error);
        }
      }
    };
    checkIfUserCandidate();
    getAdvisorInfo();
  }, [projectData]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const hasProject = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/check-user-has-projects/${user._id}`, {
          withCredentials: true
        });
        setHasProject(response.data.hasProject);
        console.log(response.data.hasProject);
        console.log("im here xd");
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };
    hasProject();
  }, []);

  const switchPage = (pageName) => {
    const myPages = { ...page };
    for (const key in page) {
      myPages[key] = key === pageName;
    }
    setPage(myPages);
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/project/get-project/${projectID}`, {
          withCredentials: true
        });
        setProjectData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };
    fetchProjectData();
  }, [projectID]);

  const copyToClipboard = () => {
    const emails = advisors.map((advisor) => advisor.email).join(", ");
    navigator.clipboard.writeText(emails);
  };

  const Unsignup = async () => {
    try {
      setIsCandidate(false);
      message.open({
        type: "loading",
        content: "מבצע הסרת הרשמה מהפרוייקט..."
      });
      const response = await axios.get(`http://localhost:5000/api/user/get-user`, {
        withCredentials: true
      });
      const userID = response.data._id;
      console.log(userID);
      await axios.post(
        `http://localhost:5000/api/project/remove-candidate`,
        { projectID: projectID, userID: userID },
        { withCredentials: true }
      );
      console.log("Unsignup successful");
      setTimeout(() => {
        message.open({
          type: "success",
          content: "הוסר הרשמה מהפרוייקט",
          duration: 2
        });
      }, 1000);
    } catch (error) {
      console.log("Error occurred:", error.response.data.message);
    }
  };

  const Signup = async () => {
    try {
      message.open({
        type: "loading",
        content: "מבצע הרשמה לפרוייקט..."
      });
      await axios.post(
        `http://localhost:5000/api/project/add-candidate`,
        { projectID: projectID },
        { withCredentials: true }
      );
      console.log("Signup successful");
      setTimeout(() => {
        message.open({
          type: "success",
          content: "נרשם בהצלחה",
          duration: 2
        });
      }, 1000);
      setIsCandidate(true);
    } catch (error) {
      console.log("Error occurred:", error.response.data.message);
      setTimeout(() => {
        message.open({
          type: "error",
          content: error.response.data.message,
          duration: 2
        });
      }, 1000);
    }
  };

  return (
    <div className="project-container">
      <div className="project-profile-header">
        <h2 className="project-title">{projectData.title}</h2>
      </div>
      <div className="project-advisors-list">
        {advisors.map((advisor, index) => (
          <div key={index} className="project-advisor">
            <UserOutlined />
            <div className="project-advisor-name">{advisor.name}</div>
          </div>
        ))}
      </div>
      <div className="project-profile-navbar">
        <div
          className={`project-navbar-item ${page.Information ? "navbar-item-selected" : ""}`}
          onClick={() => switchPage("Information")}>
          <InfoCircleOutlined />
          <div className="project-navbar-item-name">פרטי הפרוייקט</div>
        </div>
        <div
          className={`project-navbar-item ${page.Grades ? "navbar-item-selected" : ""}`}
          onClick={() => switchPage("Grades")}>
          <BookOutlined />
          <div className="project-navbar-item-name">ציונים</div>
        </div>
        <div
          className={`project-navbar-item ${page.Other ? "navbar-item-selected" : ""}`}
          onClick={() => switchPage("Other")}>
          <div className="project-navbar-item-icon"></div>
          <div className="project-navbar-item-name">לא יודע עוד משהו</div>
        </div>
      </div>
      <hr className="project-profile-line"></hr>
      {page.Information && (
        <div className="project-profile-info project-profile-content">
          <div className="project-profile-info-item">
            <div className="project-profile-info-title">תיאור הפרוייקט</div>
            <div
              className="project-profile-info-text rich-text-content"
              dangerouslySetInnerHTML={{ __html: processContent(projectData.description) }}></div>
          </div>
          <div className="project-profile-info-item project-badges">
            <div className="project-profile-info-title">התאמות:</div>
            <Tooltip title="מתאים ל">
              <div className="project-badge project-suitable">{projectData.suitableFor}</div>
            </Tooltip>
            <Tooltip title="סוג פרוייקט">
              <div className="project-badge project-type">{projectData.type}</div>
            </Tooltip>
          </div>
          <div className="project-profile-info-item project-profile-info-emails">
            <div className="project-profile-info-title">אימייל המרצה ליצירת קשר:</div>
            <div className="project-profile-info-text project-profile-info-email">
              {advisors.map((advisor, index) => (
                <Tooltip key={index} title="לחץ להעתקה">
                  <div
                    className="advisor-email"
                    onClick={() => {
                      copyToClipboard();
                    }}>
                    {advisor.email}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
          {!hasProject ? (
            isCandidate ? (
              <div className="project-unsignup-button" onClick={() => Unsignup()}>
                הסר הרשמה לפרוייקט
              </div>
            ) : (
              <div className="project-signup-button" onClick={() => Signup()}>
                הרשמה לפרוייקט
              </div>
            )
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
