import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/footer/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import validator from "validator";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for URL parameters on component mount
  useEffect(() => {
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');
    
    if (error === 'account_blocked' && errorMessage) {
      setMessage(decodeURIComponent(errorMessage));
      setIsError(true);
    } else if (error === 'google_fail') {
      setMessage('Đăng nhập Google thất bại. Vui lòng thử lại.');
      setIsError(true);
    } else if (error === 'google_auth_failed') {
      setMessage('Xác thực Google thất bại hoặc không tìm thấy thông tin người dùng.');
      setIsError(true);
    } else if (error === 'google_auth_failed_server') {
      setMessage('Lỗi server trong quá trình xác thực Google.');
      setIsError(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    if (!validator.isEmail(email)) {
      setMessage("Email không đúng định dạng.");
      setIsError(true);
      return;
    }

    if (password.length < 8) {
      setMessage("Mật khẩu phải có ít nhất 8 ký tự.");
      setIsError(true);
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const apiUrl = `${backendUrl}/api/auth/login`;

      const response = await axios.post(
        apiUrl,
        { email, password },
        { withCredentials: true }
      );

      // Đăng nhập thành công
      login(response.data.user);
      setMessage(response.data.message || "Đăng nhập thành công!");
      setIsError(false);

      const userRole = response.data.user?.role;
      console.log(userRole);
      let redirectPath = "/homepage";
      if (userRole == "owner") redirectPath = "/ownerpage";
      else if (userRole == "admin") redirectPath = "/admin";

      // Delay một chút để hiển thị thông báo
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (error) {
      console.error(
        "Đăng nhập thất bại:",
        error.response?.data || error.message
      );
      setIsError(true);

      let errorMessage = "Đã xảy ra lỗi trong quá trình đăng nhập.";

      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        if (backendMessage === "Email not found") {
          errorMessage = "Email không tồn tại.";
        } else if (backendMessage === "Incorrect password") {
          errorMessage = "Mật khẩu không đúng.";
        } else if (backendMessage === "Please verify your email") {
          errorMessage =
            "Tài khoản chưa xác thực. Vui lòng kiểm tra email để xác thực.";
        } else if (backendMessage === "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.") {
          errorMessage = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.";
        } else {
          errorMessage = `Đăng nhập thất bại: ${backendMessage}`;
        }
      }
      setMessage(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) {
      setMessage("Lỗi cấu hình: Không tìm thấy URL backend.");
      setIsError(true);
      return;
    }
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-card">
          <h2>Đăng nhập</h2>
          {message && (
            <p className={`message ${isError ? "error" : "success"}`}>
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit}>
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
                  type={showPassword ? "text" : "password"}
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
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
            <button type="submit" className="submit-button">
              Đăng nhập
            </button>
          </form>
          <div className="login-links">
            <span>Chưa có tài khoản?</span>
            <button
              type="button"
              className="login-link"
              onClick={() => navigate("/register")}
            >
              Đăng ký
            </button>
            <button
              type="button"
              className="login-link"
              onClick={() => navigate("/forgot-password")}
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="or-divider">Hoặc</div>
          <button className="google-login-button" onClick={handleGoogleLogin}>
            <span className="google-icon">
              {/* Google SVG Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21.805 10.023H12.172V14.132H17.672C16.832 16.332 14.832 17.832 12.172 17.832C8.832 17.832 6.172 15.172 6.172 11.832C6.172 8.492 8.832 5.832 12.172 5.832C13.832 5.832 15.332 6.492 16.372 7.632L19.372 4.632C17.372 2.632 14.832 1.832 12.172 1.832C6.672 1.832 2.172 6.332 2.172 11.832C2.172 17.332 6.672 21.832 12.172 21.832C17.672 21.832 22.172 17.332 22.172 11.832C22.172 11.132 22.072 10.432 21.805 10.023Z"
                  fill="#4285F4"
                />
                <path
                  d="M3.672 7.332L6.672 9.832C7.472 7.832 9.672 6.332 12.172 6.332C13.832 6.332 15.332 6.992 16.372 8.132L19.372 5.132C17.372 3.132 14.832 2.332 12.172 2.332C8.172 2.332 4.672 4.332 3.672 7.332Z"
                  fill="#34A853"
                />
                <path
                  d="M12.172 21.832C14.832 21.832 17.372 21.032 19.372 19.032L16.372 16.332C15.332 17.332 13.832 17.832 12.172 17.832C9.672 17.832 7.472 16.332 6.672 14.332L3.672 16.832C4.672 19.832 8.172 21.832 12.172 21.832Z"
                  fill="#FBBC05"
                />
                <path
                  d="M3.672 16.832V7.332L12.172 11.832L20.672 7.332V16.832H12.172Z"
                  fill="#EA4335"
                />
              </svg>
            </span>
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
