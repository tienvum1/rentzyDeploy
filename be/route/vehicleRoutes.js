const express = require('express');
const router = express.Router();
const vehicleController = require('../controller/vehicleController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // Assuming you have an auth middleware
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory for processing
const upload = multer({ storage: storage }); // Keep storage config

// Route to get vehicles owned by the authenticated user
router.get('/owner', protect, vehicleController.getOwnerVehicles);
router.get('/ownerVehicles/:ownerId', vehicleController.getVehiclesByOwnerId);

// top 100 xe thuê nhiều nhất  hiển thị cho homepage
router.get('/top-rented', vehicleController.getTopRentedVehicles);

// Route lấy danh sách xe đã duyệt
router.get('/approved', vehicleController.getApprovedVehicles);


// Route tìm xe theo thời gian (API đơn giản)
router.post('/search/by-time', vehicleController.searchVehicles);


// tạo xe 
router.post(
  '/add',
  protect,
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'additional_images', maxCount: 10 },
    { name: 'vehicleDocument', maxCount: 1 }
  ]),
  vehicleController.addVehicle
);

// Route lấy xe theo id (phải để sau các route cụ thể)
router.get('/:id', vehicleController.getVehicleById);

// Route cập nhật trạng thái xe (khoá/mở khoá)
router.put('/:id/status', protect, vehicleController.updateVehicleStatus);

// Route to update a vehicle
router.put(
  '/:id',
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'additional_images', maxCount: 10 },
    { name: 'vehicleDocument', maxCount: 1 }
  ]),
  vehicleController.updateVehicle
);

module.exports = router;