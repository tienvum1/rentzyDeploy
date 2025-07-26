import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from '../../../context/AuthContext';
import { FaTrash, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './BankAccountPage.css';

const BankAccountPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    accountNumber: "",
    bankName: "",
    accountHolder: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validNames, setValidNames] = useState([]);

  useEffect(() => {
    fetchAccounts();
    // Lấy danh sách tên hợp lệ từ user data
    if (user) {
      const names = [];
      if (user.driver_license_full_name) names.push(user.driver_license_full_name);
      if (user.cccd_full_name) names.push(user.cccd_full_name);
      if (user.name && !user.driver_license_full_name && !user.cccd_full_name) names.push(user.name);
      setValidNames(names);
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/bank-account`, {
        withCredentials: true
      });
      setAccounts(res.data.accounts || []);
    } catch (err) {
      setError("Không thể tải danh sách tài khoản ngân hàng.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (accountId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    
    try {
      setLoading(true);
      setError("");
      const res = await axios.delete(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/bank-account/${accountId}`, {
        withCredentials: true
      });
      setSuccess(res.data.message);
      setAccounts(res.data.accounts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể xóa tài khoản ngân hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.accountNumber || !form.bankName || !form.accountHolder) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/bank-account`, form, {
        withCredentials: true
      });
      setSuccess(res.data.message);
      setForm({ accountNumber: "", bankName: "", accountHolder: "" });
      fetchAccounts();
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể thêm tài khoản ngân hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-account-page">
      <h2>Quản lý tài khoản ngân hàng</h2>
      
      {/* Thông báo validation */}
      {validNames.length > 0 && (
        <div className="validation-info">
          <FaInfoCircle className="info-icon" />
          <div>
            <strong>Lưu ý:</strong> Tên chủ tài khoản phải trùng với một trong các tên sau:
            <ul>
              {validNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <FaExclamationTriangle className="error-icon" />
          {error}
        </div>
      )}
      {success && (
        <div className="success-message">
          <FaCheckCircle className="success-icon" />
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bank-form">
        <div className="form-group">
          <label>Số tài khoản</label>
          <input
            type="text"
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            placeholder="Nhập số tài khoản"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Tên ngân hàng</label>
          <input
            type="text"
            name="bankName"
            value={form.bankName}
            onChange={handleChange}
            placeholder="Nhập tên ngân hàng"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Chủ tài khoản</label>
          <input
            type="text"
            name="accountHolder"
            value={form.accountHolder}
            onChange={handleChange}
            placeholder="Nhập tên chủ tài khoản"
            required
          />
          {validNames.length > 0 && (
            <small className="form-hint">
              Tên phải trùng với tên trong GPLX hoặc CCCD
            </small>
          )}
        </div>
        
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Đang thêm..." : "Thêm tài khoản"}
        </button>
      </form>
      
      <div className="accounts-list">
        <h3>Danh sách tài khoản đã thêm</h3>
        {loading && accounts.length === 0 ? (
          <p>Đang tải...</p>
        ) : accounts.length === 0 ? (
          <p className="no-accounts">Chưa có tài khoản nào.</p>
        ) : (
          accounts.map((account) => (
            <div key={account._id} className="account-item">
              <div className="account-info">
                <p><strong>Ngân hàng:</strong> {account.bankName}</p>
                <p><strong>Số tài khoản:</strong> {account.accountNumber}</p>
                <p><strong>Chủ tài khoản:</strong> {account.accountHolder}</p>
              </div>
              <button 
                className="delete-btn"
                onClick={() => deleteAccount(account._id)}
                disabled={loading}
                title="Xóa tài khoản"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BankAccountPage;