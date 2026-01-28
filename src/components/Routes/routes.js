// src/routes/index.jsx
import { useRoutes } from "react-router-dom";
import MainLayout from "../Layout/MainLayout";
import HomePage from "../Pages/HomePage";
import Garden1 from "../Pages/Garden1";
import Page404 from "../Pages/Page404";
// Cấu hình routes
const routes = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },        // Trang chủ (index)
            { path: "home", element: <HomePage /> },      // /home
            { path: "garden1", element: <Garden1 /> },    // /garden1
            { path: "*", element: <Page404 /> }           // 404 - phải đặt cuối cùng
        ]
    }
];

// Hook chính để render routes
export default function Router() {
    return useRoutes(routes);
}

// Export mảng routes nếu cần sử dụng ở nơi khác
export { routes };