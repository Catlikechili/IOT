import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import './Login.css';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Kiểm tra mật khẩu khớp nhau
        if (formData.password !== formData.confirmPassword) {
            return setError('Mật khẩu nhập lại không khớp');
        }

        // 2. Kiểm tra độ dài mật khẩu
        if (formData.password.length < 6) {
            return setError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        setLoading(true);
        try {
            console.log("Starting registration...");

            // 3. Tạo tài khoản trên Firebase Auth
            const res = await register(formData.email, formData.password);
            const user = res.user;
            console.log("Firebase Auth created:", user.uid);

            // 4. Lưu thêm thông tin vào Firestore
            await setDoc(doc(db, "users", user.uid), {
                fullName: formData.fullName,
                email: formData.email,
                role: 'user',
                createdAt: new Date().toISOString(),
                uid: user.uid // Lưu thêm uid để dễ query
            });

            console.log("User data saved to Firestore");

            // 5. Tự động đăng nhập sau khi đăng ký
            navigate('/home');

        } catch (err) {
            console.error("Registration error details:", err);

            // XỬ LÝ LỖI CHI TIẾT
            if (err.code === 'auth/email-already-in-use') {
                setError('Email này đã được sử dụng');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email không hợp lệ');
            } else if (err.code === 'auth/weak-password') {
                setError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Phương thức đăng ký chưa được bật');
            } else {
                setError(`Đăng ký thất bại: ${err.message || 'Lỗi không xác định'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Tạo tài khoản</h2>
                    <p>Kết nối và quản lý thiết bị IOT của bạn</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-badge">{error}</div>}

                    <div className="input-group">
                        <label>Họ và Tên</label>
                        <input
                            name="fullName"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="example@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label>Mật khẩu (tối thiểu 6 ký tự)</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Tối thiểu 6 ký tự"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div className="input-group">
                        <label>Xác nhận mật khẩu</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Ngay'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;