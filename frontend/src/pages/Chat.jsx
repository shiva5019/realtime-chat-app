import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import socket, { connectSocket } from "../socket/socket";
import api from "../api/axios";

const Chat = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    connectSocket(user._id);

    const fetchUsers = async () => {
      try {
        const response = await api.get("/auth/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to load users:", error.message);
      }
    };
    fetchUsers();

    socket.on("onlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off("onlineUsers");
    };
  }, []);

  useEffect(() => {
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("userTyping", ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsReceiverTyping(true);
      }
    });

    socket.on("userStoppedTyping", ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsReceiverTyping(false);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    setIsReceiverTyping(false);

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/messages/${selectedUser._id}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to load history:", error.message);
      }
    };

    fetchHistory();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReceiverTyping]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (!selectedUser) return;

    socket.emit("typing", { senderId: user._id, receiverId: selectedUser._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { senderId: user._id, receiverId: selectedUser._id });
    }, 1500);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser) return;

    socket.emit("sendMessage", {
      sender: user._id,
      receiver: selectedUser._id,
      content,
    });

    socket.emit("stopTyping", { senderId: user._id, receiverId: selectedUser._id });
    setContent("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.myInfo}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <span style={styles.myName}>{user?.name}</span>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>

        <div style={styles.userList}>
          {users.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            const isSelected = selectedUser?._id === u._id;
            return (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                style={{
                  ...styles.userItem,
                  backgroundColor: isSelected ? "#374151" : "transparent",
                }}
              >
                <div style={styles.avatarWrapper}>
                  <div style={styles.avatar}>{u.name[0].toUpperCase()}</div>
                  <span
                    style={{
                      ...styles.statusDot,
                      backgroundColor: isOnline ? "#22c55e" : "#6b7280",
                    }}
                  />
                </div>
                <span style={styles.userName}>{u.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.chatPanel}>
        {!selectedUser ? (
          <div style={styles.emptyState}>
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.avatar}>{selectedUser.name[0].toUpperCase()}</div>
              <div>
                <div style={styles.chatHeaderName}>{selectedUser.name}</div>
                <div style={styles.chatHeaderStatus}>
                  {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                </div>
              </div>
            </div>

            <div style={styles.messagesArea}>
              {messages.map((msg) => {
                const isMine = msg.sender === user._id;
                return (
                  <div
                    key={msg._id}
                    style={{
                      ...styles.bubbleRow,
                      justifyContent: isMine ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        ...styles.bubble,
                        backgroundColor: isMine ? "#4f46e5" : "#e5e7eb",
                        color: isMine ? "#ffffff" : "#1a1a1a",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isReceiverTyping && (
                <div style={styles.bubbleRow}>
                  <div style={{ ...styles.bubble, backgroundColor: "#e5e7eb", color: "#6b7280", fontStyle: "italic" }}>
                    typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={styles.inputBar}>
              <input
                type="text"
                placeholder="Type a message..."
                value={content}
                onChange={handleContentChange}
                style={styles.messageInput}
              />
              <button type="submit" style={styles.sendBtn}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "280px",
    backgroundColor: "#1f2937",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "16px",
    borderBottom: "1px solid #374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  myInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  myName: {
    fontWeight: "600",
    fontSize: "14px",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid #4b5563",
    color: "#d1d5db",
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "6px",
  },
  userList: {
    flex: 1,
    overflowY: "auto",
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    cursor: "pointer",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  statusDot: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    border: "2px solid #1f2937",
  },
  userName: {
    fontSize: "14px",
  },
  chatPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f0f2f5",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: "14px",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  chatHeaderName: {
    fontWeight: "600",
    fontSize: "15px",
  },
  chatHeaderStatus: {
    fontSize: "12px",
    color: "#6b7280",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  bubbleRow: {
    display: "flex",
  },
  bubble: {
    maxWidth: "60%",
    padding: "10px 14px",
    borderRadius: "14px",
    fontSize: "14px",
    wordBreak: "break-word",
  },
  inputBar: {
    display: "flex",
    gap: "10px",
    padding: "14px 20px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e5e7eb",
  },
  messageInput: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: "14px",
  },
  sendBtn: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "12px 22px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "14px",
  },
};

export default Chat;