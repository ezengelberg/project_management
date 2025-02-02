import React, { useState } from "react";
import axios from "axios";
import "./Chat.scss";

import {
    CloseOutlined,
    UserOutlined,
    SearchOutlined,
    SendOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
} from "@ant-design/icons";
import { Input } from "antd";

const { TextArea } = Input;

const Chat = ({ type }) => {
    const [participants, setParticipants] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [message, setMessage] = useState("");
    const fetchChat = async () => {};

    const findUser = async (value) => {
        if (value.length < 3) return;
        if (!/^[A-Za-z\u0590-\u05FF\s]+$/.test(value)) {
            return;
        }
        // Fetch users
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/chat/fetch-users?name=${value}`,
                {
                    withCredentials: true,
                },
            );
            console.log("Users fetched:", response.data);
            setUserResults(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            setMessage("");
        }
    };

    const handleUserClick = (user) => {
        console.log(user);
        if (participants.filter((p) => p.name === user.name).length === 0) {
            setParticipants([...participants, user]);
        } else {
            setParticipants(participants.filter((p) => p.name !== user.name));
        }
    };

    return (
        <div className="chat-container">
            <CloseOutlined className="chat-close" />
            {type === "new" ? (
                <div className="chat-wrapper">
                    <h3>יצירת שיחה חדשה</h3>
                    <div className="participants-list">
                        <div className="participant-title">משתתפים:</div>
                        {participants.map((participant, index) => (
                            <div
                                key={index}
                                className="participant"
                                onClick={() => setParticipants(participants.filter((p, i) => i !== index))}>
                                <UserOutlined />
                                <div className="participant-name">{participant.name}</div>
                            </div>
                        ))}
                        {participants.length === 0 && <div className="no-participants">לא הוספו משתמשים</div>}
                    </div>
                    <div className="chat-search-container">
                        <Input
                            className="chat-search"
                            placeholder="חפש משתמש"
                            value={userSearch}
                            onChange={(e) => {
                                setUserSearch(e.target.value);
                                findUser(e.target.value);
                            }}
                        />
                        <SearchOutlined className="search-icon" />
                    </div>
                    <div className="chat-users">
                        {userResults.length > 0 ? (
                            <>
                                {userResults.map((user) => {
                                    return (
                                        <div className="chat-user" key={user._id} onClick={() => handleUserClick(user)}>
                                            <UserOutlined />
                                            <div className="chat-user-name">{user.name}</div>
                                            {/* {participants.filter((p) => p === user.name).length === 0 ? (
                                                <UserAddOutlined className="chat-action-icon" />
                                            ) : (
                                                <UserDeleteOutlined className="chat-action-icon" />
                                            )} */}
                                            {participants.filter((p) => p.name === user.name).length > 0 ? (
                                                <UserDeleteOutlined className="chat-action-icon" />
                                            ) : (
                                                <UserAddOutlined className="chat-action-icon" />
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <>none</>
                        )}
                    </div>
                    <div className="chat-message-container">
                        <TextArea
                            className="chat-message"
                            placeholder="הקלד הודעה"
                            autoSize={{
                                minRows: 1,
                                maxRows: 5,
                            }}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <SendOutlined className={`chat-send-icon ${message !== "" ? "active" : ""}`} />
                    </div>
                </div>
            ) : (
                <div className="chat-wrapper"></div>
            )}
        </div>
    );
};

export default Chat;
