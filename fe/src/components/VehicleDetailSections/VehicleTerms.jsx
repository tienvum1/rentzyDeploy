import React from 'react';
import './VehicleTerms.css';

const VehicleTerms = () => {
    const terms = [
        "Sử dụng xe đúng mục đích, không vi phạm pháp luật.",
        "Không cầm cố, cho thuê lại hoặc chuyển nhượng xe.",
        "Giữ gìn xe sạch sẽ, không hút thuốc, xả rác trong xe.",
        "Không chở hàng cấm, dễ cháy nổ hoặc thực phẩm nặng mùi.",
        "Thông báo ngay khi xảy ra tai nạn, hỏng hóc.",
        "Trả xe đúng giờ và đúng địa điểm đã thỏa thuận.",
    ];

    return (
        <div className="vehicle-terms">
            <h2 className="vehicle-terms__title">Điều khoản thuê xe</h2>
            <ul className="vehicle-terms__list">
                {terms.map((term, index) => (
                    <li key={index} className="vehicle-terms__item">
                        {term}
                    </li>
                ))}
            </ul>
            <h2 className="vehicle-terms__title" style={{marginTop: 32}}>Chính sách huỷ chuyến</h2>
            <div className="cancel-policy-table">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Chính sách hoàn tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <span className="cancel-icon success">✔️</span>
                                <b> Hoàn 100% tiền đã thanh toán</b>
                            </td>
                            <td>Huỷ trong vòng 1 giờ sau khi đặt</td>
                        </tr>
                        <tr>
                            <td>
                                <span className="cancel-icon warning">⚠️</span>
                                <b> Hoàn 50% tiền cọc, mất 50%</b>
                            </td>
                            <td>Huỷ trước 7 ngày</td>
                        </tr>
                        <tr>
                            <td>
                                <span className="cancel-icon fail">❌</span>
                                <b> Mất 100% tiền cọc</b>
                            </td>
                            <td>Huỷ trong vòng 7 ngày trước khi nhận xe</td>
                        </tr>
                        <tr>
                            <td>
                                <span className="cancel-icon fail">❌</span>
                                <b> Không hoàn tiền (tổng tiền đã thanh toán)</b>
                            </td>
                            <td>Huỷ sau thời điểm nhận xe hoặc không tới nhận xe</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 10 }}>
                <b>Lưu ý:</b> Chính sách này chỉ áp dụng cho phần tiền cọc đã thanh toán (thường là 30% tổng đơn hàng).
            </div>
            <p className="vehicle-terms__footer">
                Cảm ơn quý khách. Chúc bạn có chuyến đi an toàn và thú vị!
            </p>
        </div>
    );
};

export default VehicleTerms;
