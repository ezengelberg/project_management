import React from "react";
import "./WrongPath.css";

const WrongPath = () => {
return (
    <div className="wrong-path">
        <div className="not-found">
            <h1>עמוד זה עדיין אינו קיים</h1>
            <img src={require('./404.jpeg')} alt="404 Not Found" />
            <h2>נסו לשוב במועד מאוחר יותר</h2>
        </div>
    </div>
);
};

export default WrongPath;
