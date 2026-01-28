import mqtt from 'mqtt';
const BROKER_URL = 'wss://b2d32e2b02424f209d728478ad2bb996.s1.eu.hivemq.cloud:8884/mqtt';

const MQTT_OPTIONS = {
    username: 'Iot_garden_1',
    password: 'Iot_garden_1',
    clientId: 'web-client-' + Math.random().toString(16).substr(2, 8),
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30 * 1000,
};

let mqttClient = null;
let onDataCallback = null;

// Lưu trữ trạng thái toàn cục
let currentDeviceStates = { motor: false, fan: false, auto: false };

export const connectToHiveMQ = () => {
    if (mqttClient && mqttClient.connected) return mqttClient;
    mqttClient = mqtt.connect(BROKER_URL, MQTT_OPTIONS);

    mqttClient.on('connect', () => {
        console.log('✅ Connected to HiveMQ');
        mqttClient.subscribe(['iot_garden/sensors', 'iot_garden/motor', 'iot_garden/min_max'], { qos: 1 });
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            if (topic === 'iot_garden/motor') {
                data.type = 'CONTROL_SYNC';
                currentDeviceStates.motor = !!data.motor;
                currentDeviceStates.fan = !!data.fan;
                if (data.auto !== undefined) currentDeviceStates.auto = !!data.auto;
            } else if (topic === 'iot_garden/sensors') {
                data.type = 'SENSOR_DATA';
            } else if (topic === 'iot_garden/min_max') {
                data.type = 'THRESHOLD_SYNC';
            }
            if (onDataCallback) onDataCallback(data);
        } catch (error) { console.error('❌ Decode error:', error); }
    });
    return mqttClient;
};

// CẦN THIẾT: Export để Controller sử dụng
export const getCurrentDeviceStates = () => currentDeviceStates;

export const updateDevice = (type, value) => {
    if (!mqttClient?.connected) return;
    if (type === 'pump' || type === 'motor') currentDeviceStates.motor = !!value;
    if (type === 'fan') currentDeviceStates.fan = !!value;
    if (type === 'auto') currentDeviceStates.auto = !!value;

    const payload = JSON.stringify(currentDeviceStates);
    // Sửa thành qos: 1 và retain: true
    mqttClient.publish('iot_garden/motor', payload, { qos: 1, retain: true });
};

export const updateThresholds = (thresholds) => {
    console.log('📤 Gọi updateThresholds với:', thresholds);

    if (!mqttClient) {
        console.log('❌ MQTT client chưa được khởi tạo');
               return;
    }

    if (!mqttClient.connected) {
        console.log('❌ MQTT chưa kết nối');
                return;
    }

    // QUAN TRỌNG: Sửa key cho khớp với ESP32
    const payload = JSON.stringify({
        min_temp: Number(thresholds.min_temp),
        max_tem: Number(thresholds.max_temp), // ← key phải là "max_tem" cho ESP32
        min_hum: Number(thresholds.min_hum),
        max_hum: Number(thresholds.max_hum)
    });

    console.log('📦 Gửi payload:', payload);

    mqttClient.publish('iot_garden/min_max', payload, {
        qos: 1,
        retain: true
    }, (error) => {
        if (error) {
            console.error('❌ Lỗi publish:', error);
        } else {
            console.log('✅ Publish thành công!');
        }
    });
};


export const subscribeToUpdates = (callback) => {
    onDataCallback = callback;
    if (!mqttClient) connectToHiveMQ();
    return () => { onDataCallback = null; };
};