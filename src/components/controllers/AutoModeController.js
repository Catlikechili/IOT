import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToUpdates, updateDevice, connectToHiveMQ, getCurrentDeviceStates } from '../Service/hivemqService';

export const useAutoModeController = () => {
    const savedState = getCurrentDeviceStates();
    const [deviceStates, setDeviceStates] = useState({ fan: savedState.fan, pump: savedState.motor });
    const [currentMode, setCurrentMode] = useState(savedState.auto ? 'auto' : 'manual');

    // Khôi phục đầy đủ 5 trạm biểu đồ của bạn
    const [chartsData, setChartsData] = useState({
        V2: [], V3: [], V4: [], V5: [], V6: []
    });

    const lastActionTime = useRef(0);

    const handleHiveMQUpdate = useCallback((newData) => {
        // 1. Đồng bộ trạng thái thiết bị (có debounce 2s)
        if (newData.type === 'CONTROL_SYNC' && (Date.now() - lastActionTime.current > 2000)) {
            setDeviceStates({ fan: !!newData.fan, pump: !!newData.motor });
            if (newData.auto !== undefined) setCurrentMode(newData.auto ? 'auto' : 'manual');
        }

        // 2. Cập nhật dữ liệu cảm biến cho TẤT CẢ các trạm V2 -> V6
        if (newData.type === 'SENSOR_DATA') {
            const time = new Date().toLocaleTimeString();
            setChartsData(prev => ({
                V2: [...prev.V2, { created_at: time, field1: newData.temp }].slice(-10),
                V3: [...prev.V3, { created_at: time, field1: newData.hum1 }].slice(-10),
                V4: [...prev.V4, { created_at: time, field1: newData.hum2 }].slice(-10),
                V5: [...prev.V5, { created_at: time, field1: newData.hum3 }].slice(-10),
                V6: [...prev.V6, { created_at: time, field1: newData.hum4 }].slice(-10),
            }));
        }
    }, []);

    useEffect(() => {
        connectToHiveMQ();
        const unsubscribe = subscribeToUpdates(handleHiveMQUpdate);
        return () => unsubscribe();
    }, [handleHiveMQUpdate]);

    const handleModeChange = (mode) => {
        lastActionTime.current = Date.now();
        setCurrentMode(mode);
        updateDevice('auto', mode === 'auto');
    };

    const handleDeviceToggle = (type) => {
        if (currentMode === 'auto') return;
        lastActionTime.current = Date.now();
        const isPump = type === 'pump';
        const nextVal = !deviceStates[isPump ? 'pump' : 'fan'];

        updateDevice(type, nextVal);
        setDeviceStates(prev => ({ ...prev, [isPump ? 'pump' : 'fan']: nextVal }));
    };

    return { deviceStates, currentMode, chartsData, handleModeChange, handleDeviceToggle };
};