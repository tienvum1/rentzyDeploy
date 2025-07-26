# Email Service Documentation

Email service cho hệ thống Rentzy, cung cấp các hàm gửi email thông báo liên quan đến trạng thái tài khoản người dùng.

## Cấu hình

Đảm bảo các biến môi trường sau đã được thiết lập trong file `.env`:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
CLIENT_ORIGIN=http://localhost:3000
```

## Các hàm có sẵn

### 1. `sendAccountBlockedEmail(userEmail, userName, reason)`

Gửi email thông báo tài khoản bị khóa vĩnh viễn.

**Tham số:**
- `userEmail` (string): Email của người dùng
- `userName` (string): Tên người dùng
- `reason` (string): Lý do khóa tài khoản

**Ví dụ sử dụng:**
```javascript
const { sendAccountBlockedEmail } = require('../utils/emailService');

try {
  await sendAccountBlockedEmail(
    'user@example.com', 
    'Nguyễn Văn A', 
    'Vi phạm chính sách sử dụng dịch vụ'
  );
  console.log('Email sent successfully');
} catch (error) {
  console.error('Failed to send email:', error);
}
```

### 2. `sendAccountUnblockedEmail(userEmail, userName)`

Gửi email thông báo tài khoản được mở khóa.

**Tham số:**
- `userEmail` (string): Email của người dùng
- `userName` (string): Tên người dùng

**Ví dụ sử dụng:**
```javascript
const { sendAccountUnblockedEmail } = require('../utils/emailService');

await sendAccountUnblockedEmail('user@example.com', 'Nguyễn Văn A');
```

### 3. `sendAccountWarningEmail(userEmail, userName, warningReason, warningCount)`

Gửi email cảnh báo vi phạm trước khi khóa tài khoản.

**Tham số:**
- `userEmail` (string): Email của người dùng
- `userName` (string): Tên người dùng
- `warningReason` (string): Lý do cảnh báo
- `warningCount` (number, optional): Số lần cảnh báo (mặc định: 1)

**Ví dụ sử dụng:**
```javascript
const { sendAccountWarningEmail } = require('../utils/emailService');

await sendAccountWarningEmail(
  'user@example.com', 
  'Nguyễn Văn A', 
  'Sử dụng ngôn từ không phù hợp trong tin nhắn', 
  2
);
```

### 4. `sendTemporaryBlockEmail(userEmail, userName, reason, unblockDate)`

Gửi email thông báo tài khoản bị khóa tạm thời.

**Tham số:**
- `userEmail` (string): Email của người dùng
- `userName` (string): Tên người dùng
- `reason` (string): Lý do khóa tạm thời
- `unblockDate` (Date): Ngày mở khóa

**Ví dụ sử dụng:**
```javascript
const { sendTemporaryBlockEmail } = require('../utils/emailService');

const unblockDate = new Date();
unblockDate.setDate(unblockDate.getDate() + 7); // Khóa 7 ngày

await sendTemporaryBlockEmail(
  'user@example.com', 
  'Nguyễn Văn A', 
  'Vi phạm quy định về thanh toán', 
  unblockDate
);
```

### 5. `sendAccountStatusEmail(userEmail, userName, action, reason)`

Hàm tổng quát để gửi email thông báo trạng thái tài khoản.

**Tham số:**
- `userEmail` (string): Email của người dùng
- `userName` (string): Tên người dùng
- `action` (string): Hành động ('block' hoặc 'unblock')
- `reason` (string, optional): Lý do (chỉ cần khi action = 'block')

**Ví dụ sử dụng:**
```javascript
const { sendAccountStatusEmail } = require('../utils/emailService');

// Khóa tài khoản
await sendAccountStatusEmail(
  'user@example.com', 
  'Nguyễn Văn A', 
  'block', 
  'Vi phạm điều khoản sử dụng'
);

// Mở khóa tài khoản
await sendAccountStatusEmail(
  'user@example.com', 
  'Nguyễn Văn A', 
  'unblock'
);
```

## Xử lý lỗi

Tất cả các hàm đều trả về object với cấu trúc:

```javascript
// Thành công
{ success: true }

// Thất bại
{ success: false, error: 'Error message' }
```

**Ví dụ xử lý lỗi:**
```javascript
const result = await sendAccountBlockedEmail(email, name, reason);

if (result.success) {
  console.log('Email sent successfully');
} else {
  console.error('Failed to send email:', result.error);
}
```

## Sử dụng trong Controller

**Trong adminController.js:**
```javascript
// Thay vì code trực tiếp nodemailer
try {
  const { sendAccountStatusEmail } = require('../utils/emailService');
  await sendAccountStatusEmail(user.email, user.name, action, reason);
} catch (emailError) {
  console.error('Error sending email:', emailError);
  // Không throw error để không ảnh hưởng đến logic chính
}
```

## Template Email

Tất cả email đều sử dụng template HTML responsive với:
- Logo Rentzy
- Màu sắc phù hợp với từng loại thông báo
- Thông tin liên hệ hỗ trợ
- Link đến trang chủ (cho email mở khóa)
- Thiết kế mobile-friendly

## Lưu ý

1. **Bảo mật**: Không bao giờ log email và password trong production
2. **Rate limiting**: Gmail có giới hạn số email gửi mỗi ngày
3. **Error handling**: Luôn wrap trong try-catch và không để lỗi email ảnh hưởng đến logic chính
4. **Template**: Có thể tùy chỉnh template HTML trong từng hàm nếu cần
5. **Environment**: Đảm bảo `CLIENT_ORIGIN` được set đúng cho từng môi trường (dev/staging/prod)

## Mở rộng

Để thêm loại email mới:

1. Tạo hàm mới trong `emailService.js`
2. Thiết kế template HTML phù hợp
3. Export hàm trong module.exports
4. Cập nhật documentation này
5. Test kỹ trước khi deploy