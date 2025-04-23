import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Announcements.scss";
import { Editor } from "primereact/editor";
import { Button, message, Checkbox, Input, Select, Upload, Form } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import AnnouncementMessage from "./AnnouncementMessage";

const Announcements = () => {
  const [form] = Form.useForm();

  const [privileges, setPrivileges] = useState({
    isStudent: false,
    isAdvisor: false,
    isCoordinator: false,
  });
  const [fileList, setFileList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const fetchPrivileges = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/privileges`, { withCredentials: true });
      setPrivileges(res.data);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/group/get-current-year`, { withCredentials: true });
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/announcement/get-all`, { withCredentials: true });
      setAnnouncements(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchPrivileges();
    fetchGroups();
  }, []);

  const handleEditorChange = (e) => {
    form.setFieldsValue({ description: e.htmlValue || "" });
  };

  const submitAnnouncement = async (values) => {
    let fileResponse;

    if (fileList.length > 0) {
      const formData = new FormData();
      fileList.forEach((file) => {
        const encodedFileName = encodeURIComponent(file.originFileObj.name);
        formData.append("files", file.originFileObj, encodedFileName);
      });
      formData.append("destination", "announcements");

      fileResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/uploads?destination=announcements`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            "X-Filename-Encoding": "url",
          },
        }
      );
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/announcement/create`,
        {
          title: values.title,
          description: values.description,
          ...(values.group && { group: values.group }),
          ...(selectedRoles.length > 0 && { roles: Object.fromEntries(selectedRoles.map((r) => [r, true])) }),
          ...(fileResponse && { files: fileResponse.data.files }),
        },
        { withCredentials: true }
      );

      setAnnouncements([response.data.announcement, ...announcements]);
      message.success("ההודעה נוצרה בהצלחה");
      form.resetFields();
      setFileList([]);
      setSelectedRoles([]);
    } catch (error) {
      console.error("Error occurred:", error);
      message.error("יצירת ההודעה נכשלה");
    }
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
          <Form
            form={form}
            layout="vertical"
            onFinish={submitAnnouncement}
            className="announcement-form"
          >
            <Form.Item
              label="כותרת"
              name="title"
              rules={[{ required: true, message: "חובה להזין כותרת" }]}
            >
              <Input placeholder="כותרת" />
            </Form.Item>

            <Form.Item label="למי נשלחת ההודעה">
              <Checkbox.Group
                options={roleOptions}
                value={selectedRoles}
                onChange={setSelectedRoles}
              />
            </Form.Item>

            <Form.Item label="קבוצה" name="group">
              <Select placeholder="בחר קבוצה (לא חובה)">
                <Select.Option value="">ללא בחירה</Select.Option>
                {groups.map((group) => (
                  <Select.Option key={group._id} value={group._id}>
                    {group.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="תוכן ההודעה"
              name="description"
              rules={[{ required: true, message: "חובה להזין תוכן" }]}
            >
              <Editor
                style={{ height: "320px" }}
                onTextChange={handleEditorChange}
              />
            </Form.Item>

            <div className="submit-area">
              <Upload
                fileList={fileList}
                multiple
                beforeUpload={() => false}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                <Button icon={<UploadOutlined />}>העלה קבצים</Button>
              </Upload>

              <Button
                type="primary"
                htmlType="submit"
              >
                פרסם הודעה
              </Button>
            </div>
          </Form>
        </div>
      )}

      {announcements.length === 0 && <h2>לא הועלו עדיין הודעות</h2>}
      <div className="announcements-board">
        {announcements.map((announcement) => (
          <AnnouncementMessage
            key={announcement._id}
            announcement={announcement}
            canEdit={privileges.isCoordinator}
            updateAnnouncement={fetchAnnouncements}
          />
        ))}
      </div>
    </div>
  );
};

export default Announcements;
