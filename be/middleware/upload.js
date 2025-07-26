const multer = require('multer');

const storage = multer.memoryStorage(); // dùng memory để xử lý buffer với Cloudinary

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
