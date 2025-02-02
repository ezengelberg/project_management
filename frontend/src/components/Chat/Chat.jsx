import React, { useState } from "react";
import "./Chat.scss";

import { CloseOutlined, UserOutlined } from "@ant-design/icons";

const Chat = ({ type }) => {
    const [participants, setParticipants] = useState([
        "אביאבי 12",
        "גיא נתן איתי",
        "גיא נתן איתי",
        "גיא נתן איתי",
        "גיא נתן איתי",
    ]);
    return (
        <div className="chat-container">
            <CloseOutlined className="chat-close" />
            {type === "new" ? (
                <div className="chat-wrapper">
                    <h3>יצירת שיחה חדשה</h3>
                    <div class="participants-list">
                        <div class="participant-title">משתתפים:</div>
                        {participants.map((participant, index) => (
                            <div
                                key={index}
                                class="participant"
                                onClick={() => setParticipants(participants.filter((p, i) => i !== index))}>
                                <UserOutlined />
                                <div class="participant-name">{participant}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="chat-wrapper">bla bla</div>
            )}
        </div>
    );
};

export default Chat;
