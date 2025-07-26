import React, { useEffect, useRef } from 'react';
import './StatsSection.css';
import { FaCarSide, FaSmile, FaMapMarkedAlt, FaStar } from 'react-icons/fa';

const stats = [
  { value: 68, label: 'Xe cho thuê tại Đà Nẵng', icon: <FaCarSide /> },
  { value: 1200, label: 'Khách hàng hài lòng', icon: <FaSmile /> },
  { value: 8, label: 'Quận/Huyện phục vụ', icon: <FaMapMarkedAlt /> },
  { value: 4.95, label: 'Điểm đánh giá trung bình', icon: <FaStar /> },
];

function useCountUp(ref, end, duration = 1200, decimals = 0) {
  useEffect(() => {
    let frame;
    let start = 0;
    let startTime = null;
    let isUnmounted = false;
    function animateCount(ts) {
      if (isUnmounted || !ref.current) return;
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const value = start + (end - start) * progress;
      if (ref.current) {
        ref.current.innerText = decimals ? value.toFixed(decimals) : Math.floor(value);
      }
      if (progress < 1) {
        frame = requestAnimationFrame(animateCount);
      }
    }
    if (ref.current) {
      frame = requestAnimationFrame(animateCount);
    }
    return () => {
      isUnmounted = true;
      if (frame) cancelAnimationFrame(frame);
    };
  }, [end, duration, decimals, ref]);
}

const StatsSection = () => {
  // Khởi tạo refs một lần duy nhất
  const refs = [useRef(), useRef(), useRef(), useRef()];
  useCountUp(refs[0], stats[0].value, 1200, 0);
  useCountUp(refs[1], stats[1].value, 1200, 0);
  useCountUp(refs[2], stats[2].value, 1200, 0);
  useCountUp(refs[3], stats[3].value, 1200, 2);

  return (
    <section className="stats-section-pro">
      {stats.map((stat, idx) => (
        <div className="stat-pro" key={idx}>
          <div className="stat-icon-pro">{stat.icon}</div>
          <div className="stat-value-pro" ref={refs[idx]}></div>
          <div className="stat-label-pro">{stat.label}</div>
        </div>
      ))}
    </section>
  );
};

export default StatsSection; 