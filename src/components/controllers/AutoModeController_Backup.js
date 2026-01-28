//import { useState, useEffect, useCallback } from 'react';
//import { toast } from 'sonner';
//import { updatePin, subscribeToUpdates } from '../Service/blynkService';

//export const useAutoModeController = () => {
//    const [deviceStates, setDeviceStates] = useState({ fan: false, pump: false });
//    const [currentMode, setCurrentMode] = useState('manual');
//    const [history, setHistory] = useState([]);
//    const [averages, setAverages] = useState({ temperature: 0, soilAvg: 0 });

//    // 1. KHAI BÁO chartsData để lưu trữ dữ liệu 5 biểu đồ riêng biệt
//    const [chartsData, setChartsData] = useState({
//        V2: [], // Nhiệt độ
//        V3: [], // Độ ẩm đất A
//        V4: [], // Độ ẩm đất B
//        V5: [], // Độ ẩm đất C
//        V6: []  // Độ ẩm đất D
//    });

//    const handleBlynkUpdate = useCallback((newData) => {
//        const timeLabel = new Date().toLocaleTimeString('vi-VN', {
//            hour: '2-digit',
//            minute: '2-digit',
//            second: '2-digit',
//            hour12: false
//        });

//        // Lấy giá trị an toàn
//        const temp = newData.V2 || 0;
//        const v3 = newData.soil_humidity?.V3 || 0;
//        const v4 = newData.soil_humidity?.V4 || 0;
//        const v5 = newData.soil_humidity?.V5 || 0;
//        const v6 = newData.soil_humidity?.V6 || 0;

//        const soilAvg = (v3 + v4 + v5 + v6) / 4;

//        // Cập nhật Averages (Làm tròn để hiển thị trên Card)
//        setAverages({
//            temperature: Number(temp).toFixed(1),
//            soilAvg: Math.round(soilAvg)
//        });

//        // Cập nhật trạng thái thiết bị và chế độ từ thiết bị gửi về
//        setDeviceStates({
//            fan: newData.state_fan,
//            pump: newData.state_motor
//        });
//        setCurrentMode(newData.is_auto_mode ? 'auto' : 'manual');

//        // 2. CẬP NHẬT chartsData (Dùng dataset riêng cho từng biểu đồ)
//        setChartsData(prev => ({
//            V2: [...prev.V2, { created_at: timeLabel, field1: temp }].slice(-20),
//            V3: [...prev.V3, { created_at: timeLabel, field1: v3 }].slice(-20),
//            V4: [...prev.V4, { created_at: timeLabel, field1: v4 }].slice(-20),
//            V5: [...prev.V5, { created_at: timeLabel, field1: v5 }].slice(-20),
//            V6: [...prev.V6, { created_at: timeLabel, field1: v6 }].slice(-20),
//        }));

//        // 3. Cập nhật lịch sử tổng hợp (Nếu UI vẫn dùng mảng history)
//        const newPoint = {
//            timestamp: timeLabel,
//            V2: temp, V3: v3, V4: v4, V5: v5, V6: v6,
//            soilAvg: soilAvg
//        };

//        setHistory(prevHistory => {
//            const updatedHistory = Array.isArray(prevHistory) ? [...prevHistory, newPoint] : [newPoint];
//            return updatedHistory.slice(-20);
//        });
//    }, []);

//    useEffect(() => {
//        subscribeToUpdates(handleBlynkUpdate);
//    }, [handleBlynkUpdate]);

//    const handleModeChange = useCallback(async (mode) => {
//        const isAuto = (mode === 'auto');
//        updatePin('V8', isAuto);
//        setCurrentMode(mode);
//        toast.success(`Chế độ: ${isAuto ? 'Tự động ✨' : 'Thủ công ✋'}`);
//    }, []);

//    const handleDeviceToggle = useCallback(async (type) => {
//        if (currentMode === 'auto') {
//            toast.warning('Tắt chế độ Tự động để điều khiển thiết bị!');
//            return;
//        }

//        const pin = type === 'fan' ? 'V1' : 'V0';
//        const currentState = deviceStates[type];
//        const newState = !currentState;

//        updatePin(pin, newState);
//        // Cập nhật Optimistic UI
//        setDeviceStates(prev => ({ ...prev, [type]: newState }));
//        toast.success(`${type === 'fan' ? 'Quạt' : 'Máy bơm'} đã ${newState ? 'bật' : 'tắt'}`);
//    }, [currentMode, deviceStates]);

//    return {
//        deviceStates,
//        currentMode,
//        history,
//        averages,
//        chartsData, // Trả về để Page có thể dùng
//        handleModeChange,
//        handleDeviceToggle,
//    };
//};
// src/components/Service/hivemqService.js
