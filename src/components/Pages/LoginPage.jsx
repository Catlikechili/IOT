import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // Sau khi thành công, chuyển hướng vào home
            navigate('/home', { replace: true });
        } catch (err) {
            if (err.code === 'auth/user-not-found') setError('Tài khoản không tồn tại');
            else if (err.code === 'auth/wrong-password') setError('Sai mật khẩu');
            else setError('Đăng nhập thất bại: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="login-card">
                <h2>Chào mừng trở lại</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-badge">{error}</div>}
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="input-group">
                        <label>Mật khẩu</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;