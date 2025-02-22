import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Select, Table, Row, Col, Input, Radio, message } from "antd";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
} from "recharts";
import "./GradeDistribution.scss";

const GradeDistribution = () => {
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState("pick_year");
    const [selectedSubmission, setSelectedSubmission] = useState("pick_submission");
    const [selectedJudge, setSelectedJudge] = useState("pick_judge");
    const [calculationMethod, setCalculationMethod] = useState("average");

    const [advisors, setAdvisors] = useState([]);
    const [submissionOptions, setSubmissionOptions] = useState([]);
    const [data, setData] = useState([]);
    const [adjustedData, setAdjustedData] = useState([]);
    const [average, setAverage] = useState(0);
    const [median, setMedian] = useState(0);
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
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-distribution`, {
                params: { year: selectedYear, submission: value },
                withCredentials: true,
            });
            setData(response.data);
            console.log(response.data);
            adjustData(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const pickAdvisorDistribution = async (value) => {
        if (!advisors.map((advisor) => advisor._id).includes(value)) return; // invalid advisor option
        if (selectedYear === "") return;
    };

    const adjustData = (data) => {
        if (data.length === 0) return;

        const newData = data.map((entry) => {
            let gradesArray = entry.grades.map((grade) =>
                grade.numericGrade !== null ? grade.numericGrade : parseInt(letters[grade.grade], 10),
            );

            let newValue;
            if (calculationMethod === "average") {
                newValue = gradesArray.reduce((sum, num) => sum + num, 0) / gradesArray.length;
            } else if (calculationMethod === "median") {
                gradesArray.sort((a, b) => a - b);
                const mid = Math.floor(gradesArray.length / 2);
                newValue =
                    gradesArray.length % 2 === 0 ? (gradesArray[mid - 1] + gradesArray[mid]) / 2 : gradesArray[mid];
            }

            return { ...entry, value: Math.floor(newValue) }; // Preserve original object, only updating 'value'
        });

        setAdjustedData(newData); // Update state with new, non-mutated data
    };

    useEffect(() => {
        fetchYear();
    }, []);

    useEffect(() => {
        fetchAdvisors();
        fetchSubmissions();
    }, [selectedYear]);

    useEffect(() => {
        if (adjustData.length === 0) return;
        let average = 0;
        adjustedData.forEach((entry) => {
            average += entry.value;
        });
        average /= adjustedData.length;
        setAverage(Math.floor(average));

        let median;
        const sortedGrades = adjustedData.map((entry) => entry.value).sort((a, b) => a - b);
        const mid = Math.floor(sortedGrades.length / 2);
        median = sortedGrades.length % 2 === 0 ? (sortedGrades[mid - 1] + sortedGrades[mid]) / 2 : sortedGrades[mid]; // Calculate median
        setMedian(median);
    }, [adjustData]);

    useEffect(() => {
        adjustData(data);
    }, [letters, data, calculationMethod]);

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

    const aggregateData = (data) => {
        const aggregated = {};
        data.forEach((entry) => {
            const grade = entry.value; // Use computed value as the key
            if (!aggregated[grade]) {
                aggregated[grade] = { grade, count: 0 };
            }
            aggregated[grade].count += 1; // Count occurrences
        });
        // let median;
        // const sortedGrades = data.map((entry) => entry.value).sort((a, b) => a - b);
        // const mid = Math.floor(sortedGrades.length / 2);
        // median = sortedGrades.length % 2 === 0 ? (sortedGrades[mid - 1] + sortedGrades[mid]) / 2 : sortedGrades[mid]; // Calculate median
        // aggregated.average = Math.floor(average);
        // aggregated.median = Math.floor(median);

        // setAverage(average);
        // setMedian(aggregated.median);

        const sortedGrades = Object.values(aggregated).sort((a, b) => a.grade - b.grade); // Sort by grade
        console.log(sortedGrades);
        for (let i = sortedGrades[0].grade; i <= sortedGrades[sortedGrades.length - 1].grade; i++) {
            if (!aggregated[i]) {
                aggregated[i] = { grade: i, count: 0 };
            }
        }
        return Object.values(aggregated).sort((a, b) => a.grade - b.grade);
    };

    const letterTableRender = () => {
        // Split the letters data into two parts
        const dataEntries = Object.entries(letters).map(([grade, value]) => ({
            key: grade,
            grade,
            value,
        }));
        const half = Math.ceil(dataEntries.length / 2);
        const firstHalf = dataEntries.slice(0, half);
        const secondHalf = dataEntries.slice(half);

        return (
            <Row gutter={16}>
                <Col span={12}>
                    <Table dataSource={firstHalf} columns={columns} pagination={false} bordered />
                </Col>
                <Col span={12}>
                    <Table dataSource={secondHalf} columns={columns} pagination={false} bordered />
                </Col>
            </Row>
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
                        <div className="graph-zone">
                            <h2>התפלגות ציונים לפי הגשה</h2>
                            {adjustedData.length > 0 && (
                                <ResponsiveContainer width="100%" height={700}>
                                    <BarChart
                                        data={aggregateData(adjustedData)}
                                        margin={{ top: 50, right: 50, left: 50, bottom: 50 }} // Increased top margin for labels
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="grade" />
                                        <YAxis dx={-30} />
                                        <Tooltip />
                                        <Legend
                                            formatter={(value) => <span style={{ marginRight: 10 }}>{value}</span>}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#8884d8"
                                            name="מספר ציונים"
                                            barSize={100} // Set the width of each bar to make it more square-like
                                            barCategoryGap="10%"
                                        />
                                        {/* <ReferenceLine x={average} stroke="red" label="ממוצע ציונים" />
                                        <ReferenceLine x={median} stroke="blue" label="חציון ציונים" /> */}
                                        <ReferenceLine
                                            x={average}
                                            stroke="darkgreen"
                                            label={{
                                                value: "ממוצע ציונים",
                                                position: "insideTopRight",
                                                style: {
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    padding: "0 5px",
                                                },
                                                fill: "darkgreen"
                                            }}
                                            strokeDasharray="3 3"
                                        />
                                        <ReferenceLine
                                            x={median}
                                            stroke="blue"
                                            label={{
                                                value: "חציון ציונים",
                                                position: "insideTopLeft",
                                                style: {
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    padding: "0 5px",
                                                },
                                                fill: 'blue',
                                            }}
                                            strokeDasharray="3 3"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="grading-table">
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
                                    onChange={(e) => setCalculationMethod(e.target.value)}
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
                            onChange={(value) => {
                                setSelectedYear(value);
                                setSelectedJudge("pick_judge");
                                setSelectedSubmission("pick_submission");
                                setAdjustedData([]);
                            }}
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
                        <div className="grading-table">{letterTableRender()}</div>
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
