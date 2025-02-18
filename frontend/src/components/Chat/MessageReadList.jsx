import React, { useState } from "react";
import { Avatar } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import "./MessageReadList.scss";

const MessageReadList = ({ message, participants, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 400);
    };
    return (
        <div className={`chat-read-list ${isClosing ? "close" : ""}`}>
            <CloseOutlined
                className="chat-close"
                onClick={() => {
                    handleClose();
                }}
            />
            <div className="read-title">נקרא ע"י</div>
            <div className="read-list">
                {message.seenBy.map((user) => {
                    if (!user.user) return null;
                    return (
                        <div key={user.user._id} className="chat-read-list-item">
                            <div className="list-item-right">
                                <Avatar size={32} style={{ fontSize: "14px" }}>
                                    <span>
                                        {user?.user?.name && user.user.name[0]}
                                        {user?.user.name && user.user.name.split(" ")[1]
                                            ? user.user.name.split(" ")[1][0]
                                            : ""}
                                    </span>
                                </Avatar>
                                <span>{user?.user?.name}</span>
                            </div>
                            <div className="list-item-left">
                                {new Date(user.time).toLocaleDateString("he-IL", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="read-title">נשלח ל</div>
            <div className="read-list">
                {participants
                    .filter((p) => !message.seenBy.some((s) => s.user._id.toString() === p._id.toString())) // Get only users who haven't seen the message
                    .map((user) => (
                        <div key={user._id} className="chat-read-list-item">
                            <div className="list-item-right">
                                <Avatar size={32} style={{ fontSize: "14px" }}>
                                    <span>
                                        {user.name?.charAt(0)}
                                        {user.name?.split(" ")[1]?.charAt(0) || ""}
                                    </span>
                                </Avatar>
                                <span>{user.name}</span>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default MessageReadList;
