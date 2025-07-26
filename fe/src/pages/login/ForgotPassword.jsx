import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/footer/Footer';
import './Login.css';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const apiUrl = `${backendUrl}/api/user/forgot-password`;
      const res = await axios.post(apiUrl, { email });
      setMsg(res.data.message || 'Vui lòng kiểm tra email để đặt lại mật khẩu!');
      setIsError(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setMsg(err.response.data.message);
      } else {
        setMsg('Gửi email thất bại!');
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
          <h2>Quên mật khẩu</h2>
          <div className="form-group">
            <label htmlFor="email">Nhập email của bạn</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>
          {msg && <div className={`message ${isError ? 'error' : 'success'}`}>{msg}</div>}
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;