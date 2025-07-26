import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import SidebarAdmin from "../../../components/SidebarAdmin/SidebarAdmin";
import "./AdminChatPage.css";
// import "../adminDashboard/AdminDashboard.css";
import { useAuth } from "../../../context/AuthContext";
import { FaSearch, FaPaperPlane, FaUserCircle } from "react-icons/fa";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4999";

const AdminChatPage = () => {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef();
  const adminId = adminUser?._id;
  const messagesEndRef = useRef(null);
  const [unreadMap, setUnreadMap] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");

  // Kết nối socket
  useEffect(() => {
    if (!adminId) return;
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    socketRef.current.emit("join", adminId);
    return () => {
      socketRef.current.disconnect();
    };
  }, [adminId]);

  // Lắng nghe tin nhắn realtime
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (msg) => {
      if (
        (msg.sender === adminId && msg.receiver === selectedUser?._id) ||
        (msg.sender === selectedUser?._id && msg.receiver === adminId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      if (
        msg.sender !== adminId &&
        (!selectedUser || msg.sender !== selectedUser._id)
      ) {
        setUnreadMap((prev) => ({ ...prev, [msg.sender]: true }));
      }
    };
    socketRef.current.on("chatMessage", handler);
    return () => {
      socketRef.current.off("chatMessage", handler);
    };
  }, [adminId, selectedUser]);

  // Lấy danh sách user phân trang, search
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axios.get(
          `/api/messages/all-users-paginate?page=${pagination.page}&limit=${
            pagination.limit
          }&search=${encodeURIComponent(search)}`,
          { withCredentials: true }
        );
        setUsers(res.data.users);
        setPagination((p) => ({ ...p, total: res.data.total }));
        const unread = {};
        res.data.users.forEach((u) => {
          if (
            u.lastMessage &&
            u.lastMessage.sender !== adminId &&
            (!selectedUser || selectedUser._id !== u._id)
          ) {
            unread[u._id] = true;
          }
        });
        setUnreadMap(unread);
      } catch (err) {
        setUsers([]);
        setUnreadMap({});
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [pagination.page, pagination.limit, search, selectedUser, adminId]);

  // Lấy lịch sử chat với user được chọn
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      setLoadingMessages(true);
      try {
        const res = await axios.get(
          `/api/messages?userId=${selectedUser._id}`,
          { withCredentials: true }
        );
        setMessages(res.data);
      } catch (err) {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Khi chọn user thì clear badge đỏ
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUnreadMap((prev) => ({ ...prev, [user._id]: false }));
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUser || !adminId) return;
    socketRef.current.emit("chatMessage", {
      sender: adminId,
      receiver: selectedUser._id,
      content: newMessage,
    });
    setNewMessage("");
  };

  return (
    <div className="admin-chat-layout">
      <SidebarAdmin />
      <div className="admin-chat-content">
        <div
          style={{
            display: "flex",
            height: "90vh",
            background: "#f8fafc",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Sidebar user */}
          <div className="admin-chat-sidebar">
            <div className="admin-chat-sidebar-search">
              <FaSearch style={{ color: "#888" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                placeholder="Tìm kiếm khách hàng..."
              />
            </div>
            <div className="admin-chat-user-list">
              {loadingUsers ? (
                <div
                  style={{ textAlign: "center", marginTop: 40, color: "#888" }}
                >
                  Đang tải...
                </div>
              ) : users.length === 0 ? (
                <div
                  style={{ textAlign: "center", marginTop: 40, color: "#888" }}
                >
                  Không tìm thấy khách hàng
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className={`admin-chat-user-item${
                      selectedUser?._id === user._id ? " selected" : ""
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="admin-chat-user-info">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="admin-chat-user-avatar"
                        />
                      ) : (
                        <FaUserCircle size={36} color="#cbd5e1" />
                      )}
                      <div className="admin-chat-user-details">
                        <div className="admin-chat-user-name">{user.name}</div>
                        <div className="admin-chat-user-email">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    {unreadMap[user._id] && (
                      <span className="admin-chat-unread-dot"></span>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            <div className="admin-chat-pagination">
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    page: Math.max(1, p.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                style={{
                  marginRight: 8,
                  border: "none",
                  background: "none",
                  color: "#6366f1",
                  fontSize: 18,
                  cursor: "pointer",
                  opacity: pagination.page === 1 ? 0.5 : 1,
                }}
              >
                &lt;
              </button>
              <span style={{ fontSize: 14 }}>
                Trang {pagination.page} /{" "}
                {Math.ceil(pagination.total / pagination.limit) || 1}
              </span>
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    page: Math.min(
                      Math.ceil(pagination.total / pagination.limit),
                      p.page + 1
                    ),
                  }))
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.limit)
                }
                style={{
                  marginLeft: 8,
                  border: "none",
                  background: "none",
                  color: "#6366f1",
                  fontSize: 18,
                  cursor: "pointer",
                  opacity:
                    pagination.page >=
                    Math.ceil(pagination.total / pagination.limit)
                      ? 0.5
                      : 1,
                }}
              >
                &gt;
              </button>
            </div>
          </div>
          {/* Khung chat */}
          <div className="admin-chat-content">
            {/* Header user */}
            <div className="admin-chat-header">
              {selectedUser ? (
                <div className="admin-chat-header-user">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.name}
                      className="admin-chat-header-avatar"
                    />
                  ) : (
                    <FaUserCircle size={40} color="#cbd5e1" />
                  )}
                  <div className="admin-chat-header-details">
                    <div className="admin-chat-header-name">
                      {selectedUser.name}
                    </div>
                    <div className="admin-chat-header-email">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "#888", fontSize: 16 }}>
                  Chọn khách hàng để bắt đầu chat
                </div>
              )}
            </div>
            {/* Nội dung chat */}
            <div className="admin-chat-messages">
              {loadingMessages ? (
                <div
                  style={{ textAlign: "center", color: "#888", marginTop: 40 }}
                >
                  Đang tải tin nhắn...
                </div>
              ) : selectedUser ? (
                messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#888",
                      marginTop: 40,
                    }}
                  >
                    Chưa có tin nhắn nào
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`admin-chat-message-row${
                        (msg.sender?._id || msg.sender) === adminId
                          ? " admin"
                          : " user"
                      }`}
                    >
                      {(msg.sender?._id || msg.sender) !== adminId &&
                        (msg.sender?.avatar_url ? (
                          <img
                            src={msg.sender.avatar_url}
                            alt={msg.sender.name}
                            className="admin-chat-message-avatar"
                          />
                        ) : (
                          <FaUserCircle size={32} color="#cbd5e1" />
                        ))}
                      <div className="admin-chat-message-bubble">
                        {msg.content}
                      </div>
                      {(msg.sender?._id || msg.sender) === adminId &&
                        (adminUser?.avatar_url ? (
                          <img
                            src={adminUser.avatar_url}
                            alt={adminUser.name}
                            className="admin-chat-message-avatar"
                          />
                        ) : (
                          <FaUserCircle size={32} color="#cbd5e1" />
                        ))}
                    </div>
                  ))
                )
              ) : (
                <div
                  style={{ textAlign: "center", color: "#888", marginTop: 40 }}
                >
                  Chọn khách hàng để bắt đầu chat
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Nhập tin nhắn */}
            {selectedUser && (
              <div className="admin-chat-input-area">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="admin-chat-input"
                  placeholder="Nhập tin nhắn..."
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loadingMessages}
                />
                <button
                  onClick={handleSend}
                  className="admin-chat-send-btn"
                  disabled={!newMessage.trim() || loadingMessages}
                >
                  <FaPaperPlane /> Gửi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
