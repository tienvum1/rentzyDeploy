import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/footer/Footer';
import './Login.css';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    if (!token) {
      setMsg('Link không hợp lệ hoặc đã hết hạn.');
      setIsError(true);
      return;
    }
    if (password.length < 6) {
      setMsg('Mật khẩu phải từ 6 ký tự.');
      setIsError(true);
      return;
    }
    if (password !== confirm) {
      setMsg('Mật khẩu nhập lại không khớp!');
      setIsError(true);
      return;
    }
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const apiUrl = `${backendUrl}/api/user/reset-password`;
      const res = await axios.post(apiUrl, { token, password });
      setMsg(res.data.message || 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.');
      setIsError(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setMsg(err.response.data.message);
      } else {
        setMsg('Đặt lại mật khẩu thất bại!');
      }
      setIsError(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Đặt lại mật khẩu</h2>
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div className="form-group">
            <label>Nhập lại mật khẩu mới</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          {msg && <div className={`message ${isError ? 'error' : 'success'}`}>{msg}</div>}
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;