import React, { useEffect, useState } from "react";
import "./Homepage.scss";
import axios from "axios";
import { Statistic } from "antd";
import CountUp from "react-countup";

const Homepage = () => {
  const [numOfOpenProjects, setNumOfOpenProjects] = useState(0);
  const [numOfTakenProjects, setNumOfTakenProjects] = useState(0);
  const [numOfFinishedProjects, setNumOfFinishedProjects] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/project/status", { withCredentials: true });
        setNumOfOpenProjects(response.data.numOfOpenProjects);
        setNumOfTakenProjects(response.data.numOfTakenProjects);
        setNumOfFinishedProjects(response.data.numOfFinishedProjects);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    fetchData();
  }, []);

  const formatter = (value) => <CountUp end={value} separator="," />;
  return (
    <div className="home-page">
      <Statistic title="פרוייקטים פתוחים" value={numOfOpenProjects} formatter={formatter} />
      <Statistic title="פרוייקטים לקוחים" value={numOfTakenProjects} formatter={formatter} />
      <Statistic title="פרוייקטים שהושלמו" value={numOfFinishedProjects} formatter={formatter} />
    </div>
  );
};

export default Homepage;
