// src/components/Pages/AutoModePage.jsx
import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Switch,
    Container,
    Paper,
    Alert,
    Button,
    Divider,
    Chip,
    LinearProgress,
    IconButton,
    Tooltip,
    Badge,
    List,
    Stack,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    Thermostat,
    Opacity,
    Air,
    AcUnit,
    Whatshot,
    DeviceThermostat,
    Refresh,
    Notifications,
    Warning,
    Info,
    CheckCircle,
    Timeline

} from '@mui/icons-material';
import { Toaster } from 'sonner';
import { styled } from '@mui/material/styles'; // Di chuyển lên trên
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsIcon from '@mui/icons-material/Settings';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { LineChart } from '@mui/x-charts/LineChart'; // Import từ MUI X Charts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
        ResponsiveContainer,
    Cell
} from 'recharts';
import { ChartLineDots } from '../Chart/chart';
import TimelineIcon from "@mui/icons-material/Timeline";

// Controller
import { useAutoModeController } from '../controllers/AutoModeController';

// ===== Helper Functions =====
const getSeverityColor = (severity) => {
    const colors = {
        'high': '#ef4444',
        'medium': '#f59e0b',
        'low': '#10b981',
    };
    return colors[severity] || '#6b7280';
};

// ===== Styled Components =====
const StatusCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
    }
}));

const AlertListItem = styled(ListItem)(({ severity, theme }) => ({
    marginBottom: theme.spacing(1),
    borderRadius: 8,
    backgroundColor: severity ? `${getSeverityColor(severity)}10` : 'transparent',
    borderLeft: `4px solid ${getSeverityColor(severity)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: severity ? `${getSeverityColor(severity)}15` : '#f5f5f5'
    }
}));

// ===== Main Component =====
const AutoModePage = () => {


    const controller = useAutoModeController();
    const {
        deviceStates,
        currentMode,
        chartsData,
        handleModeChange,
        handleDeviceToggle,
        history,

    } = controller;


    const chartConfigs = [
        { id: 'V2', title: 'Nhiệt độ không khí', color: '#ff4d4f', unit: '°C' },
        { id: 'V3', title: 'Độ ẩm đất - Khu A', color: '#52c41a', unit: '%' },
        { id: 'V4', title: 'Độ ẩm đất - Khu B', color: '#1890ff', unit: '%' },
        { id: 'V5', title: 'Độ ẩm đất - Khu C', color: '#722ed1', unit: '%' },
        { id: 'V6', title: 'Độ ẩm đất - Khu D', color: '#fa8c16', unit: '%' },
    ];
    // Sử dụng getSeverityColor từ controller nếu có, nếu không dùng hàm local
    const getSeverityColorFunc =  getSeverityColor;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Toaster position="top-right" />

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    mt: 4,
                    gap: 2
                }}>
                    <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #ff7043 0%, #ff9800 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(255, 112, 67, 0.3)'
                    }}>
                        <Typography variant="h4" sx={{ color: 'white' }}>
                            🌡️
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h4" sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #ff7043 0%, #ff9800 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                        }}>
                            Chế độ điều khiển tự động
                        </Typography>
                        <Typography variant="body2" sx={{
                            color: '#666',
                            fontStyle: 'italic'
                        }}>
                            Thông minh • Tiết kiệm • Tối ưu
                        </Typography>
                    </Box>
                </Box>


                <Box>

                </Box>
            </Box>




            {/* System Status Panel */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.2, borderRadius: '12px', background: 'rgba(76,175,80,0.15)', display: 'flex' }}>
                        <AutoAwesomeIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        Trạng thái hệ thống
                    </Typography>
                </Box>

                <Grid container spacing={2} justifyContent="center">
                  
                    {/* Cột 1: Mode Status */}
                    <Grid item xs={12} md={4}>
                        <StatusCard sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <SettingsIcon sx={{ fontSize: 20, color: '#7b1fa2' }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                                        CHẾ ĐỘ HOẠT ĐỘNG
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    {[
                                        {
                                            id: "manual",
                                            label: "Thủ công",
                                            icon: <TouchAppIcon />,
                                            activeBg: "#f0f9ff", // Xanh dương cực nhẹ
                                            activeColor: "#0284c7",
                                            activeBorder: "#bae6fd"
                                        },
                                        {
                                            id: "auto",
                                            label: "Tự động",
                                            icon: <AutoModeIcon />,
                                            activeBg: "#f0fdf4", // Xanh lá cực nhẹ (Mint)
                                            activeColor: "#16a34a",
                                            activeBorder: "#bbf7d0"
                                        }
                                    ].map((mode) => {
                                        const isActive = currentMode === mode.id;
                                        return (
                                            <Grid item xs={6} key={mode.id}>
                                                <Box
                                                    onClick={() => handleModeChange(mode.id)}
                                                    sx={{
                                                        p: 2,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: 4, // Bo góc lớn hiện đại
                                                        cursor: "pointer",
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        bgcolor: isActive ? mode.activeBg : "#ffffff",
                                                        border: "1px solid",
                                                        borderColor: isActive ? mode.activeBorder : "#f1f5f9",
                                                        boxShadow: isActive
                                                            ? `0 10px 15px -3px ${mode.activeBg}, 0 4px 6px -4px ${mode.activeBg}`
                                                            : "0 1px 3px rgba(0,0,0,0.02)",
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&:hover': {
                                                            transform: "translateY(-2px)",
                                                            borderColor: mode.activeBorder
                                                        }
                                                    }}
                                                >
                                                    {/* Vòng tròn mờ trang trí phía sau icon */}
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: -10,
                                                        right: -10,
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        bgcolor: isActive ? mode.activeColor : 'transparent',
                                                        opacity: 0.05
                                                    }} />

                                                    <Box sx={{
                                                        color: isActive ? mode.activeColor : "#94a3b8",
                                                        mb: 1,
                                                        display: 'flex',
                                                        transition: '0.3s',
                                                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                                                    }}>
                                                        {React.cloneElement(mode.icon, { fontSize: "medium" })}
                                                    </Box>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: isActive ? mode.activeColor : "#64748b",
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {mode.label}
                                                    </Typography>

                                                    {/* Indicator dưới cùng */}
                                                    <Box sx={{
                                                        mt: 1,
                                                        width: 24,
                                                        height: 3,
                                                        borderRadius: 1,
                                                        bgcolor: isActive ? mode.activeColor : "transparent",
                                                        transition: '0.3s'
                                                    }} />
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </CardContent>
                        </StatusCard>
                    </Grid>

                    {/* Cột 2: Quick Actions */}
                    <Grid item xs={12} md={4}>
                        <StatusCard
                            sx={{
                                height: '100%',
                                transition: "0.25s",
                                // Không làm mờ cả card để người dùng vẫn đọc được trạng thái
                                border: currentMode === "auto" ? '1px dashed #ccc' : '1px solid #e0e0e0',
                            }}
                        >
                            <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* Tiêu đề */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '8px',
                                            background: currentMode === "auto"
                                                ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                                                : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <SettingsIcon sx={{ fontSize: 18, color: 'white' }} />
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            ĐIỀU KHIỂN 
                                        </Typography>
                                    </Box>

                                    {/* Chip trạng thái chế độ */}
                                    <Chip
                                        label={currentMode === "auto" ? "ĐANG KHÓA" : "THỦ CÔNG"}
                                        size="small"
                                        color={currentMode === "auto" ? "default" : "success"}
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                    />
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {/* Danh sách thiết bị */}
                                <Stack
                                    spacing={2}
                                    sx={{
                                        flex: 1,
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    }}
                                >
                                    {/* MÁY BƠM (V0) */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: deviceStates.pump ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                                            border: '1px solid',
                                            borderColor: deviceStates.pump ? 'success.main' : 'divider',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                borderColor: currentMode !== 'auto' && deviceStates.pump ? 'success.dark' : 'divider',
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2
                                        }}>
                                            {/* Phần thông tin */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                                {/* Status dot */}
                                                <Box sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: deviceStates.pump ? 'success.main' : 'grey.400',
                                                    flexShrink: 0
                                                }} />

                                                {/* Device info */}
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ display: 'block', fontSize: '0.7rem', lineHeight: 1 }}
                                                    >
                                                        V0
                                                    </Typography>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={500}
                                                        onClick={() => currentMode !== 'auto' && handleDeviceToggle('pump')}
                                                        sx={{
                                                            cursor: currentMode === 'auto' ? 'default' : 'pointer',
                                                            fontSize: '0.9rem',
                                                            lineHeight: 1.2,
                                                            '&:hover': {
                                                                color: currentMode !== 'auto' ? 'primary.main' : 'inherit'
                                                            }
                                                        }}
                                                    >
                                                        Máy bơm
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Switch với tooltip */}
                                            <Tooltip
                                                title={currentMode === 'auto' ? "Đang ở chế độ tự động" : (deviceStates.pump ? "Tắt máy bơm" : "Bật máy bơm")}
                                                arrow
                                                placement="top"
                                                disableInteractive
                                            >
                                                <Box sx={{ display: 'inline-flex' }}>
                                                    <Switch
                                                        checked={deviceStates.pump}
                                                        onChange={() => handleDeviceToggle('pump')}
                                                        disabled={currentMode === 'auto'}
                                                        size="small"
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                color: 'success.main',
                                                            },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                backgroundColor: 'success.main',
                                                            },
                                                            '&.Mui-disabled': {
                                                                opacity: 0.5
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </Tooltip>
                                        </Box>

                                        {/* Chế độ tự động indicator */}
                                        {currentMode === 'auto' && (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mt: 1
                                            }}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                    sx={{ fontSize: '0.7rem' }}
                                                >
                                                    🔒 Tự động điều khiển
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>

                                    {/* QUẠT GIÓ (V1) */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: deviceStates.fan ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                                            border: '1px solid',
                                            borderColor: deviceStates.fan ? 'info.main' : 'divider',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: currentMode !== 'auto' && deviceStates.fan ? 'info.dark' : 'divider',
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2
                                        }}>
                                            {/* Phần thông tin */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                                {/* Status dot */}
                                                <Box sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: deviceStates.fan ? 'info.main' : 'grey.400',
                                                    flexShrink: 0
                                                }} />

                                                {/* Device info */}
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ display: 'block', fontSize: '0.7rem', lineHeight: 1 }}
                                                    >
                                                        V1
                                                    </Typography>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={500}
                                                        onClick={() => currentMode !== 'auto' && handleDeviceToggle('fan')}
                                                        sx={{
                                                            cursor: currentMode === 'auto' ? 'default' : 'pointer',
                                                            fontSize: '0.9rem',
                                                            lineHeight: 1.2,
                                                            '&:hover': {
                                                                color: currentMode !== 'auto' ? 'primary.main' : 'inherit'
                                                            }
                                                        }}
                                                    >
                                                        Quạt gió
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Switch với tooltip */}
                                            <Tooltip
                                                title={currentMode === 'auto' ? "Đang ở chế độ tự động" : (deviceStates.fan ? "Tắt quạt gió" : "Bật quạt gió")}
                                                arrow
                                                placement="top"
                                                disableInteractive
                                            >
                                                <Box sx={{ display: 'inline-flex' }}>
                                                    <Switch
                                                        checked={deviceStates.fan}
                                                        onChange={() => handleDeviceToggle('fan')}
                                                        disabled={currentMode === 'auto'}
                                                        size="small"
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                color: 'info.main',
                                                            },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                backgroundColor: 'info.main',
                                                            },
                                                            '&.Mui-disabled': {
                                                                opacity: 0.5
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </Tooltip>
                                        </Box>

                                        {/* Chế độ tự động indicator */}
                                        {currentMode === 'auto' && (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mt: 1
                                            }}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                    sx={{ fontSize: '0.7rem' }}
                                                >
                                                    🔒 Tự động điều khiển
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Stack>
                            </CardContent>
                        </StatusCard>
                    </Grid>
                </Grid>
            </Paper>

            {/* Sensor chart */}
            {/* Sensor chart */}
            <Grid item xs={12}>
                <StatusCard>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <TimelineIcon sx={{ color: '#2196f3' }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                THEO DÕI CHI TIẾT CẢM BIẾN
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            {chartConfigs.map((config) => (
                                <Grid item xs={12} md={6} lg={4} key={config.id}>
                                    <ChartLineDots
                                        title={config.title}
                                        color={config.color}
                                        // KHÔNG cần map lại dữ liệu nữa, vì đã đúng cấu trúc trong controller
                                        data={chartsData[config.id] || []}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </StatusCard>
            </Grid>

            

            {/* System Information */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info color="info" /> THÔNG TIN HỆ THỐNG
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    🌡️ NGƯỠNG CẢNH BÁO NHIỆT ĐỘ
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {[
                                        { range: '≥ 35°C', label: 'Quá cao', color: '#ef4444', action: 'Bật quạt, tắt sưởi' },
                                        { range: '28-35°C', label: 'Cao bình thường', color: '#f59e0b', action: 'Bật quạt' },
                                        { range: '20-28°C', label: 'Bình thường', color: '#10b981', action: 'Tắt thiết bị' },
                                        { range: '15-20°C', label: 'Thấp bình thường', color: '#3b82f6', action: 'Bật sưởi' },
                                        { range: '≤ 15°C', label: 'Quá thấp', color: '#8b5cf6', action: 'Bật sưởi, tắt quạt' }
                                    ].map((item, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 1.5,
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: `${item.color}10`
                                            }}
                                        >
                                            <Box sx={{
                                                width: 8,
                                                height: 32,
                                                bgcolor: item.color,
                                                borderRadius: 1,
                                                mr: 2
                                            }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {item.range} - {item.label}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {item.action}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    💧 NGƯỠNG CẢNH BÁO ĐỘ ẨM
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {[
                                        { range: '≥ 80%', label: 'Quá cao', color: '#ef4444', action: 'Bật máy lọc không khí' },
                                        { range: '70-80%', label: 'Cao bình thường', color: '#f59e0b', action: 'Bật máy lọc không khí' },
                                        { range: '40-70%', label: 'Bình thường', color: '#10b981', action: 'Tắt thiết bị' },
                                        { range: '30-40%', label: 'Thấp bình thường', color: '#3b82f6', action: 'Bật máy bơm' },
                                        { range: '≤ 30%', label: 'Quá thấp', color: '#8b5cf6', action: 'Bật máy bơm' }
                                    ].map((item, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 1.5,
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: `${item.color}10`
                                            }}
                                        >
                                            <Box sx={{
                                                width: 8,
                                                height: 32,
                                                bgcolor: item.color,
                                                borderRadius: 1,
                                                mr: 2
                                            }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {item.range} - {item.label}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {item.action}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            

            {/* Footer */}
            <Paper sx={{
                p: 3,
                mt: 4,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                textAlign: 'center'
            }}>
                <Typography variant="body1" fontWeight="medium" gutterBottom>
                    🚀 Hệ thống điều khiển tự động IoT
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tự động điều chỉnh thiết bị dựa trên nhiệt độ và độ ẩm • Cập nhật dữ liệu mỗi 5 phút
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                    Phiên bản 1.0.0 • Dữ liệu được lưu trữ cục bộ trong trình duyệt
                </Typography>
            </Paper>
        </Container>
    );
};

export default AutoModePage;