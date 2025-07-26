const Message = require("../models/Message");
const User = require("../models/User");

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const sender = req.user._id;
    if (!receiver || !content) {
      return res.status(400).json({ message: "Missing receiver or content" });
    }
    const message = await Message.create({ sender, receiver, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy lịch sử chat giữa user và admin
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }
    // Lấy danh sách tất cả adminId
    const adminUsers = await User.find(
      { role: { $elemMatch: { $eq: "admin" } } },
      "_id"
    );
    const adminIds = adminUsers.map((u) => u._id);
    // Lấy tin nhắn giữa userId và bất kỳ admin nào
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: { $in: adminIds } },
        { sender: { $in: adminIds }, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email role")
      .populate("receiver", "name email role");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy danh sách user đã từng chat với admin
exports.getAllChatUsers = async (req, res) => {
  try {
    // Giả định admin có userId là ADMIN_ID (hoặc lấy từ env/config)
    const ADMIN_ID = process.env.ADMIN_ID || "admin";
    // Lấy tất cả các user đã từng gửi hoặc nhận tin nhắn với admin
    const users = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: ADMIN_ID }, { receiver: ADMIN_ID }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", ADMIN_ID] }, "$receiver", "$sender"],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $replaceRoot: { newRoot: "$user" },
      },
    ]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy tất cả user (trừ admin) kèm tin nhắn mới nhất với admin
exports.getAllUsersWithLastMessage = async (req, res) => {
  try {
    const ADMIN_ID = process.env.ADMIN_ID || "admin";
    // Lấy tất cả user (trừ admin)
    const users = await User.find({ _id: { $ne: ADMIN_ID } }, "_id name email");
    // Lấy tin nhắn mới nhất giữa admin và từng user
    const userIds = users.map((u) => u._id);
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: ADMIN_ID, receiver: { $in: userIds } },
            { sender: { $in: userIds }, receiver: ADMIN_ID },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", ADMIN_ID] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);
    // Map last message về từng user
    const userList = users.map((user) => {
      const lastMsgObj = lastMessages.find(
        (m) => String(m._id) === String(user._id)
      );
      return {
        ...user.toObject(),
        lastMessage: lastMsgObj ? lastMsgObj.lastMessage : null,
      };
    });
    // Sort theo thời gian tin nhắn mới nhất (null xuống cuối)
    userList.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
    });
    res.json(userList);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy danh sách user (trừ admin), phân trang, sort theo last message với bất kỳ admin nào, hỗ trợ search
exports.getAllUsersForAdmin = async (req, res) => {
  try {
    // Lấy danh sách tất cả adminId
    const adminUsers = await User.find(
      { role: { $elemMatch: { $eq: "admin" } } },
      "_id"
    );
    const adminIds = adminUsers.map((u) => u._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Query user: chỉ lấy user có role chứa 'renter'
    const userQuery = {
      role: { $all: ["renter"], $not: { $elemMatch: { $eq: "admin" } } },
      name: { $regex: search, $options: "i" },
    };
    const total = await User.countDocuments(userQuery);
    const users = await User.find(userQuery, "_id name email")
      .skip(skip)
      .limit(limit);
    const userIds = users.map((u) => u._id);
    // Lấy last message giữa user và bất kỳ admin nào
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: { $in: adminIds }, receiver: { $in: userIds } },
            { sender: { $in: userIds }, receiver: { $in: adminIds } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $in: ["$sender", adminIds] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);
    // Map last message về từng user
    const userList = users.map((user) => {
      const lastMsgObj = lastMessages.find(
        (m) => String(m._id) === String(user._id)
      );
      return {
        ...user.toObject(),
        lastMessage: lastMsgObj ? lastMsgObj.lastMessage : null,
      };
    });
    // Sort theo thời gian tin nhắn mới nhất (null xuống cuối)
    userList.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
    });
    res.json({
      users: userList,
      total,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy admin gần nhất nhắn cho user, nếu chưa có thì random admin
exports.getLatestAdminForUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }
    // Lấy danh sách tất cả adminId
    const adminUsers = await User.find(
      { role: { $elemMatch: { $eq: "admin" } } },
      "_id name email avatar_url"
    );
    const adminIds = adminUsers.map((u) => u._id);
    // Tìm tin nhắn mới nhất từ bất kỳ admin nào gửi cho user này
    const lastMsg = await Message.findOne({
      sender: { $in: adminIds },
      receiver: userId,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "_id name email avatar_url");
    let admin = null;
    if (lastMsg) {
      admin = lastMsg.sender;
    } else {
      // Nếu chưa có admin nào nhắn, random 1 admin
      if (adminUsers.length > 0) {
        admin = adminUsers[Math.floor(Math.random() * adminUsers.length)];
      }
    }
    if (!admin) {
      return res.status(404).json({ message: "No admin found" });
    }
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
