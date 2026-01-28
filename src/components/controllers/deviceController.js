// src/controllers/deviceController.js
import { updatePin } from "../Service/blynkService";

export const createDeviceController = (setDeviceStates, isAutoMode = false) => {
    // Hàm điều khiển chung
    const control = async (device, pin, forcedValue = null) => {
        setDeviceStates(prev => {
            const current = prev[device];
            const newState = forcedValue !== null ? forcedValue : !current;

            // Gửi lên Cloud
            if (pin !== null) {
                updatePin(pin, newState ? 1 : 0).catch(err => {
                    console.error(`Lỗi gửi lệnh tới ${device}:`, err);
                    // Rollback nếu lỗi
                    setDeviceStates(prev2 => ({
                        ...prev2,
                        [device]: current
                    }));
                });
            }

            return {
                ...prev,
                [device]: newState
            };
        });
    };

    // Hàm xuất ra
    return {
        fan: {
            on: () => control("fan", 1, true),
            off: () => control("fan", 1, false),
            toggle: () => control("fan", 1)
        },
        heater: {
            on: () => control("heater", 2, true),
            off: () => control("heater", 2, false),
            toggle: () => control("heater", 2)
        },
        humidifier: {
            on: () => control("humidifier", 0, true), // Note: pin 0
            off: () => control("humidifier", 0, false),
            toggle: () => control("humidifier", 0)
        },
        airPurifier: {
            on: () => control("airPurifier", 3, true),
            off: () => control("airPurifier", 3, false),
            toggle: () => control("airPurifier", 3)
        }
    };
};