const nodemailer = require('nodemailer');

// Tạo transporter cho việc gửi email
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Hàm gửi email thông báo khóa tài khoản
const sendAccountBlockedEmail = async (userEmail, userName, reason) => {
  try {
    const transporter = createEmailTransporter();
    
    await transporter.sendMail({
      to: userEmail,
      subject: 'Tài khoản Rentzy của bạn đã bị khóa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1976d2; margin: 0;">Rentzy</h1>
          </div>
          <h2 style="color: #d32f2f; text-align: center;">Thông báo khóa tài khoản</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Chúng tôi xin thông báo rằng tài khoản của bạn trên hệ thống Rentzy đã bị tạm khóa bởi quản trị viên.</p>
          <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Lý do khóa tài khoản:</strong></p>
            <p style="margin: 5px 0 0 0; color: #d32f2f;">${reason}</p>
          </div>
          <p>Trong thời gian tài khoản bị khóa, bạn sẽ không thể:</p>
          <ul>
            <li>Đăng nhập vào hệ thống</li>
            <li>Thực hiện các giao dịch thuê xe</li>
            <li>Sử dụng các dịch vụ của Rentzy</li>
          </ul>
          <p>Nếu bạn cho rằng đây là nhầm lẫn hoặc cần hỗ trợ thêm, vui lòng liên hệ với bộ phận chăm sóc khách hàng của chúng tôi qua:</p>
          <ul>
            <li>Email: support@rentzy.com</li>
            <li>Hotline: 1900-xxxx</li>
          </ul>
          <p>Trân trọng,<br/><strong>Đội ngũ Rentzy</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      `
    });
    
    console.log(`Account blocked email sent successfully to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending account blocked email:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi email thông báo mở khóa tài khoản
const sendAccountUnblockedEmail = async (userEmail, userName) => {
  try {
    const transporter = createEmailTransporter();
    
    await transporter.sendMail({
      to: userEmail,
      subject: 'Tài khoản Rentzy của bạn đã được mở khóa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1976d2; margin: 0;">Rentzy</h1>
          </div>
          <h2 style="color: #4caf50; text-align: center;">Thông báo mở khóa tài khoản</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Chúng tôi xin thông báo rằng tài khoản của bạn trên hệ thống Rentzy đã được mở khóa và có thể sử dụng bình thường.</p>
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #4caf50; font-weight: bold;">🎉 Tài khoản của bạn đã được kích hoạt lại!</p>
          </div>
          <p>Bây giờ bạn có thể:</p>
          <ul>
            <li>Đăng nhập vào hệ thống</li>
            <li>Thuê xe và sử dụng các dịch vụ</li>
            <li>Truy cập đầy đủ các tính năng của Rentzy</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_ORIGIN}/login" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Đăng nhập ngay</a>
          </div>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của Rentzy. Chúng tôi mong muốn mang đến cho bạn những trải nghiệm tốt nhất.</p>
          <p>Trân trọng,<br/><strong>Đội ngũ Rentzy</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      `
    });
    
    console.log(`Account unblocked email sent successfully to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending account unblocked email:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi email cảnh báo trước khi khóa tài khoản
const sendAccountWarningEmail = async (userEmail, userName, warningReason, warningCount = 1) => {
  try {
    const transporter = createEmailTransporter();
    
    await transporter.sendMail({
      to: userEmail,
      subject: `Cảnh báo vi phạm tài khoản Rentzy - Lần ${warningCount}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1976d2; margin: 0;">Rentzy</h1>
          </div>
          <h2 style="color: #ff9800; text-align: center;">⚠️ Cảnh báo vi phạm tài khoản</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Chúng tôi phát hiện tài khoản của bạn có hành vi vi phạm chính sách sử dụng dịch vụ Rentzy.</p>
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <p style="margin: 0;"><strong>Lý do cảnh báo:</strong></p>
            <p style="margin: 5px 0 0 0; color: #e65100;">${warningReason}</p>
            <p style="margin: 10px 0 0 0; font-weight: bold;">Đây là cảnh báo lần thứ ${warningCount}</p>
          </div>
          <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #d32f2f;">Lưu ý quan trọng:</p>
            <ul style="margin: 10px 0 0 0; color: #d32f2f;">
              <li>Nếu tiếp tục vi phạm, tài khoản của bạn có thể bị khóa tạm thời hoặc vĩnh viễn</li>
              <li>Vui lòng tuân thủ nghiêm ngặt các quy định của Rentzy</li>
              <li>Đọc kỹ điều khoản sử dụng dịch vụ</li>
            </ul>
          </div>
          <p>Để tránh bị khóa tài khoản, vui lòng:</p>
          <ul>
            <li>Tuân thủ đầy đủ các quy định của Rentzy</li>
            <li>Sử dụng dịch vụ một cách có trách nhiệm</li>
            <li>Liên hệ hỗ trợ nếu có thắc mắc về chính sách</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_ORIGIN}/terms" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Xem điều khoản sử dụng</a>
          </div>
          <p>Nếu bạn có thắc mắc, vui lòng liên hệ:</p>
          <ul>
            <li>Email: support@rentzy.com</li>
            <li>Hotline: 1900-xxxx</li>
          </ul>
          <p>Trân trọng,<br/><strong>Đội ngũ Rentzy</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      `
    });
    
    console.log(`Account warning email sent successfully to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending account warning email:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi email thông báo tài khoản bị khóa tạm thời
const sendTemporaryBlockEmail = async (userEmail, userName, reason, unblockDate) => {
  try {
    const transporter = createEmailTransporter();
    const unblockDateFormatted = new Date(unblockDate).toLocaleDateString('vi-VN');
    
    await transporter.sendMail({
      to: userEmail,
      subject: 'Tài khoản Rentzy của bạn đã bị khóa tạm thời',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1976d2; margin: 0;">Rentzy</h1>
          </div>
          <h2 style="color: #ff5722; text-align: center;">Thông báo khóa tài khoản tạm thời</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Tài khoản của bạn trên hệ thống Rentzy đã bị khóa tạm thời do vi phạm chính sách sử dụng.</p>
          <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Lý do khóa tài khoản:</strong></p>
            <p style="margin: 5px 0 0 0; color: #d32f2f;">${reason}</p>
          </div>
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #1976d2;">📅 Tài khoản sẽ được mở khóa vào: ${unblockDateFormatted}</p>
          </div>
          <p>Trong thời gian bị khóa, bạn sẽ không thể sử dụng các dịch vụ của Rentzy.</p>
          <p>Sau khi được mở khóa, vui lòng tuân thủ nghiêm ngặt các quy định để tránh bị khóa lại.</p>
          <p>Nếu có thắc mắc, vui lòng liên hệ hỗ trợ:</p>
          <ul>
            <li>Email: support@rentzy.com</li>
            <li>Hotline: 1900-xxxx</li>
          </ul>
          <p>Trân trọng,<br/><strong>Đội ngũ Rentzy</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      `
    });
    
    console.log(`Temporary block email sent successfully to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending temporary block email:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi email thông báo chung cho tài khoản
const sendAccountStatusEmail = async (userEmail, userName, action, reason = null) => {
  if (action === 'block') {
    return await sendAccountBlockedEmail(userEmail, userName, reason);
  } else if (action === 'unblock') {
    return await sendAccountUnblockedEmail(userEmail, userName);
  } else {
    throw new Error('Invalid action. Use "block" or "unblock"');
  }
};

module.exports = {
  createEmailTransporter,
  sendAccountBlockedEmail,
  sendAccountUnblockedEmail,
  sendAccountWarningEmail,
  sendTemporaryBlockEmail,
  sendAccountStatusEmail
};