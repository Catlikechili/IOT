import { subscribeToUpdates } from './hivemqService';

// Ngưỡng mặc định (Sẽ được cập nhật khi có tin nhắn từ topic min_max)
let currentThresholds = { min_temp: 20, max_temp: 35, min_hum: 40, max_hum: 80 };

export const initAlertListener = () => {
    subscribeToUpdates((data) => {
        // Cập nhật ngưỡng từ HiveMQ
        if (data.type === 'THRESHOLD_SYNC') {
            currentThresholds = {
                min_temp: data.min_temp,
                max_temp: data.max_tem, 
                min_hum: data.min_hum,
                max_hum: data.max_hum
            };
        }

        // Xử lý dữ liệu cảm biến
        if (data.type === 'SENSOR_DATA') {
            processSensorAlerts(data);
        }
    });
};

const processSensorAlerts = (data) => {
    const { temperature, humidity } = data;
    const timestamp = new Date().toISOString();
    let alert = null;

    // Kiểm tra nhiệt độ cao
    if (temperature > currentThresholds.max_temp) {
        alert = createAlertObject("Nhiệt độ quá cao!", `Hiện tại: ${temperature}°C`, "high", "high", temperature, currentThresholds.max_temp);
    }
    // Kiểm tra nhiệt độ thấp
    else if (temperature < currentThresholds.min_temp) {
        alert = createAlertObject("Nhiệt độ quá thấp!", `Hiện tại: ${temperature}°C`, "low", "medium", temperature, currentThresholds.min_temp);
    }

    if (alert) {
        saveAlertToLocalStorage(alert);
    }
};

const createAlertObject = (title, msg, type, severity, val, limit) => ({
    id: Date.now(),
    type: type, // "high", "low"
    severity: severity, // "high", "medium"
    message: `${title} ${msg}`,
    value: val,
    threshold: limit,
    timestamp: new Date().toISOString(),
    read: false,
    channelName: "Cảm biến vườn",
    details: { from: "Ngưỡng an toàn", to: val }
});

const saveAlertToLocalStorage = (newAlert) => {
    const rawData = localStorage.getItem("temperatureAlerts");
    const logs = rawData ? JSON.parse(rawData) : [];

    // Chặn spam: Không lưu nếu cảnh báo cùng loại xảy ra trong vòng 1 phút
    const lastAlert = logs[0];
    if (lastAlert && (Date.now() - new Date(lastAlert.timestamp).getTime() < 60000) && lastAlert.type === newAlert.type) {
        return;
    }

    const updatedLogs = [newAlert, ...logs];
    localStorage.setItem("temperatureAlerts", JSON.stringify(updatedLogs));

    // Phát sự kiện để React Component cập nhật UI ngay lập tức
    window.dispatchEvent(new Event("new_alert_received"));
};