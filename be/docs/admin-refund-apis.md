# Admin Refund APIs Documentation

## Tổng quan
Các API này cho phép admin quản lý và duyệt các yêu cầu hoàn tiền và bồi thường trong hệ thống Rentzy.

## Danh sách APIs

### 1. Lấy yêu cầu bồi thường owner pending
**Endpoint:** `GET /api/admin/owner-compensation-requests`

**Mô tả:** Lấy danh sách các booking có `refundStatusOwner = 'pending'` (chờ admin duyệt bồi thường cho chủ xe)

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng item per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalBookings": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Lấy yêu cầu hoàn tiền renter pending
**Endpoint:** `GET /api/admin/refund-requests`

**Mô tả:** Lấy danh sách các booking có `refundStatusRenter = 'pending'` (chờ admin duyệt hoàn tiền cho người thuê)

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng item per page (default: 10)

**Response:** Tương tự như API trên

### 3. Lấy tất cả yêu cầu pending (API mới)
**Endpoint:** `GET /api/admin/all-pending-refunds`

**Mô tả:** Lấy tất cả các booking có `refundStatusRenter = 'pending'` HOẶC `refundStatusOwner = 'pending'`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng item per page (default: 10)
- `type` (optional): Lọc theo loại
  - `'renter'`: Chỉ lấy yêu cầu hoàn tiền renter
  - `'owner'`: Chỉ lấy yêu cầu bồi thường owner
  - Không có: Lấy tất cả

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "booking_id",
        "renter": {...},
        "vehicle": {...},
        "pendingRequests": [
          {
            "type": "renter_refund",
            "amount": 500000,
            "createdAt": "2024-01-15T10:30:00Z",
            "description": "Hoàn tiền cho người thuê"
          },
          {
            "type": "owner_compensation",
            "amount": 200000,
            "createdAt": "2024-01-15T11:00:00Z",
            "description": "Bồi thường cho chủ xe"
          }
        ],
        // ... các field khác của booking
      }
    ],
    "pagination": {...},
    "summary": {
      "totalPendingRenterRefunds": 25,
      "totalPendingOwnerCompensations": 15
    }
  }
}
```

### 4. Duyệt bồi thường owner
**Endpoint:** `POST /api/admin/approve-owner-compensation/:bookingId`

**Body:**
```json
{
  "note": "Ghi chú của admin (optional)"
}
```

### 5. Duyệt hoàn tiền renter
**Endpoint:** `POST /api/admin/approve-refund/:bookingId`

**Body:**
```json
{
  "note": "Ghi chú của admin (optional)"
}
```

## Cách sử dụng

### Ví dụ lấy tất cả yêu cầu pending:
```javascript
// Lấy tất cả
GET /api/admin/all-pending-refunds?page=1&limit=20

// Chỉ lấy yêu cầu hoàn tiền renter
GET /api/admin/all-pending-refunds?type=renter

// Chỉ lấy yêu cầu bồi thường owner
GET /api/admin/all-pending-refunds?type=owner
```

### Ví dụ duyệt yêu cầu:
```javascript
// Duyệt bồi thường owner
POST /api/admin/approve-owner-compensation/64a1b2c3d4e5f6789
{
  "note": "Đã xác minh và duyệt bồi thường"
}

// Duyệt hoàn tiền renter
POST /api/admin/approve-refund/64a1b2c3d4e5f6789
{
  "note": "Đã xác minh và duyệt hoàn tiền"
}
```

## Lưu ý
- Tất cả các API này yêu cầu authentication và admin role
- Khi duyệt, hệ thống sẽ tự động:
  - Cập nhật trạng thái trong database
  - Tạo transaction tương ứng
  - Cập nhật ví người dùng (nếu cần)
  - Gửi thông báo cho user
- API `all-pending-refunds` cung cấp thông tin tổng hợp và phân loại rõ ràng các loại yêu cầu pending