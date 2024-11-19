import React, { useState, useEffect } from "react";
import "./SystemControl.scss";
import { Button, Switch, Form, Input, InputNumber, Table, Typography, message, Tooltip } from "antd";
import { CloseCircleOutlined, EditOutlined, SaveOutlined, StopOutlined } from "@ant-design/icons";

const SystemControl = () => {
  const [createProject, setCreateProject] = useState(true);
  const [registerToProjects, setRegisterToProjects] = useState(true);
  const [manageStudents, setManageStudents] = useState(true);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = (record) => record.key === editingKey;

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
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
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
  ];

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
    <div className="system">
      <h1 className="system-title">לוח בקרת מערכת</h1>
      <div className="control-options">
        <div className="box switches">
          <h3 className="box-title">סוויטצ'ים להדלקה \ כיבוי מהירים</h3>
          <div className="switch">
            <label className="switch-label">הזנת פרוייקטים חדשים</label>
            <Switch checked={createProject} />
          </div>
          <Tooltip title="רישום של הסטודנטים עצמם לפרוייקט">
            <div className="switch">
              <label className="switch-label">רישום לפרוייקטים</label>
              <Switch checked={registerToProjects} />
            </div>
          </Tooltip>
          <Tooltip title="אישור, דחיה והסרה של סטודנטים מפרויקט">
            <div className="switch">
              <label className="switch-label">ניהול סטודנטים בפרוייקט</label>
              <Switch checked={manageStudents} />
            </div>
          </Tooltip>
          <div className="switch">
            <label className="switch-label">pending action</label>
            <Switch />
          </div>
        </div>
        <div className="box finish-projects">
          <h3 className="box-title">סיים פרוייקטים</h3>
          <Tooltip title="סיים את כל הפרוייקטים">
            <Button shape="circle" type="primary" icon={<CloseCircleOutlined />}></Button>
          </Tooltip>
        </div>
      </div>
      <Form form={form} component={false} loading={loading}>
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

export default SystemControl;
