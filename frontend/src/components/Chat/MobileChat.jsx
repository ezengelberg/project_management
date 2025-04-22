import React, { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "antd";
import { useSocket } from "../../utils/SocketContext";
import "./MobileChat.scss";
import Chat from "./Chat";

const MessageSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    fill="#000"
  >
    <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
  </svg>
);

const MobileChat = () => {
  const [chats, setChats] = useState([]);
  const { socket } = useSocket();
  const [user, setUser] = useState({});
  const [chatFilter, setChatFilter] = useState("");
  const [selectedChats, setSelectedChats] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Redirect to home if window size is greater than 768px (non mobile)
  useEffect(() => {
    if (windowSize.width > 768) {
      window.location.href = "/home";
    }
  }, [windowSize]);

  const loadUser = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user`,
        {
          withCredentials: true,
        }
      );
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
    }
  };

  const selectChat = (chat) => {
    setSelectedChats((prev) => {
      // Prevent duplicates
      if (prev.some((c) => c._id?.toString() === chat._id?.toString())) {
        return prev;
      }

      // Ensure "new" is unique
      if (chat === "new" && prev.includes("new")) {
        return prev;
      }

      // Maintain max length of 1
      if (prev.length < 1) {
        return [...prev, chat];
      } else {
        return [...prev.slice(0), chat]; // Remove the oldest
      }
    });
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/`,
        {
          withCredentials: true,
        }
      );
      setChats(
        response.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        )
      );
      // returning for socket purposes
      // return response.data;

      if (socket && response.data.length) {
        socket.emit(
          "join_chats",
          response.data.map((chat) => chat._id)
        );
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleCreateChat = async (chatID) => {
    setSelectedChats((prev) => {
      return prev.filter((chat) => chat !== "new");
    });
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("connect", () => {
      if (chats?.length) {
        socket.emit(
          "join_chats",
          chats.map((chat) => chat._id)
        );
      }
    });

    socket.on("reconnect", () => {
      console.log("Reconnected! Rejoining chats...");
      if (chats?.length) {
        socket.emit(
          "join_chats",
          chats.map((chat) => chat._id)
        );
      }
    });

    socket.on("receive_chat", (newChat, newMessage) => {
      setChats((prev) => {
        const updatedChats = prev.map((chat) => {
          if (
            chat._id === newChat._id &&
            chat.lastMessage !== newChat.lastMessage
          ) {
            if (newMessage.sender._id !== user._id) {
              chat.unreadTotal++;
            }
            return {
              ...chat,
              lastMessage: newMessage,
            };
          }
          return chat;
        });
        return updatedChats;
      });
    });

    socket.on("receive_new_chat", (chat) => {
      setChats((prev) => {
        const newChats = [chat, ...prev];
        return newChats;
      });
      //   selectChat(chat);
      socket.emit("join_chats", [chat._id.toString()]);
    });

    return () => {
      socket.off("connect");
      socket.off("reconnect");
      socket.off("receive_chat");
    };
  }, [socket, chats, user]);

  // Fetch chats when the component mounts
  useEffect(() => {
    fetchChats();
    loadUser();
  }, []);

  return (
    <div className="mobile-chat-container">
      {selectedChats.map((chat) => {
        return (
          <Chat
            key={chat._id || "new"}
            chatID={chat}
            onClose={() => {
              setSelectedChats((prev) =>
                prev.filter((c) => c._id !== chat._id)
              );
            }}
            onWatch={() => {
              setChats((prevChats) => {
                const updatedChats = prevChats.map((c) => {
                  if (c._id.toString() === chat._id.toString()) {
                    c.unreadTotal = c.unreadTotal ? c.unreadTotal - 1 : 0;
                  }
                  return c;
                });
                return updatedChats;
              });
            }}
            onCreateChat={handleCreateChat}
          />
        );
      })}
      {selectedChats.length === 0 && (
        <>
          <div className="chat-header">
            <MessageSVG />
            <div className="header-title">צ׳אטים</div>
          </div>
          <div className="chat-list">
            <div
              className="chat-item new-chat"
              onClick={() => selectChat("new")}
            >
              <svg
                width="64px"
                height="64px"
                viewBox="0 0 24.00 24.00"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#000000"
                stroke-width="0.00024000000000000003"
                transform="rotate(0)"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 3C7.85113 3 4 5.73396 4 10C4 11.5704 4.38842 12.7289 5.08252 13.6554C5.79003 14.5998 6.87746 15.3863 8.41627 16.0908L9.2326 16.4645L8.94868 17.3162C8.54129 18.5384 7.84997 19.6611 7.15156 20.5844C9.56467 19.8263 12.7167 18.6537 14.9453 17.1679C17.1551 15.6948 18.3969 14.5353 19.0991 13.455C19.7758 12.4139 20 11.371 20 10C20 5.73396 16.1489 3 12 3ZM2 10C2 4.26604 7.14887 1 12 1C16.8511 1 22 4.26604 22 10C22 11.629 21.7242 13.0861 20.7759 14.545C19.8531 15.9647 18.3449 17.3052 16.0547 18.8321C13.0781 20.8164 8.76589 22.2232 6.29772 22.9281C5.48665 23.1597 4.84055 22.6838 4.56243 22.1881C4.28848 21.6998 4.22087 20.9454 4.74413 20.3614C5.44439 19.5798 6.21203 18.5732 6.72616 17.4871C5.40034 16.7841 4.29326 15.9376 3.48189 14.8545C2.48785 13.5277 2 11.9296 2 10Z"
                    fill="#0F0F0F"
                  ></path>{" "}
                  <path
                    d="M12 6C11.4477 6 11 6.44771 11 7V9H9C8.44772 9 8 9.44771 8 10C8 10.5523 8.44772 11 9 11H11V13C11 13.5523 11.4477 14 12 14C12.5523 14 13 13.5523 13 13V11H15C15.5523 11 16 10.5523 16 10C16 9.44772 15.5523 9 15 9H13V7C13 6.44771 12.5523 6 12 6Z"
                    fill="#0F0F0F"
                  ></path>{" "}
                </g>
              </svg>
              <span className="chat-item-title">יצירת שיחה חדשה</span>
            </div>
            {chats?.length === 0 && <p>אין שיחות זמינות</p>}
            {chats
              .filter((chat) => {
                const title =
                  chat.participants.length === 2
                    ? chat.participants.filter((p) => p._id !== user._id)[0]
                        .name
                    : chat.chatName
                    ? chat.chatName
                    : chat.participants.map((p) => p.name).join(", ");

                return title.toLowerCase().includes(chatFilter);
              })
              .map((chat) => {
                return (
                  <div
                    key={chat._id}
                    className="chat-item"
                    onClick={() => selectChat(chat)}
                  >
                    <div className="chat-header">
                      <span className="head-title">
                        {chat.participants.length === 2
                          ? chat.participants.filter(
                              (p) => p._id !== user._id
                            )[0].name
                          : chat.chatName
                          ? chat.chatName
                          : (() => {
                              let title = chat.participants
                                .map((p) => p.name)
                                .join(", ");
                              if (title.length > 40)
                                title = title.substring(0, 40).concat("...");
                              return title;
                            })()}
                      </span>
                    </div>
                    <div className="message-description">
                      <div className="last-message">
                        <div
                          className={`seen ${
                            chat.lastMessage?.seenBy?.length ===
                            chat.participants.length
                              ? "all"
                              : ""
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 960 960"
                          >
                            <g transform="translate(0, 960)">
                              <path
                                d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z"
                                fill="#666"
                              />
                            </g>
                          </svg>
                        </div>
                        <span className="last-message-content">
                          {chat?.lastMessage?.sender?.name}:{" "}
                          {chat?.lastMessage?.message?.length > 10
                            ? `${chat?.lastMessage?.message?.substring(
                                0,
                                50
                              )}...`
                            : chat?.lastMessage?.message}
                        </span>
                      </div>
                    </div>
                    {chat.unreadTotal > 0 && (
                      <div className="unread-total">
                        <Badge count={chat?.unreadTotal} color="#1daa61" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default MobileChat;
