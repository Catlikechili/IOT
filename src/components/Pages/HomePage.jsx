// src/components/Pages/HomePage.jsx
import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Avatar,
    Chip,
    Stack,
    Card,
    CardContent,
    Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Toaster } from 'sonner';

// Icons
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimelineIcon from '@mui/icons-material/Timeline';
import NatureIcon from '@mui/icons-material/Nature';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

// Icons for manual mode
import SettingsIcon from '@mui/icons-material/Settings';
import MemoryIcon from '@mui/icons-material/Memory';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

// ===== FIX IMPORT CONTROLLER =====
import { useGeneralController } from '../controllers/general_controller'

// -------------------------------------------------------------
// Styled Components
// -------------------------------------------------------------
const HeroSection = styled(Box)(({ theme, backgroundImage }) => ({
    width: '100%',
    background: backgroundImage
        ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`
        : 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '24px',
    padding: theme.spacing(4),
    paddingLeft: '140px',
    paddingBottom: theme.spacing(2),
    position: 'relative',
    overflow: 'hidden',
    color: 'white',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
    }
}));

const ManualModeCard = styled(Card)(({ theme }) => ({
    borderRadius: '20px',
    padding: theme.spacing(2.5),
    height: '100%',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
    }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
    borderRadius: '20px',
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    height: '100%',
    background: 'white',
    border: '1px solid rgba(86, 171, 47, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#56ab2f',
        boxShadow: '0 8px 25px rgba(86, 171, 47, 0.15)',
    }
}));

// -------------------------------------------------------------
// Icon Mapping
// -------------------------------------------------------------
const iconComponents = {
    thermostat: ThermostatIcon,
    water_drop: WaterDropIcon,
    wb_sunny: WbSunnyIcon,
    local_florist: LocalFloristIcon,
    device_hub: DeviceHubIcon,
    auto_awesome: AutoAwesomeIcon,
    timeline: TimelineIcon,
    nature: NatureIcon,
    settings: SettingsIcon,
    memory: MemoryIcon,
    security: SecurityIcon,
    speed: SpeedIcon,
};

// -------------------------------------------------------------
// Manual Mode Data
// -------------------------------------------------------------
const manualModes = [
    {
        id: 1,
        title: 'Cấu hình hệ thống',
        description: 'Tùy chỉnh thông số vườn và thiết bị',
        icon: 'settings',
        color: '#2196F3',
        status: 'Đang hoạt động',
        action: 'Cấu hình'
    },
    {
        id: 2,
        title: 'Điều khiển thiết bị',
        description: 'Bật/tắt thiết bị theo nhu cầu',
        icon: 'memory',
        color: '#4CAF50',
        status: 'Sẵn sàng',
        action: 'Điều khiển'
    },
    {
        id: 3,
        title: 'Bảo mật',
        description: 'Quản lý truy cập và bảo vệ',
        icon: 'security',
        color: '#FF9800',
        status: 'Bảo vệ',
        action: 'Cài đặt'
    },
    {
        id: 4,
        title: 'Thông báo',
        description: 'Theo dõi và kiểm tra',
        icon: 'speed',
        color: '#9C27B0',
        status: '',
        action: 'Xem chi tiết'
    }
];

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
const HomePage = () => {
    const {
        stats,
        features,
        quickActions,
        handleFeatureClick,
        handleQuickAction,
        handleGuideClick,
        handleDocumentationClick,
        handleSupportClick
    } = {};

    // Background image for hero section
    const heroBackgroundImage = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'; // Example garden image
    const { handleManualModeClick } = useGeneralController();
    const renderIcon = (iconName, props = {}) => {
        const IconComponent = iconComponents[iconName];
        return IconComponent ? <IconComponent {...props} /> : null;
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8faf9 0%, #e8f5e9 100%)',
            p: { xs: 2, md: 4 }
        }}>
            <Toaster position="bottom-right" />

            <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>

                {/* ===== Hero Section ===== */}
                <HeroSection backgroundImage={heroBackgroundImage}>
                    <Box className="inner">
                        <Grid container alignItems="center" spacing={4}>
                            <Grid item xs={12} md={5}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    🌱 Chào mừng đến IoT Garden
                                </Typography>
                                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                                    Hệ thống thông minh giám sát và chăm sóc khu vườn của bạn
                                </Typography>

                                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            borderRadius: '12px',
                                            px: 4,
                                            bgcolor: 'white',
                                            color: '#56ab2f',
                                            fontWeight: 'bold',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                        }}
                                    >
                                        <PlayCircleOutlineIcon sx={{ mr: 1 }} />
                                        Hướng dẫn nhanh
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            borderRadius: '12px',
                                            px: 4,
                                            borderColor: 'white',
                                            color: 'white',
                                            '&:hover': {
                                                borderColor: 'rgba(255,255,255,0.8)',
                                                bgcolor: 'rgba(255,255,255,0.1)'
                                            }
                                        }}
                                    >
                                        Xem video
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </HeroSection>

                {/* ===== Manual Mode Section ===== */}
                <Typography variant="h5" sx={{ mb: 3, mt: 4, fontWeight: 'bold', color: '#2e7d32' }}>
                    ⚙️ Cài đặt chung
                </Typography>

                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {manualModes.map((mode) => (
                        <Grid item xs={12} sm={6} lg={3} key={mode.id}>
                            <ManualModeCard onClick={() => handleManualModeClick(mode.id)}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{
                                        bgcolor: `${mode.color}20`,
                                        width: 50,
                                        height: 50,
                                        mr: 2
                                    }}>
                                        {renderIcon(mode.icon, {
                                            sx: {
                                                fontSize: 26,
                                                color: mode.color
                                            }
                                        })}
                                    </Avatar>

                                    <Box>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 'bold',
                                            color: '#1a1a1a'
                                        }}>
                                            {mode.title}
                                        </Typography>
                                        <Chip
                                            label={mode.status}
                                            size="small"
                                            sx={{
                                                bgcolor: `${mode.color}15`,
                                                color: mode.color,
                                                fontWeight: 'medium',
                                                fontSize: '0.7rem',
                                                height: 20,
                                                mt: 0.5
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                                    {mode.description}
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 'auto'
                                }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{
                                            color: mode.color,
                                            borderColor: `${mode.color}50`,
                                            fontWeight: 'medium',
                                            '&:hover': {
                                                borderColor: mode.color,
                                                bgcolor: `${mode.color}10`
                                            }
                                        }}
                                    >
                                        {mode.action}
                                    </Button>

                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        Nhấp để mở
                                    </Typography>
                                </Box>
                            </ManualModeCard>
                        </Grid>
                    ))}
                </Grid>

                {/* ===== Footer ===== */}
                <Paper sx={{
                    p: 4,
                    borderRadius: '24px',
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(86, 171, 47, 0.1)'
                }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                                🚀 Cần hỗ trợ hoặc muốn tìm hiểu thêm?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Khám phá tất cả tính năng và tài liệu hướng dẫn chi tiết
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    sx={{ borderRadius: '12px', px: 3 }}
                                >
                                    Tài liệu
                                </Button>

                                <Button
                                    variant="outlined"
                                    sx={{ borderRadius: '12px', px: 3 }}
                                >
                                    Hỗ trợ
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default HomePage;