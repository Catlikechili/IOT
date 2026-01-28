// src/controllers/general_controller.js
import { useNavigate } from 'react-router-dom';

/**
 * General Controller cho các chức năng điều hướng và tiện ích chung
 */
export const useGeneralController = () => {
    const navigate = useNavigate();

    /**
     * Map các manual mode ID với đường dẫn và handler tương ứng
     */
    const manualModeHandlers = {
        1: () => navigate('/config'), // Cấu hình hệ thống
        2: () => navigate('/automode'), // Điều khiển thiết bị
        3: () => navigate('/notdound'), // Bảo mật
        4: () => navigate('/notification'), // Hiệu suất
    };

    /**
     * Xử lý click vào manual mode card
     * @param {number} modeId - ID của manual mode
     */
    const handleManualModeClick = (modeId) => {
        const handler = manualModeHandlers[modeId];

        if (handler) {
            handler();
        } else {
            console.warn(`No handler found for manual mode ID: ${modeId}`);
            // Fallback: điều hướng đến trang mặc định
            navigate('/settings');
        }
    };

    return {
        handleManualModeClick
    };
};