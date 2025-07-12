import React, { useEffect, useState, useContext, useRef } from "react";
import "./ApproveProjects.scss";
import axios from "axios";
import { Table, message, Button, Tabs, Select, Modal, Input, Tooltip, Tag } from "antd";
import { getColumnSearchProps as getColumnSearchPropsUtil } from "../../utils/tableUtils";
import { NotificationsContext } from "../../utils/NotificationsContext";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import { processContent } from "../../utils/htmlProcessor";

const ApproveProjects = () => {
  const { fetchNotifications } = useContext(NotificationsContext);
  const [loading, setLoading] = useState(false);
  const [yearFilter, setYearFilter] = useState("all");
  const [years, setYears] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [closedRequests, setClosedRequests] = useState([]);
  const [showDescription, setShowDescription] = useState({});
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [projectToDeny, setProjectToDeny] = useState(null);
  const [denyModalVisible, setDenyModalVisible] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    fetchYears();
    fetchRequests();
    fetchNotifications();
  }, []);

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

  const getColumnSearchProps = (dataIndex) =>
    getColumnSearchPropsUtil(dataIndex, searchInput, handleSearch, handleReset, searchText);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const fetchYears = async () => {
    try {
      setLoading(true);
      const [projectsResponse, configResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/years`, {
          withCredentials: true,
        }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/config/get-config`, {
          withCredentials: true,
        }),
      ]);
      const sortedYears = projectsResponse.data.sort((a, b) => b.localeCompare(a));
      setYears(sortedYears);

      const currentHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date())).split(" ").pop().replace(/^ה/, "");
      const currentHebrewYearIndex = sortedYears.indexOf(currentHebrewYear);
      if (sortedYears.includes(configResponse.data.currentYear)) {
        setYearFilter(configResponse.data.currentYear);
      } else {
        setYearFilter(currentHebrewYearIndex !== -1 ? sortedYears[currentHebrewYearIndex] : sortedYears[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error occurred:", error);
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/get-project-suggestions`, {
        withCredentials: true,
      });
      const sortedRequests = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOpenRequests(sortedRequests.filter((request) => request.studentSuggestions.stage === 1));
      setClosedRequests(sortedRequests.filter((request) => request.studentSuggestions.stage === 2));
      setLoading(false);
    } catch (error) {
      console.error("Error occurred:", error);
      setLoading(false);
    }
  };

  const approveProject = async (project) => {
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/approve-project-suggestion/${project._id}`,
        {},
        {
          withCredentials: true,
        }
      );
      message.success("הפרויקט אושר בהצלחה");
      fetchRequests();
      fetchNotifications();
      setLoading(false);
    } catch (error) {
      if (error.response.status === 409) {
        message.error(error.response.data.message);
      } else {
        console.error("Error occurred:", error);
        message.error("אירעה שגיאה בעת אישור הפרויקט");
      }
      setLoading(false);
    }
  };

  const denyProject = async (project) => {
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/project/reject-project-suggestion/${project._id}`,
        { reason: denyReason },
        {
          withCredentials: true,
        }
      );
      message.success("הפרויקט נדחה בהצלחה");
      fetchRequests();
      fetchNotifications();
      setLoading(false);
      setDenyModalVisible(false);
      setDenyReason("");
    } catch (error) {
      console.error("Error occurred:", error);
      message.error("אירעה שגיאה בעת דחיית הפרויקט");
      setLoading(false);
    }
  };

  const filteredOpenRequests = openRequests.filter((request) => {
    if (yearFilter === "all") return true;
    return request.year === yearFilter;
  });

  const filteredClosedRequests = closedRequests.filter((request) => {
    if (yearFilter === "all") return true;
    return request.year === yearFilter;
  });

  const openColumns = [
    {
      title: "שם הפרויקט",
      dataIndex: "title",
      key: "title",
      fixed: windowSize.width > 1024 ? "left" : false,
      ...getColumnSearchProps("title"),
      render: (title) => (title.length > 60 ? <Tooltip title={title}>{title.slice(0, 60)}...</Tooltip> : title),
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortDirections: ["descend", "ascend"],
      width: 400,
    },
    {
      title: "שם המציע",
      dataIndex: "suggestedBy",
      key: "suggestedBy",
      render: (_, record) => record.studentSuggestions.suggestedBy.name,
      sorter: (a, b) => a.studentSuggestions.suggestedBy.name.localeCompare(b.studentSuggestions.suggestedBy.name),
      sortDirections: ["descend", "ascend"],
      width: 300,
    },
    {
      title: "תאריך הצעה",
      dataIndex: "suggestedDate",
      key: "suggestedDate",
      render: (_, record) => new Date(record.studentSuggestions.suggestedDate).toLocaleDateString("he-IL"),
      sorter: (a, b) => new Date(a.studentSuggestions.suggestedDate) - new Date(b.studentSuggestions.suggestedDate),
      sortDirections: ["descend", "ascend"],
      defaultSortOrder: "ascend",
      width: 200,
    },
    {
      title: "תיאור הפרויקט",
      dataIndex: "description",
      key: "description",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setShowDescription(record);
            setDescriptionModalVisible(true);
          }}>
          הצג
        </Button>
      ),
      width: 150,
    },
    {
      title: "פעולות",
      key: "action",
      render: (text, record) => (
        <span className="approve-project-actions">
          <Button color="cyan" variant="filled" onClick={() => approveProject(record)}>
            אשר פרויקט
          </Button>
          <Button
            color="danger"
            variant="filled"
            onClick={() => {
              setProjectToDeny(record);
              setDenyModalVisible(true);
            }}>
            דחה פרויקט
          </Button>
        </span>
      ),
      width: 300,
    },
  ];

  const closedColumns = [
    {
      title: "שם הפרויקט",
      dataIndex: "title",
      key: "title",
      fixed: windowSize.width > 1024 ? "left" : false,
      ...getColumnSearchProps("title"),
      render: (title) => (title.length > 60 ? <Tooltip title={title}>{title.slice(0, 60)}...</Tooltip> : title),
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortDirections: ["descend", "ascend"],
      width: 400,
    },
    {
      title: "שם המציע",
      dataIndex: "suggestedBy",
      key: "suggestedBy",
      render: (_, record) => record.studentSuggestions.suggestedBy.name,
      sorter: (a, b) => a.studentSuggestions.suggestedBy.name.localeCompare(b.studentSuggestions.suggestedBy.name),
      sortDirections: ["descend", "ascend"],
      width: 300,
    },
    {
      title: "תאריך הצעה",
      dataIndex: "suggestedDate",
      key: "suggestedDate",
      render: (_, record) => new Date(record.studentSuggestions.suggestedDate).toLocaleDateString("he-IL"),
      sorter: (a, b) => new Date(a.studentSuggestions.suggestedDate) - new Date(b.studentSuggestions.suggestedDate),
      sortDirections: ["descend", "ascend"],
      defaultSortOrder: "ascend",
      width: 200,
    },
    {
      title: "תיאור הפרויקט",
      dataIndex: "description",
      key: "description",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setShowDescription(record);
            setDescriptionModalVisible(true);
          }}>
          הצג
        </Button>
      ),
      width: 150,
    },
    {
      title: "סטטוס",
      dataIndex: "status",
      key: "status",
      render: (_, record) =>
        record.studentSuggestions.acceptProject ? <Tag color="green">אושר</Tag> : <Tag color="red">נדחה</Tag>,
      sorter: (a, b) => a.studentSuggestions.acceptProject - b.studentSuggestions.acceptProject,
      sortDirections: ["descend", "ascend"],
      width: 100,
    },
    {
      title: "תאריך החלטה",
      dataIndex: "decisionDate",
      key: "decisionDate",
      render: (_, record) => {
        if (record.studentSuggestions.acceptProject) {
          return new Date(record.studentSuggestions.acceptDate).toLocaleDateString("he-IL");
        }
        return new Date(record.studentSuggestions.denyDate).toLocaleDateString("he-IL");
      },
      sorter: (a, b) => {
        if (a.studentSuggestions.acceptProject) {
          return new Date(a.studentSuggestions.acceptDate) - new Date(b.studentSuggestions.acceptDate);
        }
        return new Date(a.studentSuggestions.denyDate) - new Date(b.studentSuggestions.denyDate);
      },
      sortDirections: ["descend", "ascend"],
      width: 200,
    },
  ];

  const items = [
    {
      key: "1",
      label: "בקשות פתוחות",
      children: (
        <Table
          columns={openColumns}
          dataSource={filteredOpenRequests.map((request, index) => ({ ...request, key: index }))}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{ x: "max-content" }}
          sticky={{
            offsetHeader: -27,
            offsetScroll: -27,
            getContainer: () => window,
          }}
        />
      ),
    },
    {
      key: "2",
      label: "בקשות סגורות",
      children: (
        <Table
          columns={closedColumns}
          dataSource={filteredClosedRequests.map((request, index) => ({ ...request, key: index }))}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{ x: "max-content" }}
          sticky={{
            offsetHeader: -27,
            offsetScroll: -27,
            getContainer: () => window,
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="approve-extra-file-filters">
        <Select value={yearFilter} onChange={setYearFilter} style={{ width: "200px" }}>
          <Select.Option value="all">כל השנים</Select.Option>
          {years.map((year) => (
            <Select.Option key={year} value={year}>
              {year}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Tabs defaultActiveKey="1" items={items} />
      <Modal
        open={descriptionModalVisible}
        okButtonProps={{ style: { display: "none" } }}
        onCancel={() => setDescriptionModalVisible(false)}
        cancelText="סגור">
        <div className="project-suggestion-modal">
          <h3>{showDescription.title}</h3>
          <div className="rich-text-content">
            <p>
              <strong>תיאור הפרויקט:</strong>
            </p>
            <div dangerouslySetInnerHTML={{ __html: processContent(showDescription.description) }} />
          </div>
          <p>
            <strong>מתאים ל:</strong> {showDescription.suitableFor}
            <br />
            <strong>סוג הפרויקט:</strong> {showDescription.type}
            <br />
            <strong>סטודנטים:</strong>{" "}
            {showDescription?.candidates?.map((candidate) => candidate.student.name).join(", ")}
          </p>
          {showDescription?.externalEmail && (
            <p>
              <strong>אימייל גורם חיצוני:</strong> {showDescription.externalEmail}
            </p>
          )}
        </div>
      </Modal>
      <Modal
        open={denyModalVisible}
        onOk={() => denyProject(projectToDeny)}
        onCancel={() => setDenyModalVisible(false)}
        okText="דחה פרויקט"
        okButtonProps={{ danger: true }}
        cancelText="סגור">
        <div className="deny-modal">
          <p>האם אתה בטוח שברצונך לדחות את הפרויקט?</p>
          <Input.TextArea
            placeholder="סיבת הדחייה (אופציונלי)"
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ApproveProjects;
