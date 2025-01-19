import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Announcements.scss";
import { Editor } from "primereact/editor";
import { Button, message, Checkbox } from "antd";

const Announcements = () => {
  const [privileges, setPrivileges] = useState({ isStudent: false, isAdvisor: false, isCoordinator: false });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState({
    student: false,
    advisor: false,
    judge: false,
    coordinator: false,
  });
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);

  const fetchPrivileges = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/privileges`, {
        withCredentials: true,
      });
      setPrivileges(response.data);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/group/get-current-year`, {
        withCredentials: true,
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchAnnouncements = async () => {};

  useEffect(() => {
    fetchAnnouncements();
    fetchPrivileges();
    fetchGroups();
  }, []);

  const submitAnnouncement = async () => {
    console.log(title, description);
    console.log(selectedGroup === "");
    console.log("selected roles", selectedRoles);
    try {
      axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/announcement/create`,
        {
          title,
          description,
          ...(selectedGroup !== "" && { group: selectedGroup }),
          ...(selectedRoles.some((role) => selectedRoles[role] === true) && { roles: selectedRoles }),
        },
        {
          withCredentials: true,
        },
      );

      message.success("ההודעה נוצרה בהצלחה");
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setTitle("");
      setDescription("");
      fetchAnnouncements();
    }
  };

  const handleEditorChange = (e) => {
    setDescription(e.htmlValue || "");
  };

  const roleOptions = [
    { label: "סטודנט", value: "student" },
    { label: "מנחה", value: "advisor" },
    { label: "שופט", value: "judge" },
    { label: "רכז", value: "coordinator" },
  ];

  return (
    <div className="announcements-container">
      {privileges.isCoordinator && (
        <div className="create-announcement">
          <h2>כתיבת הודעה חדשה</h2>
          <div className="form-input-group">
            <label htmlFor="announcement-title">כותרת</label>
            <input
              type="text"
              id="announcement-title"
              placeholder="כותרת"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="announcement-roles">למי נשלחת ההודעה</label>
            <Checkbox.Group
              id="announcement-roles"
              options={roleOptions}
              value={Object.keys(selectedRoles).filter((role) => selectedRoles[role])}
              onChange={(checkedValues) => {
                const newRoles = {
                  student: checkedValues.includes("student"),
                  advisor: checkedValues.includes("advisor"),
                  judge: checkedValues.includes("judge"),
                  coordinator: checkedValues.includes("coordinator"),
                };
                console.log("Changing roles:", newRoles);
                setSelectedRoles(newRoles);
              }}
            />
            <label htmlFor="announcement-group">קבוצה (במידה ולא תבחר קבוצה ההודעה תשלח לכולם)</label>
            <select id="announcement-group" onChange={(e) => setSelectedGroup(e.target.value)}>
              <option value=""></option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-input-group template-input-group">
            <Editor
              placeholder="תיאור לקובץ"
              value={description}
              onTextChange={handleEditorChange}
              style={{ height: "320px", wordBreak: "break-word" }}
            />
          </div>
          <Button
            type="primary"
            onClick={submitAnnouncement}
            disabled={description === "" || title === ""}
            style={{ marginTop: 16 }}>
            פרסם הודעה
          </Button>
        </div>
      )}
      <h2>הודעות</h2>
    </div>
  );
};

export default Announcements;
