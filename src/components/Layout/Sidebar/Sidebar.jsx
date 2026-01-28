import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Grass as GrassIcon,
    Spa as SpaIcon,
    Park as ParkIcon,
    LocalFlorist as FloristIcon,
    Devices as DevicesIcon,
    Settings as SettingsIcon,
    Analytics as AnalyticsIcon,
    WaterDrop as WaterIcon,
    Thermostat as TempIcon
} from '@mui/icons-material';

const menuItems = [
    {
        path: '/',
        name: 'Home',
        icon: <DashboardIcon />,
        exact: true,
        badge: 3
    },
    { type: 'divider', title: 'Các Vườn' },
    {
        path: '/UserPage',
        name: 'Vườn cây 1',
        icon: <GrassIcon />,
        subtitle: '12 thiết bị',
        status: 'active'
    },
    {
        path: '/garden2',
        name: 'Vườn Hoa',
        icon: <SpaIcon />,
        subtitle: '8 thiết bị',
        status: 'warning'
    },
    {
        path: '/garden3',
        name: 'Vườn Thảo Mộc',
        icon: <ParkIcon />,
        subtitle: '6 thiết bị',
        status: 'active'
    },
    {
        path: '/garden4',
        name: 'Vườn Mini',
        icon: <FloristIcon />,
        subtitle: '4 thiết bị',
        status: 'inactive'
    },
    { type: 'divider', title: 'Quản Lý' },
    {
        path: '/devices',
        name: 'Thiết Bị',
        icon: <DevicesIcon />,
        badge: 5
    },
    {
        path: '/analytics',
        name: 'Phân Tích',
        icon: <AnalyticsIcon />
    },
    {
        path: '/irrigation',
        name: 'Tưới Tiêu',
        icon: <WaterIcon />
    },
    {
        path: '/climate',
        name: 'Khí Hậu',
        icon: <TempIcon />
    },
    {
        path: '/settings',
        name: 'Cài Đặt',
        icon: <SettingsIcon />
    },
];

const Sidebar = ({ drawerWidth }) => {
    const location = useLocation();
    const theme = useTheme();
    const isActive = (menuItem) => {
        if (menuItem.exact) {
            return location.pathname === '/' || location.pathname === menuItem.path;
        }
        return location.pathname.startsWith(menuItem.path);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4caf50';
            case 'warning': return '#ff9800';
            case 'inactive': return '#9e9e9e';
            default: return '#4caf50';
        }
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                height: 'calc(100vh - 64px)',
                mt: '64px',
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    height: 'calc(100vh - 64px)',
                    mt: '64px',
                    top: 0,
                    left: 0,
                    boxSizing: 'border-box',
                    border: 'none',
                    boxShadow: theme.shadows[2],
                    overflowX: 'hidden',
                    backgroundColor: 'white',
                },
            }}
        >
            {/* Header của Sidebar (phần logo) */}
            <Box sx={{
                p: 3,
                background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                color: 'white',
                textAlign: 'center',
                minHeight: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                }}>
                    🌿
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        IoT Garden
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Control Panel
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Menu Content */}
            <Box sx={{
                overflow: 'auto',
                height: 'calc(100% - 64px)',
                px: 2,
                py: 2
            }}>
                <List disablePadding>
                    {menuItems.map((item, index) => {
                        if (item.type === 'divider') {
                            return (
                                <Box key={`divider-${index}`} sx={{ my: 2 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            px: 3,
                                            color: 'text.secondary',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Divider sx={{ mt: 1 }} />
                                </Box>
                            );
                        }

                        const active = isActive(item);
                        return (
                            <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: active ? 'rgba(86, 171, 47, 0.1)' : 'transparent',
                                        color: active ? '#56ab2f' : 'text.primary',
                                        borderLeft: active ? '4px solid #56ab2f' : '4px solid transparent',
                                        '&:hover': {
                                            backgroundColor: 'rgba(86, 171, 47, 0.08)',
                                        },
                                        py: 1.5,
                                        px: 2.5,
                                        mb: 1,
                                        minHeight: 48,
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        color: active ? '#56ab2f' : 'text.secondary',
                                        minWidth: 48,
                                        mr: 2,
                                        justifyContent: 'center'
                                    }}>
                                        {item.icon}
                                        {item.badge && (
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                width: 8,
                                                height: 8,
                                                bgcolor: '#ff3d00',
                                                borderRadius: '50%'
                                            }} />
                                        )}
                                    </ListItemIcon>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <ListItemText
                                            primary={item.name}
                                            primaryTypographyProps={{
                                                fontWeight: active ? 600 : 500,
                                                fontSize: '0.9rem',
                                                noWrap: true
                                            }}
                                        />
                                        {item.subtitle && (
                                            <Typography variant="caption" sx={{
                                                color: 'text.secondary',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}>
                                                <Box sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor: getStatusColor(item.status)
                                                }} />
                                                {item.subtitle}
                                            </Typography>
                                        )}
                                    </Box>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* Footer Info */}
                <Box sx={{
                    mt: 'auto',
                    p: 3,
                    bgcolor: 'rgba(86, 171, 47, 0.05)',
                    borderRadius: 2,
                    mx: 1,
                    mb: 2
                }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Phiên bản 2.1.0
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        © 2024 IoT Garden
                    </Typography>
                </Box>
            </Box>
        </Drawer>
    );
};

export default Sidebar;