import React, { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToUpdates, connectToHiveMQ } from '../Service/hivemqService';
import {
    AlertTriangle, Thermometer, Droplets,
    Bell, Check, Trash2, Zap,
    BarChart3, Settings, RefreshCw
} from 'lucide-react';

const Notification = () => {
    const [alerts, setAlerts] = useState(() => {
        const stored = localStorage.getItem('smartAlerts') || '[]';
        return JSON.parse(stored);
    });

    const [currentData, setCurrentData] = useState({
        temp: 0,
        hum1: 0, hum2: 0, hum3: 0, hum4: 0
    });

    // Khởi tạo thresholds với tên biến đúng
    const [thresholds, setThresholds] = useState(() => {
        const saved = localStorage.getItem('iot_thresholds');
        if (saved) {
            return JSON.parse(saved);
        }
        // Tên biến đồng nhất với dữ liệu MQTT
        return {
            min_temp: 15,
            max_temp: 25,
            min_hum: 70,
            max_hum: 80,
            rapidChangeTemp: 3, // °C/phút - chỉ dùng trong app
            rapidChangeHum: 10  // %/phút - chỉ dùng trong app
        };
    });

    const [showSettings, setShowSettings] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const historyRef = useRef([]);

    // Hàm kiểm tra thay đổi nhanh
    const checkRapidChanges = useCallback((newData, timestamp) => {
        const newAlerts = [];

        if (historyRef.current.length > 0) {
            const lastData = historyRef.current[0];
            const timeDiff = (new Date(timestamp) - new Date(lastData.timestamp)) / (1000 * 60); // phút

            if (timeDiff > 0 && timeDiff <= 5) {
                // Kiểm tra thay đổi nhiệt độ nhanh
                const tempChange = Math.abs(newData.temp - lastData.temp);
                const tempRate = tempChange / timeDiff;

                if (tempRate > thresholds.rapidChangeTemp) {
                    newAlerts.push({
                        id: `rapid_temp_${Date.now()}`,
                        type: 'rapid_temperature',
                        channel: 'V2',
                        severity: tempRate > 5 ? 'high' : 'medium',
                        message: `⚡ Nhiệt độ thay đổi nhanh: ${tempRate.toFixed(1)}°C/phút`,
                        value: newData.temp,
                        previousValue: lastData.temp,
                        rate: tempRate,
                        timestamp: timestamp,
                        read: false,
                        icon: 'zap'
                    });
                }

                // Kiểm tra thay đổi độ ẩm nhanh (trung bình)
                const avgHumNow = (newData.hum1 + newData.hum2 + newData.hum3 + newData.hum4) / 4;
                const avgHumLast = (lastData.hum1 + lastData.hum2 + lastData.hum3 + lastData.hum4) / 4;
                const humChange = Math.abs(avgHumNow - avgHumLast);
                const humRate = humChange / timeDiff;

                if (humRate > thresholds.rapidChangeHum) {
                    newAlerts.push({
                        id: `rapid_hum_${Date.now()}`,
                        type: 'rapid_humidity',
                        channel: 'AVG',
                        severity: humRate > 15 ? 'high' : 'medium',
                        message: `⚡ Độ ẩm thay đổi nhanh: ${humRate.toFixed(1)}%/phút`,
                        value: avgHumNow,
                        previousValue: avgHumLast,
                        rate: humRate,
                        timestamp: timestamp,
                        read: false,
                        icon: 'zap'
                    });
                }
            }
        }

        return newAlerts;
    }, [thresholds]);

    // Hàm kiểm tra trung bình ngưỡng - SỬA LẠI
    const checkAverageThresholds = useCallback((data, timestamp) => {
        const newAlerts = [];
        const avgHumidity = (data.hum1 + data.hum2 + data.hum3 + data.hum4) / 4;

        // Kiểm tra nhiệt độ trung bình (theo thời gian)
        if (historyRef.current.length >= 3) {
            const last3 = historyRef.current.slice(0, 3);
            const avgTemp = last3.reduce((sum, d) => sum + d.temp, 0) / last3.length;

            // Sử dụng thresholds.max_temp và thresholds.min_temp
            if (avgTemp > thresholds.max_temp) {
                newAlerts.push({
                    id: `avg_temp_high_${Date.now()}`,
                    type: 'average_temperature',
                    channel: 'V2',
                    severity: 'high',
                    message: `📈 Nhiệt độ trung bình 3 phút cao: ${avgTemp.toFixed(1)}°C (Ngưỡng: ${thresholds.max_temp}°C)`,
                    value: avgTemp,
                    threshold: thresholds.max_temp,
                    duration: '3 phút',
                    timestamp: timestamp,
                    read: false,
                    icon: 'trending-up'
                });
            }

            if (avgTemp < thresholds.min_temp) {
                newAlerts.push({
                    id: `avg_temp_low_${Date.now()}`,
                    type: 'average_temperature',
                    channel: 'V2',
                    severity: 'medium',
                    message: `📉 Nhiệt độ trung bình 3 phút thấp: ${avgTemp.toFixed(1)}°C (Ngưỡng: ${thresholds.min_temp}°C)`,
                    value: avgTemp,
                    threshold: thresholds.min_temp,
                    duration: '3 phút',
                    timestamp: timestamp,
                    read: false,
                    icon: 'trending-down'
                });
            }
        }

        // Kiểm tra độ ẩm trung bình
        if (historyRef.current.length >= 3) {
            const last3 = historyRef.current.slice(0, 3);
            const avgHumHistory = last3.reduce((sum, d) =>
                sum + (d.hum1 + d.hum2 + d.hum3 + d.hum4) / 4, 0
            ) / last3.length;

            if (avgHumHistory > thresholds.max_hum) {
                newAlerts.push({
                    id: `avg_hum_high_${Date.now()}`,
                    type: 'average_humidity',
                    channel: 'AVG',
                    severity: 'medium',
                    message: `📈 Độ ẩm trung bình 3 phút cao: ${avgHumHistory.toFixed(1)}% (Ngưỡng: ${thresholds.max_hum}%)`,
                    value: avgHumHistory,
                    threshold: thresholds.max_hum,
                    duration: '3 phút',
                    timestamp: timestamp,
                    read: false,
                    icon: 'trending-up'
                });
            }

            if (avgHumHistory < thresholds.min_hum) {
                newAlerts.push({
                    id: `avg_hum_low_${Date.now()}`,
                    type: 'average_humidity',
                    channel: 'AVG',
                    severity: 'medium',
                    message: `📉 Độ ẩm trung bình 3 phút thấp: ${avgHumHistory.toFixed(1)}% (Ngưỡng: ${thresholds.min_hum}%)`,
                    value: avgHumHistory,
                    threshold: thresholds.min_hum,
                    duration: '3 phút',
                    timestamp: timestamp,
                    read: false,
                    icon: 'trending-down'
                });
            }
        }

        return newAlerts;
    }, [thresholds]);

    // Xử lý dữ liệu MQTT
    useEffect(() => {
        connectToHiveMQ();

        const unsubscribe = subscribeToUpdates((data) => {
            if (data.type === 'SENSOR_DATA') {
                const timestamp = new Date().toISOString();
                const newData = {
                    temp: data.temp || 0,
                    hum1: data.hum1 || 0,
                    hum2: data.hum2 || 0,
                    hum3: data.hum3 || 0,
                    hum4: data.hum4 || 0,
                    timestamp
                };

                setCurrentData({
                    temp: newData.temp,
                    hum1: newData.hum1,
                    hum2: newData.hum2,
                    hum3: newData.hum3,
                    hum4: newData.hum4
                });

                // Cập nhật lịch sử
                historyRef.current = [newData, ...historyRef.current.slice(0, 19)];
                setHistoryData(historyRef.current);

                // Kiểm tra tất cả loại cảnh báo
                const allAlerts = [
                    ...checkBasicThresholds(newData, timestamp),
                    ...checkRapidChanges(newData, timestamp),
                    ...checkAverageThresholds(newData, timestamp)
                ];

                // Tìm đến phần useEffect xử lý SENSOR_DATA
                if (allAlerts.length > 0) {
                    setAlerts(prevAlerts => {
                        // Lọc bỏ những cảnh báo vừa mới xuất hiện trong vòng 1 phút qua để tránh trùng
                        const filteredNewAlerts = allAlerts.filter(newA =>
                            !prevAlerts.some(oldA =>
                                oldA.type === newA.type &&
                                oldA.channel === newA.channel &&
                                (new Date(newA.timestamp) - new Date(oldA.timestamp)) < 60000 // 1 phút
                            )
                        );

                        if (filteredNewAlerts.length === 0) return prevAlerts;

                        const updated = [...filteredNewAlerts, ...prevAlerts].slice(0, 100);
                        localStorage.setItem('smartAlerts', JSON.stringify(updated));
                        return updated;
                    });
                }
            }

            if (data.type === 'THRESHOLD_SYNC') {
                const updatedThresholds = {
                    ...thresholds, // Giữ lại rapidChangeTemp và rapidChangeHum
                    min_temp: data.min_temp || thresholds.min_temp,
                    max_temp: data.max_tem || data.max_temp || thresholds.max_temp,
                    min_hum: data.min_hum || thresholds.min_hum,
                    max_hum: data.max_hum || thresholds.max_hum
                };

                setThresholds(updatedThresholds);
                localStorage.setItem('iot_thresholds', JSON.stringify(updatedThresholds));
            }
        });

        return unsubscribe;
    }, [alerts, checkRapidChanges, checkAverageThresholds]);

    // Hàm kiểm tra ngưỡng cơ bản
    const checkBasicThresholds = useCallback((data, timestamp) => {
        const newAlerts = [];

        // Kiểm tra nhiệt độ
        // Chỉ thông báo khi NGOÀI khoảng [min_temp, max_temp]
        if (data.temp > thresholds.max_temp) {
            newAlerts.push({
                id: `temp_high_${Date.now()}`,
                type: 'temperature_high',
                channel: 'V2',
                severity: 'high',
                message: `🔥 Nhiệt độ quá cao: ${data.temp}°C (Ngưỡng tối đa: ${thresholds.max_temp}°C)`,
                value: data.temp,
                threshold: thresholds.max_temp,
                timestamp,
                read: false,
                icon: 'thermometer'
            });
        } else if (data.temp < thresholds.min_temp) {
            newAlerts.push({
                id: `temp_low_${Date.now()}`,
                type: 'temperature_low',
                channel: 'V2',
                severity: 'medium',
                message: `❄️ Nhiệt độ quá thấp: ${data.temp}°C (Ngưỡng tối thiểu: ${thresholds.min_temp}°C)`,
                value: data.temp,
                threshold: thresholds.min_temp,
                timestamp,
                read: false,
                icon: 'thermometer'
            });
        }

        // Kiểm tra từng kênh độ ẩm (V3 đến V6)
        const humidityChannels = [
            ['V3', data.hum1], ['V4', data.hum2],
            ['V5', data.hum3], ['V6', data.hum4]
        ];

        humidityChannels.forEach(([channel, value]) => {
            // Chỉ thông báo khi NGOÀI khoảng [min_hum, max_hum]
            if (value > thresholds.max_hum) {
                newAlerts.push({
                    id: `hum_high_${channel}_${Date.now()}`,
                    type: 'humidity_high',
                    channel,
                    severity: value > thresholds.max_hum + 10 ? 'high' : 'medium',
                    message: `💧 Độ ẩm ${channel} quá cao: ${value}%`,
                    value,
                    threshold: thresholds.max_hum,
                    timestamp,
                    read: false,
                    icon: 'droplets'
                });
            } else if (value < thresholds.min_hum) {
                newAlerts.push({
                    id: `hum_low_${channel}_${Date.now()}`,
                    type: 'humidity_low',
                    channel,
                    severity: value < thresholds.min_hum - 10 ? 'high' : 'medium',
                    message: `💧 Độ ẩm ${channel} quá thấp: ${value}%`,
                    value,
                    threshold: thresholds.min_hum,
                    timestamp,
                    read: false,
                    icon: 'droplets'
                });
            }
        });

        return newAlerts;
    }, [thresholds]);

    // UI Helper functions
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            default: return '#10b981';
        }
    };

    const getTypeColor = (type) => {
        if (type.includes('temperature')) return '#f97316';
        if (type.includes('humidity')) return '#0ea5e9';
        if (type.includes('rapid')) return '#8b5cf6';
        if (type.includes('average')) return '#ec4899';
        return '#6b7280';
    };

    const formatTime = (timestamp) => {
        const diff = (Date.now() - new Date(timestamp)) / 60000;
        if (diff < 1) return 'Vừa xong';
        if (diff < 60) return `${Math.floor(diff)} phút trước`;
        if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
        return new Date(timestamp).toLocaleDateString('vi-VN');
    };

    const markAsRead = (id) => {
        const updated = alerts.map(alert =>
            alert.id === id ? { ...alert, read: true } : alert
        );
        setAlerts(updated);
        localStorage.setItem('smartAlerts', JSON.stringify(updated));
    };

    const markAllAsRead = () => {
        const updated = alerts.map(alert => ({ ...alert, read: true }));
        setAlerts(updated);
        localStorage.setItem('smartAlerts', JSON.stringify(updated));
    };

    const clearAll = () => {
        if (window.confirm('Xóa tất cả cảnh báo?')) {
            setAlerts([]);
            localStorage.setItem('smartAlerts', '[]');
        }
    };

    // Thống kê
    const unreadCount = alerts.filter(a => !a.read).length;
    const stats = {
        temperature: alerts.filter(a => a.type.includes('temperature')).length,
        humidity: alerts.filter(a => a.type.includes('humidity')).length,
        rapid: alerts.filter(a => a.type.includes('rapid')).length,
        average: alerts.filter(a => a.type.includes('average')).length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                                <Bell className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    Thông Báo Thông Minh
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Giám sát thời gian thực • Phát hiện bất thường
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <span className="px-4 py-2 bg-red-500 text-white rounded-full font-semibold animate-pulse">
                                    {unreadCount} mới
                                </span>
                            )}
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Settings className="h-6 w-6 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <Thermometer className="h-8 w-8 text-orange-500" />
                                <span className="text-2xl font-bold text-gray-800">{stats.temperature}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">Cảnh báo nhiệt độ</div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <Droplets className="h-8 w-8 text-blue-500" />
                                <span className="text-2xl font-bold text-gray-800">{stats.humidity}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">Cảnh báo độ ẩm</div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <Zap className="h-8 w-8 text-purple-500" />
                                <span className="text-2xl font-bold text-gray-800">{stats.rapid}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">Thay đổi nhanh</div>
                        </div>

                        <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <BarChart3 className="h-8 w-8 text-pink-500" />
                                <span className="text-2xl font-bold text-gray-800">{stats.average}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">Trung bình ngưỡng</div>
                        </div>
                    </div>
                </div>

                {/* Current Data Display - SỬA TÊN BIẾN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Thermometer className="h-5 w-5 text-orange-500" />
                                Nhiệt Độ Hiện Tại
                            </h2>
                            <span className="text-sm text-gray-500">Kênh V2</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-5xl font-bold text-gray-800">
                                    {currentData.temp.toFixed(1)}°C
                                </div>
                                <div className="text-sm text-gray-500 mt-2">
                                    Ngưỡng: {thresholds.min_temp}°C - {thresholds.max_temp}°C
                                </div>
                            </div>
                            <div className={`text-3xl ${currentData.temp > thresholds.max_temp ? 'text-red-500' : 'text-green-500'}`}>
                                {currentData.temp > thresholds.max_temp ? '🔥' : '✅'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Droplets className="h-5 w-5 text-blue-500" />
                                Độ Ẩm Trung Bình
                            </h2>
                            <span className="text-sm text-gray-500">Kênh V3-V6</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-5xl font-bold text-gray-800">
                                    {((currentData.hum1 + currentData.hum2 + currentData.hum3 + currentData.hum4) / 4).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-500 mt-2">
                                    Ngưỡng: {thresholds.min_hum}% - {thresholds.max_hum}%
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[currentData.hum1, currentData.hum2, currentData.hum3, currentData.hum4].map((hum, idx) => (
                                    <div key={idx} className="text-center">
                                        <div className="text-xs text-gray-500">V{idx + 3}</div>
                                        <div className={`text-sm font-semibold ${hum > thresholds.max_hum ? 'text-red-500' : hum < thresholds.min_hum ? 'text-yellow-500' : 'text-blue-500'}`}>
                                            {hum.toFixed(0)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Panel - SỬA TÊN BIẾN */}
                {showSettings && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">⚙️ Cài Đặt Ngưỡng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nhiệt độ (°C)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={thresholds.min_temp}
                                        onChange={(e) => setThresholds(prev => ({
                                            ...prev,
                                            min_temp: Number(e.target.value)
                                        }))}
                                        className="flex-1 p-2 border rounded-lg"
                                        placeholder="Min"
                                    />
                                    <input
                                        type="number"
                                        value={thresholds.max_temp}
                                        onChange={(e) => setThresholds(prev => ({
                                            ...prev,
                                            max_temp: Number(e.target.value)
                                        }))}
                                        className="flex-1 p-2 border rounded-lg"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Độ ẩm (%)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={thresholds.min_hum}
                                        onChange={(e) => setThresholds(prev => ({
                                            ...prev,
                                            min_hum: Number(e.target.value)
                                        }))}
                                        className="flex-1 p-2 border rounded-lg"
                                        placeholder="Min"
                                    />
                                    <input
                                        type="number"
                                        value={thresholds.max_hum}
                                        onChange={(e) => setThresholds(prev => ({
                                            ...prev,
                                            max_hum: Number(e.target.value)
                                        }))}
                                        className="flex-1 p-2 border rounded-lg"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thay đổi nhanh nhiệt độ (°C/phút)
                                </label>
                                <input
                                    type="number"
                                    value={thresholds.rapidChangeTemp}
                                    onChange={(e) => setThresholds(prev => ({
                                        ...prev,
                                        rapidChangeTemp: Number(e.target.value)
                                    }))}
                                    className="w-full p-2 border rounded-lg"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thay đổi nhanh độ ẩm (%/phút)
                                </label>
                                <input
                                    type="number"
                                    value={thresholds.rapidChangeHum}
                                    onChange={(e) => setThresholds(prev => ({
                                        ...prev,
                                        rapidChangeHum: Number(e.target.value)
                                    }))}
                                    className="w-full p-2 border rounded-lg"
                                    step="0.1"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                // Lưu cài đặt vào localStorage
                                localStorage.setItem('iot_thresholds', JSON.stringify(thresholds));
                                setShowSettings(false);
                            }}
                            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                            Lưu Cài Đặt
                        </button>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="mt-2 ml-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                )}

                {/* Control Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                    >
                        <Check className="h-5 w-5" />
                        Đánh dấu đã đọc tất cả
                    </button>
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                        <Trash2 className="h-5 w-5" />
                        Xóa tất cả cảnh báo
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Làm mới dữ liệu
                    </button>
                </div>

                {/* Alerts List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Danh Sách Cảnh Báo ({alerts.length})
                        </h2>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-6xl mb-4">🎯</div>
                                <h3 className="text-xl font-medium text-gray-700 mb-2">
                                    Không có cảnh báo nào
                                </h3>
                                <p className="text-gray-500">
                                    Hệ thống sẽ thông báo khi phát hiện bất thường
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-6 transition-all hover:bg-gray-50 ${alert.read ? 'opacity-75' : 'bg-blue-50'}`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="p-2 rounded-lg"
                                                        style={{ backgroundColor: `${getTypeColor(alert.type)}20` }}
                                                    >
                                                        {alert.icon === 'zap' ? (
                                                            <Zap className="h-6 w-6" style={{ color: getTypeColor(alert.type) }} />
                                                        ) : alert.icon === 'thermometer' ? (
                                                            <Thermometer className="h-6 w-6" style={{ color: getTypeColor(alert.type) }} />
                                                        ) : alert.icon === 'droplets' ? (
                                                            <Droplets className="h-6 w-6" style={{ color: getTypeColor(alert.type) }} />
                                                        ) : (
                                                            <AlertTriangle className="h-6 w-6" style={{ color: getTypeColor(alert.type) }} />
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className={`font-semibold ${alert.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                                {alert.message}
                                                            </h3>
                                                            <span
                                                                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                                                                style={{ backgroundColor: getSeverityColor(alert.severity) }}
                                                            >
                                                                {alert.severity === 'high' ? 'Cao' : 'Trung bình'}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <span className="font-medium">Kênh:</span> {alert.channel}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="font-medium">Giá trị:</span>
                                                                <span className="font-bold" style={{ color: getTypeColor(alert.type) }}>
                                                                    {alert.value}{alert.type.includes('temperature') ? '°C' : '%'}
                                                                </span>
                                                            </span>
                                                            {alert.threshold && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="font-medium">Ngưỡng:</span> {alert.threshold}
                                                                </span>
                                                            )}
                                                            {alert.rate && (
                                                                <span className="flex items-center gap-1">
                                                                    <Zap className="h-3 w-3" />
                                                                    <span className="font-medium">Tốc độ:</span> {alert.rate.toFixed(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-3">
                                                <div className="text-sm text-gray-500">
                                                    {formatTime(alert.timestamp)}
                                                </div>

                                                {!alert.read && (
                                                    <button
                                                        onClick={() => markAsRead(alert.id)}
                                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-md transition-all flex items-center gap-2"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        Đánh dấu đã đọc
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-gray-500 text-sm">
                    <p>Hệ thống giám sát thông minh • Cập nhật thời gian thực</p>
                    <p className="mt-1">Dữ liệu từ 5 kênh cảm biến (V2-V6)</p>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default Notification;