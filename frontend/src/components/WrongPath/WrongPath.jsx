import React from "react";
import "./WrongPath.scss";
import { useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

const WrongPath = () => {
  const navigate = useNavigate();
  return (
    <div className="wrong-path"><Result
    status="404"
    title="404"
    subTitle="סליחה, העמוד שהגעת אליו אינו קיים"
    extra={<Button type="primary" onClick={()=> navigate("/login")}>למסך כניסה</Button>}
  /></div>
);
};

export default WrongPath;
