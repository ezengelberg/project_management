import React, { useState, useEffect, useContext } from "react";
import "./ListZoomMeetings.scss";
import { Table, Button, Tag, message, Tooltip, Popconfirm } from "antd";
import { CopyTwoTone, DeleteTwoTone } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { NotificationsContext } from "../../utils/NotificationsContext";

const ListZoomMeetings = () => {
  const { fetchNotifications } = useContext(NotificationsContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const isCoordinatorOrAdvisor = currentUser.isCoordinator || currentUser.isAdvisor;

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/zoom/meetings`, {
          withCredentials: true,
        });

        const meetingsWithCreator = await Promise.all(
          response.data.map(async (meeting) => {
            const creator = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-info/${meeting.creator}`,
              {
                withCredentials: true,
              }
            );
            return { ...meeting, creator: creator.data };
          })
        );
        setMeetings(meetingsWithCreator);
      } catch (error) {
        message.error("שגיאה בטעינת הפגישות");
      }
      setLoading(false);
    };
    fetchMeetings();
    fetchNotifications();
  }, []);

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    message.success("לינק הועתק");
  };

  const deleteMeeting = async (meetingId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/zoom/meetings/${meetingId}`, {
        withCredentials: true,
      });
      setMeetings(meetings.filter((meeting) => meeting._id !== meetingId));
      message.success("הפגישה נמחקה בהצלחה");
    } catch (error) {
      message.error("שגיאה במחיקת הפגישה");
    }
  };

  const columns = [
    {
      title: "פרויקט",
      fixed: windowSize.width > 768 && "left",
      dataIndex: "project",
      key: "projectTitle",
      render: (project) => (
        <Tooltip title={project ? project.title : "פגישה כללית"}>
          {windowSize.width > 1920
            ? project && project.title.length > 100
              ? `${project.title.substring(0, 100)}...`
              : project
              ? project.title
              : "פגישה כללית"
            : windowSize.width > 1600
            ? project && project.title.length > 65
              ? `${project.title.substring(0, 65)}...`
              : project
              ? project.title
              : "פגישה כללית"
            : windowSize.width > 1200
            ? project && project.title.length > 50
              ? `${project.title.substring(0, 50)}...`
              : project
              ? project.title
              : "פגישה כללית"
            : windowSize.width > 1024
            ? project && project.title.length > 40
              ? `${project.title.substring(0, 40)}...`
              : project
              ? project.title
              : "פגישה כללית"
            : windowSize.width > 768
            ? project && project.title.length > 35
              ? `${project.title.substring(0, 35)}...`
              : project
              ? project.title
              : "פגישה כללית"
            : project && project.title.length > 35
            ? `${project.title.substring(0, 35)}...`
            : project
            ? project.title
            : "פגישה כללית"}
        </Tooltip>
      ),
      sorter: (a, b) => (a.project ? a.project.title.localeCompare(b.project.title) : -1),
      width:
        windowSize.width > 1920
          ? "35%"
          : windowSize.width > 1600
          ? 500
          : windowSize.width > 1200
          ? 420
          : windowSize.width > 1024
          ? 320
          : 300,
    },
    {
      title: "נושא",
      dataIndex: "topic",
      key: "topic",
      render: (topic) => (
        <Tooltip title={topic}>
          {windowSize.width > 1920
            ? topic.length > 60
              ? `${topic.substring(0, 60)}...`
              : topic
            : windowSize.width > 1600
            ? topic.length > 45
              ? `${topic.substring(0, 45)}...`
              : topic
            : windowSize.width > 1200
            ? topic.length > 35
              ? `${topic.substring(0, 35)}...`
              : topic
            : windowSize.width > 1024
            ? topic.length > 23
              ? `${topic.substring(0, 23)}...`
              : topic
            : windowSize.width > 768
            ? topic.length > 23
              ? `${topic.substring(0, 23)}...`
              : topic
            : topic.length > 23
            ? `${topic.substring(0, 23)}...`
            : topic}
        </Tooltip>
      ),
      width:
        windowSize.width > 1920
          ? "20%"
          : windowSize.width > 1600
          ? 350
          : windowSize.width > 1200
          ? 280
          : windowSize.width > 1024
          ? 200
          : 200,
    },
    {
      title: "תאריך",
      dataIndex: "startTime",
      key: "startTime",
      render: (date) => dayjs(date).locale("he").format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
      defaultSortOrder: "ascend",
      width: windowSize.width > 1920 ? "10%" : windowSize.width > 1600 ? 150 : 150,
    },
    {
      title: "לינק",
      dataIndex: "joinUrl",
      key: "joinUrl",
      render: (text, record) => {
        const link = currentUser._id === record.creator._id ? record.startUrl : record.joinUrl;
        const isMeetingEnded = dayjs().isAfter(dayjs(record.endTime));
        return isMeetingEnded ? (
          <span>הפגישה הסתיימה</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
              הצטרף לפגישה
            </a>
            <Tooltip title="העתק לינק">
              <Button
                type="text"
                icon={<CopyTwoTone className="meeting-table-icon" />}
                onClick={() => copyLink(record.joinUrl)}
              />
            </Tooltip>
          </div>
        );
      },
      width: windowSize.width > 1920 ? "10%" : windowSize.width > 1600 ? 200 : 200,
    },
    {
      title: "משתתפים",
      dataIndex: "participants",
      key: "participants",
      render: (participants, record) => (
        <div>
          <Tag color="red" key={record.creator._id}>
            {record.creator.name}
          </Tag>
          {participants.map((p) => (
            <Tag key={p._id} color="blue">
              {p.name}
            </Tag>
          ))}
        </div>
      ),
      width: windowSize.width > 1920 ? "20%" : windowSize.width > 1600 ? 350 : 350,
    },
    isCoordinatorOrAdvisor && {
      title: "פעולות",
      key: "actions",
      render: (text, record) =>
        currentUser._id === record.creator._id && (
          <Popconfirm
            title="האם אתה בטוח שברצונך למחוק את הפגישה?"
            onConfirm={() => deleteMeeting(record._id)}
            okText="כן"
            cancelText="לא">
            <Button
              type="text"
              icon={
                <Tooltip title="מחק פגישה">
                  <DeleteTwoTone twoToneColor="#ff4d4f" className="meeting-table-icon" />
                </Tooltip>
              }
            />
          </Popconfirm>
        ),
      width: windowSize.width > 1920 ? "5%" : windowSize.width > 1600 ? 100 : 100,
    },
  ].filter(Boolean);

  return (
    <div className="meetings-list-container">
      <Table
        columns={columns}
        dataSource={meetings}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{
          x: "max-content",
        }}
      />
    </div>
  );
};

export default ListZoomMeetings;
