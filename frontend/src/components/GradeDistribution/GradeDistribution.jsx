import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Select, Table, Input } from "antd";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import "./GradeDistribution.scss";

const GradeDistribution = () => {
  const [currentYear, setCurrentYear] = useState("");
  const [advisors, setAdvisors] = useState([]);
  const [submissionOptions, setSubmissionOptions] = useState([]);
  const [letters, setLetters] = useState({
    "A+": 0,
    A: 0,
    "A-": 0,
    "B+": 0,
    B: 0,
    "B-": 0,
    "C+": 0,
    C: 0,
    "C-": 0,
    "D+": 0,
    D: 0,
    "D-": 0,
    E: 0,
    F: 0,
  });

  const fetchYear = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/config/get/year`,
      {
        withCredentials: true,
      }
    );
    setCurrentYear(response.data);
  };

  const fetchAdvisors = async () => {
    if (!currentYear || currentYear === "") return;
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/user/get-active-advisors/`,
      {
        params: { year: currentYear },
        withCredentials: true,
      }
    );
    setAdvisors(response.data);
  };

  const fetchSubmissions = async () => {
    if (!currentYear || currentYear === "") return;
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/submission/get-yearly-submissions`,
      {
        params: { year: currentYear },
        withCredentials: true,
      }
    );
    setSubmissionOptions(response.data);
  };

  const pickSubmissionDistribution = async (value) => {
    if (!submissionOptions.includes(value)) return; // invalid submission option
    if (currentYear === "") return;
  };

  const pickAdvisorDistribution = async (value) => {
    if (!advisors.map((advisor) => advisor._id).includes(value)) return; // invalid advisor option
    console.log(value);
  };

  useEffect(() => {
    fetchYear();
  }, []);

  useEffect(() => {
    fetchAdvisors();
    fetchSubmissions();
  }, [currentYear]);

  const handleInputChange = (grade, newValue) => {
    if (newValue < 0 || newValue > 100) return; // Invalid input
    setLetters((prevLetters) => ({
      ...prevLetters,
      [grade]: newValue, // Update the specific grade with new value
    }));
  };

  const columns = [
    {
      title: "ציון",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "ערך",
      dataIndex: "value",
      key: "value",
      render: (text, record) => (
        <Input
          type="number"
          value={record.value}
          onChange={(e) => handleInputChange(record.grade, e.target.value)}
        />
      ),
    },
  ];

  const letterTableRender = () => {
    return (
      <Table
        dataSource={Object.entries(letters).map(([grade, value]) => ({
          grade,
          value,
        }))}
        columns={columns}
        pagination={false}
      />
    );
  };

  const items = [
    {
      key: "1",
      label: "התפלגות ציונים לפי הגשה",
      children: (
        <>
          <Select
            defaultValue="pick_submission"
            options={[
              { value: "pick_submission", label: "בחר הגשה" },
              ...submissionOptions.map((submission) => ({
                value: submission,
                label: submission,
              })),
            ]}
            onChange={(value) => pickSubmissionDistribution(value)}
          />
          {letterTableRender()}
        </>
      ),
    },
    {
      key: "2",
      label: "התפלגות ציונים לפי שופט",
      children: (
        <>
          <div className="select-options">
            <Select options={[{ value: "pick_year", label: "בחירת מחזור" }]} />
            <Select
              defaultValue="pick_judge"
              options={[
                { value: "pick_judge", label: "בחר שופט" },
                ...advisors.map((advisor) => ({
                  value: advisor._id,
                  label: advisor.name,
                })),
              ]}
              onChange={(value) => pickAdvisorDistribution(value)}
            />
          </div>

          {letterTableRender()}
        </>
      ),
    },
  ];
  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default GradeDistribution;
