const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const messageController = require("../controller/messageController");

// Gửi tin nhắn
router.post("/", protect, messageController.sendMessage);

// Lấy lịch sử chat giữa user và admin
router.get("/", protect, messageController.getMessages);

// Lấy danh sách user đã từng chat với admin
router.get("/all-users", protect, messageController.getAllChatUsers);

// Lấy danh sách user (trừ admin), phân trang, sort theo last message với admin, hỗ trợ search
router.get(
  "/all-users-paginate",
  protect,
  messageController.getAllUsersForAdmin
);

// Lấy admin gần nhất nhắn cho user, nếu chưa có thì random admin
router.get("/latest-admin", protect, messageController.getLatestAdminForUser);

module.exports = router;
