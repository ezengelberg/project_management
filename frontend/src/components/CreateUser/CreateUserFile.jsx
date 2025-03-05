import React, { useState } from "react";
import { Steps, Upload } from "antd";
import * as XLSX from "xlsx";
import { InboxOutlined } from "@ant-design/icons";
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

const CreateUserFile = () => {
  const [step, setStep] = useState(0);
  const [users, setUsers] = useState([]);
  const [duplicatedUsers, setDuplicatedUsers] = useState([]);

  const handleUploadIDFile = (file) => {
    const fileType = file.name.split(".").pop().toLowerCase();

    if (!["csv", "xlsx", "xls"].includes(fileType)) {
      console.error("פורמט קובץ לא נתמך. יש להעלות קובץ CSV או Excel.");
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

        let firstRow = jsonData[1].map((col) =>
          typeof col === "string" ? col.toLowerCase().trim() : ""
        );

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

        // Find column indices more robustly
        const columnIndex = headerMappings.reduce((acc, mapping) => {
          const engIndex = mapping.eng.findIndex((header) =>
            firstRow.includes(header.toLowerCase())
          );
          const hebIndex = mapping.heb.findIndex((header) =>
            firstRow.includes(header.toLowerCase())
          );

          acc[mapping.key] =
            engIndex !== -1
              ? firstRow.indexOf(mapping.eng[engIndex])
              : hebIndex !== -1
              ? firstRow.indexOf(mapping.heb[hebIndex])
              : -1;

          return acc;
        }, {});
        let formattedData = [];
        const startRow = firstRow.some((h) =>
          headerMappings.some((m) =>
            [...m.eng, ...m.heb].includes(h.toLowerCase())
          )
        )
          ? 1
          : 0;

        jsonData.slice(startRow).forEach((row) => {
          // Skip empty rows
          if (
            row.some(
              (cell) => cell !== null && cell !== undefined && cell !== ""
            )
          ) {
            formattedData.push({
              first_name: row[columnIndex.firstName] || "",
              last_name: row[columnIndex.lastName] || "",
              id: row[columnIndex.id] || "",
            });
          }
        });

        // Filter out rows with empty first name, last name, or id
        const uniqueData = new Map();
        const ejectedNames = [];
        formattedData.forEach((row, index) => {
          if (
            index !== 0 &&
            row.first_name !== "" &&
            row.last_name !== "" &&
            row.id !== ""
          ) {
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

  const props = {
	name: "file",
	maxCount: 1,
	accept: ".csv, .xlsx, .xls",
	beforeUpload: handleUploadIDFile,
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
          <Dragger className="uploader-users-csv" {...props}>
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
    </>
  );
};

export default CreateUserFile;
