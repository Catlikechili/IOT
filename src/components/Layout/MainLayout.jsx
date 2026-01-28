// MainLayout.jsx - phiên bản đơn giản
import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';
import Footer from './Footer/Footer';

const MainLayout = () => {
    const drawerWidth = 280;
    const headerHeight = 64;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Header */}
            <Header />

            {/* Sidebar */}
            <Sidebar drawerWidth={drawerWidth} />

            {/* Main Content - ĐƠN GIẢN NHẤT */}
            <Box sx={{
                flex: 1,
                //ml: `${drawerWidth}px`,
                pt: `${headerHeight}px`,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}>
                {/* Nội dung trang - chiếm hết không gian */}
                <Box sx={{
                    flex: 1,
                    p: 3,
                    overflow: 'auto',
                }}>
                    <Outlet />
                </Box>

                {/* Footer */}
                <Footer />
            </Box>
        </Box>
    );
};

export default MainLayout;