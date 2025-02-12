import React from "react";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

const Message = ({ message, user, participants, onWatch, socket, chatID, checkWatchers }) => {
    const { ref, inView } = useInView({
        triggerOnce: true, // Ensures it only fires once per message
        threshold: 1.0, // Ensures the message is fully visible before triggering
    });

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

    const [seen, setSeen] = useState(false);

    useEffect(() => {
        if (inView && !seen) {
            const isSeenByUser = message.seenBy.some((u) => u.user._id.toString() === user._id.toString());

            if (!isSeenByUser) {
                console.log("MESSAGE SEEN");
                onWatch(); // Trigger parent update
                socket.emit("seen_message", { messageID: message._id, chatID: chatID._id, user: user._id });
                setSeen(true);
            }
        }
    }, [inView, seen, message, user, chatID, onWatch, socket]);

    return (
        <div ref={ref} className={`message ${message.sender._id.toString() === user._id.toString() ? "" : "else"}`}>
            <div className="message-header">
                <div className="sender">{message.sender.name}</div>
                <div className="time">
                    {new Date(message.createdAt).toLocaleDateString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
            <div className="message-text">{message.message}</div>
            {message.sender._id.toString() === user._id.toString() && (
                <div
                    className={`seen ${message.seenBy.length === participants.length ? "all" : ""}`}
                    onClick={() => checkWatchers()}>
                    {checkmarkSVG}
                </div>
            )}
        </div>
    );
};

export default Message;
