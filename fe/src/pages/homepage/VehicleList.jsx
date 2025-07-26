import React, { useEffect, useState } from "react";
import VehicleCard from "../../components/VehicleCard/VehicleCard";
import "./VehicleList.css";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRented = async () => {
      try {
        const res = await fetch("http://localhost:4999/api/vehicles/top-rented");
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopRented();
  }, []);

  return (
    <div className="vehicle-list-container">
      <h1>Xe có ngay</h1>
      {loading ? (
        <div className="no-vehicles-message">Đang tải...</div>
      ) : Array.isArray(vehicles) && vehicles.length > 0 ? (
        <div className="vehicle-list">
          {vehicles.filter(v => v.status === 'available' && v.approvalStatus === 'approved').map((v) => (
            <VehicleCard key={v._id} vehicle={v} />
          ))}
        </div>
      ) : (
        <div className="no-vehicles-message">Không có xe nào phù hợp.</div>
      )}
    </div>
  );
};

export default VehicleList;
