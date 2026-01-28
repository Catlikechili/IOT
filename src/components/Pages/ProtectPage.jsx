// src/components/Pages/ProtectPage.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = ({ children }) => {
    const { user, role } = useAuth();

    // 1. Nếu chưa đăng nhập -> Về trang Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu đã đăng nhập nhưng KHÔNG PHẢI admin -> Về trang quan sát (UserPage)
    if (role !== 'admin') {
        return <Navigate to="/UserPage" replace />;
    }

    // 3. Nếu là Admin -> Cho phép vào trang (children)
    return children;
};