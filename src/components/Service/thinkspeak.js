import axios from "axios";

const CHANNEL_ID = "3185144";
const API_KEY = "ZBFF0Y8IHLR6C5MB";
const WRITE_API_KEY = "MM84EL6T86DLNCFG"; // THAY BẰNG WRITE API KEY CỦA BẠN
const BASE_URL = "https://api.thingspeak.com/channels";

// Cấu hình axios mặc định
const axiosInstance = axios.create({
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const ThingSpeakAPI = {
    // Lấy tất cả feeds
    getAllFeeds(results = 20) {
        return axiosInstance.get(`${BASE_URL}/${CHANNEL_ID}/feeds.json`, {
            params: { api_key: API_KEY, results }
        });
    },

    // Lấy field cụ thể
    getField(field, results = 20) {
        return axiosInstance.get(`${BASE_URL}/${CHANNEL_ID}/fields/${field}.json`, {
            params: { api_key: API_KEY, results }
        });
    },

    // Lấy giá trị mới nhất
    getLatest() {
        return axiosInstance.get(`${BASE_URL}/${CHANNEL_ID}/feeds/last.json`, {
            params: { api_key: API_KEY }
        });
    },

    // Hàm tiện ích để lấy giá trị từ feed
    getFieldValue(fieldNumber) {
        return this.getLatest()
            .then(response => {
                const data = response.data;
                return parseFloat(data[`field${fieldNumber}`]) || null;
            })
            .catch(error => {
                console.error(`Error getting field ${fieldNumber}:`, error);
                return null;
            });
    },

    // ===== THÊM HÀM GỬI DỮ LIỆU =====

    /**
     * Gửi dữ liệu test lên ThingSpeak
     * @param {number} temperature - Nhiệt độ (field1)
     * @param {number} humidity - Độ ẩm (field2)
     * @returns {Promise<boolean>} true nếu thành công
     */
    async sendTestData(temperature, humidity) {
        try {
            const response = await axios.post('https://api.thingspeak.com/update', null, {
                params: {
                    api_key: WRITE_API_KEY,
                    field1: temperature,
                    field2: humidity
                }
            });

            console.log("✅ Đã gửi test data lên ThingSpeak, entry_id:", response.data);
            return true;
        } catch (error) {
            console.error("❌ Lỗi gửi test data:", error);
            return false;
        }
    },

    // ===== THÊM CÁC HÀM MỚI CHO 5 FIELDS =====

    /**
     * Lấy tất cả 5 fields cùng lúc
     */
    async getAllSensorData() {
        try {
            const response = await this.getLatest();
            const data = response.data;

            return {
                temperature: this._parseFieldValue(data.field1),    // Field 1
                humidity: this._parseFieldValue(data.field2),       // Field 2
                pressure: this._parseFieldValue(data.field3),       // Field 3
                light: this._parseFieldValue(data.field4),          // Field 4
                soilMoisture: this._parseFieldValue(data.field5),   // Field 5
                timestamp: data.created_at || new Date().toISOString()
            };
        } catch (error) {
            console.error("Error getting all sensor data:", error);
            return this._getEmptyData();
        }
    },

    /**
     * Lấy dữ liệu từ các fields được chỉ định
     * @param {Array} fields - Mảng các field numbers [1, 2, 3]
     */
    async getSpecificFields(fields) {
        try {
            const response = await this.getLatest();
            const data = response.data;
            const result = {};

            fields.forEach(fieldNum => {
                result[`field${fieldNum}`] = this._parseFieldValue(data[`field${fieldNum}`]);
            });

            result.timestamp = data.created_at || new Date().toISOString();
            return result;
        } catch (error) {
            console.error("Error getting specific fields:", error);
            return {};
        }
    },

    /**
     * Lấy nhiệt độ và độ ẩm (fields 1 và 2) - Giữ tương thích
     */
    async getAverageData() {
        try {
            const data = await this.getAllSensorData();
            return {
                temperature: data.temperature,
                humidity: data.humidity,
                timestamp: data.timestamp
            };
        } catch (error) {
            console.error("Error in getAverageData:", error);
            return {
                temperature: null,
                humidity: null,
                timestamp: new Date().toISOString()
            };
        }
    },

    // ===== HÀM HỖ TRỢ =====

    /**
     * Parse giá trị field
     */
    _parseFieldValue(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        return parseFloat(value);
    },

    /**
     * Trả về dữ liệu rỗng
     */
    _getEmptyData() {
        return {
            temperature: null,
            humidity: null,
            pressure: null,
            light: null,
            soilMoisture: null,
            timestamp: new Date().toISOString()
        };
    }
};

export default ThingSpeakAPI;