import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ChatChooseCar = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "chatai",
      text: "Chào bạn! Bạn muốn tìm loại xe nào?",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const popupRef = useRef(null);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // close popup when click outside :
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // call chat ai api when customer send new message :
  const handleSend = async () => {
    // push customer's message to array :
    setMessages([
      ...messages,
      {
        sender: "user",
        text: newMessage,
      },
    ]);
    messages.push({
      sender: "user",
      text: newMessage,
    });
    // clear input :
    setNewMessage("");
    // call chatbox api :
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/chat/suggestCar`,
      {
        message: newMessage,
      }
    );
    // response :
    console.log("response : ", response.data);
    if (Array.isArray(response.data)) {
      // if it is a response for suggested car :
      setMessages([
        ...messages,
        {
          sender: "chatai",
          text: "Here some cars base on your request :",
          suggestedList: response.data,
        },
      ]);
    } else {
      // if it is a response for unrelative question :
      setMessages([
        ...messages,
        {
          sender: "chatai",
          text: response.data.text,
        },
      ]);
    }
  };

  return (
    <>
      {/* Button nổi */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 32,
          bottom: 120,
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
        <FaRobot />
      </button>

      {/* Popup chat */}
      {open && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            right: 32,
            bottom: 120,
            zIndex: 1001,
            width: 360,
            maxWidth: "95vw",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            overflow: "hidden",
            display: "flex",
            justifyContent: "space-between",
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
              <img
                src={
                  "https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
                }
                alt={"chatAI"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #e5e7eb",
                }}
              />

              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>ChatAI</div>
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
              padding: "16px 12px",
              overflowY: "auto",
              background: "#f9fafb",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    background: msg.sender === "user" ? "#6366f1" : "#e5e7eb",
                    color: msg.sender === "user" ? "#fff" : "#111827",
                    padding: "10px 14px",
                    borderRadius: 16,
                    maxWidth: "70%",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.suggestedList ? (
                    <CarList cars={msg.suggestedList} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Nhập tin nhắn */}
          <div
            style={{
              backgroundColor: "#f3f4f6",
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
              disabled={!newMessage.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatChooseCar;

const CarList = ({ cars }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {cars.map((car) => (
        <div
          key={car._id}
          onClick={() => navigate(`/vehicles/${car._id}`)}
          className="cursor-pointer bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4"
        >
          <div className="text-blue-700 font-semibold text-lg mb-1">
            {car.brand}
          </div>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Location:</strong> {car.location}
            </p>
            <p>
              <strong>Fuel:</strong> {car.fuelType}
            </p>
            <p>
              <strong>Seats:</strong> {car.seatCount}
            </p>
            <p className="font-bold text-gray-800 mt-1">
              {car.pricePerDay.toLocaleString()} VND/day
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
