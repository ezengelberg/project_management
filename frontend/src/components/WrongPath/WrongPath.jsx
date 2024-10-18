import React from "react";
import "./WrongPath.scss";
import image404 from "../../assets/404v2.jpg";

const WrongPath = () => {
  return (
    <div className="wrong-path">
      <div className="not-found">
        <h1>אופס...</h1>
        <h2>העמוד שניסית להגיע אליו כבר איננו פה</h2>
        <img src={image404} alt="404 Not Found" />
        <button className="return-to-existance">חזור למקום קיים</button>
      </div>
    </div>
  );
};

export default WrongPath;
