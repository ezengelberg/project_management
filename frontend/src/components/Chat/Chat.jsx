import React, { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
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
import MessageReadList from "./MessageReadList";
import Message from "./Message";
import { useSocket } from "../../utils/SocketContext";

const { TextArea } = Input;

const Chat = ({ chatID, onClose, onWatch, onCreateChat }) => {
    const { socket, isConnected } = useSocket();
    const [participants, setParticipants] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [message, setMessage] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [seenUnread, setSeenUnread] = useState(false);
    const [sentMessage, setSentMessage] = useState(false);
    const [watchMessage, setWatchMessage] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);

    const messageRefs = useRef([]);

    const user = JSON.parse(localStorage.getItem("user"));

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

    // useEffect(() => {
    //     if (socket) {
    //         socket.on("receive_message", (msg) => {
    //             console.log("📩 Received new message:", msg);
    //             setChatHistory((prevHistory) => {
    //                 const newHistory = [...prevHistory, msg];
    //                 newHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    //                 return newHistory;
    //             });
    //         });
    //         socket.on("receive_seen", (message) => {
    //             setChatHistory((prevHistory) => {
    //                 const newHistory = prevHistory.map((msg) => {
    //                     if (msg._id.toString() === message._id.toString()) {
    //                         return message;
    //                     }
    //                     return msg;
    //                 });
    //                 return newHistory;
    //             });
    //         });
    //         socket.on("typing_start", (chatUser, chat) => {
    //             if (chatID._id.toString() !== chat.toString()) return;
    //             if (chatUser.toString() === user._id.toString()) return;
    //             console.log(`${chatUser} is typing...`);
    //             setTypingUsers((prevUsers) => {
    //                 if (prevUsers.includes(chatUser)) return prevUsers;
    //                 return [...prevUsers, chatUser];
    //             });
    //         });
    //         socket.on("typing_stop", (user, chat) => {
    //             if (chatID._id.toString() !== chat.toString()) return;
    //             console.log(`${user} stopped typing...`);
    //             setTypingUsers((prevUsers) => prevUsers.filter((u) => u.toString() !== user.toString()));
    //             console.log("removed user from typing users");
    //             console.log("typing users:", typingUsers);
    //         });
    //     }
    //     return () => {
    //         if (socket) {
    //             socket.off("receive_message");
    //             socket.off("receive_seen");
    //             socket.off("typing_start");
    //             socket.off("typing_stop");
    //         }
    //     };
    // }, [socket]);

    useEffect(() => {
        if (!socket) return; // Wait for socket to be available

        // Listen for new messages
        socket.on("receive_message", (msg) => {
            console.log("📩 Received new message:", msg);
            setChatHistory((prevHistory) => {
                const newHistory = [...prevHistory, msg];
                newHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                return newHistory;
            });
        });

        // Listen for "seen" updates
        socket.on("receive_seen", (message) => {
            setChatHistory((prevHistory) => {
                const newHistory = prevHistory.map((msg) => {
                    if (msg._id.toString() === message._id.toString()) {
                        return message;
                    }
                    return msg;
                });
                return newHistory;
            });
        });

        // Listen for typing status updates
        socket.on("typing_start", (chatUser, chat) => {
            if (chatID._id.toString() !== chat.toString()) return;
            if (chatUser.toString() === user._id.toString()) return;
            console.log(`${chatUser} is typing...`);
            setTypingUsers((prevUsers) => {
                if (prevUsers.includes(chatUser)) return prevUsers;
                return [...prevUsers, chatUser];
            });
        });

        // Listen for typing stop
        socket.on("typing_stop", (user, chat) => {
            if (chatID._id.toString() !== chat.toString()) return;
            console.log(`${user} stopped typing...`);
            setTypingUsers((prevUsers) => prevUsers.filter((u) => u.toString() !== user.toString()));
        });

        // Cleanup on unmount
        return () => {
            socket.off("receive_message");
            socket.off("receive_seen");
            socket.off("typing_start");
            socket.off("typing_stop");
        };
    }, [socket, chatID]);

    const scrollIntoView = () => {
        if (chatHistory.length > 0) {
            const unreadMessage = chatHistory.find(
                (message) => !message.seenBy.some((u) => u.user._id.toString() === user._id.toString()),
            );
            if (unreadMessage && messageRefs.current[unreadMessage._id] && !seenUnread) {
                messageRefs.current[unreadMessage._id].scrollIntoView({ behavior: "smooth", block: "end" });
                setSeenUnread(true);
            }
            if (!seenUnread && !unreadMessage) scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        if (chatHistory.length > 0) {
            const lastMessageId = chatHistory[chatHistory.length - 1]._id;
            messageRefs.current[lastMessageId]?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    };

    // const messageObserver = (message, el) => {
    //     if (!el || observerRef.current.has(message._id)) return;
    //     console.log("OBSERVING MESSAGE");
    //     const observer = new IntersectionObserver(
    //         ([entry]) => {
    //             if (entry.isIntersecting) {
    //                 const isSeenByUser = message.seenBy.some((u) => {
    //                     return u.user._id.toString() === user._id.toString();
    //                 });
    //                 if (!isSeenByUser) {
    //                     message.seenBy.push({ time: new Date(), user: { _id: user._id, name: user.name } });
    //                     onWatch();
    //                     socket.emit("seen_message", { messageID: message._id, chatID: chatID._id, user: user._id });
    //                 }
    //                 observer.disconnect();
    //                 observerRef.current.delete(message._id);
    //             }
    //         },
    //         { threshold: 1.0 },
    //     );

    //     observerRef.current.set(message._id, observer);
    //     observer.observe(el);
    // };

    const updateTyping = () => {
        if (isTyping) return;
        setIsTyping(true);
        socket.emit("typing start", { chatID: chatID._id, user: user._id });
        setTimeout(() => {
            setIsTyping(false);
            socket.emit("typing stop", { chatID: chatID._id, user: user._id });
        }, 5000);
    };

    useEffect(() => {
        if (!seenUnread) {
            scrollIntoView();
        }
    }, [chatHistory]);

    useEffect(() => {
        if (seenUnread && sentMessage) {
            scrollToBottom();
            setSentMessage(false);
        }
    }, [chatHistory.length]);

    const fetchChat = async () => {
        if (chatID === "") return;
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/chat/messages?chatID=${chatID._id}`,
                {
                    withCredentials: true,
                },
            );
            setChatHistory(response.data);
        } catch (error) {
            console.error("Error fetching chat:", error);
        }
    };

    const findUser = async (value) => {
        if (value.length < 3) return;
        if (!/^[A-Za-z\u0590-\u05FF\s]+$/.test(value)) {
            return;
        }
        setLoadingUsers(true);
        console.log("Loaded users");
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/chat/fetch-users?name=${value}`,
                {
                    withCredentials: true,
                },
            );
            setUserResults(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const sendMessage = async () => {
        if (message === "" || message.trim() === "") return;
        socket.emit("typing stop", { chatID: chatID._id, user: user._id });
        setSentMessage(true);
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
            console.log(response.data);
            if (response.data.isNewChat) {
                onCreateChat(response.data.messageData.chat);
            }
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
                    <div className="chat-header">
                        <h3 className="chat-header-title">יצירת שיחה חדשה</h3>
                    </div>
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
                    <div className="chat-header">
                        <h3
                            className={`chat-header-title ${participants.length > 2 ? "changeable" : ""}`}
                            onClick={() => console.log("Change chat name")}>
                            {participants.length === 2
                                ? participants.filter((p) => p._id !== user._id)[0].name
                                : chatID.chatName
                                ? chatID.chatName
                                : (() => {
                                      let title = participants.map((p) => p.name).join(", ");
                                      if (title.length > 40) title = title.substring(0, 40).concat("...");
                                      return title;
                                  })()}
                        </h3>
                    </div>
                    <div className="chat-history">
                        {chatHistory.length === 0 ? <div className="no-messages">אין היסטורית הודעות</div> : null}

                        {chatHistory.map((message) => {
                            return (
                                <Message
                                    key={message._id}
                                    message={message}
                                    user={user}
                                    participants={participants}
                                    onWatch={() => onWatch()}
                                    socket={socket}
                                    chatID={chatID}
                                    checkWatchers={() => setWatchMessage(message)}
                                />
                                // <div
                                //     key={message._id}
                                //     className={`message ${
                                //         message.sender._id.toString() === user._id.toString() ? "" : "else"
                                //     }`}
                                //     ref={(el) => {
                                //         if (el) {
                                //             messageRefs.current[message._id] = el;
                                //         }
                                //     }}>
                                //     <div className="message-header">
                                //         <div className="sender">{message.sender.name}</div>
                                //         <div className="time">
                                //             {new Date(message.createdAt).toLocaleDateString("he-IL", {
                                //                 hour: "2-digit",
                                //                 minute: "2-digit",
                                //             })}
                                //         </div>
                                //     </div>
                                //     <div className="message-text">{message.message}</div>
                                //     {message.sender._id.toString() === user._id.toString() && (
                                //         <div
                                //             className={`seen ${
                                //                 message.seenBy.length === participants.length ? "all" : ""
                                //             }`}
                                //             onClick={() => setWatchMessage(message)}>
                                //             {checkmarkSVG}
                                //         </div>
                                //     )}
                                // </div>
                            );
                        })}
                        <div className="actively-typing">
                            {typingUsers.length > 0 && (
                                <div className="typing-users">
                                    {typingUsers.length === 1 &&
                                        typingUsers.map((user) => (
                                            <div key={user} className="typing-user">
                                                <span>
                                                    {participants.find((p) => p._id.toString() === user).name} מקליד\ה...
                                                </span>
                                            </div>
                                        ))}
                                    {typingUsers.length > 1 && (
                                        <div className="typing-user">
                                            {() => {
                                                const names = typingUsers.map((user) => {
                                                    return participants.find(
                                                        (p) => p._id.toString() === user.toString(),
                                                    ).name;
                                                });
                                                return `${names.join(", ")} מקלידים...`;
                                            }}
                                        </div>
                                    )}
                                </div>
                            )}
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
                                if (e.target.value.length > 0) updateTyping();
                                else {
                                    setIsTyping(false);
                                    socket.emit("typing stop", { chatID: chatID._id, user: user._id });
                                }
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
            {watchMessage && (
                <MessageReadList
                    message={watchMessage}
                    participants={participants}
                    onClose={() => setWatchMessage(null)}
                />
            )}
        </div>
    );
};

export default Chat;
