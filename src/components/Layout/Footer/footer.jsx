// src/components/Layout/Footer.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => (
    <Box sx={{ height: 50, bgcolor: '#2e7d32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2">© 2025 IoT Garden. All rights reserved.</Typography>
    </Box>
);

export default Footer;
