// src/components/Pages/ChartDemo.jsx
import React, { useState, useEffect } from "react";
import { ThingSpeakDashboard, MultiChannelChart, ChartLineDots } from "../Chart/chart";

export default function ChartDemo() {
    const [channelsData, setChannelsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Cấu hình 5 kênh ThingSpeak
    const CHANNELS = [
        {
            id: 1,
            channelId: "3185144",
            readApiKey: "ZBFF0Y8IHLR6C5MB",
            name: "Nhiệt độ",
            fieldNumber: 1
        },
        {
            id: 2,
            channelId: "3185144",
            readApiKey: "ZBFF0Y8IHLR6C5MB",
            name: " Độ ẩm cây 1",
            fieldNumber: 2
        },
        {
            id: 3,
            channelId: "3185144",
            readApiKey: "ZBFF0Y8IHLR6C5MB",
            name: " Độ ẩm cây 2",
            fieldNumber: 3
        },
        {
            id: 4,
            channelId: "3185144",
            readApiKey: "ZBFF0Y8IHLR6C5MB",
            name: " Độ ẩm cây 3",
            fieldNumber: 4
        },
        {
            id: 5,
            channelId: "3185144",
            readApiKey: "ZBFF0Y8IHLR6C5MB",
            name: " Độ ẩm cây 4",
            fieldNumber: 5
        }
    ];

    useEffect(() => {
        const fetchAllChannelsData = async () => {
            try {
                setLoading(true);
                setError(null);

                const fetchPromises = CHANNELS.map(channel =>
                    fetchThingSpeakData(channel)
                );

                const results = await Promise.allSettled(fetchPromises);

                const successfulData = results
                    .filter(result => result.status === 'fulfilled' && result.value)
                    .map(result => result.value);

                setChannelsData(successfulData);
                setLastUpdate(new Date());

                // Kiểm tra lỗi
                if (successfulData.length === 0) {
                    const errors = results
                        .filter(result => result.status === 'rejected')
                        .map(result => result.reason?.message || 'Unknown error');

                    setError(`Không thể tải dữ liệu từ bất kỳ kênh nào. Lỗi: ${errors[0] || 'Không xác định'}`);
                }

            } catch (err) {
                console.error("Error fetching all channels:", err);
                setError(`Lỗi hệ thống: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAllChannelsData();

        // Cập nhật dữ liệu mỗi 30 giây
        const interval = setInterval(fetchAllChannelsData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchThingSpeakData = async (channel) => {
        try {
            const url = `https://api.thingspeak.com/channels/${channel.channelId}/feeds.json?api_key=${channel.readApiKey}&results=15`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.feeds && data.feeds.length > 0) {
                const formattedData = formatThingSpeakData(data.feeds, channel.fieldNumber);

                return {
                    ...channel,
                    data: formattedData,
                    success: true,
                    dataCount: formattedData.length
                };
            } else {
                throw new Error("Không có dữ liệu từ kênh");
            }

        } catch (err) {
            console.error(`Error fetching channel ${channel.name}:`, err);
            return {
                ...channel,
                data: [],
                success: false,
                error: err.message,
                dataCount: 0
            };
        }
    };

    const formatThingSpeakData = (feeds, fieldNumber) => {
        const formattedData = feeds.map(feed => {
            const timestamp = new Date(feed.created_at).getTime();
            const value = parseFloat(feed[`field${fieldNumber}`]);

            return {
                time: timestamp,
                value: isNaN(value) ? 0 : value
            };
        }).filter(item => item.value !== null);

        return formattedData;
    };

    if (loading) {
        return (
            <div style={{
                padding: "40px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh"
            }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
                <p style={{ fontSize: "18px", marginBottom: "10px" }}>Đang tải dữ liệu từ 5 kênh ThingSpeak...</p>
                <p style={{ color: "#666", fontSize: "14px" }}>Vui lòng chờ trong giây lát</p>
            </div>
        );
    }

    if (error && channelsData.length === 0) {
        return (
            <div style={{
                padding: "40px",
                textAlign: "center",
                color: "#d32f2f"
            }}>
                <h3 style={{ marginBottom: "10px" }}>Lỗi kết nối</h3>
                <p>{error}</p>
                <p style={{ marginTop: "20px", color: "#666" }}>
                    Vui lòng kiểm tra Channel ID và API Key của các kênh
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
            {/* Sử dụng Dashboard */}
            <ThingSpeakDashboard
                channelsData={channelsData}
                refreshTime={lastUpdate}
            />

            {/* Hoặc sử dụng MultiChannelChart đơn thuần */}
            {/* <MultiChannelChart channelsData={channelsData} /> */}

            {/* Hoặc sử dụng từng ChartLineDots riêng lẻ */}
            {/* 
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", 
                gap: "20px",
                marginTop: "30px"
            }}>
                {channelsData.map((channel, index) => (
                    <ChartLineDots
                        key={channel.id}
                        data={channel.data}
                        title={channel.name}
                        channelInfo={channel}
                        showStats={true}
                        height={320}
                    />
                ))}
            </div>
            */}
        </div>
    );
}