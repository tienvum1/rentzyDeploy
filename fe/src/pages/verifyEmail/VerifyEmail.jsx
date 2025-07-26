import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import './VerifyEmail.css'; // We'll create this CSS file next

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Đang xác thực email...');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const navigate = useNavigate(); // Use the hook

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Không tìm thấy token xác thực trong liên kết.');
      setIsError(true);
      setIsLoading(false); // Stop loading on error
      return;
    }

    const verifyEmail = async () => {
      setIsLoading(true); // Start loading
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        if (!backendUrl) {
          setMessage('Lỗi cấu hình: Không tìm thấy URL backend.');
          setIsError(true);
          setIsLoading(false); // Stop loading on error
          return;
        }

        const apiUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;

        const response = await axios.get(apiUrl);

        // Handle successful verification
        setMessage(response.data.message || 'Xác thực email thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.');
        setIsError(false);

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Redirect after 3 seconds

      } catch (error) {
        console.error('Lỗi xác thực email:', error);
        setIsError(true);
        if (error.response) {
          setMessage(`Xác thực thất bại: ${error.response.data.message || error.response.statusText}`);
        } else {
          setMessage('Đã xảy ra lỗi trong quá trình xác thực.');
        }
      } finally {
        setIsLoading(false); // Stop loading regardless of success or failure
      }
    };

    verifyEmail();

  }, [searchParams, navigate]); // Add navigate to dependency array

  return (
    <div className="verify-email-container">
      <h2>Xác thực email</h2>
      {isLoading ? (
        <p>Đang xử lý....</p>
      ) : (
        <p className={isError ? 'error-message' : 'success-message'}>{message}</p>
      )}
      {/* Remove static link if redirecting automatically */}
      {/* {!isError && <p><a href="/login">Đi đến trang đăng nhập</a></p>} */}
    </div>
  );
};

export default VerifyEmail; 