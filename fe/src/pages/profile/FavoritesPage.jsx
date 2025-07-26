import React from 'react';
import VehicleCard from '../../components/VehicleCard/VehicleCard.jsx';
import { useAuth } from '../../context/AuthContext';
import ProfileLayout from './profileLayout/ProfileLayout';

const FavoritesPage = () => {
  const { user, favorites, isLoading } = useAuth();

  const renderContent = () => {
    if (isLoading) {
      return <p>Đang tải danh sách yêu thích...</p>;
    }
    if (!user) {
      return <p>Vui lòng đăng nhập để xem xe yêu thích.</p>;
    }
    if (!favorites || favorites.length === 0) {
      return <p>Bạn chưa có xe yêu thích nào.</p>;
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {favorites.map(vehicle => (
          <VehicleCard key={vehicle._id} vehicle={vehicle} />
        ))}
      </div>
    );
  };

  return (
    <ProfileLayout>
      <div style={{ padding: '2rem' }}>
        <h2>Xe yêu thích của bạn</h2>
        {renderContent()}
      </div>
    </ProfileLayout>
  );
};

export default FavoritesPage; 