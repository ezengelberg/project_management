import React, { useEffect, useState, useContext } from "react";
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
import { useParams } from "react-router-dom";
import { NotificationsContext } from "../../utils/NotificationsContext";

const Journal = ({ readOnly }) => {
  const { projectId } = useParams();
  const { fetchNotifications } = useContext(NotificationsContext);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [newMissionForm] = Form.useForm();
  const [editMissionForm] = Form.useForm();
  const [deleteMissionModalVisible, setDeleteMissionModalVisible] = useState(false);
  const [deleteMissionId, setDeleteMissionId] = useState("");
  const [editMissionModalVisible, setEditMissionModalVisible] = useState(false);
  const [editMissionDetails, setEditMissionDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [missions, setMissions] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState(null);

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
    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        let projectRes;
        let missionRes;
        if (readOnly) {
          projectRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/get-self-projects`, {
            withCredentials: true,
          });
          if (!projectRes.data.projects.length) {
            return;
          }
          const project = projectRes.data.projects.find((project) => project._id === projectId);
          if (!project) {
            return;
          }
          setProjectDetails(project);
          missionRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/mission/project/${projectId}`, {
            withCredentials: true,
          });
        } else {
          projectRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/self-projects-student`, {
            withCredentials: true,
          });
          if (!projectRes.data.projects.length) {
            return;
          }
          setProjectDetails(projectRes.data.projects[0]);
          missionRes = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/mission/project/${projectRes.data.projects[0]._id}`,
            {
              withCredentials: true,
            }
          );
        }
        const sortedMissions = missionRes.data.missions.sort((a, b) => b.number - a.number);
        setMissions(sortedMissions || []);
        setStudents(
          projectRes.data.projects[0].students.map((student) => ({
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
  }, [projectId, readOnly]);

  useEffect(() => {
    if (editMissionDetails) {
      editMissionForm.setFieldsValue({
        name: editMissionDetails.name,
        description: editMissionDetails.description,
        labels: editMissionDetails.labels,
        assignees: editMissionDetails.assignees.map((assignee) => assignee._id),
      });
    }
  }, [editMissionDetails, editMissionForm]);

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

  const handleDeleteMission = async (missionId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/mission/${missionId}`, {
        withCredentials: true,
      });
      fetchMissions();
      message.success("המשימה נמחקה בהצלחה");
      setDeleteMissionModalVisible(false);
      setDeleteMissionId("");
    } catch (error) {
      console.error(error);
      message.error("שגיאה במחיקת המשימה");
    }
  };

  const handleMarkMissionAsCompleted = async (missionId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/mission/${missionId}`,
        { isCompleted: true },
        {
          withCredentials: true,
        }
      );
      fetchMissions();
      message.success("המשימה הושלמה בהצלחה");
    } catch (error) {
      console.error(error);
      message.error("שגיאה בסימון המשימה כהושלמה");
    }
  };

  const handleRestoreMission = async (missionId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/mission/${missionId}`,
        { isCompleted: false },
        {
          withCredentials: true,
        }
      );
      fetchMissions();
      message.success("המשימה נפתחה מחדש בהצלחה");
    } catch (error) {
      console.error(error);
      message.error("שגיאה בפתיחת המשימה מחדש");
    }
  };

  const handleEditMission = async (values) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/mission/${editMissionDetails._id}`, values, {
        withCredentials: true,
      });
      fetchMissions();
      message.success("המשימה עודכנה בהצלחה");
      setEditMissionModalVisible(false);
      editMissionForm.resetFields();
      setEditMissionDetails(null);
    } catch (error) {
      console.error(error);
      message.error("שגיאה בעדכון המשימה");
    }
  };

  const filterMissions = (missions) => {
    return missions.filter((mission) => {
      const matchesCreator = selectedCreator ? mission.author._id === selectedCreator : true;
      const matchesLabel = selectedLabel ? mission.labels.includes(selectedLabel) : true;
      const matchesAssignee = selectedAssignee
        ? mission.assignees.some((assignee) => assignee._id === selectedAssignee)
        : true;
      return matchesCreator && matchesLabel && matchesAssignee;
    });
  };

  const openMissionsDataSource = filterMissions(missions.filter((mission) => mission.isCompleted === false));
  const closedMissionsDataSource = filterMissions(missions.filter((mission) => mission.isCompleted === true));

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
              {!readOnly && (
                <div className="journal-header-filter">
                  <Select
                    placeholder="יוצר"
                    style={{ width: 150 }}
                    onChange={(value) => setSelectedCreator(value)}
                    options={[{ label: "הכל", value: "" }, ...students]}
                  />
                  <Select
                    placeholder="תגית"
                    style={{ width: 150 }}
                    onChange={(value) => setSelectedLabel(value)}
                    options={[{ label: "הכל", value: "" }, ...missionLabels]}
                  />
                  <Select
                    placeholder="משוייך ל..."
                    style={{ width: 150 }}
                    onChange={(value) => setSelectedAssignee(value)}
                    options={[{ label: "הכל", value: "" }, ...students]}
                  />
                </div>
              )}
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
                          {!readOnly && (
                            <div className="journal-item-actions-buttons">
                              <Tooltip title="סמן כהושלם">
                                <CheckCircleTwoTone
                                  twoToneColor="#52c41a"
                                  onClick={() => handleMarkMissionAsCompleted(item._id)}
                                />
                              </Tooltip>
                              <Divider type="vertical" />
                              <Tooltip title="עריכה">
                                <EditOutlined
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditMissionModalVisible(true);
                                    setEditMissionDetails(item);
                                  }}
                                />
                              </Tooltip>
                              <Divider type="vertical" />
                              <Tooltip title="מחיקה">
                                <DeleteTwoTone
                                  twoToneColor="#ff4d4f"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteMissionModalVisible(true);
                                    setDeleteMissionId(item._id);
                                  }}
                                />
                              </Tooltip>
                            </div>
                          )}
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
              {!readOnly && (
                <div className="journal-header-filter">
                  <Select
                    placeholder="יוצר"
                    style={{ width: 150 }}
                    onChange={(value) => setSelectedCreator(value)}
                    options={[{ label: "הכל", value: "" }, ...students]}
                  />
                  <Select
                    placeholder="תגית"
                    style={{ width: 150 }}
                    onChange={(value) => setSelectedLabel(value)}
                    options={[{ label: "הכל", value: "" }, ...missionLabels]}
                  />
                  <Select
                    placeholder="משוייך ל..."
                    style={{ width: 150 }}
                    onChange={(value) => setSelectedAssignee(value)}
                    options={[{ label: "הכל", value: "" }, ...students]}
                  />
                </div>
              )}
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
                          {!readOnly && (
                            <div className="journal-item-actions-buttons">
                              <Tooltip title="פתח מחדש">
                                <RollbackOutlined onClick={() => handleRestoreMission(item._id)} />
                              </Tooltip>
                              <Divider type="vertical" />
                              <Tooltip title="מחיקה">
                                <DeleteTwoTone
                                  twoToneColor="#ff4d4f"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteMissionModalVisible(true);
                                    setDeleteMissionId(item._id);
                                  }}
                                />
                              </Tooltip>
                            </div>
                          )}
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
      key: !readOnly && "3",
      label: !readOnly && "פתיחת משימה חדשה",
      children: !readOnly && (
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
            <Input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
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
      {projectDetails ? <Tabs defaultActiveKey="1" items={items} /> : <h2>אחרי הרשמה לפרויקט תוכלו לפתוח יומן</h2>}
      <Modal
        title="האם אתה בטוח שברצונך למחוק את המשימה?"
        open={deleteMissionModalVisible}
        onOk={() => handleDeleteMission(deleteMissionId)}
        onCancel={() => {
          setDeleteMissionModalVisible(false);
          setDeleteMissionId("");
        }}
        okText="כן"
        cancelText="לא"
        okButtonProps={{ danger: true }}></Modal>

      <Modal
        title="עריכת משימה"
        open={editMissionModalVisible}
        onOk={() => {
          editMissionForm
            .validateFields()
            .then((values) => handleEditMission(values))
            .catch(() => {
              console.log("Validation Failed");
            });
        }}
        onCancel={() => {
          setEditMissionModalVisible(false);
          editMissionForm.resetFields();
          setEditMissionDetails(null);
        }}
        okText="שמירה"
        cancelText="ביטול">
        <Form form={editMissionForm} layout="vertical" className="edit-mission-form">
          <Form.Item label="שם המשימה" name="name" rules={[{ required: true, message: "שדה חובה" }]}>
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
        </Form>
      </Modal>
    </div>
  );
};

export default Journal;
