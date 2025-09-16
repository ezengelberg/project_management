import React, { useState, useEffect, useContext } from "react";
import "./CreateUser.scss";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { Popconfirm } from "antd";
import { Button, Form, Input, Select, message, Upload, Table, Checkbox, Tooltip, Divider } from "antd";
import { NotificationsContext } from "../../utils/NotificationsContext";
import { getHebrewYearBundle } from "../../utils/dates/hebrewYears";

// Helper function to get Hebrew years correctly
function getHebrewYearBundle(date = new Date()) {
  const { year: currentYear } = toJewishDate(date);

  // Remove leading ה/ה׳ and keep Hebrew letters & punctuation like ׳/״
  const cleanHebrewYearToken = (token) =>
    token
      .replace(/^ה[׳']?/, '')          // strip ה or ה׳
      .replace(/[^\u05D0-\u05EA"׳״']/g, '') // keep Hebrew letters + common geresh/gershayim
      .trim();

  // Format a Hebrew year label by formatting 1 Tishrei of that year and taking the last token.
  const formatYearHeb = (y) => {
    // NOTE: Many libs use Tishrei=7 (Nisan=1). If your lib uses Tishrei=1, change month: 7 -> 1.
    const tishrei = { day: 1, month: 7, year: y };
    const full = formatJewishDateInHebrew(tishrei);
    const yearToken = full.trim().split(/\s+/).pop();
    return cleanHebrewYearToken(yearToken);
  };

  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;

  return {
    // numeric years
    current: currentYear,
    previous: previousYear,
    next: nextYear,

    // Hebrew labels like "תשפ״ח"
    currentLabel: formatYearHeb(currentYear),
    previousLabel: formatYearHeb(previousYear),
    nextLabel: formatYearHeb(nextYear),
  };
}

const CreateUser = () => {
  const { Dragger } = Upload;
  const { fetchNotifications } = useContext(NotificationsContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [configYear, setConfigYear] = useState(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Get Hebrew year data using the new helper function
  const today = new Date();
  const { currentLabel: currentHebrewYear, previousLabel: previousHebrewYear, nextLabel: nextHebrewYear } = getHebrewYearBundle(today);

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

  useEffect(() => {
    const fetchConfigYear = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/config/get-config`, {
          withCredentials: true,
        });
        setConfigYear(response.data.currentYear);
      } catch (error) {
        console.error("Error fetching config year:", error);
      }
    };

    fetchConfigYear();
    fetchNotifications();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const registerValues = {
        name: values.name,
        email: values.email,
        id: values.userId,
        password: values.userId,
        isStudent: values.role.includes("student"),
        isAdvisor: values.role.includes("advisor"),
        isJudge: values.role.includes("judge"),
        isCoordinator: values.role.includes("coordinator"),
        participationYear: values.participationYear ? values.participationYear : null,
      };

      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/register`, registerValues, {
        withCredentials: true,
      });
      // await axios.post(
      //     `${process.env.REACT_APP_BACKEND_URL}/api/email/create-user`,
      //     { email: values.email },
      //     { withCredentials: true },
      // );
      message.success("משתמש נוצר בהצלחה");
      form.resetFields();
    } catch (error) {
      if (error.response.data === "Email already in use") {
        message.error("כתובת המייל כבר קיימת במערכת");
      } else if (error.response.data === "ID already in use") {
        message.error("תעודת הזהות כבר קיימת במערכת");
      } else {
        message.error("שגיאה ביצירת משתמש");
      }
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCSV = async (users) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/register-multiple`, users, {
        withCredentials: true,
      });
      message.success("משתמשים נוצרו בהצלחה");
      if (response.data.existingUsers.length > 0) {
        message.warning(
          `המשתמשים הבאים כבר קיימים במערכת: ${response.data.existingUsers.map((user) => user.email).join(", ")}`
        );
      }
      const usersData = users.filter((user) =>
        response.data.existingUsers.some((existingUser) => existingUser.email === user.email)
      );
      setUsers(usersData);
    } catch (error) {
      if (error.response.data === "Email already in use") {
        message.error("כתובת המייל כבר קיימת במערכת");
      } else if (error.response.data === "ID already in use") {
        message.error("תעודת הזהות כבר קיימת במערכת");
      } else {
        message.error("שגיאה ביצירת משתמשים");
      }
      console.error("Error creating users:", error);
    }
  };

  const handleUploadFile = async (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0]; // Get first sheet
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON, treating CSV and XLSX the same way
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      processParsedData(jsonData);
    };

    reader.readAsArrayBuffer(file); // Read the file as binary

    return false;
  };

  const processParsedData = (data) => {
    try {
      const defaultParticipationYear = configYear || currentHebrewYear;
      const parsedData = data
        .map((row, index) => ({
          key: index,
          email: row['דוא"ל'] || row["דואר אלקטרוני"] || row["אימייל"] || row["email"],
          firstName: row["שם פרטי"] || row["first_name"],
          lastName: row["שם משפחה"] || row["last_name"],
          name:
            row["שם פרטי"] && row["שם משפחה"]
              ? `${row["שם פרטי"]} ${row["שם משפחה"]}`
              : `${row["first_name"]} ${row["last_name"]}`,
          id: row["ת.ז."] || row["תעודת זהות"] || row['ת"ז'] || row["id"],
          role: ["isStudent"],
          participationYear: defaultParticipationYear,
        }))
        .filter((row) => row.email && row.firstName && row.lastName);

      if (parsedData.length === 0) {
        message.error(`העלאה נכשלה: הקובץ צריך להכיל עמודות - דוא"ל, שם פרטי, שם משפחה ותעודת זהות`);
        return;
      } else {
        setUsers(parsedData);
        message.success("הקובץ הועלה בהצלחה");
      }
    } catch (error) {
      console.error("Error processing parsed data:", error);
      message.error("שגיאה בעיבוד נתוני הקובץ");
    }
  };

  const handleRemoveUser = (record) => {
    const filteredUsers = users.filter((user) => user.id !== record.id);
    setUsers(filteredUsers);
  };

  const props = {
    name: "file",
    maxCount: 1,
    accept: ".csv, .xlsx, .xls",
    beforeUpload: handleUploadFile,
    customRequest: ({ onSuccess }) => {
      onSuccess("ok");
    },
    showUploadList: false,
  };

  const roleOptions = [
    { label: "סטודנט", value: "isStudent" },
    { label: "מנחה", value: "isAdvisor" },
    { label: "שופט", value: "isJudge" },
    { label: "מנהל", value: "isCoordinator" },
  ];

  const participationYearOptions = [
    { label: previousHebrewYear, value: previousHebrewYear },
    { label: currentHebrewYear, value: currentHebrewYear },
    { label: nextHebrewYear, value: nextHebrewYear },
    { label: "ללא", value: "" },
  ];

  const columns = [
    {
      title: "שם מלא",
      dataIndex: "name",
      key: "name",
      fixed: windowSize.width > 626 && "left",
      render: (text) => <div>{text.length > 45 ? text.substring(0, 45) + "..." : text}</div>,
    },
    {
      title: "ת.ז.",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "אימייל",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "תפקיד",
      dataIndex: "role",
      key: "role",
      render: (text, record) => (
        <div>
          <Checkbox.Group
            options={roleOptions}
            defaultValue={record.role || ["isStudent"]}
            onChange={(checkedValues) => {
              const updatedUsers = users.map((user) => {
                if (user.email === record.email && user.id === record.id) {
                  return { ...user, role: checkedValues };
                }
                return user;
              });
              setUsers(updatedUsers);
            }}
          />
        </div>
      ),
    },
    {
      title: "שנת השתתפות",
      dataIndex: "participationYear",
      key: "participationYear",
      render: (text, record) => (
        <Select
          style={{ width: 100 }}
          value={
            record.participationYear !== undefined
              ? record.participationYear
              : participationYearOptions.find((option) => option.value === configYear)
              ? configYear
              : currentHebrewYear
          }
          options={participationYearOptions}
          onChange={(value) => {
            const updatedUsers = users.map((user) => {
              if (user.email === record.email && user.id === record.id) {
                return { ...user, participationYear: value };
              }
              return user;
            });
            setUsers(updatedUsers);
          }}
        />
      ),
    },
    {
      title: "פעולות",
      key: "action",
      render: (record) => (
        <span className="user-actions">
          <Tooltip title="הסר משתמש מרשימה">
            <Popconfirm
              title="הסרת משתמש מרשימה"
              description={`האם ברצונך להסיר את ${record.name}?`}
              okText="הסר"
              cancelText="בטל"
              onConfirm={() => handleRemoveUser(record)}>
              <DeleteOutlined />
            </Popconfirm>
          </Tooltip>
        </span>
      ),
      width: 100,
    },
  ];
  return (
    <div className="create-user">
      <h1>יצירת משתמש חדש</h1>
      <Form className="create-user-form" form={form} name="createUser" layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="שם מלא"
          name="name"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין שם מלא",
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="ת.ז."
          name="userId"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין ת.ז.",
            },
            { pattern: /^\d{9}$/, message: "תעודת זהות חייבת להכיל 9 ספרות" },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="אימייל"
          name="email"
          hasFeedback
          rules={[
            {
              required: true,
              message: "חובה להזין כתובת מייל",
            },
            {
              type: "email",
              message: "נא להזין כתובת מייל תקינה",
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="תפקיד"
          name="role"
          rules={[
            {
              required: true,
              message: "חובה לבחור תפקיד",
            },
          ]}>
          <Select mode="multiple">
            <Select.Option value="student">סטודנט</Select.Option>
            <Select.Option value="advisor">מנחה</Select.Option>
            <Select.Option value="judge">שופט</Select.Option>
            <Select.Option value="coordinator">מנהל</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="שנת השתתפות" name="participationYear">
          <Select>
            <Select.Option value={nextHebrewYear}>{nextHebrewYear}</Select.Option>
            <Select.Option value={currentHebrewYear}>{currentHebrewYear}</Select.Option>
            <Select.Option value={previousHebrewYear}>{previousHebrewYear}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item className="create-user-buttons">
          <Button color="danger" variant="outlined" onClick={() => form.resetFields()} disabled={loading}>
            אפס טופס
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            צור משתמש חדש
          </Button>
        </Form.Item>
      </Form>
      <div className="upload-users-csv">
        <Divider />
        <h2 style={{ textAlign: "center" }}>יצירת משתמשים מקובץ</h2>
        <Dragger className="uploader-users-csv" {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="uploader-title">יצירת משתמשים מקובץ</p>
          <p className="ant-upload-text">לחצו או גררו כדי להעלות קובץ</p>
          <p className="ant-upload-hint">יש להעלות קובץ CSV יחיד עם השורות הבאות: דוא"ל, שם פרטי, שם משפחה, ת"ז</p>
        </Dragger>
        {users.length > 0 && (
          <div className="users-csv">
            <Table
              columns={columns}
              dataSource={users}
              scroll={{ x: "max-content" }}
              sticky={{
                offsetHeader: -27,
                offsetScroll: -27,
                getContainer: () => window,
              }}
            />
            <Button type="primary" className="submit-csv" onClick={() => handleSubmitCSV(users)}>
              צור משתמשים
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUser;
