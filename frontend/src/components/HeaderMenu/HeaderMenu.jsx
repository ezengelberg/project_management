import "./HeaderMenu.scss";
import collegeLogo from "../../assets/CollegeLogo.png";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Tooltip, Avatar, Badge } from "antd";
import { MessageOutlined, LogoutOutlined } from "@ant-design/icons";

const HeaderMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/logout`, null, { withCredentials: true });
      navigate("/login", { replace: true });
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  return (
    <div className="header-container">
      <div className="site-upper-header-right">
        <img src={collegeLogo} alt="collage logo" className="collage-logo" onClick={() => navigate("/home")} />
        <h1>מערכת ניהול פרויקטים</h1>
      </div>
      <div className="site-upper-header-left">
        <Tooltip title="פרופיל">
          <Avatar className="avatar-icon" size="large" onClick={() => navigate(`/profile/${user.id}`)}>
            {user.name && user.name[0]}
            {user.name && user.name.split(" ")[1] ? user.name.split(" ")[1][0] : ""}
          </Avatar>
        </Tooltip>
        <Badge count={100}>
          <Tooltip title="התראות">
            <MessageOutlined className="notification-icon" />
          </Tooltip>
        </Badge>
        <Tooltip title="התנתק">
          <LogoutOutlined className="logout-icon" onClick={handleLogout} />
        </Tooltip>
      </div>
    </div>
  );
};

export default HeaderMenu;
