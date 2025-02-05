import React, { useState, useEffect } from "react";
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
    LockOutlined,
} from "@ant-design/icons";
import { Input, Spin } from "antd";

const { TextArea } = Input;

const Chat = ({ chatID, onClose, socket }) => {
    const [participants, setParticipants] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [message, setMessage] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const checkmarkSVG = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960">
            <g transform="translate(0, 960)">
                <path
                    d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z"
                    fill="#666"
                />
            </g>
        </svg>
    );

    useEffect(() => {
        if (chatID === "new") return;
        setParticipants(chatID.participants);
        fetchChat();
    }, [chatID]);

    const fetchChat = async () => {
        if (chatID === "") return;
        // Fetch chat data based on chatID
    };

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

    const sendMessage = async () => {
        if (message === "" || message.trim() === "") return;
        console.log("sending msg");
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/chat/send`,
                {
                    message,
                    recievers: participants.map((p) => p._id),
                    chatID,
                },
                {
                    withCredentials: true,
                },
            );
            const newMessage = response.data;

            // // Emit the message to other users via Socket.io
            // socket.emit("send_message", {
            //     chatID,
            //     message: newMessage.message,
            //     sender: newMessage.sender,
            // });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            setMessage("");
            sendMessage();
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
            <CloseOutlined
                className="chat-close"
                onClick={() => {
                    onClose();
                    setParticipants([]);
                    setUserSearch("");
                    setUserResults([]);
                    setMessage("");
                    setChatHistory([]);
                }}
            />
            {chatID === "new" ? (
                <div className="chat-wrapper">
                    <h3 className="chat-header">יצירת שיחה חדשה</h3>
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
                                                <UserDeleteOutlined
                                                    className="chat-action-icon"
                                                    style={{ color: "red" }}
                                                />
                                            ) : (
                                                <UserAddOutlined
                                                    className="chat-action-icon"
                                                    style={{ color: "green" }}
                                                />
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
                            className={`chat-message ${participants.length === 0 ? "inactive" : ""}`}
                            placeholder={`${participants.length === 0 ? "אנא הוסף משתמשים לשיחה" : "הקלד הודעה"}`}
                            autoSize={{
                                minRows: 1,
                                maxRows: 5,
                            }}
                            value={message}
                            onChange={(e) => {
                                if (participants.length === 0) return;
                                setMessage(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {participants.length === 0 ? (
                            <LockOutlined className="chat-send-icon" />
                        ) : (
                            <SendOutlined className={`chat-send-icon ${message !== "" ? "active" : ""}`} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="chat-wrapper">
                    <h3 className="chat-header">
                        {chatID.chatName
                            ? chatID.chatName
                            : (() => {
                                  let title = participants.map((p) => p.name).join(", ");
                                  if (title.length > 40) title = title.substring(0, 40).concat("...");
                                  return title;
                              })()}
                    </h3>
                    <div className="chat-history">
                        <div className="message">
                            <div className="speech-triangle"></div>
                            <div className="message-header">
                                <div className="sender">יוסי כהן</div>
                                <div className="time">13:45</div>
                            </div>
                            <div className="message-text">My message</div>
                            <div className="seen">{checkmarkSVG}</div>
                        </div>
                        <div className="message else">
                            <div className="speech-triangle"></div>
                            <div className="message-header">
                                <div className="sender">אביתר בן חיון עם שם מאוד ארוך</div>
                                <div className="time">13:45</div>
                            </div>
                            <div className="message-text">Your message</div>
                        </div>
                        <div className="message else">
                            <div className="speech-triangle"></div>
                            <div className="message-header">
                                <div className="sender">אביתר בן חיון עם שם מאוד ארוך</div>
                                <div className="time">13:45</div>
                            </div>
                            <div className="message-text">.</div>
                        </div>
                        <div className="message">
                            <div className="speech-triangle"></div>
                            <div className="message-header">
                                <div className="sender">יוסי המלך לא לגמרי כהן בלה בלה דגלחיד דחלג</div>
                                <div className="time">13:45</div>
                            </div>
                            <div className="message-text">.</div>
                            <div className="seen all">{checkmarkSVG}</div>
                        </div>
                        <div className="message">
                            <div className="speech-triangle"></div>
                            <div className="message-header">
                                <div className="sender">יוסי המלך לא לגמרי כהן בלה בלה דגלחיד דחלג</div>
                                <div className="time">13:45</div>
                            </div>
                            <div className="message-text">.</div>
                            <div className="seen all">{checkmarkSVG}</div>
                        </div>
                        <div className="message">
                            <div className="speech-triangle"></div>
                            <div className="message-header">
                                <div className="sender">יוסי המלך לא לגמרי כהן בלה בלה דגלחיד דחלג</div>
                                <div className="time">13:45</div>
                            </div>
                            <div className="message-text">.</div>
                            <div className="seen all">{checkmarkSVG}</div>
                        </div>
                    </div>
                    <div className="chat-message-container">
                        <TextArea
                            className={`chat-message`}
                            placeholder={`${participants.length === 0 ? "אנא הוסף משתמשים לשיחה" : "הקלד הודעה"}`}
                            autoSize={{
                                minRows: 1,
                                maxRows: 5,
                            }}
                            value={message}
                            onChange={(e) => {
                                if (participants.length === 0) return;
                                setMessage(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {participants.length === 0 ? (
                            <LockOutlined className="chat-send-icon lock" />
                        ) : (
                            <SendOutlined className={`chat-send-icon ${message !== "" ? "active" : ""}`} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
