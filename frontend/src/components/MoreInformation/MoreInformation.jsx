import React, { useState, useEffect, useRef } from "react";
import "./MoreInformation.scss";
import axios from "axios";
import {
  Form,
  Input,
  InputNumber,
  Table,
  Typography,
  message,
  Tooltip,
  Tabs,
  Button,
  Popconfirm,
  DatePicker,
  Select,
} from "antd";
import { EditOutlined, SaveOutlined, StopOutlined, DeleteOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { getColumnSearchProps as getColumnSearchPropsUtil } from "../../utils/tableUtils";
import { handleEditSave } from "../../utils/editUtils";
import dayjs from "dayjs";
import { Editor } from "primereact/editor";
import { processContent } from "../../utils/htmlProcessor";

const MoreInformation = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [form] = Form.useForm();
  const [formGrades] = Form.useForm();
  const [formEditGrades] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [editingGradesKey, setEditingGradesKey] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = (record) => record.key === editingKey;
  const isGradesEditing = (record) => record.key === editingGradesKey;
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [gradesData, setGradesData] = useState([]);
  const [filterTachlit, setFilterTachlit] = useState(false);
  const [gradeWeightDescription, setGradeWeightDescription] = useState("");
  const [randomText, setRandomText] = useState("");
  const [randomTextId, setRandomTextId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [advisorsRes, gradesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/advisors-for-users-info`, {
            withCredentials: true,
          }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/grade-structure`, {
            withCredentials: true,
          }),
        ]);

        const advisors = advisorsRes.data.map((advisor) => ({
          ...advisor,
          key: advisor._id,
        }));
        setData(advisors);

        const gradeStructures = gradesRes.data.map((grade) => ({
          ...grade,
          key: grade._id,
          date: dayjs(grade.date), // Ensure date is a dayjs object
        }));
        setGradesData(gradeStructures);

        setLoading(false);
      } catch (error) {
        console.error("Error occurred:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRandomText = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/random/description-for-grade-structure`, {
          withCredentials: true,
        });
        if (res.data.length > 0) {
          setRandomText(res.data[0].descriptionForGradeStructure);
          setRandomTextId(res.data[0]._id);
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };
    fetchRandomText();
  }, []);

  const handleEditorChange = (e) => {
    setGradeWeightDescription(e.htmlValue || "");
  };

  const saveRandomText = async () => {
    try {
      if (randomTextId) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/random/edit-description-for-grade-structure/${randomTextId}`,
          {
            descriptionForGradeStructure: gradeWeightDescription,
          },
          {
            withCredentials: true,
          }
        );
      } else {
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/random/create-description-for-grade-structure`,
          {
            descriptionForGradeStructure: gradeWeightDescription,
          },
          {
            withCredentials: true,
          }
        );
        setRandomTextId(res.data._id);
      }
      setRandomText(gradeWeightDescription);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const editRandomText = () => {
    setGradeWeightDescription(randomText);
  };

  const deleteRandomText = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/random/delete-description-for-grade-structure/${randomTextId}`,
        {
          withCredentials: true,
        }
      );
      setRandomText("");
      setRandomTextId(null);
      setGradeWeightDescription("");
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : dataIndex === "date" ? <DatePicker /> : <Input />;
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

  const editGrades = (record) => {
    formEditGrades.setFieldsValue({ ...record, date: dayjs(record.date) });
    setEditingGradesKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
    form.resetFields();
  };

  const cancelGrades = () => {
    setEditingGradesKey("");
    formEditGrades.resetFields();
  };

  const save = async (key, isGrade) => {
    if (isGrade) {
      await handleEditSave(key, formEditGrades, gradesData, setGradesData, "/api/grade-structure");
      setEditingGradesKey("");
    } else {
      await handleEditSave(key, form, data, setData, "/api/user/edit-user-coordinator", {
        interests: form.getFieldValue("interests"),
      });
      setEditingKey("");
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
              onClick={() => save(record.key, false)}
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

  const handleGradesDelete = async (key) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/grade-structure/${key}`, {
        withCredentials: true,
      });
      const newData = gradesData.filter((item) => item.key !== key);
      setGradesData(newData);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleGradesAdd = async (values) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/grade-structure`, values, {
        withCredentials: true,
      });
      const newGrade = res.data;
      newGrade.key = newGrade._id;
      setGradesData([...gradesData, newGrade]);
      formGrades.resetFields();
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleFilterChange = (value) => {
    setFilterTachlit(value);
  };

  const filteredGradesData = gradesData.filter((item) => item.tachlit === filterTachlit);

  const gradesColumns = [
    {
      title: "שם",
      dataIndex: "name",
      editable: true,
      width: "26%",
    },
    {
      title: "משקל",
      dataIndex: "weight",
      editable: true,
      render: (text) => <span>{text === 0 ? "ללא ציון" : `${text}%`}</span>,
      width: "7%",
    },
    {
      title: "תיאור",
      dataIndex: "description",
      editable: true,
      width: "47%",
    },
    {
      title: "תאריך הגשה",
      dataIndex: "date",
      editable: true,
      render: (text) => <span>{dayjs(text).format("DD/MM/YYYY")}</span>,
      width: "10%",
    },
    currentUser.isCoordinator && {
      title: "פעולות",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => {
        const editable = isGradesEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key, true)}
              style={{
                marginInlineEnd: 8,
              }}>
              <Tooltip title="שמירה">
                <SaveOutlined className="grade-weight-icon" />
              </Tooltip>
            </Typography.Link>
            <a onClick={cancelGrades}>
              <Tooltip title="ביטול">
                <StopOutlined className="grade-weight-icon" />
              </Tooltip>
            </a>
          </span>
        ) : (
          <div className="grade-weight-icon-container">
            <Typography.Link disabled={editingGradesKey !== ""} onClick={() => editGrades(record)}>
              <Tooltip title="עריכה">
                <EditOutlined className="grade-weight-icon" />
              </Tooltip>
            </Typography.Link>
            <Popconfirm
              title="בטוח שברצונך למחוק?"
              okText="כן"
              okButtonProps={{ danger: true }}
              cancelText="לא"
              onConfirm={() => handleGradesDelete(record.key)}>
              <Typography.Link>
                <Tooltip title="מחיקה">
                  <DeleteOutlined className="grade-weight-icon" />
                </Tooltip>
              </Typography.Link>
            </Popconfirm>
          </div>
        );
      },
      width: "10%",
    },
  ].filter(Boolean);

  const gradesMergedColumns = gradesColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable.toString(),
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isGradesEditing(record),
      }),
    };
  });

  const tabs = [
    {
      key: "1",
      label: "רשימת מנחים",
      children: (
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
            pagination={false}
          />
        </Form>
      ),
    },
    {
      key: "2",
      label: "מרכיבי הציון",
      children: (
        <div>
          {currentUser.isCoordinator && (
            <Form
              form={formGrades}
              onFinish={handleGradesAdd}
              layout="inline"
              style={{
                marginBottom: 16,
              }}>
              <Form.Item name="name" rules={[{ required: true, message: "הכנס שם" }]}>
                <Input placeholder="שם" />
              </Form.Item>
              <Form.Item name="weight" rules={[{ required: true, message: "הכנס משקל" }]}>
                <InputNumber placeholder="משקל" />
              </Form.Item>
              <Form.Item name="description" rules={[{ required: true, message: "הכנס תיאור" }]} style={{ width: 400 }}>
                <Input placeholder="תיאור" />
              </Form.Item>
              <Form.Item name="date" rules={[{ required: true, message: "הכנס תאריך" }]}>
                <DatePicker placeholder="תאריך" />
              </Form.Item>
              <Form.Item name="tachlit" rules={[{ required: true, message: "בחר סוג" }]}>
                <Select placeholder="בחר סוג">
                  <Select.Option value={false}>כולם</Select.Option>
                  <Select.Option value={true}>תכלית</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  שורה חדשה
                </Button>
              </Form.Item>
            </Form>
          )}
          <Select
            placeholder="סנן לפי סוג"
            onChange={handleFilterChange}
            style={{ marginBottom: 16, width: 200 }}
            defaultValue={false}>
            <Select.Option value={false}>כולם</Select.Option>
            <Select.Option value={true}>תכלית</Select.Option>
          </Select>
          <Form form={formEditGrades} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              style={{ marginBottom: "25px" }}
              bordered
              dataSource={filteredGradesData}
              columns={gradesMergedColumns}
              rowClassName="editable-row"
              pagination={false}
            />
          </Form>
          {currentUser.isCoordinator && (
            <div className="grade-weight-random-description-editor">
              <Editor
                placeholder="כאן אפשר לרשום דברים נוספים על מרכיבי הציון"
                value={gradeWeightDescription}
                onTextChange={handleEditorChange}
                style={{ height: "200px", wordBreak: "break-word" }}
              />
              <Button type="primary" onClick={saveRandomText} style={{ marginTop: 16 }}>
                שמור
              </Button>
            </div>
          )}
          {randomText && (
            <div className="grade-weight-random-description">
              <p style={{ marginTop: "20px" }} dangerouslySetInnerHTML={{ __html: processContent(randomText) }} />
              {currentUser.isCoordinator && (
                <div className="grade-weight-random-description-buttons">
                  <Button
                    color="primary"
                    variant="filled"
                    onClick={editRandomText}
                    style={{ marginTop: 16, marginLeft: 8 }}>
                    ערוך
                  </Button>
                  <Button
                    color="danger"
                    variant="filled"
                    onClick={deleteRandomText}
                    style={{ marginTop: 16, marginLeft: 8 }}>
                    מחק
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: "קבצים נוספים",
      children: <div>קבצים נוספים</div>,
    },
  ];

  return (
    <div className="info-container">
      <Tabs items={tabs} defaultActiveKey={currentUser.isStudent ? "1" : "3"} />
    </div>
  );
};

export default MoreInformation;
