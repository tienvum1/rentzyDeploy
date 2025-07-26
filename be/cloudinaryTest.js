const cloudinary = require('./utils/cloudinary');
const fs = require('fs');

async function testUpload() {
  try {
    const imageBuffer = fs.readFileSync('./logo512.png'); // Đặt 1 file ảnh test tại cùng thư mục
    const base64 = imageBuffer.toString('base64');
    
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64}`,
      { folder: 'rentzy/cccd' }
    );
    
    console.log('✅ Upload OK:', result.secure_url);
  } catch (err) {
    console.error('❌ Upload FAIL:', err);
  }
}

testUpload();
