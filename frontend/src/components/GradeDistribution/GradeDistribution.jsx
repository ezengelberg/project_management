import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs } from "antd";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import "./GradeDistribution.scss";

const GradeDistribution = () => {
    const [currentYear, setCurrentYear] = useState("");

    const fetchYear = async () => {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/config/get/year`, {
            withCredentials: true,
        });
        setCurrentYear(response.data);
    };
    const fetchAdvisors = async () => {
        if (!currentYear || currentYear === "") return;
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/get-active-advisors/`, {
            params: { year: currentYear },
            withCredentials: true,
        });
        console.log(response.data);
    };

    const fetchSubmissions = async () => {
        if (!currentYear || currentYear === "") return;
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/submission/get-yearly-submissions`, {
            params: { year: currentYear },
            withCredentials: true,
        });
        console.log(response.data);
    };

    useEffect(() => {
        fetchYear();
    }, []);

    useEffect(() => {
        fetchAdvisors();
        fetchSubmissions();
    }, [currentYear]);
    const items = [
        {
            key: "1",
            label: "התפלגות ציונים לפי הגשה",
            content: <div>התפלגות ציונים לפי הגשה</div>,
        },
        {
            key: "2",
            label: "התפלגות ציונים לפי שופט",
            content: <div>התפלגות ציונים לפי מרצה</div>,
        },
    ];
    return (
        <div>
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};

export default GradeDistribution;
