import React from "react";
import "./Homepage.scss";
import { Statistic } from "antd";
import CountUp from "react-countup";

const Homepage = () => {
  const formatter = (value) => <CountUp end={value} separator="," />;
  return (
    <div>
      <Statistic title="פרוייקטים פתוחים" value={112893} formatter={formatter} />
      <Statistic title="פרוייקטים סגורים" value={11893} formatter={formatter} />
    </div>
  );
};

export default Homepage;
