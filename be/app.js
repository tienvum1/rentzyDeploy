const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // phải là dòng đầu tiên!

const path = require("path");

const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const passport = require("passport");
require("./auth/auth");

// Lấy PORT và origin từ biến môi trường
const PORT = process.env.PORT || 4999;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

//routes
const authRoutes = require("./route/auth");
const userRoutes = require("./route/userRoutes");
const vehicleRoutes = require("./route/vehicleRoutes");
const ownerRoutes = require("./route/ownerRoutes");
const adminRoutes = require("./route/adminRoutes");
const chatBoxRoutes = require('./route/chatBoxRoute')

const bookingRoutes = require('./route/bookingRoutes');
const paymentRoutes = require('./route/paymentRoute');
const momoRoutes = require('./route/momoRoutes');

const notificationRoutes = require('./route/notificationRoutes');
const promotionRoutes = require('./route/promotionRoutes');
const reportRoutes = require('./route/reportRoutes');
const messageRoutes = require("./route/messageRoutes");
const Message = require("./models/Message");
const User = require("./models/User");


const app = express();

// Log toàn cục để debug mọi request
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

// Thay body-parser bằng express.json() và express.urlencoded()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});

app.use(cookieParser());

// Cấu hình CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(passport.initialize());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mongoose Connection (Centralized here)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
});

// Check connection events directly on mongoose.connection
mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);
mongoose.connection.once("open", function () {
  console.log("MongoDB connected successfully");
});

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/momo', momoRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/report', reportRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/chat' , chatBoxRoutes)



app.get("/hello", (req, res) => {
  res.send("Hello World");
});

// Serve static files (for locally stored images)
// Configure this only if you are saving images locally as implemented in vehicleController
app.use(
  "/uploads/vehicles",
  express.static(path.join(__dirname, "uploads", "vehicles"))
);

// Socket.io chat logic
io.on("connection", (socket) => {
  // Khi client join vào phòng chat với userId (user hoặc admin)
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  // Khi gửi tin nhắn
  socket.on("chatMessage", async ({ sender, receiver, content }) => {
    if (!sender || !receiver || !content) return;
    // Lưu vào DB
    const message = await Message.create({ sender, receiver, content });
    // Gửi realtime cho người nhận nếu đang online
    io.to(receiver).emit("chatMessage", {
      _id: message._id,
      sender,
      receiver,
      content,
      createdAt: message.createdAt,
    });
    // (Tùy chọn) Gửi lại cho người gửi để xác nhận
    io.to(sender).emit("chatMessage", {
      _id: message._id,
      sender,
      receiver,
      content,
      createdAt: message.createdAt,
    });
  });
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Thay app.listen bằng server.listen
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export io để sử dụng ở nơi khác nếu cần
module.exports = { app, io };
