import React from "react";
import "./WrongPath.scss";
import { useNavigate } from "react-router-dom";

const WrongPath = () => {

  const navigate = useNavigate();
  return (
    <div className="wrong-path">
      <div className="not-found">
        <h1>אופס...</h1>
        <h2>העמוד שניסית להגיע אליו כבר איננו פה</h2>
        <img src={require("./404v2.jpg")} alt="404 Not Found" />
        <button className="return-to-existance" onClick={() => navigate("/home")} >חזור למקום קיים</button>
      </div>
    </div>
  );
};

export default WrongPath;
