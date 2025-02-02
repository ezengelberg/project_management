import React, { useState } from "react";
import axios from "axios";
import "./Chat.scss";

import {
    LoadingOutlined,
    CloseOutlined,
    UserOutlined,
    SearchOutlined,
    SendOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
} from "@ant-design/icons";
import { Input, Spin } from "antd";

const { TextArea } = Input;

const Chat = ({ type }) => {
    const [participants, setParticipants] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [message, setMessage] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);
    const fetchChat = async () => {};

    const findUser = async (value) => {
        if (value.length < 3) return;
        if (!/^[A-Za-z\u0590-\u05FF\s]+$/.test(value)) {
            return;
        }
        setLoadingUsers(true);
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
        } finally {
            setLoadingUsers(false);
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
                        <div className="participants-list--wrapper">
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
                    </div>
                    <div className="chat-search-container">
                        <Input
                            className="chat-search"
                            placeholder="חפש משתמש"
                            value={userSearch}
                            onChange={(e) => {
                                setUserSearch(e.target.value);
                                if (e.target.value.length < 3) {
                                    setUserResults([]);
                                    return;
                                }
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
                                            {participants.filter((p) => p.name === user.name).length > 0 ? (
                                                <UserDeleteOutlined className="chat-action-icon" style={{"color": "red"}}/>
                                            ) : (
                                                <UserAddOutlined className="chat-action-icon" style={{"color" : "green"}}/>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div className={`no-users ${loadingUsers ? "loading" : ""}`}>
                                {loadingUsers ? (
                                    <div className="searching-users">
                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                                        <div className="search-title">מחפש משתמשים...</div>
                                    </div>
                                ) : (
                                    "לא נמצאו משתמשים"
                                )}
                            </div>
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
