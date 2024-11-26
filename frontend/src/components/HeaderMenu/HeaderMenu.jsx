import React, { useState } from "react";
import "./HeaderMenu.scss";
import collegeLogo from "../../assets/CollegeLogo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tooltip, Avatar, Badge, Popover, Divider } from "antd";
import { LogoutOutlined, CommentOutlined } from "@ant-design/icons";
import { handleMouseDown } from "../../utils/mouseDown";

const HeaderMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });
  const [open, setOpen] = useState(false);

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  const content = (
    <div className="headermenu-popover-content">
      <p>Content</p>
      <Divider />
      <p>Content</p>
      <Divider className="last-divider" />
      <a
        className="show-all-notifications"
        onClick={() => {
          navigate("/notifications");
          hide();
        }}>
        כל ההתראות
      </a>
    </div>
  );

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/logout`, null, {
        withCredentials: true,
      });
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
        <h1>מערכת לניהול פרויקטים</h1>
      </div>
      <div className="site-upper-header-left">
        <Popover
          content={content}
          title={<div style={{ textAlign: "center" }}>התראות אחרונות</div>}
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}>
          <Badge count={100} style={{ transform: "translate(50%, -50%)" }}>
            <Tooltip title="התראות" placement="right">
              <CommentOutlined className="notification-icon" />
            </Tooltip>
          </Badge>
        </Popover>
        <Tooltip title="פרופיל">
          <Avatar
            className="avatar-icon"
            size="large"
            onClick={() => navigate(`/profile/${user.id}`)}
            onMouseDown={(e) => handleMouseDown(e, `/profile/${user.id}`)}>
            {user.name && user.name[0]}
            {user.name && user.name.split(" ")[1] ? user.name.split(" ")[1][0] : ""}
          </Avatar>
        </Tooltip>
        <Tooltip title="התנתק">
          <LogoutOutlined className="logout-icon" onClick={handleLogout} />
        </Tooltip>
      </div>
    </div>
  );
};

export default HeaderMenu;
