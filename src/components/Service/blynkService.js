import mqtt from "mqtt";

const HOST = "wss://blynk.cloud:443/mqtt";
const USERNAME = "device";
const PASSWORD = "h5zXwUnzdZCFKB4FJBhrEr-BYWzLbhus";

// Cấu trúc dữ liệu lưu trữ trạng thái hiện tại trong bộ nhớ đệm
const gardenData = {
    state_motor: false,
    state_fan: false,
    is_auto_mode: false,
    V2: 0,
    V10: 0,
    soil_humidity: { V3: 0, V4: 0, V5: 0, V6: 0 }
};

// Lưu trữ giá trị chuỗi cuối cùng để so sánh gói tin mới/cũ
const lastPayloads = {};

let globalUpdateCallback = null;
let client = null;

export const connectMQTT = () => {
    if (client) return client;

    // Cấu hình kết nối tối giản để tiết kiệm dung lượng
    client = mqtt.connect(HOST, {
        username: USERNAME,
        password: PASSWORD,
        clean: true,           // Không nhận lại các tin nhắn cũ khi kết nối lại
        connectTimeout: 5000,
        reconnectPeriod: 5000,
    });

    client.on("connect", () => {
        console.log("📡 Đã kết nối: Chế độ chỉ lắng nghe (Subscribe Only)");
        // Chỉ đăng ký nhận dữ liệu từ các chân cần thiết
        client.subscribe("downlink/ds/#", { qos: 0 });
    });

    client.on("message", (topic, payload) => {
        const message = payload.toString();
        const pin = topic.split("/").pop().toUpperCase();

        // CHẶN NGAY TỪ CỬA NGÕ: Nếu gói tin mới giống hệt gói tin cũ -> Dừng xử lý
        if (lastPayloads[pin] === message) {
            return;
        }

        // Lưu lại gói tin mới nhất để so sánh lần sau
        lastPayloads[pin] = message;

        let hasChange = false;

        // Chỉ xử lý và cập nhật Object khi có gói tin thực sự mới
        switch (pin) {
            case 'V0': gardenData.state_motor = (message === "1"); hasChange = true; break;
            case 'V1': gardenData.state_fan = (message === "1"); hasChange = true; break;
            case 'V8': gardenData.is_auto_mode = (message === "1"); hasChange = true; break;
            case 'V2': gardenData.V2 = parseFloat(message) || 0; hasChange = true; break;
            case 'V10': gardenData.V10 = parseFloat(message) || 0; hasChange = true; break;
            case 'V3':
            case 'V4':
            case 'V5':
            case 'V6':
                gardenData.soil_humidity[pin] = parseFloat(message) || 0;
                hasChange = true;
                break;
        }

        // Chỉ thông báo cho React Re-render khi dữ liệu hữu ích thay đổi
        if (hasChange && globalUpdateCallback) {
            console.log(`📥 Gói tin mới xác nhận: ${pin} = ${message}`);
            globalUpdateCallback({ ...gardenData });
        }
    });

    return client;
};

// Đăng ký nhận thông báo từ Service vào Controller
export const subscribeToUpdates = (callback) => {
    globalUpdateCallback = callback;
};

// Vẫn giữ hàm updatePin nhưng Web của bạn có thể không dùng tới nếu bạn chỉ muốn "đọc"
export const updatePin = (pin, value) => {
    if (client?.connected) {
        const strValue = typeof value === "boolean" ? (value ? "1" : "0") : String(value);
        client.publish(`ds/${pin.toUpperCase()}`, strValue, { qos: 1 });
    }
};

connectMQTT();