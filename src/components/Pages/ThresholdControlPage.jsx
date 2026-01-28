import React, { useState, useEffect } from 'react';
import { updateThresholds, connectToHiveMQ } from '../Service/hivemqService';
import { toast } from 'sonner';

const ThresholdControlPage = () => {
    // Trạng thái lưu trữ giá trị ngưỡng
    const [thresholds, setThresholds] = useState({
        minT: 15,
        maxT: 25,
        minH: 70,
        maxH: 80
    });

    useEffect(() => {
        // Khởi tạo kết nối MQTT khi component mount
        connectToHiveMQ();
        console.log('✅ Đã khởi tạo kết nối MQTT');
    }, []);

    // Hàm xử lý khi người dùng nhập liệu, giới hạn từ 0-100
    const handleInputChange = (field, value) => {
        let numValue = Number(value);

        if (field === 'minT' || field === 'maxT') {
            if (numValue < 0) numValue = 0;
            if (numValue > 100) numValue = 100;
        } else if (field === 'minH' || field === 'maxH') {
            if (numValue < 0) numValue = 0;
            if (numValue > 100) numValue = 100;
        }

        setThresholds(prev => ({ ...prev, [field]: numValue }));
    };

    const handleSave = () => {
        const { minT, maxT, minH, maxH } = thresholds;

        // Kiểm tra tính hợp lệ của dữ liệu đầu vào
        if (isNaN(minT) || isNaN(maxT) || isNaN(minH) || isNaN(maxH)) {
            toast.error("Vui lòng nhập số hợp lệ!");
            return;
        }

        if (minT >= maxT) {
            toast.error("Nhiệt độ Min phải nhỏ hơn Max!");
            return;
        }

        if (minH >= maxH) {
            toast.error("Độ ẩm Min phải nhỏ hơn Max!");
            return;
        }

        try {
            // Gửi dữ liệu xuống thiết bị thông qua service
            // Service sẽ tự động chuyển max_temp thành max_tem cho ESP32
            updateThresholds({
                min_temp: minT,
                max_temp: maxT,
                min_hum: minH,
                max_hum: maxH
            });

            toast.success("🚀 Đã gửi cấu hình mới xuống thiết bị biên!");
        } catch (error) {
            console.error('❌ Lỗi khi gửi thresholds:', error);
            toast.error("Gửi cấu hình thất bại!");
        }
    };

    // Styles nội bộ (Giữ nguyên từ code gốc của bạn)
    const inputStyle = {
        padding: '10px',
        margin: '5px 0',
        width: '100%',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '16px',
        boxSizing: 'border-box'
    };

    return (
        <div style={{
            padding: '25px',
            borderRadius: '12px',
            maxWidth: '400px',
            backgroundColor: '#fdfdfd',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            margin: '20px auto'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333', textAlign: 'center', fontSize: '20px', fontWeight: '600' }}>
                ⚙️ Cấu Hình Hệ Thống
            </h3>

            {/* Điều khiển Nhiệt độ */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px', color: '#555' }}>
                    Nhiệt độ ngưỡng (°C)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="number"
                        value={thresholds.minT}
                        onChange={e => handleInputChange('minT', e.target.value)}
                        style={inputStyle}
                        placeholder="Min T"
                    />
                    <input
                        type="number"
                        value={thresholds.maxT}
                        onChange={e => handleInputChange('maxT', e.target.value)}
                        style={inputStyle}
                        placeholder="Max T"
                    />
                </div>
            </div>

            {/* Điều khiển Độ ẩm */}
            <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px', color: '#555' }}>
                    Độ ẩm đất ngưỡng (%)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="number"
                        value={thresholds.minH}
                        onChange={e => handleInputChange('minH', e.target.value)}
                        style={inputStyle}
                        placeholder="Min H"
                    />
                    <input
                        type="number"
                        value={thresholds.maxH}
                        onChange={e => handleInputChange('maxH', e.target.value)}
                        style={inputStyle}
                        placeholder="Max H"
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
                CẬP NHẬT THIẾT BỊ
            </button>
        </div>
    );
};

export default ThresholdControlPage;