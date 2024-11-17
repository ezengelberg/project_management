import React, { useEffect, useState } from "react";
import "./CheckSubmissions.scss";
import axios from "axios";
import { Tooltip, List, Skeleton } from "antd";
import { useNavigate } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";
import { DownloadOutlined } from "@ant-design/icons";

const CheckSubmissions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [initLoading, setInitLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-user-submissions`, {
          withCredentials: true,
        });

        setSubmissions(response.data);
        console.log(response.data);
        setInitLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="check-submissions-container">
      <List
        className="submission-list"
        loading={initLoading}
        itemLayout="horizontal"
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 10,
        }}
        dataSource={submissions}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a
                key="list-grade"
                onClick={() => navigate(`/grade-project/${item.key}`)}
                onMouseDown={(e) => handleMouseDown(e, `/grade-project/${item.key}`)}>
                דרג
              </a>,
              <a key="list-more">פרטים נוספים</a>,
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
                        {item.projectName}
                      </a>
                      )
                    </span>
                  </div>
                }
                description="פה יהיה שם הקובץ"
              />

              <div className="submission-details">
                {item.grade !== null ? (
                  item.overridden ? (
                    <div className="grade">
                      <span>ציון:</span>
                      <span style={{ textDecoration: "line-through" }}>{item.grade}</span>
                      <span>{item.overridden.newGrade}</span>
                    </div>
                  ) : (
                    <div className="grade">
                      <span>ציון:</span>
                      <span>{item.grade}</span>
                    </div>
                  )
                ) : (
                  <span>לא ניתן ציון</span>
                )}
                <Tooltip title="הורד קובץ">
                  <DownloadOutlined className="icon" />
                </Tooltip>
              </div>
            </Skeleton>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CheckSubmissions;
