import React, { useEffect, useState, forwardRef } from "react";
import { useInView } from "react-intersection-observer";

const Message = forwardRef(({ message, user, participants, onWatch, socket, chatID, checkWatchers }, parentRef) => {
    const { ref: inViewRef, inView } = useInView({
        triggerOnce: true,
        threshold: 1.0,
    });
    const [seen, setSeen] = useState(false);

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
        if (inView && !seen) {
            setSeen(true);
            const isSeenByUser = message.seenBy.some((u) => u.user._id.toString() === user._id.toString());
            if (!isSeenByUser) {
                onWatch();
                socket.emit("seen_message", { messageID: message._id, chatID: chatID._id, user: user._id });
                console.log(`Message ${message.message} seen by ${user.name}`);
            }
        }
    }, [inView, seen]);

    // Combine both refs using a callback ref
    const setRefs = (element) => {
        // Set the parent ref
        if (typeof parentRef === "function") {
            parentRef(element);
        } else if (parentRef) {
            parentRef.current = element;
        }
        // Set the inView ref
        inViewRef(element);
    };

    return (
        <div ref={setRefs} className={`message ${message.sender._id.toString() === user._id.toString() ? "" : "else"}`}>
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
});

export default Message;
