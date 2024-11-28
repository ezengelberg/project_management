import React, { useState, useEffect, useRef } from "react";
import "./MoreInformation.scss";
import axios from "axios";
import { Form, Input, InputNumber, Table, Typography, message, Tooltip } from "antd";
import { EditOutlined, SaveOutlined, StopOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { getColumnSearchProps as getColumnSearchPropsUtil } from "../../utils/tableUtils";

const MoreInformation = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = (record) => record.key === editingKey;
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    const fetchAdvisors = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/advisors-for-users-info`, {
          withCredentials: true,
        });

        const advisors = res.data.map((advisor) => ({
          ...advisor,
          key: advisor._id,
        }));
        setData(advisors);
        setLoading(false);
      } catch (error) {
        console.error("Error occurred:", error);
        setLoading(false);
      }
    };
    fetchAdvisors();
  }, []);

  const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: "שדה חובה",
              },
            ]}>
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
    form.resetFields();
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        const updatedItem = { ...item, ...row };
        newData.splice(index, 1, updatedItem);
        setData(newData);
        setEditingKey("");
        form.resetFields();

        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/user/edit-user-coordinator/${item._id}`,
          { interests: updatedItem.interests },
          { withCredentials: true }
        );
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
        form.resetFields();
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleEmailClick = (email) => {
    navigator.clipboard.writeText(email);
    message.success("הועתק");
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) =>
    getColumnSearchPropsUtil(dataIndex, searchInput, handleSearch, handleReset, searchText);

  const columns = [
    {
      title: "שם המנחה",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      width: "22.5%",
      render: (text) => (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text}
        />
      ),
    },
    {
      title: "מייל",
      dataIndex: "email",
      key: "email",
      width: "22.5%",
      render: (text) => (
        <Tooltip title="לחץ להעתקה">
          <a onClick={() => handleEmailClick(text)}>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: "תחומי עניין",
      dataIndex: "interests",
      key: "interests",
      width: "22.5%",
      editable: true,
      render: (interests) => <p>{interests ? interests : "אין תחום עניין"}</p>,
      filters: [
        { text: "קיים תחום עניין", value: "קיים תחום עניין" },
        { text: "אין תחום עניין", value: "אין תחום עניין" },
      ],
      onFilter: (value, record) => {
        if (value === "קיים תחום עניין") {
          return record.interests;
        } else {
          return !record.interests;
        }
      },
    },
    {
      title: "האם נשארו פריקטים פנויים",
      dataIndex: "projectsAvailable",
      key: "projectsAvailable",
      width: "22.5%",
      render: (projectsAvailable) => <p>{projectsAvailable ? "כן" : "לא"}</p>,
      filters: [
        { text: "כן", value: true },
        { text: "לא", value: false },
      ],
      onFilter: (value, record) => record.projectsAvailable === value,
    },
    currentUser.isCoordinator && {
      title: "פעולות",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginInlineEnd: 8,
              }}>
              <Tooltip title="שמירה">
                <SaveOutlined className="edit-icon" />
              </Tooltip>
            </Typography.Link>
            <a onClick={cancel}>
              <Tooltip title="ביטול">
                <StopOutlined className="edit-icon" />
              </Tooltip>
            </a>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
            <Tooltip title="עריכה">
              <EditOutlined className="edit-icon" />
            </Tooltip>
          </Typography.Link>
        );
      },
      width: "10%",
    },
  ].filter(Boolean);

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className="info-container">
      <Form form={form} component={false} loading={loading}>
        <Table
          style={{ width: "100%", minHeight: "770px" }}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
    </div>
  );
};

export default MoreInformation;
