import React, { useState } from 'react';
import './Register.css';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/footer/Footer';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!validator.isEmail(email)) {
      setMessage('Email không đúng định dạng.');
      setIsError(true);
      return;
    }

    if (password.length < 8) {
      setMessage('Mật khẩu phải có ít nhất 8 ký tự.');
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Mật khẩu và xác nhận mật khẩu không khớp.');
      setIsError(true);
      return;
    }

    try {
      const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/api/auth/register`;
      const response = await axios.post(apiUrl, { name, email, password });

      setMessage(response.data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      setIsError(false);

      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (error) {
      console.error('Đăng ký thất bại:', error);
      setIsError(true);
      const errorMessage = error.response?.data?.message
        ? `Đăng ký thất bại: ${error.response.data.message}`
        : 'Đã xảy ra lỗi trong quá trình đăng ký.';
      setMessage(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <Header />
      <div className="register-container">
        <div className="register-card">
          <h2>Đăng ký</h2>
          {message && (
            <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Tên</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  minLength={8}
                />
                <span
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  name="confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  minLength={8}
                />
                <span
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                >
                   {showConfirmPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>
            <button type="submit" className="submit-button">Đăng ký</button>
          </form>
          <div className="register-links">
            <span>Đã có tài khoản?</span>
            <button type="button" className="register-link" onClick={() => navigate('/login')}>
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;