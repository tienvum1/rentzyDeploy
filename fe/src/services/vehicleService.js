import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4999/api';

// Service để tìm xe có sẵn trong thời gian người dùng chọn
export const searchAvailableVehicles = async (searchParams) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Thêm các tham số bắt buộc
    if (searchParams.pickupDate) queryParams.append('pickupDate', searchParams.pickupDate);
    if (searchParams.pickupTime) queryParams.append('pickupTime', searchParams.pickupTime);
    if (searchParams.returnDate) queryParams.append('returnDate', searchParams.returnDate);
    if (searchParams.returnTime) queryParams.append('returnTime', searchParams.returnTime);
    
    // Thêm các filter tùy chọn
    if (searchParams.brand) queryParams.append('brand', searchParams.brand);
    if (searchParams.seatCount) queryParams.append('seatCount', searchParams.seatCount);
    if (searchParams.bodyType) queryParams.append('bodyType', searchParams.bodyType);
    if (searchParams.transmission) queryParams.append('transmission', searchParams.transmission);
    if (searchParams.fuelType) queryParams.append('fuelType', searchParams.fuelType);
    if (searchParams.location) queryParams.append('location', searchParams.location);
    if (searchParams.minPrice) queryParams.append('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);
    if (searchParams.page) queryParams.append('page', searchParams.page);
    if (searchParams.limit) queryParams.append('limit', searchParams.limit);

    const response = await fetch(`${API_BASE_URL}/vehicles/search/available?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi tìm kiếm xe');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching available vehicles:', error);
    throw error;
  }
};

// Service để tìm xe theo thời gian (API đơn giản)
export const searchVehiclesByTime = async (timeParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/search/by-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pickupDate: timeParams.pickupDate,
        pickupTime: timeParams.pickupTime,
        returnDate: timeParams.returnDate,
        returnTime: timeParams.returnTime
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi tìm kiếm xe');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching vehicles by time:', error);
    throw error;
  }
};

// Service để lấy thống kê xe (cho filter)
export const getVehicleStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi lấy thống kê xe');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting vehicle stats:', error);
    throw error;
  }
};

// Service để lấy danh sách xe đã duyệt (cũ)
export const getApprovedVehicles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/approved`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi lấy danh sách xe');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting approved vehicles:', error);
    throw error;
  }
};

// Service để lấy chi tiết xe theo ID
export const getVehicleById = async (vehicleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi lấy thông tin xe');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting vehicle by ID:', error);
    throw error;
  }
};

// Service để lấy top xe được thuê nhiều nhất
export const getTopRentedVehicles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/top-rented`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi lấy top xe');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting top rented vehicles:', error);
    throw error;
  }
}; 

export const reviewBooking = async (bookingId, rating, review) => {
  const res = await axios.post(
    `${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}/review`,
    { rating, review },
    { withCredentials: true }
  );
  return res.data;
}; 