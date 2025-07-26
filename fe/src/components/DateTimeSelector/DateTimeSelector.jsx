import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import TimePicker from 'react-time-picker';
import { toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import "react-toastify/dist/ReactToastify.css";
import './DateTimeSelector.css'; // Assuming some basic styling

const DateTimeSelector = ({ bookedDates, onDateTimeChange, initialStartDate, initialEndDate, initialPickupTime, initialReturnTime, disableBookedRanges }) => {
    const [startDate, setStartDate] = useState(initialStartDate ? new Date(initialStartDate) : null);
    const [endDate, setEndDate] = useState(initialEndDate ? new Date(initialEndDate) : null);
    const [pickupTime, setPickupTime] = useState(initialPickupTime || null);
    const [returnTime, setReturnTime] = useState(initialReturnTime || null);
    const [selectedPickupSlot, setSelectedPickupSlot] = useState(null);
    const [selectedReturnSlot, setSelectedReturnSlot] = useState(null);

    const handleConfirm = () => {
        if (!startDate || !endDate) {
            toast.error('Vui lòng chọn ngày nhận và trả xe');
            return;
        }

        if (!pickupTime || !returnTime) {
            toast.error('Vui lòng chọn giờ nhận và trả xe');
            return;
        }

        // Validate date range
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        const [startHours, startMinutes] = pickupTime.split(':').map(Number);
        const [endHours, endMinutes] = returnTime.split(':').map(Number);

        startDateTime.setHours(startHours, startMinutes, 0, 0);
        endDateTime.setHours(endHours, endMinutes, 0, 0);

        if (endDateTime <= startDateTime) {
            toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }

        // Format dates in YYYY-MM-DD format
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        onDateTimeChange({
            startDate: formatDate(startDateTime),
            endDate: formatDate(endDateTime),
            pickupTime: pickupTime,
            returnTime: returnTime
        });
    };

    const isDateAvailable = useCallback((date) => {
        if (!date) return false;

        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);

        // Kiểm tra ngày trong quá khứ
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (currentDate < today) {
            return false;
        }

        if (!bookedDates || bookedDates.length === 0) return true;

        // Nếu disableBookedRanges, disable hoàn toàn các ngày đã bị đặt
        if (disableBookedRanges) {
            for (const booking of bookedDates) {
                const bookingStart = new Date(booking.startDateTime || booking.startDate);
                const bookingEnd = new Date(booking.endDateTime || booking.endDate);
                if (currentDate >= bookingStart && currentDate <= bookingEnd) {
                    return false;
                }
            }
        }

        // Kiểm tra từng booking
        for (const booking of bookedDates) {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            
            // Nếu ngày hiện tại nằm trong khoảng thời gian booking
            if (currentDate >= bookingStart && currentDate <= bookingEnd) {
                // Lấy giờ bắt đầu và kết thúc của booking
                const [startHour] = booking.pickupTime.split(':').map(Number);
                const [endHour] = booking.returnTime.split(':').map(Number);
                
                // Nếu booking kéo dài cả ngày (từ 00:00 đến 23:59)
                if (startHour === 0 && endHour === 23) {
                    return false;
                }
                
                // Nếu booking chỉ trong một khoảng thời gian cụ thể
                // Chúng ta vẫn cho phép chọn ngày này, nhưng sẽ hiển thị icon
                return true;
            }
        }
        return true;
    }, [bookedDates, disableBookedRanges]);

    const getDateClassName = useCallback((date) => {
        if (!isDateAvailable(date)) {
            return 'disabled-date';
        }

        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);

        // Kiểm tra xem ngày này có booking nào không
        const hasBooking = bookedDates?.some(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return currentDate >= bookingStart && currentDate <= bookingEnd;
        });

        if (hasBooking) {
            return 'has-booking';
        }

        return '';
    }, [bookedDates, isDateAvailable]);

    // Thêm hàm để lấy thông tin booking cho một ngày cụ thể
    const getBookingInfoForDate = useCallback((date) => {
        if (!bookedDates || bookedDates.length === 0) return null;

        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);

        return bookedDates.find(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return currentDate >= bookingStart && currentDate <= bookingEnd;
        });
    }, [bookedDates]);

    // Thêm component để hiển thị thông tin booking
    const BookingInfo = ({ date }) => {
        const booking = getBookingInfoForDate(date);
        if (!booking) return null;

        return (
            <div className="booking-info">
                <span className="booking-time">
                    {booking.pickupTime} - {booking.returnTime}
                </span>
            </div>
        );
    };

    const isHourBooked = useCallback((hour, date) => {
        if (!bookedDates || bookedDates.length === 0) return false;
        if (!date) return false;

        const selectedDateTime = new Date(date);
        selectedDateTime.setHours(hour, 0, 0, 0);

        // Kiểm tra giờ trong quá khứ
        const now = new Date();
        if (selectedDateTime < now) {
            return true;
        }

        const vietnamOffset = 7 * 60; // 7 hours in minutes
        const localOffset = selectedDateTime.getTimezoneOffset();
        const totalOffset = vietnamOffset + localOffset;
        selectedDateTime.setMinutes(selectedDateTime.getMinutes() + totalOffset);

        return bookedDates.some(booking => {
            const startDateTime = new Date(booking.startDateTime);
            const endDateTime = new Date(booking.endDateTime);

            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                return false;
            }

            startDateTime.setMinutes(startDateTime.getMinutes() + totalOffset);
            endDateTime.setMinutes(endDateTime.getMinutes() + totalOffset);

            return selectedDateTime >= startDateTime && selectedDateTime < endDateTime;
        });
    }, [bookedDates]);

    const getAvailableHours = useCallback((date) => {
        if (!date) return [];
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) {
            return [];
        }

        return Array.from({ length: 24 }, (_, i) => {
            const hour = i.toString().padStart(2, '0');
            const time = `${hour}:00`;
            return {
                time,
                isAvailable: !isHourBooked(i, dateObj)
            };
        });
    }, [isHourBooked]);

    const filterPassedDates = useCallback((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today && isDateAvailable(date);
    }, [isDateAvailable]);

    const getHighlightDates = useCallback(() => {
        if (!bookedDates || bookedDates.length === 0) return [];

        const highlight = bookedDates.map(booking => {
            const start = new Date(booking.startDateTime);
            const end = new Date(booking.endDateTime);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return null;
            }

            const dates = [];
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
            }
            return dates;
        }).filter(Boolean).flat();
   
        return [
            {
                "react-datepicker__day--highlighted-custom": highlight
            }
        ];
    }, [bookedDates]);

    const handleDateChange = (type, date) => {
        if (!date) {
            if (type === 'startDate') {
                setStartDate(null);
                setPickupTime(null);
                setSelectedPickupSlot(null);
            } else {
                setEndDate(null);
                setReturnTime(null);
                setSelectedReturnSlot(null);
            }
            return;
        }

        if (isNaN(date.getTime())) {
            toast.error('Ngày được chọn không hợp lệ.');
            return;
        }

        // Kiểm tra ngày trong quá khứ
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < now) {
            toast.warning('Không thể chọn ngày trong quá khứ.');
            return;
        }

        // Kiểm tra ngày đã được đặt
        if (!isDateAvailable(selectedDate)) {
            toast.warning('Ngày này đã được đặt hoặc không khả dụng.');
            return;
        }

        if (type === 'startDate') {
            setStartDate(date);
            // Reset time khi thay đổi ngày
            setPickupTime(null);
            setSelectedPickupSlot(null);
            
            if (endDate && date > endDate) {
                setEndDate(null);
                setReturnTime(null);
                setSelectedReturnSlot(null);
                toast.warning('Ngày trả xe không thể trước ngày nhận xe. Vui lòng chọn lại ngày trả.');
            }
        } else {
            if (startDate && date < startDate) {
                toast.warning('Ngày trả xe không thể trước ngày nhận xe.');
                return;
            }
            setEndDate(date);
            // Reset time khi thay đổi ngày
            setReturnTime(null);
            setSelectedReturnSlot(null);
        }
    };

    const handleTimeSlotClick = (type, time) => {
        const [selectedHour] = time.split(':').map(Number);
        const selectedDate = type === 'pickup' ? startDate : endDate;
        const selectedDateTime = new Date(selectedDate);
        selectedDateTime.setHours(selectedHour, 0, 0, 0);

        // Kiểm tra giờ trong quá khứ
        const now = new Date();
        if (selectedDateTime < now) {
            toast.warning('Không thể chọn giờ trong quá khứ.');
            return;
        }

        // Kiểm tra logic thời gian nhận/trả xe
        if (type === 'pickup') {
            if (endDate && returnTime) {
                const [returnHour] = returnTime.split(':').map(Number);
                const returnDateTime = new Date(endDate);
                returnDateTime.setHours(returnHour, 0, 0, 0);

                if (selectedDateTime >= returnDateTime) {
                    if (startDate.toDateString() === endDate.toDateString()) {
                        toast.warning('Giờ nhận xe phải trước giờ trả xe.');
                    } else {
                        toast.warning('Ngày nhận xe phải trước ngày trả xe.');
                    }
                    return;
                }
            }
            setPickupTime(time);
            setSelectedPickupSlot(time);
        } else {
            if (startDate && pickupTime) {
                const [pickupHour] = pickupTime.split(':').map(Number);
                const pickupDateTime = new Date(startDate);
                pickupDateTime.setHours(pickupHour, 0, 0, 0);

                if (selectedDateTime <= pickupDateTime) {
                    if (startDate.toDateString() === endDate.toDateString()) {
                        toast.warning('Giờ trả xe phải sau giờ nhận xe.');
                    } else {
                        toast.warning('Ngày trả xe phải sau ngày nhận xe.');
                    }
                    return;
                }
            }
            setReturnTime(time);
            setSelectedReturnSlot(time);
        }
    };

    return (
        <div className="date-time-modal-overlay">
            <div className="date-time-modal">
                <div className="modal-header">
                    <h3>Chọn thời gian thuê xe </h3>
                    <button onClick={() => onDateTimeChange(null)}>✕</button>
                </div>

                <div className="date-time-selection">
                    <div className="pickup-section">
                        <h4>Thời gian nhận xe</h4>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => handleDateChange('startDate', date)}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày nhận xe"
                            className="date-picker-input"
                            filterDate={filterPassedDates}
                            highlightDates={getHighlightDates()}
                            tileClassName={getDateClassName}
                            tileContent={({ date }) => <BookingInfo date={date} />}
                            withPortal
                        />
                        {startDate ? (
                            <div className="time-content-wrapper">
                                <div className="time-slots">
                                    {getAvailableHours(startDate).length > 0 ? (
                                        getAvailableHours(startDate).map((slot) => (
                                            <button
                                                key={slot.time}
                                                className={`time-slot ${selectedPickupSlot === slot.time ? 'selected' : ''} ${!slot.isAvailable ? 'time-slot-booked' : ''}`}
                                                onClick={() => slot.isAvailable && handleTimeSlotClick('pickup', slot.time)}
                                                disabled={!slot.isAvailable}
                                            >
                                                {slot.time}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="no-available-hours">Không có giờ trống cho ngày này</div>
                                    )}
                                </div>
                                {!pickupTime && <div className="validation-message">Vui lòng chọn giờ nhận xe</div>}
                            </div>
                        ) : (
                            <div className="time-content-wrapper">
                                <div className="validation-message">Vui lòng chọn ngày nhận xe</div>
                            </div>
                        )}
                    </div>

                    <div className="return-section">
                        <h4>Thời gian trả xe</h4>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => handleDateChange('endDate', date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate || new Date()} // Disallow past dates, or before start date
                            filterDate={filterPassedDates}
                            dateFormat="dd/MM/yyyy"
                            className="date-picker-input"
                            placeholderText="Chọn ngày trả xe"
                            dayClassName={getDateClassName}
                            highlightDates={getHighlightDates()}
                            withPortal
                        />
                        {endDate ? (
                            <div className="time-content-wrapper">
                                <div className="time-slots">
                                    {getAvailableHours(endDate).length > 0 ? (
                                        getAvailableHours(endDate).map((slot) => (
                                            <button
                                                key={slot.time}
                                                className={`time-slot ${selectedReturnSlot === slot.time ? 'selected' : ''} ${!slot.isAvailable ? 'time-slot-booked' : ''}`}
                                                onClick={() => slot.isAvailable && handleTimeSlotClick('return', slot.time)}
                                                disabled={!slot.isAvailable}
                                            >
                                                {slot.time}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="no-available-hours">Không có giờ trống cho ngày này</div>
                                    )}
                                </div>
                                {!returnTime && <div className="validation-message">Vui lòng chọn giờ trả xe</div>}
                            </div>
                        ) : (
                            <div className="time-content-wrapper">
                                <div className="validation-message">Vui lòng chọn ngày trả xe</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="confirm-button"
                        onClick={handleConfirm}
                        disabled={!startDate || !endDate || !pickupTime || !returnTime}
                    >
                        Xác nhận
                    </button>
                    <button
                        className="cancel-button"
                        onClick={() => onDateTimeChange(null)}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateTimeSelector; 