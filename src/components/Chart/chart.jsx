import React, { useMemo } from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Paper, Stack, useTheme, alpha
} from '@mui/material';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    Opacity as OpacityIcon,
    DeviceThermostat as DeviceThermostatIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

const StatBox = ({ label, value, unit, color }) => (
    <Paper elevation={0} sx={{
        p: 1.5,
        textAlign: 'center',
        bgcolor: alpha(color || '#ccc', 0.05),
        border: `1px solid ${alpha(color || '#ccc', 0.1)}`,
        borderRadius: 2,
        height: '70px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    }}>
        <Typography variant="caption" color="text.secondary" sx={{
            display: 'block',
            mb: 0.5,
            fontWeight: 500,
            fontSize: '0.75rem',
            lineHeight: 1.2
        }}>
            {label}
        </Typography>
        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="baseline">
            <Typography variant="h6" sx={{
                fontWeight: 700,
                color: color,
                fontSize: '1.25rem',
                lineHeight: 1.2
            }}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{
                fontWeight: 600,
                fontSize: '0.75rem'
            }}>
                {unit}
            </Typography>
        </Stack>
    </Paper>
);

export function ChartLineDots({
    data = [],
    title = "Sensor Data",
    color = "#2196f3",
    showStats = true,
    height = 300
}) {
    const theme = useTheme();

    const isHumidity = title.toLowerCase().includes("độ ẩm");
    const dataUnit = isHumidity ? "%" : "°C";

    // 1. Logic tính toán Scale (Domain) và Stats
    const { stats, yDomain } = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                stats: { avg: 0, min: 0, max: 0, count: 0 },
                yDomain: [0, 100]
            };
        }

        const values = data.map(d => d.field1).filter(val => val != null);

        if (values.length === 0) {
            return {
                stats: { avg: 0, min: 0, max: 0, count: 0 },
                yDomain: [0, 100]
            };
        }

        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const avgVal = values.reduce((a, b) => a + b, 0) / values.length;

        // Tính toán khoảng đệm (padding) 20% để scale trông to và rõ hơn
        const range = maxVal - minVal;
        const padding = range === 0 ? 5 : range *4 ;

        return {
            stats: {
                avg: avgVal,
                min: minVal,
                max: maxVal,
                count: values.length
            },
            yDomain: [Number((minVal - padding).toFixed(1)), Number((maxVal + padding).toFixed(1))]
        };
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <Paper sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 3,
                border: '2px dashed #eee',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <WarningIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Đang chờ dữ liệu...</Typography>
            </Paper>
        );
    }

    return (
        <Card elevation={0} sx={{
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(180deg, ${alpha(color, 0.02)} 0%, #ffffff 100%)`,
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <CardContent sx={{
                p: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header Icon & Title */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} alignItems="center">
                    <Box sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha(color, 0.1),
                        display: 'flex',
                        color: color,
                        width: '36px',
                        height: '36px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {isHumidity ? <OpacityIcon /> : <DeviceThermostatIcon />}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        {title}
                    </Typography>
                </Stack>

                {/* Main Chart Area */}
                <Box sx={{ width: '100%', height: `${height}px`, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id={`color-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke={alpha(theme.palette.divider, 0.5)}
                            />
                            <XAxis
                                dataKey="created_at"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                                minTickGap={40}
                                height={25}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                                domain={yDomain} // Áp dụng khoảng scale đã tính toán
                                width={45}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                    fontSize: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="field1"
                                stroke={color}
                                strokeWidth={4} // Làm đường kẻ dày hơn
                                fill={`url(#color-${title.replace(/\s+/g, '-')})`}
                                animationDuration={1200}
                                // Tăng kích thước điểm dữ liệu
                                dot={{
                                    r: 4,
                                    fill: color,
                                    strokeWidth: 2,
                                    stroke: '#fff'
                                }}
                                // Điểm khi hover
                                activeDot={{
                                    r: 7,
                                    strokeWidth: 0
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>

                {/* Bottom Stats Area */}
                {showStats && (
                    <Grid container spacing={1} sx={{ mt: 2, flexShrink: 0 }}>
                        <Grid item xs={4}>
                            <StatBox
                                label="Trung bình"
                                value={stats.avg.toFixed(1)}
                                unit={dataUnit}
                                color={color}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <StatBox
                                label="Cao nhất"
                                value={stats.max.toFixed(1)}
                                unit={dataUnit}
                                color={theme.palette.error.main}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <StatBox
                                label="Thấp nhất"
                                value={stats.min.toFixed(1)}
                                unit={dataUnit}
                                color={theme.palette.info.main}
                            />
                        </Grid>
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
}