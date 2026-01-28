import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";

import MainLayout from "./components/Layout/MainLayout";
import HomePage from "./components/Pages/HomePage";
import NotificationPage from './components/Pages/NotificationPage';
import AutoModePage from './components/Pages/AutoModePage';
import ThresholdControlPage from './components/Pages/ThresholdControlPage';
import LoginPage from './components/Pages/LoginPage';
import Register from './components/Pages/Register';
import Page404 from './components/Pages/Page404';
import { UserPage } from "./components/Pages/UserPage";

// 1. Điều hướng thông minh dựa trên Role ngay tại trang gốc
const RootRedirect = () => {
    const { user, role, loading } = useAuth();
    if (loading) return <div>Đang tải...</div>;

    if (!user) return <Navigate to="/login" replace />;

    // Nếu là admin thì vào trang Home chính, nếu là user thì vào thẳng UserPage
    return role === 'admin' ? <Navigate to="/home" replace /> : <Navigate to="/user" replace />;
};

// 2. Bảo vệ Route: Chỉ dành cho Admin
const AdminRoute = ({ children }) => {
    const { user, role, loading } = useAuth();
    if (loading) return <div>Đang xác minh quyền Admin...</div>;
    return (user && role === 'admin') ? children : <Navigate to="/user" />;
};

// 3. Bảo vệ Route: Dành cho User (hoặc Admin cũng có thể vào)
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Đang tải...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Kiểm tra logic điều hướng ngay khi vào "/" */}
                    <Route path="/" element={<RootRedirect />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<Register />} />

                    {/* Toàn bộ hệ thống nằm trong MainLayout */}
                    <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>

                        {/* NHÓM 1: Chỉ Admin mới có quyền truy cập các trang này */}
                        <Route path="home" element={<AdminRoute><HomePage /></AdminRoute>} />
                        <Route path="notification" element={<AdminRoute><NotificationPage /></AdminRoute>} />
                        <Route path="automode" element={<AdminRoute><AutoModePage /></AdminRoute>} />
                        <Route path="config" element={<AdminRoute><ThresholdControlPage /></AdminRoute>} />

                        {/* NHÓM 2: Trang duy nhất User có thể vào (Admin cũng vào được) */}
                        <Route path="user" element={<UserPage />} />
                    </Route>

                    {/* Trang lỗi */}
                    <Route path="*" element={<Page404 />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;