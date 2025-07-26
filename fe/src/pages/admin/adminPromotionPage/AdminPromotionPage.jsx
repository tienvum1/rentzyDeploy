import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminPromotionPage.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

const emptyPromo = {
  code: '',
  description: '',
  discountPercent: '',
  maxDiscount: '',
  minOrderValue: '',
  validFrom: '',
  validTo: '',
  quantity: ''
};

const AdminPromotionPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPromo, setEditPromo] = useState(null);
  const [form, setForm] = useState(emptyPromo);
  const [saving, setSaving] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/promotions`, { withCredentials: true });
      setPromos(res.data.promotions || []);
    } catch (err) {
      toast.error('Không thể tải danh sách mã khuyến mãi!');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const openAdd = () => {
    setEditPromo(null);
    setForm(emptyPromo);
    setModalOpen(true);
  };
  const openEdit = (promo) => {
    setEditPromo(promo);
    setForm({
      ...promo,
      validFrom: promo.validFrom ? promo.validFrom.slice(0, 16) : '',
      validTo: promo.validTo ? promo.validTo.slice(0, 16) : ''
    });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditPromo(null);
    setForm(emptyPromo);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editPromo) {
        await axios.put(`${backendUrl}/api/promotions/${editPromo._id}`, form, { withCredentials: true });
        toast.success('Cập nhật mã thành công!');
      } else {
        await axios.post(`${backendUrl}/api/promotions`, form, { withCredentials: true });
        toast.success('Tạo mã thành công!');
      }
      fetchPromos();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu mã!');
    }
    setSaving(false);
  };
  const handleDelete = async (promo) => {
    if (!window.confirm(`Xác nhận xoá mã ${promo.code}?`)) return;
    try {
      await axios.delete(`${backendUrl}/api/promotions/${promo._id}`, { withCredentials: true });
      toast.success('Đã xoá mã!');
      fetchPromos();
    } catch (err) {
      toast.error('Lỗi khi xoá mã!');
    }
  };

  return (
    <div className="admin-dashboard-layout">
      <SidebarAdmin />
      <div className="admin-dashboard-content">
        <div className="promotion-header-row">
          <h2>Quản lý mã khuyến mãi</h2>
          <button className="btn-add-promo" onClick={openAdd}>+ Thêm mã mới</button>
        </div>
        {loading ? (
          <div className="promo-loading">Đang tải...</div>
        ) : promos.length === 0 ? (
          <div className="promo-empty">Chưa có mã khuyến mãi nào.</div>
        ) : (
          <div className="promo-table-wrapper">
            <table className="promo-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Giảm (%)</th>
                  <th>Tối đa (VNĐ)</th>
                  <th>Đơn tối thiểu</th>
                  <th>Hiệu lực từ</th>
                  <th>Đến</th>
                  <th>Số lượng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr key={promo._id}>
                    <td style={{ fontWeight: 600 }}>{promo.code}</td>
                    <td>{promo.description}</td>
                    <td>{promo.discountPercent}%</td>
                    <td>{promo.maxDiscount?.toLocaleString('vi-VN')}</td>
                    <td>{promo.minOrderValue?.toLocaleString('vi-VN')}</td>
                    <td>{promo.validFrom ? new Date(promo.validFrom).toLocaleString('vi-VN') : ''}</td>
                    <td>{promo.validTo ? new Date(promo.validTo).toLocaleString('vi-VN') : ''}</td>
                    <td>{promo.quantity}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openEdit(promo)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(promo)}>Xoá</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {modalOpen && (
          <div className="promo-modal-backdrop" onClick={closeModal}>
            <div className="promo-modal" onClick={e => e.stopPropagation()}>
              <h3>{editPromo ? 'Cập nhật mã khuyến mãi' : 'Thêm mã khuyến mãi mới'}</h3>
              <form className="promo-form" onSubmit={handleSubmit}>
                <label>Mã khuyến mãi*<input name="code" value={form.code} onChange={handleChange} required disabled={!!editPromo} placeholder="VD: GIAM10" /></label>
                <label>Mô tả*<input name="description" value={form.description} onChange={handleChange} required placeholder="VD: Giảm 10% tối đa 50k cho đơn từ 1 triệu" /></label>
                <label>Phần trăm giảm (%)*<input name="discountPercent" type="number" value={form.discountPercent} onChange={handleChange} required min={1} max={100} /></label>
                <label>Giảm tối đa (VNĐ)*<input name="maxDiscount" type="number" value={form.maxDiscount} onChange={handleChange} required min={1000} /></label>
                <label>Đơn tối thiểu (VNĐ)*<input name="minOrderValue" type="number" value={form.minOrderValue} onChange={handleChange} required min={0} /></label>
                <label>Hiệu lực từ*<input name="validFrom" type="datetime-local" value={form.validFrom} onChange={handleChange} required /></label>
                <label>Đến*<input name="validTo" type="datetime-local" value={form.validTo} onChange={handleChange} required /></label>
                <label>Số lượng còn lại*<input name="quantity" type="number" value={form.quantity} onChange={handleChange} required min={1} /></label>
                <div className="promo-form-actions">
                  <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Đang lưu...' : (editPromo ? 'Cập nhật' : 'Tạo mới')}</button>
                  <button type="button" className="btn-cancel" onClick={closeModal}>Huỷ</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </div>
  );
};

export default AdminPromotionPage; 