import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Select, Table, Input, Radio, message } from "antd";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import "./GradeDistribution.scss";

const GradeDistribution = () => {
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState("pick_year");
    const [selectedSubmission, setSelectedSubmission] = useState("pick_submission");
    const [selectedJudge, setSelectedJudge] = useState("pick_judge");

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
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/config/get/year`, {
            withCredentials: true,
        });
        setYears(response.data.years);
    };

    const fetchAdvisors = async () => {
        if (!selectedYear || selectedYear === "") return;
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-active-advisors/`, {
            params: { year: selectedYear },
            withCredentials: true,
        });
        setAdvisors(response.data);
        console.log(response.data);
    };

    const fetchSubmissions = async () => {
        if (!selectedYear || selectedYear === "") return;
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-yearly-submissions`, {
            params: { year: selectedYear },
            withCredentials: true,
        });
        setSubmissionOptions(response.data);
    };

    const pickSubmissionDistribution = async (value) => {
        if (!submissionOptions.includes(value)) return; // invalid submission option
        if (selectedYear === "") return;
        console.log("fetching submission distribution");
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-distribution`, {
                params: { year: selectedYear, submission: value },
                withCredentials: true,
            });
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const pickAdvisorDistribution = async (value) => {
        if (!advisors.map((advisor) => advisor._id).includes(value)) return; // invalid advisor option
        if (selectedYear === "") return;
    };

    useEffect(() => {
        fetchYear();
    }, []);

    useEffect(() => {
        fetchAdvisors();
        fetchSubmissions();
    }, [selectedYear]);

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
                    onChange={(e) => {
                        handleInputChange(record.grade, e.target.value);
                    }}
                />
            ),
        },
    ];

    const letterTableRender = () => {
        return (
            <Table
                dataSource={Object.entries(letters).map(([grade, value]) => ({
                    key: grade,
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
                    <div className="select-options">
                        <Select
                            value={selectedYear}
                            options={[
                                { value: "pick_year", label: "בחירת שנה" },
                                ...years.map((year) => ({
                                    value: year,
                                    label: year,
                                })),
                            ]}
                            onChange={(value) => setSelectedYear(value)}
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    width: "auto",
                                    minWidth: "150px",
                                }),
                            }}
                        />
                        <Select
                            value={selectedSubmission}
                            options={[
                                { value: "pick_submission", label: "בחר הגשה" },
                                ...submissionOptions.map((submission) => ({
                                    value: submission,
                                    label: submission,
                                })),
                            ]}
                            onChange={(value) => {
                                setSelectedSubmission(value);
                                pickSubmissionDistribution(value);
                            }}
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    width: "auto",
                                    minWidth: "150px",
                                }),
                            }}
                        />
                    </div>
                    <div className="tab-content">
                        <div className="graph-zone">graph</div>
                        <div className="grading-column">
                            <div className="calc-type">
                                <Radio.Group
                                    defaultValue={"average"}
                                    options={[
                                        {
                                            value: "average",
                                            label: "ממוצע",
                                        },
                                        {
                                            value: "median",
                                            label: "חציון",
                                        },
                                    ]}
                                />
                            </div>
                            {letterTableRender()}
                        </div>
                    </div>
                </>
            ),
        },
        {
            key: "2",
            label: "התפלגות ציונים לפי שופט",
            children: (
                <>
                    <div className="select-options">
                        <Select
                            value={selectedYear}
                            options={[
                                { value: "pick_year", label: "בחירת שנה" },
                                ...years.map((year) => ({
                                    value: year,
                                    label: year,
                                })),
                            ]}
                            onChange={(value) => setSelectedYear(value)}
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    width: "auto",
                                    minWidth: "150px",
                                }),
                            }}
                        />
                        <Select
                            value={selectedJudge}
                            options={[
                                { value: "pick_judge", label: "בחר שופט" },
                                ...advisors.map((advisor) => ({
                                    value: advisor._id,
                                    label: advisor.name,
                                })),
                            ]}
                            onChange={(value) => {
                                if (selectedYear === "" || !selectedYear) return message.error("נא לבחור שנה");
                                setSelectedJudge(value);
                                pickAdvisorDistribution(value);
                            }}
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    width: "auto",
                                    minWidth: "250px",
                                }),
                            }}
                        />
                    </div>
                    <div className="tab-content">
                        <div className="graph-zone">graph</div>
                        <div className="grading-column">{letterTableRender()}</div>
                    </div>
                </>
            ),
        },
    ];
    return (
        <div>
            <Tabs
                defaultActiveKey="1"
                items={items}
                onChange={() => {
                    setSelectedJudge("pick_judge");
                    setSelectedSubmission("pick_submission");
                    setSelectedYear("pick_year");
                }}
            />
        </div>
    );
};

export default GradeDistribution;
