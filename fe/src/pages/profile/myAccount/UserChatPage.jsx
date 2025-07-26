import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  FaPaperPlane,
  FaUserShield,
  FaUserCircle,
  FaComments,
} from "react-icons/fa";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4999";

const UserChatPage = () => {
  const { user } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const [open, setOpen] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  // Lấy admin gần nhất nhắn cho user
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(
          `/api/messages/latest-admin?userId=${user._id}`,
          {
            withCredentials: true,
          }
        );
        setAdmin(res.data.admin);
      } catch (err) {
        setAdmin(null);
      }
    };
    if (user?._id) fetchAdmin();
  }, [user?._id]);

  // Kết nối socket
  useEffect(() => {
    if (!user?._id) return;
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    socketRef.current.emit("join", user._id);
    return () => {
      socketRef.current.disconnect();
    };
  }, [user?._id]);

  // Lấy lịch sử chat với admin
  useEffect(() => {
    if (!open) return;
    const fetchMessages = async () => {
      if (!admin || !user?._id) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/messages?userId=${user._id}`, {
          withCredentials: true,
        });
        setMessages(res.data);
      } catch (err) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [admin, user?._id, open]);

  // Lắng nghe tin nhắn realtime
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (msg) => {
      // Nếu là tin nhắn từ admin gửi cho user
      if (
        (msg.sender?._id || msg.sender) === admin?._id &&
        (msg.receiver?._id || msg.receiver) === user._id
      ) {
        setMessages((prev) => [...prev, msg]);
        setUnread(true);
      }
      // Nếu là tin nhắn user gửi
      if (
        (msg.sender?._id || msg.sender) === user._id &&
        (msg.receiver?._id || msg.receiver) === admin?._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socketRef.current.on("chatMessage", handler);
    return () => {
      socketRef.current.off("chatMessage", handler);
    };
  }, [admin, user?._id]);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!newMessage.trim() || !admin || !user?._id) return;
    socketRef.current.emit("chatMessage", {
      sender: user._id,
      receiver: admin._id,
      content: newMessage,
    });
    setNewMessage("");
  };

  return (
    <>
      {/* Button nổi */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 32,
          bottom: 32,
          zIndex: 1000,
          background: "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          cursor: "pointer",
        }}
      >
        <FaComments />
        {unread && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "red",
              display: "inline-block",
              border: "2px solid #fff",
            }}
          ></span>
        )}
      </button>
      {/* Popup chat */}
      {open && (
        <div
          style={{
            position: "fixed",
            right: 32,
            bottom: 110,
            zIndex: 1001,
            width: 360,
            maxWidth: "95vw",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: 480,
          }}
        >
          {/* Header */}
          <div
            style={{
              height: 56,
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              background: "#f3f4f6",
              minHeight: 56,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {admin ? (
                admin.avatar_url ? (
                  <img
                    src={admin.avatar_url}
                    alt={admin.name}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                ) : (
                  <FaUserShield size={32} color="#6366f1" />
                )
              ) : (
                <FaUserShield size={32} color="#6366f1" />
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Admin</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: 22,
                color: "#888",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </div>
          {/* Nội dung chat */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: "#f8fafc",
            }}
          >
            {loading ? (
              <div
                style={{ textAlign: "center", color: "#888", marginTop: 40 }}
              >
                Đang tải tin nhắn...
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{ textAlign: "center", color: "#888", marginTop: 40 }}
              >
                Chưa có tin nhắn nào
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    display: "flex",
                    justifyContent:
                      (msg.sender?._id || msg.sender) === user._id
                        ? "flex-end"
                        : "flex-start",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  {(msg.sender?._id || msg.sender) !== user._id &&
                    (admin?.avatar_url ? (
                      <img
                        src={admin.avatar_url}
                        alt={admin.name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #e5e7eb",
                        }}
                      />
                    ) : (
                      <FaUserShield size={28} color="#6366f1" />
                    ))}
                  <div
                    style={{
                      background:
                        (msg.sender?._id || msg.sender) === user._id
                          ? "#6366f1"
                          : "#fff",
                      color:
                        (msg.sender?._id || msg.sender) === user._id
                          ? "#fff"
                          : "#222",
                      padding: "8px 14px",
                      borderRadius: 16,
                      maxWidth: "65%",
                      fontSize: 14,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    {msg.content}
                  </div>
                  {(msg.sender?._id || msg.sender) === user._id &&
                    (user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #e5e7eb",
                        }}
                      />
                    ) : (
                      <FaUserCircle size={28} color="#cbd5e1" />
                    ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Nhập tin nhắn */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #e5e7eb",
              background: "#fff",
              padding: 12,
              gap: 8,
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                background: "#f3f4f6",
              }}
              placeholder="Nhập tin nhắn..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              style={{
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                opacity: newMessage.trim() ? 1 : 0.7,
              }}
              disabled={!newMessage.trim() || loading}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserChatPage;
