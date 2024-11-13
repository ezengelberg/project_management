import React, { useState, useEffect } from "react";
import "./MoreInformation.scss";
import axios from "axios";
import { Form, Input, InputNumber, Table, Typography, message, Tooltip } from "antd";
import { EditOutlined } from "@ant-design/icons";

const MoreInformation = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.key === editingKey;

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/all-users`, {
          withCredentials: true,
        });
        const users = res.data;
        const advisors = users
          .filter((user) => user.isAdvisor)
          .map((advisor) => ({
            ...advisor,
            key: advisor.id, // Use a unique identifier for the key
          }));
        setData(advisors);
      } catch (error) {
        console.error("Error occurred:", error);
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
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey("");
        form.resetFields();
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

  const columns = [
    {
      title: "שם המנחה",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text) => <p>{text}</p>,
    },
    {
      title: "מייל",
      dataIndex: "email",
      key: "email",
      width: "20%",
      render: (text) => <a onClick={() => handleEmailClick(text)}>{text}</a>,
    },
    {
      title: "תחומי עניין",
      dataIndex: "interests",
      key: "interests",
      width: "20%",
      render: (text) => <p>{text}</p>,
    },
    {
      title: "האם נשארו פריקטים פנויים",
      dataIndex: "hasProjects",
      key: "hasProjects",
      width: "20%",
      editable: true,
      render: (text) => <p>{text}</p>,
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
              שמור שינויים
            </Typography.Link>
            <a onClick={cancel}>בטל</a>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
            <Tooltip title="עריכה">
              <EditOutlined className="edit-icon" />
            </Tooltip>
          </Typography.Link>
        );
      },
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
      <Form form={form} component={false}>
        <Table
          style={{ width: "100%" }}
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
