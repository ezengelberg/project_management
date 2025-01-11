import React, { useEffect, useState } from "react";
import "./Groups.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import { Button, Form, Input, Select, message, Transfer, Divider, Table, Radio, Modal } from "antd";

const Groups = () => {
  const navigate = useNavigate();
  const [targetKeys, setTargetKeys] = useState([]);
  const [createGroupForm] = Form.useForm();
  const [renameGroupForm] = Form.useForm();
  const [deleteGroupForm] = Form.useForm();
  const [projectsData, setProjectsData] = useState([]);
  const [years, setYears] = useState([]);
  const [yearFilter, setYearFilter] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [projectsWithNoGroup, setProjectsWithNoGroup] = useState([]);
  const [radioButtonValue, setRadioButtonValue] = useState("createGroup");
  const [selectedGroupToRename, setSelectedGroupToRename] = useState(null);
  const [selectedGroupToDelete, setSelectedGroupToDelete] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, usersRes, groupRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project`, { withCredentials: true }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/all-users`, { withCredentials: true }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/group/get`, { withCredentials: true }),
      ]);

      const years = Array.from(new Set(projectsRes.data.map((project) => project.year))).sort((a, b) =>
        b.localeCompare(a)
      );
      setYears(years);
      const currentHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date())).split(" ").pop().replace(/^ה/, "");
      const currentHebrewYearIndex = years.indexOf(currentHebrewYear);
      setYearFilter(currentHebrewYearIndex !== -1 ? years[currentHebrewYearIndex] : years[0]);

      const activeUsers = usersRes.data.filter((user) => !user.suspended);
      const projectsWithDetails = projectsRes.data.map((project) => {
        const advisorsDetails = project.advisors.map((advisorId) => activeUsers.find((user) => user._id === advisorId));
        const studentsDetails = project.students.map((student) =>
          activeUsers.find((user) => user._id === student.student)
        );
        return { ...project, advisorsDetails, studentsDetails };
      });

      const projectsWithNoGroup = projectsWithDetails.filter(
        (project) => !groupRes.data.some((group) => group.projects.includes(project._id))
      );

      setProjectsWithNoGroup(projectsWithNoGroup);

      setProjectsData(projectsWithDetails);
      setGroups(groupRes.data);
      setProjectsData(projectsWithDetails);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      const group = groups.find((group) => group._id === selectedGroup);
      if (group) {
        setTargetKeys(group.projects);
      }
    } else {
      setTargetKeys([]);
    }
  }, [selectedGroup, groups]);

  const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
    <Transfer {...restProps}>
      {({
        direction,
        filteredItems,
        onItemSelect,
        onItemSelectAll,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const columns = direction === "left" ? leftColumns : rightColumns;

        return (
          <Table
            rowSelection={{
              getCheckboxProps: () => ({ disabled: listDisabled }),
              selectedRowKeys: listSelectedKeys,
              onChange: (selectedRowKeys) => {
                onItemSelectAll(selectedRowKeys, "replace");
              },
            }}
            columns={columns}
            dataSource={filteredItems}
            size="small"
            style={{ pointerEvents: listDisabled ? "none" : undefined }}
            onRow={({ key, disabled: itemDisabled }) => ({
              onClick: () => {
                if (itemDisabled || listDisabled) return;
                onItemSelect(key, !listSelectedKeys.includes(key));
              },
            })}
            scroll={{ x: "max-content" }}
          />
        );
      }}
    </Transfer>
  );

  const createGroup = async (values) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/group/create`, values, { withCredentials: true });
      message.success("קבוצה נוצרה בהצלחה");
      createGroupForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("נכשל ביצירת קבוצה");
      console.error(error);
    }
  };

  const renameGroup = async (values) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/group/rename`, values, { withCredentials: true });
      message.success("שם הקבוצה שונה בהצלחה");
      setSelectedGroupToRename(null);
      setSelectedGroup(null);
      renameGroupForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("נכשל בשינוי שם הקבוצה");
      console.error(error);
    }
  };

  const deleteGroup = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/group/delete`, {
        data: { groupId: selectedGroupToDelete },
        withCredentials: true,
      });
      message.success("הקבוצה נמחקה בהצלחה");
      setConfirmDeleteModal(false);
      setSelectedGroupToDelete(null);
      setSelectedGroup(null);
      deleteGroupForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("נכשל במחיקת הקבוצה");
      console.error(error);
    }
  };

  const onChange = async (nextTargetKeys, direction, moveKeys) => {
    if (!selectedGroup) return;

    try {
      if (direction === "right") {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/group/add-projects`,
          { groupId: selectedGroup, projectIds: moveKeys },
          { withCredentials: true }
        );
        message.success("פרויקטים נוספו לקבוצה בהצלחה");
      } else {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/group/remove-projects`,
          { groupId: selectedGroup, projectIds: moveKeys },
          { withCredentials: true }
        );
        message.success("פרויקטים הוסרו מהקבוצה בהצלחה");
      }
      setTargetKeys(nextTargetKeys);
      fetchData();
    } catch (error) {
      message.error("נכשל בהזזת פרויקטים");
      console.error(error);
    }
  };

  const leftTableData = projectsWithNoGroup
    .filter((project) => project.year === yearFilter)
    .map((project) => ({
      key: project._id,
      name: project.title,
      advisor: project.advisorsDetails[0]?.name || "אין מנחה",
      students: project.studentsDetails.map((student) => student?.name).join(" | ") || "אין סטודנטים",
    }));

  const rightTableData = selectedGroup
    ? projectsData
        .filter((project) => targetKeys.includes(project._id))
        .map((project) => ({
          key: project._id,
          name: project.title,
          advisor: project.advisorsDetails[0]?.name || "אין מנחה",
          students: project.studentsDetails.map((student) => student?.name).join("| ") || "אין סטודנטים",
        }))
    : [];

  const allTableData = [...leftTableData, ...rightTableData];

  const columns = [
    {
      title: "פרויקט",
      dataIndex: "name",
      fixed: windowSize.width > 1450 && "left",
      render: (text, record) => (
        <a
          onClick={() => navigate(`/project/${record.key}`)}
          onMouseDown={(e) => handleMouseDown(e, `/project/${record.key}`)}>
          {windowSize.width > 2229
            ? text.length > 60
              ? `${text.substring(0, 60)}...`
              : text
            : windowSize.width > 1765
            ? text.length > 50
              ? `${text.substring(0, 50)}...`
              : text
            : windowSize.width > 1560
            ? text.length > 45
              ? `${text.substring(0, 45)}...`
              : text
            : text.length > 38
            ? `${text.substring(0, 38)}...`
            : text}
        </a>
      ),
      width: windowSize.width > 2229 ? "50%" : windowSize.width > 1765 ? 400 : windowSize.width > 1560 ? 350 : 300,
    },
    {
      title: "מנחה",
      dataIndex: "advisor",
      width: windowSize.width > 2229 ? "20%" : windowSize.width > 1765 ? 250 : 200,
    },
    {
      title: "סטודנטים",
      dataIndex: "students",
      width: windowSize.width > 2229 ? "30%" : 250,
    },
  ];

  const filterOption = (inputValue, item) =>
    item.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
    item.advisor?.toLowerCase().includes(inputValue.toLowerCase()) ||
    item.students?.toLowerCase().includes(inputValue.toLowerCase());

  const options = [
    {
      label: "יצירת קבוצה",
      value: "createGroup",
    },
    {
      label: "שינוי שם לקבוצה",
      value: "renameGroup",
    },
    {
      label: "מחיקת קבוצה",
      value: "deleteGroup",
    },
  ];

  return (
    <div className="groups-container">
      <Radio.Group
        className="groups-radio"
        block
        options={options}
        defaultValue="createGroup"
        optionType="button"
        buttonStyle="solid"
        onChange={(e) => setRadioButtonValue(e.target.value)}
      />
      {radioButtonValue === "createGroup" && (
        <Form className="groups-form" form={createGroupForm} layout="vertical" onFinish={createGroup}>
          <Form.Item label="שם קבוצה" name="name" rules={[{ required: true, message: "שדה חובה" }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              צור קבוצה
            </Button>
          </Form.Item>
        </Form>
      )}
      {radioButtonValue === "renameGroup" && (
        <Form className="groups-form" form={renameGroupForm} layout="vertical" onFinish={renameGroup}>
          <Form.Item label="בחר שנה" name="year" rules={[{ required: true, message: "שדה חובה" }]}>
            <Select
              placeholder="בחר שנה"
              value={yearFilter}
              onChange={(value) => {
                setYearFilter(value);
                setSelectedGroup(null);
                renameGroupForm.resetFields(["groupId", "newName"]);
              }}
              options={years.map((year) => ({ label: year, value: year }))}></Select>
          </Form.Item>
          <Form.Item label="בחר קבוצה לשינוי שם" name="groupId" rules={[{ required: true, message: "שדה חובה" }]}>
            <Select
              placeholder="בחר קבוצה"
              onChange={(value) => setSelectedGroupToRename(value)}
              options={groups
                .filter((group) => group.year === yearFilter)
                .map((group) => ({ label: group.name, value: group._id }))}></Select>
          </Form.Item>
          <Form.Item label="שם חדש" name="newName" rules={[{ required: true, message: "שדה חובה" }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              שנה שם
            </Button>
          </Form.Item>
        </Form>
      )}
      {radioButtonValue === "deleteGroup" && (
        <Form
          className="groups-form"
          form={deleteGroupForm}
          layout="vertical"
          onFinish={() => setConfirmDeleteModal(true)}>
          <Form.Item label="בחר שנה" name="year" rules={[{ required: true, message: "שדה חובה" }]}>
            <Select
              placeholder="בחר שנה"
              value={yearFilter}
              onChange={(value) => {
                setYearFilter(value);
                setSelectedGroup(null);
                deleteGroupForm.resetFields(["groupId"]);
              }}
              options={years.map((year) => ({ label: year, value: year }))}></Select>
          </Form.Item>
          <Form.Item label="בחר קבוצה למחיקה" name="groupId" rules={[{ required: true, message: "שדה חובה" }]}>
            <Select
              placeholder="בחר קבוצה"
              onChange={(value) => setSelectedGroupToDelete(value)}
              options={groups
                .filter((group) => group.year === yearFilter)
                .map((group) => ({ label: group.name, value: group._id }))}></Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" danger htmlType="submit">
              מחק קבוצה
            </Button>
          </Form.Item>
        </Form>
      )}
      <Modal
        title="אישור מחיקת קבוצה"
        open={confirmDeleteModal}
        onOk={deleteGroup}
        onCancel={() => setConfirmDeleteModal(false)}
        okButtonProps={{ danger: true }}
        okText="אשר מחיקה"
        cancelText="ביטול">
        <p>האם אתה בטוח שברצונך למחוק את הקבוצה?</p>
      </Modal>
      <Divider />
      <h3>בחר שנה וקבוצה כדי להתחיל</h3>
      <div className="groups-header">
        <Select
          style={{ width: "200px" }}
          placeholder="בחר שנה"
          value={yearFilter}
          onChange={(value) => {
            setYearFilter(value);
            setSelectedGroup(null);
          }}
          options={years.map((year) => ({ label: year, value: year }))}></Select>
        <Select
          style={{ width: "200px" }}
          placeholder="בחר קבוצה"
          value={selectedGroup}
          onChange={(value) => setSelectedGroup(value)}
          options={groups
            .filter((group) => group.year === yearFilter)
            .map((group) => ({ label: group.name, value: group._id }))}></Select>
      </div>
      <TableTransfer
        className="groups-transfer"
        loading={loading}
        dataSource={allTableData}
        targetKeys={targetKeys}
        showSearch
        onChange={onChange}
        filterOption={filterOption}
        titles={[
          "פרויקטים",
          selectedGroup ? groups.find((group) => group._id === selectedGroup)?.name : "בחר קבוצה כדי להתחיל",
        ]}
        showSelectAll={false}
        leftColumns={columns}
        rightColumns={columns}
        locale={{ itemUnit: "פריטים", itemsUnit: "פריטים", searchPlaceholder: "חפש פריטים" }}
        disabled={!selectedGroup}
      />
    </div>
  );
};

export default Groups;
