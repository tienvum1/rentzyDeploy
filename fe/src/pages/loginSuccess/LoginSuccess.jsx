import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Keep if needed for other logic, though seems unused in effect
import './VerifyEmail.css'; // Keep if needed
import { useAuth } from '../../context/AuthContext'; // Import useAuth

const LoginSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [displayMessage, setDisplayMessage] = useState('Đang xử lý đăng nhập Google...'); // State for message
  const { user, isLoading } = useAuth(); // Get user and isLoading from AuthContext

  useEffect(() => {
    // Check for the needsSetPassword query parameter
    const needsSetPassword = searchParams.get('needsSetPassword') === 'true';

    if (needsSetPassword) {
      // User needs to set a password. Redirect to set password page.
      setDisplayMessage('Đăng nhập thành công! Bạn cần thiết lập mật khẩu. Đang chuyển hướng...');
      const redirectTimer = setTimeout(() => {
        navigate('/set-password');
      }, 2000); // Redirect after 2 seconds

      return () => clearTimeout(redirectTimer); // Cleanup the timer

    } else if (!isLoading) {
      // If not loading (AuthContext has finished fetching user) and no password needed
      if (user) {
        // User data is available
        const userRole = user.role;
        let redirectPath = '/homepage'; // Default redirect

        if (userRole === 'owner') {
          redirectPath = '/ownerpage/overview';
        } else if (userRole === 'admin') {
          redirectPath = '/adminpage'; // Assuming admin page
        }
        // Add more roles if needed

        setDisplayMessage(`Đăng nhập Google thành công! Đang chuyển hướng đến ${redirectPath}...`);
        const redirectTimer = setTimeout(() => {
          navigate(redirectPath);
        }, 2000); // Redirect after 2 seconds

        return () => clearTimeout(redirectTimer); // Cleanup the timer

      } else {
        // User is null and not loading, means authentication failed or user is not logged in
        setDisplayMessage('Đăng nhập Google thất bại hoặc không tìm thấy thông tin người dùng.');
        const redirectTimer = setTimeout(() => {
          navigate('/login?error=auth_failed'); // Redirect to login with error
        }, 3000); // Redirect after 3 seconds

        return () => clearTimeout(redirectTimer); // Cleanup the timer
      }
    }

  }, [searchParams, navigate, user, isLoading]); // Add user and isLoading to dependencies

  // This component will only display a message while the redirect is happening
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{displayMessage}</h2>
      {/* Optional: add a loading spinner */}
      {isLoading && <p>Loading user data...</p>}
    </div>
  );
};

export default LoginSuccess; 