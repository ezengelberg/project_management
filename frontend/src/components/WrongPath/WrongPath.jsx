import React from "react";
import "./WrongPath.css";

const WrongPath = () => {
  return (
    <div className="wrong-path">
      <div className="not-found">
        <h1>אופס...</h1>
        <h2>העמוד שניסית להגיע אליו לא קיים</h2>
        <img src={require("./404.jpeg")} alt="404 Not Found" />
      </div>
    </div>
  );
};

export default WrongPath;
