import React, { useState, useEffect } from "react";
import { Steps, Table, Upload, message, Button } from "antd";
import * as XLSX from "xlsx";
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons";
import "./CreateUserFile.scss";

const { Dragger } = Upload;

const steps = [
    {
        title: "העלאת קובץ ראשון",
        description: "העלאת קובץ אקסל עם שמות ות׳ז",
        content: "user-id-content",
    },
    {
        title: "העלאת קובץ שני",
        description: "העלאת קובץ אקסל עם שמות ואימייל",
        content: "user-email-content",
    },
    {
        title: "הורדת קובץ מוכן",
        description: "הורדת קובץ אקסל עם שמות, ת׳ז ואימייל",
        content: "user-download-content",
    },
];

const columns = [
    {
        title: "שם פרטי",
        dataIndex: "first_name",
        key: "first_name",
    },
    {
        title: "שם משפחה",
        dataIndex: "last_name",
        key: "last_name",
    },
    {
        title: "תעודת זהות",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "אימייל",
        dataIndex: "email",
        key: "email",
    },
];

const CreateUserFile = () => {
    const [step, setStep] = useState(0);
    const [users, setUsers] = useState([]);
    const [duplicatedUsers, setDuplicatedUsers] = useState([]);

    const handleUploadEMAILFile = (file) => {
        const fileType = file.name.split(".").pop().toLowerCase();
        if (!["csv", "xlsx", "xls"].includes(fileType)) {
            message.error("פורמט קובץ לא נתמך. יש להעלות קובץ CSV או Excel.");
            return false;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0]; // Get first sheet
                const sheet = workbook.Sheets[sheetName];
                let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                if (jsonData.length === 0) {
                    console.error("הקובץ לא יכול להיות ריק");
                    return;
                }

                const headerMappings = [
                    {
                        eng: ["first name", "firstname"],
                        heb: ["שם פרטי"],
                        key: "firstName",
                    },
                    {
                        eng: ["last name", "lastname"],
                        heb: ["שם משפחה"],
                        key: "lastName",
                    },
                    {
                        eng: ["email", "e-mail"],
                        heb: ["אימייל", "דואר אלקטרוני", 'דוא"ל'],
                        key: "email",
                    },
                ];

                // Dynamically find the header row
                let headerRowIndex = jsonData.findIndex((row) => {
                    if (!Array.isArray(row)) return false;
                    const normalized = row.map((cell) => (typeof cell === "string" ? cell.toLowerCase().trim() : ""));
                    return headerMappings.every((mapping) =>
                        [...mapping.eng, ...mapping.heb].some((header) => normalized.includes(header)),
                    );
                });

                if (headerRowIndex === -1) {
                    message.error("הקובץ חייב לכלול את העמודות: שם פרטי, שם משפחה, ואימייל");
                    return;
                }

                const firstRow = jsonData[headerRowIndex].map((col) =>
                    typeof col === "string" ? col.toLowerCase().trim() : "",
                );

                // Find column indices by checking all possible header options
                const columnIndex = {};
                headerMappings.forEach((mapping) => {
                    let index = -1;

                    // Check English headers
                    mapping.eng.forEach((header) => {
                        if (firstRow.includes(header.toLowerCase())) {
                            index = firstRow.indexOf(header.toLowerCase());
                        }
                    });

                    // Check Hebrew headers (only if English wasn't found)
                    if (index === -1) {
                        mapping.heb.forEach((header) => {
                            if (firstRow.includes(header.toLowerCase())) {
                                index = firstRow.indexOf(header.toLowerCase());
                            }
                        });
                    }

                    columnIndex[mapping.key] = index;
                });

                if (Object.values(columnIndex).some((index) => index === -1)) {
                    console.error("Missing required columns");
                    message.error("הקובץ חייב לכלול את העמודות: שם פרטי, שם משפחה, ואימייל");
                    return;
                }

                let formattedData = [];

                jsonData.slice(headerRowIndex + 1).forEach((row) => {
                    if (row.some((cell) => cell !== null && cell !== undefined && cell !== "")) {
                        formattedData.push({
                            first_name: row[columnIndex.firstName] || "",
                            last_name: row[columnIndex.lastName] || "",
                            email: row[columnIndex.email] || "",
                        });
                    }
                });

                // Remove duplicates and attach email to existing users
                const uniqueEmails = new Map();
                const ejectedEmails = [];

                formattedData.forEach((row) => {
                    if (row.first_name && row.last_name && row.email) {
                        const key = `${row.first_name.toLowerCase()}_${row.last_name.toLowerCase()}`;
                        if (!uniqueEmails.has(key)) {
                            uniqueEmails.set(key, row.email);
                        } else {
                            ejectedEmails.push(`${row.first_name} ${row.last_name}`);
                        }
                    }
                });

                // Attach emails to existing users
                const updatedUsers = users.map((user) => {
                    const key = `${user.first_name.toLowerCase()}_${user.last_name.toLowerCase()}`;
                    if (uniqueEmails.has(key)) {
                        return { ...user, email: uniqueEmails.get(key) };
                    }
                    return user; // Keep the user without email if no match
                });

                setStep(2);
                setUsers(updatedUsers);
                setDuplicatedUsers([...duplicatedUsers, ...ejectedEmails]);
            } catch (error) {
                console.error("Error processing email file:", error);
            }
        };

        reader.readAsArrayBuffer(file);
        return false; // Prevent default upload behavior
    };

    const handleUploadIDFile = (file) => {
        const fileType = file.name.split(".").pop().toLowerCase();

        if (!["csv", "xlsx", "xls"].includes(fileType)) {
            message.error("פורמט קובץ לא נתמך. יש להעלות קובץ CSV או Excel.");
            return false;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0]; // Get first sheet
                const sheet = workbook.Sheets[sheetName];
                let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Read raw rows
                if (jsonData.length === 0) {
                    console.error("הקובץ לא יכול להיות ריק");
                    return;
                }
                const headerMappings = [
                    {
                        eng: ["first name", "firstname"],
                        heb: ["שם פרטי"],
                        key: "firstName",
                    },
                    {
                        eng: ["last name", "lastname"],
                        heb: ["שם משפחה"],
                        key: "lastName",
                    },
                    {
                        eng: ["id"],
                        heb: ["ת.ז.", "תעודת זהות"],
                        key: "id",
                    },
                ];

                // Find the header row dynamically
                let headerRowIndex = jsonData.findIndex((row) => {
                    if (!Array.isArray(row)) return false;
                    const normalized = row.map((cell) => (typeof cell === "string" ? cell.toLowerCase().trim() : ""));
                    return headerMappings.every((mapping) =>
                        [...mapping.eng, ...mapping.heb].some((header) => normalized.includes(header)),
                    );
                });

                console.log("Header Row Index:", headerRowIndex);

                if (headerRowIndex === -1) {
                    message.error("הקובץ חייב לכלול את העמודות: שם פרטי, שם משפחה, תעודת זהות");
                    return;
                }

                const firstRow = jsonData[headerRowIndex].map((col) =>
                    typeof col === "string" ? col.toLowerCase().trim() : "",
                );
                console.log("First Row Headers:", firstRow);

                // Find column indices more robustly
                const columnIndex = headerMappings.reduce((acc, mapping) => {
                    const engIndex = mapping.eng.findIndex((header) => firstRow.includes(header.toLowerCase()));
                    const hebIndex = mapping.heb.findIndex((header) => firstRow.includes(header.toLowerCase()));

                    acc[mapping.key] =
                        engIndex !== -1
                            ? firstRow.indexOf(mapping.eng[engIndex])
                            : hebIndex !== -1
                            ? firstRow.indexOf(mapping.heb[hebIndex])
                            : -1;

                    return acc;
                }, {});

                console.log("Column Index Mapping:", columnIndex);

                let formattedData = [];

                jsonData.slice(headerRowIndex + 1).forEach((row) => {
                    // Skip empty rows
                    if (row.some((cell) => cell !== null && cell !== undefined && cell !== "")) {
                        formattedData.push({
                            first_name: row[columnIndex.firstName] || "",
                            last_name: row[columnIndex.lastName] || "",
                            id: row[columnIndex.id] || "",
                            key: row[columnIndex.id],
                        });
                    }
                });

                if (Object.values(columnIndex).some((index) => index === -1)) {
                    console.error("Missing required columns");
                    message.error("הקובץ חייב לכלול את העמודות: שם פרטי, שם משפחה, תעודת זהות");
                    return;
                }

                // Filter out rows with empty first name, last name, or id
                const uniqueData = new Map();
                const ejectedNames = [];
                formattedData.forEach((row, index) => {
                    if (index !== 0 && row.first_name !== "" && row.last_name !== "" && row.id !== "") {
                        const key = `${row.first_name.toLowerCase()}_${row.last_name.toLowerCase()}`;
                        if (!uniqueData.has(key)) {
                            uniqueData.set(key, row);
                        } else {
                            ejectedNames.push(`${row.first_name} ${row.last_name}`);
                        }
                    }
                });
                formattedData = Array.from(uniqueData.values());
                setStep(1);
                setUsers(formattedData);
                setDuplicatedUsers(ejectedNames);
            } catch (error) {}
        };

        reader.readAsArrayBuffer(file);
        return false; // Prevent default upload behavior
    };

    const propsID = {
        name: "file",
        maxCount: 1,
        accept: ".csv, .xlsx, .xls",
        beforeUpload: handleUploadIDFile,
        customRequest: ({ onSuccess }) => {
            onSuccess("ok");
        },
        showUploadList: false,
    };
    const propsEMAIL = {
        name: "file",
        maxCount: 1,
        accept: ".csv, .xlsx, .xls",
        beforeUpload: handleUploadEMAILFile,
        customRequest: ({ onSuccess }) => {
            onSuccess("ok");
        },
        showUploadList: false,
    };

    return (
        <>
            <Steps size="small" current={step} items={steps} />
            {/* Step 1:  */}
            {step === 0 && (
                <div className="file-uploader">
                    <Dragger className="uploader-users-csv" {...propsID}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="uploader-title">יצירת משתמשים מקובץ</p>
                        <p className="ant-upload-text">לחצו או גררו כדי להעלות קובץ</p>
                        <p className="ant-upload-hint">
                            יש להעלות קובץ אקסל יחיד עם העמודות: שם פרטי, שם משפחה, תעודת זהות
                        </p>
                    </Dragger>
                </div>
            )}
            {/* Step 2:  */}
            {step === 1 && (
                <div className="file-uploader">
                    <Dragger className="uploader-users-csv" {...propsEMAIL}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="uploader-title">יצירת משתמשים מקובץ</p>
                        <p className="ant-upload-text">לחצו או גררו כדי להעלות קובץ</p>
                        <p className="ant-upload-hint">
                            יש להעלות קובץ אקסל יחיד עם העמודות: שם פרטי, שם משפחה, תעודת זהות
                        </p>
                    </Dragger>
                </div>
            )}
            {/* Step 3:  */}
            {step === 2 && (
                <>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                            const wb = XLSX.utils.book_new();
                            const ws = XLSX.utils.json_to_sheet(users);
                            XLSX.utils.book_append_sheet(wb, ws, "Users");
                            XLSX.writeFile(wb, "users.xlsx");
                        }}>
                        הורדת קובץ מוכן
                    </Button>
                </>
            )}
            {users.length > 0 && (
                <div className="users-list">
                    <Table columns={columns} dataSource={users} />
                </div>
            )}
        </>
    );
};

export default CreateUserFile;
