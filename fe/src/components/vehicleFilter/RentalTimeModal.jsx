import React, { useState, useMemo } from "react";
import "./RentalTimeModal.css";
import { FaCalendarAlt, FaClock, FaMoon } from "react-icons/fa";

const hours = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00",
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00", "23:00"
];

function parseDateTime(date, time) {
  if (!date || !time) return null;
  const [h, m] = time.split(":");
  return new Date(`${date}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`);
}

function getDurationText(pickupDate, pickupTime, returnDate, returnTime) {
  const start = parseDateTime(pickupDate, pickupTime);
  const end = parseDateTime(returnDate, returnTime);
  if (!start || !end || end <= start) return "";
  const ms = end - start;
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  let text = "Thời gian thuê ";
  if (days > 0) text += `${days} ngày`;
  if (hours > 0) text += (days > 0 ? " " : "") + `${hours} giờ`;
  if (days === 0 && hours === 0) text += "dưới 1 giờ";
  return text;
}

const RentalTimeModal = ({ open, onClose, onConfirm, initialValue }) => {
  const [pickupDate, setPickupDate] = useState(initialValue?.pickupDate || "");
  const [pickupTime, setPickupTime] = useState(initialValue?.pickupTime || "20:00");
  const [returnDate, setReturnDate] = useState(initialValue?.returnDate || "");
  const [returnTime, setReturnTime] = useState(initialValue?.returnTime || "20:00");
  const [activeField, setActiveField] = useState("");

  const durationText = useMemo(
    () => getDurationText(pickupDate, pickupTime, returnDate, returnTime),
    [pickupDate, pickupTime, returnDate, returnTime]
  );

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm({
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    });
    onClose();
  };

  return (
    <div className="rental-time-modal-overlay">
      <div className="rental-time-modal rental-time-modal-wide">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Thời gian thuê</h2>
        <div className="rental-time-row">
          <div className="rental-time-step">1</div>
          <div className="rental-time-fields-group">
            <div className="rental-time-field rental-time-date">
              <label>Ngày nhận xe</label>
              <div className="rental-time-inputbox">
                <FaCalendarAlt className="rental-time-icon" />
                <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
              </div>
            </div>
            <div className={`rental-time-field rental-time-time${activeField === 'pickupTime' ? ' active' : ''}`}> 
              <label>Giờ nhận xe</label>
              <div className="rental-time-inputbox">
                <FaClock className="rental-time-icon" />
                <select
                  value={pickupTime}
                  onFocus={() => setActiveField('pickupTime')}
                  onBlur={() => setActiveField('')}
                  onChange={e => setPickupTime(e.target.value)}
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="rental-time-row">
          <div className="rental-time-step">2</div>
          <div className="rental-time-fields-group">
            <div className="rental-time-field rental-time-date">
              <label>Ngày trả xe</label>
              <div className="rental-time-inputbox">
                <FaCalendarAlt className="rental-time-icon" />
                <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
              </div>
            </div>
            <div className="rental-time-field rental-time-time">
              <label>Giờ trả xe</label>
              <div className="rental-time-inputbox">
                <FaClock className="rental-time-icon" />
                <select value={returnTime} onChange={e => setReturnTime(e.target.value)}>
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                {returnTime >= "23:00" || returnTime < "05:00" ? <FaMoon className="rental-time-moon" /> : null}
              </div>
            </div>
          </div>
        </div>
        {/* Cảnh báo, warning, ... */}
        {durationText && (
          <div className="rental-time-summary">
            {durationText}
          </div>
        )}
        <button className="confirm-btn" onClick={handleConfirm}>TÌM XE</button>
      </div>
    </div>
  );
};

export default RentalTimeModal;
