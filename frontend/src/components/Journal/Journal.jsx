import React, { useEffect, useState } from "react";
import "./Journal.scss";
import axios from "axios";
import {
  Tooltip,
  List,
  Modal,
  Tabs,
  Select,
  Badge,
  Form,
  Input,
  Button,
  message,
  Avatar,
  Divider,
  Collapse,
  Tag,
} from "antd";
import { CheckCircleTwoTone, EditOutlined, DeleteTwoTone, RollbackOutlined } from "@ant-design/icons";
import { missionLabels } from "../../utils/labelsUtil";

const Journal = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [newMissionForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [missions, setMissions] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});
  const [students, setStudents] = useState([]);

  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const labelData = missionLabels.find((l) => l.value === value);
    const color = labelData?.color || "#000";
    const borderColor = labelData?.borderColor || "#000";
    const borderRadius = labelData?.borderRadius || "0px";

    return (
      <Tag
        color={color}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          marginInlineEnd: 4,
          color: borderColor,
          borderColor: borderColor,
          borderRadius: borderRadius,
          fontWeight: "bold",
        }}>
        {label}
      </Tag>
    );
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/self-projects-student`, {
          withCredentials: true,
        });
        const missionsRes = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/mission/project/${res.data.projects[0]._id}`,
          {
            withCredentials: true,
          }
        );
        // console.log(res.data.projects[0]);
        // console.log(missionsRes.data);
        setProjectDetails(res.data.projects[0]);
        const sortedMissions = missionsRes.data.missions.sort((a, b) => b.number - a.number);
        setMissions(sortedMissions || []);
        setStudents(
          res.data.projects[0].students.map((student) => ({
            label: student.student.name,
            value: student.student._id,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/mission/project/${projectDetails._id}`, {
        withCredentials: true,
      });
      const sortedMissions = res.data.missions.sort((a, b) => b.number - a.number);
      setMissions(sortedMissions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMission = async (values) => {
    try {
      const missionData = {
        ...values,
        projectId: projectDetails._id,
        author: currentUser._id,
        number: missions.length + 1,
      };
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/mission`, missionData, {
        withCredentials: true,
      });
      fetchMissions();
      newMissionForm.resetFields();
      message.success("המשימה נוצרה בהצלחה");
    } catch (error) {
      console.error(error);
      message.error("שגיאה ביצירת המשימה");
    }
  };

  const openMissionsDataSource = missions.filter((mission) => mission.isCompleted === false);
  const closedMissionsDataSource = missions.filter((mission) => mission.isCompleted === true);

  const items = [
    {
      key: "1",
      label: "משימות פתוחות",
      children: (
        <List
          loading={loading}
          pagination={{
            pageSize: 10,
          }}
          header={
            <div className="journal-header">
              <div className="journal-header-counter">
                <Badge
                  count={missions.filter((mission) => mission.isCompleted === false).length}
                  overflowCount={999}
                  style={{
                    backgroundColor: "#faad14",
                  }}
                />
                <p>משימות פתוחות</p>
              </div>
              <div className="journal-header-filter">
                <Select
                  placeholder="יוצר"
                  style={{ width: 150 }}
                  onChange={(value) => console.log(value)}
                  options={students}
                />
                <Select
                  placeholder="תגית"
                  style={{ width: 150 }}
                  onChange={(value) => console.log(value)}
                  options={missionLabels}
                />
                <Select
                  placeholder="משוייך ל..."
                  style={{ width: 150 }}
                  onChange={(value) => console.log(value)}
                  options={students}
                />
              </div>
            </div>
          }
          dataSource={openMissionsDataSource}
          renderItem={(item) => (
            <>
              <Collapse
                key={item._id}
                ghost
                items={[
                  {
                    key: item._id,
                    label: (
                      <List.Item key={item._id}>
                        <List.Item.Meta
                          title={item.name}
                          description={
                            <div className="journal-item-meta">
                              <div className="journal-item-creator">
                                <span>
                                  #{item.number} · {item.author.name} נפתח ב:{" "}
                                </span>
                                {new Date(item.createdAt).toLocaleString("he-IL", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                              </div>
                              <div className="journal-item-labels">
                                {item.labels.map((label) => {
                                  const labelData = missionLabels.find((l) => l.value === label);
                                  const color = labelData?.color || "#000";
                                  const borderColor = labelData?.borderColor || "#000";
                                  const borderRadius = labelData?.borderRadius || "0px";
                                  return (
                                    <Tag
                                      key={label}
                                      color={color}
                                      style={{
                                        color: borderColor,
                                        borderColor: borderColor,
                                        borderRadius: borderRadius,
                                        fontWeight: "bold",
                                      }}>
                                      {label}
                                    </Tag>
                                  );
                                })}
                              </div>
                            </div>
                          }
                        />
                        <div className="journal-item-actions">
                          <Avatar.Group>
                            {item.assignees.map((assignee) => (
                              <Tooltip title={assignee.name} key={assignee._id}>
                                <Avatar className="avatar-icon" size="large">
                                  {assignee.name && assignee.name[0]}
                                  {assignee.name && assignee.name.split(" ")[1] ? assignee.name.split(" ")[1][0] : ""}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </Avatar.Group>
                          <div className="journal-item-actions-buttons">
                            <Tooltip title="סמן כהושלם">
                              <CheckCircleTwoTone twoToneColor="#52c41a" />
                            </Tooltip>
                            <Divider type="vertical" />
                            <Tooltip title="עריכה">
                              <EditOutlined />
                            </Tooltip>
                            <Divider type="vertical" />
                            <Tooltip title="מחיקה">
                              <DeleteTwoTone twoToneColor="#ff4d4f" />
                            </Tooltip>
                          </div>
                        </div>
                      </List.Item>
                    ),
                    children: item.description ? <p key={item._id}>{item.description}</p> : <p>אין תיאור</p>,
                  },
                ]}
              />
              <Divider style={{ margin: "0" }} />
            </>
          )}></List>
      ),
    },
    {
      key: "2",
      label: "משימות סגורות",
      children: (
        <List
          loading={loading}
          pagination={{
            pageSize: 10,
          }}
          header={
            <div className="journal-header">
              <div className="journal-header-counter">
                <Badge
                  count={missions.filter((mission) => mission.isCompleted === true).length}
                  overflowCount={999}
                  style={{
                    backgroundColor: "#52c41a",
                  }}
                />
                <p>משימות סגורות</p>
              </div>
              <div className="journal-header-filter">
                <Select
                  placeholder="יוצר"
                  style={{ width: 150 }}
                  onChange={(value) => console.log(value)}
                  options={students}
                />
                <Select
                  placeholder="תגית"
                  style={{ width: 150 }}
                  onChange={(value) => console.log(value)}
                  options={missionLabels}
                />
                <Select
                  placeholder="משוייך ל..."
                  style={{ width: 150 }}
                  onChange={(value) => console.log(value)}
                  options={students}
                />
              </div>
            </div>
          }
          dataSource={closedMissionsDataSource}
          renderItem={(item) => (
            <Collapse
              key={item._id}
              ghost
              items={[
                {
                  key: item._id,
                  label: (
                    <div>
                      <List.Item key={item._id}>
                        <div className="journal-item">
                          <div className="journal-item__title">{item.name}</div>
                          <div className="journal-item__date">
                            {
                              <>
                                <div className="journal-item-creator">
                                  <span>
                                    #{item.number} · {item.author.name} נפתח ב:{" "}
                                  </span>
                                  {new Date(item.createdAt).toLocaleString("he-IL", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })}
                                </div>
                                <div>
                                  {item.labels.map((label) => {
                                    const labelData = missionLabels.find((l) => l.value === label);
                                    const color = labelData?.color || "#000";
                                    const borderColor = labelData?.borderColor || "#000";
                                    const borderRadius = labelData?.borderRadius || "0px";
                                    return (
                                      <Tag
                                        key={label}
                                        color={color}
                                        style={{
                                          color: borderColor,
                                          borderColor: borderColor,
                                          borderRadius: borderRadius,
                                          fontWeight: "bold",
                                        }}>
                                        {label}
                                      </Tag>
                                    );
                                  })}
                                </div>
                              </>
                            }
                          </div>
                        </div>
                        <div className="journal-item-actions">
                          <Avatar.Group>
                            {item.assignees.map((assignee) => (
                              <Tooltip title={assignee.name} key={assignee._id}>
                                <Avatar className="avatar-icon" size="large">
                                  {assignee.name && assignee.name[0]}
                                  {assignee.name && assignee.name.split(" ")[1] ? assignee.name.split(" ")[1][0] : ""}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </Avatar.Group>
                          <div className="journal-item-actions-buttons">
                            <Tooltip title="פתח מחדש">
                              <RollbackOutlined />
                            </Tooltip>
                            <Divider type="vertical" />
                            <Tooltip title="מחיקה">
                              <DeleteTwoTone twoToneColor="#ff4d4f" />
                            </Tooltip>
                          </div>
                        </div>
                      </List.Item>
                    </div>
                  ),
                  children: item.description ? <p key={item._id}>{item.description}</p> : <p>אין תיאור</p>,
                },
              ]}
            />
          )}
        />
      ),
    },
    {
      key: "3",
      label: "פתיחת משימה חדשה",
      children: (
        <Form form={newMissionForm} layout="vertical" onFinish={handleCreateMission}>
          <Form.Item
            label="שם המשימה"
            name="name"
            rules={[
              {
                required: true,
                message: "שדה חובה",
              },
            ]}>
            <Input />
          </Form.Item>
          <Form.Item label="תיאור המשימה" name="description">
            <Input.TextArea rows={10} />
          </Form.Item>
          <Form.Item label="תגיות" name="labels">
            <Select
              showSearch={false}
              mode="multiple"
              tagRender={tagRender}
              style={{ width: "100%" }}
              placeholder="תגיות"
              options={missionLabels.map((label) => ({
                value: label.value,
                label: label.value,
              }))}
            />
          </Form.Item>
          <Form.Item label="משוייך ל..." name="assignees">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="משוייך ל..."
              options={students}
              showSearch={false}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              יצירה
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="journal">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default Journal;
