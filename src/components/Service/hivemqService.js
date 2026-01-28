import mqtt from 'mqtt';
const BROKER_URL = 'wss://b2d32e2b02424f209d728478ad2bb996.s1.eu.hivemq.cloud:8884/mqtt';

let mqttClient = null;
let listeners = []; // Danh sách các hàm callback
let currentDeviceStates = { motor: false, fan: false, auto: false };

export const connectToHiveMQ = () => {
    if (mqttClient?.connected) return mqttClient;

    mqttClient = mqtt.connect(BROKER_URL, {
        username: 'Iot_garden_1',
        password: 'Iot_garden_1',
        clientId: 'web-client-' + Math.random().toString(16).substr(2, 8),
        clean: true,
        reconnectPeriod: 5000,
    });

    mqttClient.on('connect', () => {
        mqttClient.subscribe(['iot_garden/sensors', 'iot_garden/motor', 'iot_garden/min_max'], { qos: 1 });
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            if (topic === 'iot_garden/motor') {
                data.type = 'CONTROL_SYNC';
                currentDeviceStates = { motor: !!data.motor, fan: !!data.fan, auto: !!data.auto };
            } else if (topic === 'iot_garden/sensors') {
                data.type = 'SENSOR_DATA';
            } else if (topic === 'iot_garden/min_max') {
                data.type = 'THRESHOLD_SYNC';
            }
            // Gửi dữ liệu cho tất cả các nơi đang lắng nghe
            listeners.forEach(callback => callback(data));
        } catch (error) { console.error('❌ Decode error:', error); }
    });
};

export const getCurrentDeviceStates = () => currentDeviceStates;

export const updateDevice = (type, value) => {
    if (!mqttClient?.connected) return;
    // Cập nhật state nội bộ trước khi gửi
    if (type === 'pump' || type === 'motor') currentDeviceStates.motor = !!value;
    if (type === 'fan') currentDeviceStates.fan = !!value;
    if (type === 'auto') currentDeviceStates.auto = !!value;
    mqttClient.publish('iot_garden/motor_manu', JSON.stringify(currentDeviceStates), { qos: 1, retain: true });
    mqttClient.publish('iot_garden/motor', JSON.stringify(currentDeviceStates), { qos: 1, retain: true });
};

export const updateThresholds = (thresholds) => {
    if (!mqttClient?.connected) return;
    const payload = JSON.stringify({
        min_temp: Number(thresholds.min_temp),
        max_tem: Number(thresholds.max_temp), 
        min_hum: Number(thresholds.min_hum),
        max_hum: Number(thresholds.max_hum)
    });
    mqttClient.publish('iot_garden/min_max', payload, { qos: 1, retain: true });
};

export const subscribeToUpdates = (callback) => {
    listeners.push(callback);
    return () => { listeners = listeners.filter(l => l !== callback); }; // Cleanup đúng cách
};