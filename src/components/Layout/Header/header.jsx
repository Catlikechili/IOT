// src/components/Layout/Header.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Stack,
    Chip,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Button
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    HelpOutline as HelpIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Wifi as WifiIcon,
    BatteryFull as BatteryIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    TrendingDown as TrendingDownIcon,
    Speed as SpeedIcon,
    Warning as WarningIcon,
    ChevronRight as ChevronRightIcon,
    Logout as LogoutIcon,
    Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import context để lấy thông tin user

const Header = () => {
    const { user, logout } = useAuth(); // Lấy user và hàm logout
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [helpAnchor, setHelpAnchor] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // --- LOGIC THÔNG BÁO ---
    useEffect(() => {
        const loadNotifications = () => {
            try {
                const storedLogs = localStorage.getItem("temperatureAlerts");
                if (!storedLogs) {
                    setNotifications([]);
                    return;
                }
                const parsed = JSON.parse(storedLogs);
                const sortedLogs = parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setNotifications(sortedLogs);
            } catch (error) {
                console.error("Error loading notifications:", error);
                setNotifications([]);
            }
        };

        loadNotifications();
        const interval = setInterval(loadNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = useMemo(() => notifications.filter(noti => !noti.read).length, [notifications]);

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleLoginRedirect = () => {
        setAnchorEl(null);
        navigate('/login');
    };

    const handleLogout = async () => {
        try {
            await logout();
            setAnchorEl(null);
            navigate('/login');
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    };

    const markAllAsRead = () => {
        try {
            const updatedLogs = notifications.map(log => ({ ...log, read: true }));
            localStorage.setItem("temperatureAlerts", JSON.stringify(updatedLogs));
            setNotifications(updatedLogs);
            setNotificationAnchor(null);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    // --- HELPER RENDER ---
    const getAlertIcon = (type) => {
        switch (type) {
            case "high": return <ErrorIcon color="error" fontSize="small" />;
            case "low": return <InfoIcon color="info" fontSize="small" />;
            case "sudden_drop": return <TrendingDownIcon color="error" fontSize="small" />;
            case "rapid_change": return <SpeedIcon color="warning" fontSize="small" />;
            default: return <WarningIcon fontSize="small" />;
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case "high": return "#ef4444";
            case "low": return "#3b82f6";
            default: return "#6b7280";
        }
    };

    const getTimeAgo = (timestamp) => {
        const diffMins = Math.floor((new Date() - new Date(timestamp)) / 60000);
        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        return `${Math.floor(diffMins / 60)} giờ trước`;
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                bgcolor: 'white',
                color: '#2d3748',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Left - Logo */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#56ab2f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        🌿
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#1a202c', display: { xs: 'none', sm: 'block' } }}>
                        IoT Garden
                    </Typography>
                </Stack>

                {/* Right - Controls */}
                <Stack direction="row" spacing={1} alignItems="center">
                    {/* Theme Toggle */}
                    <IconButton size="small" onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>

                    {/* Notifications */}
                    <IconButton size="small" onClick={(e) => setNotificationAnchor(e.currentTarget)}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon fontSize="small" />
                        </Badge>
                    </IconButton>

                    {/* User Profile */}
                    <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#56ab2f', fontSize: '0.9rem' }}>
                            {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                    </IconButton>
                </Stack>
            </Toolbar>

            {/* --- MENUS --- */}

            {/* User Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { width: 220, mt: 1 } }}
            >
                {user ? (
                    <Box>
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle2" noWrap>{user.email}</Typography>
                            <Typography variant="caption" color="text.secondary">Thành viên</Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => { setAnchorEl(null); navigate('/config'); }}>Cài đặt hệ thống</MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Đăng xuất
                        </MenuItem>
                    </Box>
                ) : (
                    <MenuItem onClick={handleLoginRedirect}>
                        <LoginIcon fontSize="small" sx={{ mr: 1 }} /> Đăng nhập
                    </MenuItem>
                )}
            </Menu>

            {/* Notifications Menu */}
            <Menu
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={() => setNotificationAnchor(null)}
                PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Thông báo</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={markAllAsRead}>Đọc tất cả</Button>
                    )}
                </Box>
                <Divider />
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                        <Typography sx={{ p: 3, textAlign: 'center' }} color="text.secondary">Không có thông báo</Typography>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {notifications.slice(0, 5).map((noti) => (
                                <ListItem key={noti.id} sx={{ bgcolor: noti.read ? 'transparent' : 'rgba(86, 171, 47, 0.05)' }}>
                                    <ListItemAvatar sx={{ minWidth: 40 }}>
                                        <Box sx={{ color: getAlertColor(noti.type) }}>{getAlertIcon(noti.type)}</Box>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={noti.message}
                                        secondary={getTimeAgo(noti.timestamp)}
                                        primaryTypographyProps={{ variant: 'body2', fontWeight: noti.read ? 400 : 600 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
                <Divider />
                <Button fullWidth onClick={() => { navigate('/notification'); setNotificationAnchor(null); }}>
                    Xem tất cả <ChevronRightIcon />
                </Button>
            </Menu>
        </AppBar>
    );
};

export default Header;