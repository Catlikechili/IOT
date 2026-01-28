// src/components/Pages/UserPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, Container, Paper, Card, CardContent, Stack, Divider } from '@mui/material';
import { Thermostat, Opacity, Warning, NotificationsActive } from '@mui/icons-material';
import { ChartLineDots } from '../Chart/chart';
import { subscribeToUpdates, connectToHiveMQ } from '../Service/hivemqService';
import { useAutoModeController } from '../controllers/AutoModeController';
import { Toaster, toast } from 'sonner';

export const UserPage = () => {
    const { chartsData } = useAutoModeController();
    const [alerts, setAlerts] = useState(() => JSON.parse(localStorage.getItem('smartAlerts') || '[]'));
    const [currentData, setCurrentData] = useState({ temp: 0, hum1: 0, hum2: 0, hum3: 0, hum4: 0 });

    // 1. Logic lấy ngưỡng so sánh (Thresholds)
    const getThresholds = () => {
        const saved = localStorage.getItem('iot_thresholds');
        return saved ? JSON.parse(saved) : {
            min_temp: 15, max_temp: 25, min_hum: 70, max_hum: 80
        };
    };

    // 2. Logic tạo và lưu cảnh báo khi phát hiện vượt ngưỡng
    const checkAndAddAlert = useCallback((newData) => {
        const limits = getThresholds();
        const timestamp = new Date().toISOString();
        let newAlerts = [];

        // So sánh nhiệt độ (V2)
        if (newData.temp > limits.max_temp) {
            newAlerts.push({ id: Date.now() + 1, message: `Nhiệt độ quá cao: ${newData.temp}°C`, channel: 'V2', severity: 'high', timestamp });
        } else if (newData.temp < limits.min_temp) {
            newAlerts.push({ id: Date.now() + 2, message: `Nhiệt độ quá thấp: ${newData.temp}°C`, channel: 'V2', severity: 'warning', timestamp });
        }

        // So sánh độ ẩm (V3 - V6)
        const humValues = [newData.hum1, newData.hum2, newData.hum3, newData.hum4];
        humValues.forEach((val, index) => {
            const channelName = `V${index + 3}`;
            if (val < limits.min_hum) {
                newAlerts.push({ id: Date.now() + index + 3, message: `Độ ẩm khu vực ${channelName} thấp: ${val}%`, channel: channelName, severity: 'high', timestamp });
            } else if (val > limits.max_hum) {
                newAlerts.push({ id: Date.now() + index + 7, message: `Độ ẩm khu vực ${channelName} cao: ${val}%`, channel: channelName, severity: 'warning', timestamp });
            }
        });

        if (newAlerts.length > 0) {
            // Hiển thị thông báo Toast nhanh
            newAlerts.forEach(a => {
                toast[a.severity === 'high' ? 'error' : 'warning'](a.message);
            });

            // Cập nhật danh sách cảnh báo vào state và localStorage
            setAlerts(prev => {
                const updated = [...newAlerts, ...prev].slice(0, 30); // Giữ 30 tin mới nhất
                localStorage.setItem('smartAlerts', JSON.stringify(updated));
                return updated;
            });
        }
    }, []);

    // 3. Đăng ký nhận dữ liệu và thực hiện so sánh
    useEffect(() => {
        connectToHiveMQ();
        const unsubscribe = subscribeToUpdates((data) => {
            if (data.type === 'SENSOR_DATA') {
                const newData = {
                    temp: data.temp || 0,
                    hum1: data.hum1 || 0,
                    hum2: data.hum2 || 0,
                    hum3: data.hum3 || 0,
                    hum4: data.hum4 || 0
                };
                setCurrentData(newData);
                checkAndAddAlert(newData); // Chạy logic so sánh ở đây
            }
        });
        return unsubscribe;
    }, [checkAndAddAlert]);

    const chartConfigs = [
        { id: 'V2', title: 'Nhiệt độ không khí', color: '#ff4d4f' },
        { id: 'V3', title: 'Độ ẩm đất - Khu A', color: '#52c41a' },
        { id: 'V4', title: 'Độ ẩm đất - Khu B', color: '#1890ff' },
        { id: 'V5', title: 'Độ ẩm đất - Khu C', color: '#722ed1' },
        { id: 'V6', title: 'Độ ẩm đất - Khu D', color: '#fa8c16' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Toaster richColors position="top-right" />

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">Giám Sát Hệ Thống</Typography>
                <Typography variant="body2" color="textSecondary">Chế độ quan sát & Cảnh báo tự động</Typography>
            </Box>

            {/* Các thẻ chỉ số hiện tại */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, borderLeft: '8px solid #ff9800' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="overline" color="textSecondary">NHIỆT ĐỘ</Typography>
                                <Typography variant="h3" fontWeight="bold">{currentData.temp}°C</Typography>
                            </Box>
                            <Thermostat sx={{ fontSize: 40, color: '#ff9800' }} />
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, borderLeft: '8px solid #2196f3' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="overline" color="textSecondary">ĐỘ ẨM TB</Typography>
                                <Typography variant="h3" fontWeight="bold">
                                    {((currentData.hum1 + currentData.hum2 + currentData.hum3 + currentData.hum4) / 4).toFixed(1)}%
                                </Typography>
                            </Box>
                            <Opacity sx={{ fontSize: 40, color: '#2196f3' }} />
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Phần đồ thị */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {chartConfigs.map((config) => (
                    <Grid item xs={12} md={6} lg={4} key={config.id}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <ChartLineDots title={config.title} color={config.color} data={chartsData[config.id] || []} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Phần hiển thị danh sách cảnh báo đã so sánh */}
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsActive color="error" />
                    <Typography variant="h6" fontWeight="bold">Lịch sử cảnh báo vượt ngưỡng</Typography>
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: 'auto', p: 2 }}>
                    {alerts.length === 0 ? (
                        <Typography color="textSecondary" align="center">Hệ thống an toàn - Chưa có cảnh báo</Typography>
                    ) : (
                        alerts.map((alert) => (
                            <Box key={alert.id} sx={{
                                mb: 1.5, p: 2, borderRadius: 2,
                                bgcolor: alert.severity === 'high' ? '#fff1f2' : '#fffbeb',
                                borderLeft: `5px solid ${alert.severity === 'high' ? '#e11d48' : '#f59e0b'}`,
                                display: 'flex', justifyContent: 'space-between'
                            }}>
                                <Box>
                                    <Typography variant="body2" fontWeight="bold" color={alert.severity === 'high' ? 'error' : 'warning.main'}>
                                        {alert.message}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Kênh: {alert.channel} • {new Date(alert.timestamp).toLocaleTimeString('vi-VN')}
                                    </Typography>
                                </Box>
                                <Warning color={alert.severity === 'high' ? 'error' : 'warning'} />
                            </Box>
                        ))
                    )}
                </Box>
            </Paper>
        </Container>
    );
};