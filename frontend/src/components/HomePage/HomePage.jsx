import React, { useEffect, useState } from "react";
import "./HomePage.scss";
import axios from "axios";
import { Statistic, Alert, Calendar } from "antd";
import CountUp from "react-countup";
import dayjs from "dayjs";
import "dayjs/locale/he";
import localeData from "dayjs/plugin/localeData";

const Homepage = () => {
  const [numOfOpenProjects, setNumOfOpenProjects] = useState(0);
  const [numOfTakenProjects, setNumOfTakenProjects] = useState(0);
  const [numOfFinishedProjects, setNumOfFinishedProjects] = useState(0);
  const [value, setValue] = useState(() => dayjs());
  const [selectedValue, setSelectedValue] = useState(() => dayjs());

  useEffect(() => {
    dayjs.locale("he");
    dayjs.extend(localeData);
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/project/status`, {
          withCredentials: true,
        });
        setNumOfOpenProjects(response.data.numOfOpenProjects);
        setNumOfTakenProjects(response.data.numOfTakenProjects);
        setNumOfFinishedProjects(response.data.numOfFinishedProjects);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    fetchData();
  }, []);

  const onSelect = (newValue) => {
    setValue(newValue);
    setSelectedValue(newValue);
  };
  const onPanelChange = (newValue) => {
    setValue(newValue);
  };

  const getMonthLabel = (month, value) => {
    const monthLables = {
      0: "ינואר",
      1: "פברואר",
      2: "מרץ",
      3: "אפריל",
      4: "מאי",
      5: "יוני",
      6: "יולי",
      7: "אוגוסט",
      8: "ספטמבר",
      9: "אוקטובר",
      10: "נובמבר",
      11: "דצמבר",
    };
    return monthLables[month];
  };

  const formatter = (value) => <CountUp end={value} separator="," />;
  return (
    <div className="home-page">
      <div className="home-page-statistics">
        <Statistic title="פרויקטים פתוחים" value={numOfOpenProjects} formatter={formatter} />
        <Statistic title="פרויקטים לקוחים" value={numOfTakenProjects} formatter={formatter} />
        <Statistic title="פרויקטים שהושלמו" value={numOfFinishedProjects} formatter={formatter} />
      </div>
      <div className="home-page-updates">
        <h2>עדכונים</h2>
      </div>
      <div className="home-page-upcoming-events">
        <h2>אירועים קרובים</h2>
        <div className="home-page-upcoming-events-list">
          <Calendar
            className="list-calendar"
            value={value}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            locale={{
              lang: {
                locale: "he",
                month: getMonthLabel(value.month(), value),
                year: value.year(),
                day: value.day(),
                shortWeekDays: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
              },
            }}
            firstDayOfWeek={0}
          />
          <Alert className="list-info" message={`You selected date: ${selectedValue?.format("DD-MM-YYYY")}`} />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
