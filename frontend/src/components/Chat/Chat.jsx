import React, { useState } from "react";
import "./Chat.scss";

import { CloseOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";

const Chat = ({ type }) => {
    const [participants, setParticipants] = useState([
        "אביאבי 12",
        "גיא נתן איתי",
        "גיא נתן איתי",
        "גיא נתן איתי",
        "גיא נתן איתי",
    ]);
    const fetchChat = async () => {
        setParticipants(["אביאבי 12", "גיא נתן איתי", "גיא נתן איתי", "גיא נתן איתי", "גיא נתן איתי"]);
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
                                <div className="participant-name">{participant}</div>
                            </div>
                        ))}
                        {participants.length === 0 && <div className="no-participants">לא הוספו משתמשים</div>}
                    </div>
                    <div className="chat-search-container">
                        <Input className="chat-search" placeholder="חפש משתמש" onChange={() => console.log("search users")}/>
                        <SearchOutlined className="search-icon"/>
                    </div>
                </div>
            ) : (
                <div className="chat-wrapper">bla bla</div>
            )}
        </div>
    );
};

export default Chat;
