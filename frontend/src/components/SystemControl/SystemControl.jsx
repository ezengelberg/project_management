import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SystemControl.scss";
import { Button, Switch, Form, Input, InputNumber, Table, Typography, message, Tooltip } from "antd";
import { CloseCircleOutlined, EditOutlined, SaveOutlined, StopOutlined } from "@ant-design/icons";

const SystemControl = () => {
  const [createProject, setCreateProject] = useState(true);
  const [registerToProjects, setRegisterToProjects] = useState(true);
  const [manageStudents, setManageStudents] = useState(true);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [letterToNumber, setLetterToNumber] = useState({
    "A+": null,
    A: null,
    "A-": null,
    "B+": null,
    B: null,
    "B-": null,
    "C+": null,
    C: null,
    "C-": null,
    "D+": null,
    D: null,
    "D-": null,
    E: null,
    F: null,
  });

  useEffect(() => {
    setLoading(true);
    const fetchGrades = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/grade/get-numeric-values`, {
          withCredentials: true,
        });
        setLetterToNumber(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching grades:", error);
        message.error("שגיאה בטעינת הציונים");
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

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

  const edit = () => {
    form.setFieldsValue({ ...letterToNumber });
    setEditingKey("letterToNumber");
  };

  const cancel = () => {
    setEditingKey("");
    form.resetFields();
  };

  const save = async () => {
    try {
      const row = await form.validateFields();
      setLetterToNumber(row);
      setEditingKey("");

      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/grade/update-numeric-values`,
        { updatedValues: row },
        { withCredentials: true }
      );
      message.success("הציון עודכן בהצלחה");
    } catch (error) {
      console.error("Error updating grade:", error);
      message.error("שגיאה בעדכון הציון");
    }
  };

  const columns = [
    ...Object.keys(letterToNumber).map((letter) => ({
      title: <p style={{ direction: "ltr", margin: "0", textAlign: "right" }}>{letter}</p>,
      dataIndex: letter,
      key: letter,
      editable: true,
      render: (text) => (text !== null ? text : ""),
      width: `${95 / Object.keys(letterToNumber).length}%`,
    })),
    {
      title: "פעולות",
      dataIndex: "actions",
      key: "actions",
      render: () => {
        const editable = isEditing({ key: "letterToNumber" });
        return editable ? (
          <span>
            <Typography.Link
              onClick={save}
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
          <Typography.Link onClick={edit}>
            <Tooltip title="עריכה">
              <EditOutlined className="edit-icon" />
            </Tooltip>
          </Typography.Link>
        );
      },
      width: "5%",
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: () => ({
        inputType: "number",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing({ key: "letterToNumber" }),
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
          dataSource={[{ key: "letterToNumber", ...letterToNumber }]}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form>
    </div>
  );
};

export default SystemControl;
