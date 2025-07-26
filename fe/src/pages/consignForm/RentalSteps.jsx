import React from "react";
import "./RentalSteps.css";

const RentalSteps = () => {
  return (
    <div className="rental-container">
      <h2 className="title">Cho thuê 3 bước siêu dễ chỉ 10 phút</h2>
      <div className="steps">
        <div className="step">
          <div className="circle">1</div>
          <h4>Chuẩn bị xe và nhận đơn nhẹ nhàng</h4>

          <p>Khi xe sẵn sàng cho thuê, Rentzy sẽ thay chủ xe định giá cho thuê và ký hợp đồng cho thuê khi khách đặt xe.</p>

        </div>
        <div className="step">
          <div className="circle">2</div>
          <h4>Cho thuê xe nhận nhà</h4>

          <p>Khách thuê sẽ tự lấy xe và trả tại vị trí xe đậu dưới sự giám sát 24/7 của Rentzy.</p>
        </div>
        <div className="step">
          <div className="circle">3</div>
          <h4>Nhận thu nhập hấp dẫn hàng tuần</h4>
          <p>Nhận tiền thuê và các thu nhập khách hàng tuần.</p>
        </div>
      </div>

      <div className="guarantee">
        <div className="guarantee-left">
          <h3>An tâm cho thuê, Rentzy lo trọn gói – Tăng thu nhập dễ dàng.</h3>
          <p>
            Bạn sở hữu xe nhàn rỗi và muốn tạo thêm thu nhập? Hãy để Rentzy giúp bạn. Chúng tôi cung cấp giải pháp cho thuê xe "chìa khóa trao tay" hoàn hảo cho chủ xe bận rộn. Rentzy đảm nhận mọi việc: sàng lọc và xác minh kỹ lưỡng từng khách thuê, xử lý giấy tờ pháp lý, và giải quyết triệt để các vấn đề như phạt nguội hay sự cố phát sinh. An tâm tuyệt đối, bạn chỉ cần tập trung vào cuộc sống của mình và nhận thu nhập đều đặn.
          </p>
        </div>


      </div>

      <div className="safety-section">
        <h3>Bảo vệ xe tối ưu với công nghệ An toàn</h3>
      </div>

      <div className="flexibility-section">
        <h3>Linh hoạt sử dụng, xe luôn sẵn sàng cho bạn</h3>
        <p>
          Xe vẫn ở chỗ bạn và bạn <span className="highlight">hoàn toàn chủ động sử dụng xe khi cần</span>, dễ dàng cho thuê kiếm thêm thu nhập khi xe không sử dụng đến
        </p>
      </div>

      <div className="comparison-section">
        <h3>Rentzy: Giải pháp vượt trội cho thuê xe tự lái</h3>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Rentzy</th>

              <th>Tự cho thuê</th>
              <th>Nền tảng khác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tiết kiệm 90% thời gian, công sức cho thuê</td>
              <td>✔</td>
              <td>✖</td>
              <td>✖</td>
            </tr>
            <tr>
              <td>Quy trình quản lý rõ ràng 10 bước chặt chẽ</td>
              <td>✔</td>
              <td>✖</td>
              <td>✖</td>
            </tr>
            <tr>
              <td>Miễn phí lắp đặt thiết bị an toàn</td>
              <td>✔</td>
              <td>✖</td>
              <td>✖</td>
            </tr>
            <tr>
              <td>Thay thế xe giảm sát đảm bảo 24/7</td>
              <td>✔</td>
              <td>✖</td>
              <td>✖</td>
            </tr>
            <tr>
              <td>Xử lý và truy thu phạt người thuê thay cho xe</td>
              <td>✔</td>
              <td>✖</td>
              <td>✖</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalSteps;
