import React, { useEffect, useState } from "react";
import "./CheckSubmissions.scss";
import axios from "axios";
import { Tooltip, List, Skeleton, Modal, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";
import { DownloadOutlined } from "@ant-design/icons";

const CheckSubmissions = () => {
  const navigate = useNavigate();
  const [initLoading, setInitLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [moreDetailsModal, setMoreDetailsModal] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-judge-submissions`, {
          withCredentials: true,
        });

        setSubmissions(response.data);
        setInitLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const getSumbissionDetails = async (submissionId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/submission/get-submission-details/${submissionId}`,
        {
          withCredentials: true,
        }
      );
      setSubmissionDetails(response.data);
      setMoreDetailsModal(true);
    } catch (error) {
      console.log(error);
      setSubmissionDetails({});
      setMoreDetailsModal(false);
    }
  };

  const waitingForGrade = submissions.filter((submission) => submission.grade === null);
  const gradedAndEditable = submissions
    .filter((submission) => submission.grade !== null && submission.editable)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const gradedSubmissions = submissions
    .filter((submission) => submission.grade !== null && !submission.editable)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const items = [
    {
      key: "1",
      label: "מחכה לשפיטה",
      children: (
        <List
          className="submission-list"
          loading={initLoading}
          itemLayout="horizontal"
          pagination={{
            pageSize: 10,
          }}
          dataSource={waitingForGrade}
          renderItem={(item) => (
            <List.Item
              actions={[
                <a
                  key="list-grade"
                  onClick={() => navigate(`/grade-submission/${item.key}`)}
                  onMouseDown={(e) => handleMouseDown(e, `/grade-submission/${item.key}`)}>
                  שפיטה
                </a>,
                <a
                  key="list-more"
                  onClick={() => {
                    getSumbissionDetails(item.key);
                  }}>
                  פרטים נוספים
                </a>,
              ]}>
              <Skeleton title={false} loading={item.loading} active>
                <List.Item.Meta
                  className="submission-meta"
                  title={
                    <div className="project-name">
                      <span>
                        {item.submissionName} - (
                        <a
                          onClick={() => navigate(`/project/${item.projectId}`)}
                          onMouseDown={(e) => handleMouseDown(e, `/project/${item.projectId}`)}>
                          {item.projectName.length > 55 ? item.projectName.slice(0, 55) + "..." : item.projectName}
                        </a>
                        )
                      </span>
                    </div>
                  }
                  description="פה יהיה שם הקובץ"
                />
                <div className="submission-details">
                  <span>לא ניתן ציון</span>
                  <Tooltip title="הורד קובץ">
                    <DownloadOutlined className="icon" />
                  </Tooltip>
                </div>
              </Skeleton>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "2",
      label: "ניתנים לשינוי",
      children: (
        <List
          className="submission-list"
          loading={initLoading}
          itemLayout="horizontal"
          pagination={{
            pageSize: 10,
          }}
          dataSource={gradedAndEditable}
          renderItem={(item) => (
            <List.Item
              actions={[
                <a
                  key="list-grade"
                  onClick={() => navigate(`/grade-submission/${item.key}?edit=true`)}
                  onMouseDown={(e) => handleMouseDown(e, `/grade-submission/${item.key}?edit=true`)}>
                  עריכה
                </a>,
                <a
                  key="list-more"
                  onClick={() => {
                    getSumbissionDetails(item.key);
                  }}>
                  פרטים נוספים
                </a>,
              ]}>
              <Skeleton title={false} loading={item.loading} active>
                <List.Item.Meta
                  className="submission-meta"
                  title={
                    <div className="project-name">
                      <span>
                        {item.submissionName} - (
                        <a
                          onClick={() => navigate(`/project/${item.projectId}`)}
                          onMouseDown={(e) => handleMouseDown(e, `/project/${item.projectId}`)}>
                          {item.projectName.length > 55 ? item.projectName.slice(0, 55) + "..." : item.projectName}
                        </a>
                        )
                      </span>
                    </div>
                  }
                  description="פה יהיה שם הקובץ"
                />
                <div className="submission-details">
                  {item.overridden ? (
                    <div className="grade">
                      <span>ציון:</span>
                      <p style={{ textDecoration: "line-through" }}>{item.grade}</p>
                      <p>{item.overridden.newGrade}</p>
                    </div>
                  ) : (
                    <div className="grade">
                      <span>ציון: </span>
                      <p>{item.grade}</p>
                    </div>
                  )}
                  <Tooltip title="הורד קובץ">
                    <DownloadOutlined className="icon" />
                  </Tooltip>
                </div>
              </Skeleton>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "3",
      label: "נשפט",
      children: (
        <List
          className="submission-list"
          loading={initLoading}
          itemLayout="horizontal"
          pagination={{
            pageSize: 10,
          }}
          dataSource={gradedSubmissions}
          renderItem={(item) => (
            <List.Item
              actions={[
                <a
                  key="list-more"
                  onClick={() => {
                    getSumbissionDetails(item.key);
                  }}>
                  פרטים נוספים
                </a>,
              ]}>
              <Skeleton title={false} loading={item.loading} active>
                <List.Item.Meta
                  className="submission-meta"
                  title={
                    <div className="project-name">
                      <span>
                        {item.submissionName} - (
                        <a
                          onClick={() => navigate(`/project/${item.projectId}`)}
                          onMouseDown={(e) => handleMouseDown(e, `/project/${item.projectId}`)}>
                          {item.projectName.length > 55 ? item.projectName.slice(0, 55) + "..." : item.projectName}
                        </a>
                        )
                      </span>
                    </div>
                  }
                  description="פה יהיה שם הקובץ"
                />
                <div className="submission-details">
                  {item.overridden ? (
                    <div className="grade">
                      <span>ציון:</span>
                      <p style={{ textDecoration: "line-through" }}>{item.grade}</p>
                      <p>{item.overridden.newGrade}</p>
                    </div>
                  ) : (
                    <div className="grade">
                      <span>ציון: </span>
                      <p>{item.grade}</p>
                    </div>
                  )}
                  <Tooltip title="הורד קובץ">
                    <DownloadOutlined className="icon" />
                  </Tooltip>
                </div>
              </Skeleton>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div className="check-submissions-container">
      <Tabs defaultActiveKey="1" items={items} />
      <Modal
        title="פרטי שפיטה"
        open={moreDetailsModal}
        onCancel={() => {
          setMoreDetailsModal(false);
          setSubmissionDetails({});
        }}
        cancelText="סגור"
        okButtonProps={{ style: { display: "none" } }}>
        <div className="details-title">
          <h3>{submissionDetails.projectName}</h3>
          <p>הגשה - {submissionDetails.submissionName}</p>
        </div>
        <div className="details-grade">
          <span>ציון שניתן על ידך:</span> <p>{submissionDetails.grade ? submissionDetails.grade : "לא ניתן ציון"}</p>
        </div>
        <p>
          <strong>איכות הוידאו:</strong> {submissionDetails.videoQuality}
        </p>
        <p>
          <strong>איכות העבודה:</strong> {submissionDetails.workQuality}
        </p>
        <p>
          <strong>איכות הכתיבה:</strong> {submissionDetails.writingQuality}
        </p>
        {submissionDetails.commits && (
          <p>
            <strong>מספר הקומיטים:</strong> {submissionDetails.commits}
          </p>
        )}
        {submissionDetails.journalActive && (
          <p>
            <strong>האם היומן פעיל:</strong>{" "}
            {submissionDetails.journalActive === "yes" ? "כן" : submissionDetails.journalActive === "no" ? "לא" : ""}
          </p>
        )}
        <p>
          <strong>תאריך שפיטה:</strong>{" "}
          {new Date(submissionDetails.updatedAt).toLocaleString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </p>
      </Modal>
    </div>
  );
};

export default CheckSubmissions;
