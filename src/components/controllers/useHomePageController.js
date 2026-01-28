// src/controllers/useHomePageController.js
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { updatePin } from '../Service/blynkService'
export const useHomePageController = () => {
    const navigate = useNavigate();
    const [deviceStatus, setDeviceStatus] = useState({
        fan: false,
        water: false,
        heater: false,
        airPurifier: false
    });

    // Chỉ khai báo MỘT LẦN
    const quickActions = [
        {
            title: "Quạt",
            icon: "🌀",
            description: "Làm mát ngay",
            pin: 1,
            deviceKey: "fan"
        },
        {
            title: "Tưới nước",
            icon: "💧",
            description: "Tưới tự động",
            pin: 0,
            deviceKey: "water"
        },
        {
            title: "Sưởi",
            icon: "🔥",
            description: "Giữ ấm",
            pin: 2,
            deviceKey: "heater"
        },
        {
            title: " Lọc khí",
            icon: "🌫️",
            description: "Lọc sạch môi trường",
            pin: 3,
            deviceKey: "airPurifier"
        }
    ];

    const [stats] = useState([
        { label: "Nhiệt độ", value: "26°C", icon: "thermostat", color: "#ff7043", status: "Ổn định", trend: "+1°C" },
        { label: "Độ ẩm", value: "62%", icon: "water_drop", color: "#42a5f5", status: "Tốt", trend: "-3%" },
        { label: "Ánh sáng", value: "78%", icon: "wb_sunny", color: "#fbc02d", status: "Mạnh", trend: "+5%" },
        { label: "Độ phì nhiêu", value: "6.5 pH", icon: "local_florist", color: "#66bb6a", status: "Chuẩn", trend: "Ổn định" }
    ]);

    const [features] = useState([
        { title: "Giám sát", icon: "device_hub", description: "Theo dõi toàn bộ cảm biến", count: "12 sensor", action: "Xem ngay" },
        { title: "Điều khiển", icon: "auto_awesome", description: "Điều khiển thiết bị smart", count: "5 rule", action: "Cấu hình", path: "/automode" },
        { title: "Lịch sử", icon: "timeline", description: "Lưu lại dữ liệu 30 ngày", count: "1200 log", action: "Xem dữ liệu" },
        { title: "Cây & vườn", icon: "nature", description: "Quản lý khu vườn", count: "8 khu vực", action: "Quản lý" }
    ]);

    // Chỉ khai báo MỘT LẦN
    const showAction = (message, icon, isSuccess = true) => {
        const style = isSuccess ? {
            background: "linear-gradient(135deg, #d9fcd2, #b8f8c1)",
            color: "#0f172a",
        } : {
            background: "linear-gradient(135deg, #ffeaea, #ffd6d6)",
            color: "#7f1d1d",
        };

        toast(`${icon} ${message}`, {
            duration: 1700,
            style: {
                padding: "14px 18px",
                borderRadius: "12px",
                ...style,
                fontSize: "16px",
                fontWeight: 500,
                boxShadow: "0px 4px 14px rgba(0,0,0,0.15)"
            }
        });
    };

    // TODO: Thêm hàm này hoặc import từ service
 

    // Chỉ khai báo MỘT LẦN
    const handleQuickAction = async (action) => {
        try {
            const currentStatus = deviceStatus[action.deviceKey];
            const newValue = currentStatus ? 0 : 1;

            // Gửi lệnh đến Blynk
            const result = await updatePin(action.pin, newValue);

            // Cập nhật state local
            setDeviceStatus(prev => ({
                ...prev,
                [action.deviceKey]: !prev[action.deviceKey]
            }));

            const actionText = newValue === 1 ? "Bật" : "Tắt";
            const icon = newValue === 1 ? "✅" : "⏸️";
            showAction(`${actionText} ${action.title} thành công!`, icon, true);

            console.log(`${actionText} ${action.deviceKey}:`, result);
        } catch (error) {
            showAction(`Lỗi khi điều khiển thiết bị!`, "❌", false);
            console.error(`Lỗi:`, error);
        }
    };

    const handleFeatureClick = (feature) => {
        if (feature.path) {
            navigate(feature.path);
        } else {
            showAction("Tính năng sắp ra mắt", "🚧", false);
        }
    };

    const handleGuideClick = () => {
        showAction("Tính năng sắp ra mắt", "🚧", false);
    };

    const handleDocumentationClick = () => {
        showAction("Tính năng sắp ra mắt", "🚧", false);
    };

    const handleSupportClick = () => {
        showAction("Tính năng sắp ra mắt", "🚧", false);
    };

    return {
        stats,
        features,
        quickActions,
        deviceStatus, // Trả về deviceStatus để UI có thể hiển thị trạng thái
        handleFeatureClick,
        handleQuickAction,
        handleGuideClick,
        handleDocumentationClick,
        handleSupportClick
    };
};