// src/controllers/environmentLogic.js
export const createEnvironmentLogic = (control, addLog, addNotification) => {

    const createAlert = (message, severity, type, value, threshold, unit) => {
        const alert = {
            id: Date.now(),
            message,
            severity,
            type,
            value,
            threshold,
            unit,
            timestamp: new Date().toISOString(),
            read: false,
            details: { current: value, threshold, unit }
        };

        addLog(alert);
        addNotification(alert);
    };

    // ================================
    //  AUTO LOGIC: Temperature
    // ================================
    const checkTemperature = (temp) => {
        if (temp >= 35) {
            control.fan.on();
            control.heater.off();
            createAlert(
                `Nhiệt độ quá cao: ${temp.toFixed(1)}°C`,
                "high",
                "high",
                temp.toFixed(1),
                35,
                "°C"
            );
            return;
        }

        if (temp <= 15) {
            control.heater.on();
            control.fan.off();
            createAlert(
                `Nhiệt độ quá thấp: ${temp.toFixed(1)}°C`,
                "medium",
                "low",
                temp.toFixed(1),
                15,
                "°C"
            );
            return;
        }

        if (temp >= 28) {
            control.fan.on();
            control.heater.off();
        } else if (temp <= 20) {
            control.heater.on();
            control.fan.off();
        } else {
            control.fan.off();
            control.heater.off();
        }
    };

    // ================================
    //  AUTO LOGIC: Humidity
    // ================================
    const checkHumidity = (humi) => {
        if (humi >= 80) {
            control.airPurifier.on();
            control.humidifier.off();
            createAlert(
                `Độ ẩm quá cao: ${humi.toFixed(1)}%`,
                "medium",
                "high_humidity",
                humi.toFixed(1),
                80,
                "%"
            );
            return;
        }

        if (humi <= 30) {
            control.humidifier.on();
            control.airPurifier.off();
            createAlert(
                `Độ ẩm quá thấp: ${humi.toFixed(1)}%`,
                "medium",
                "low_humidity",
                humi.toFixed(1),
                30,
                "%"
            );
            return;
        }

        if (humi >= 70) {
            control.airPurifier.on();
            control.humidifier.off();
        } else if (humi <= 40) {
            control.humidifier.on();
            control.airPurifier.off();
        } else {
            control.humidifier.off();
            control.airPurifier.off();
        }
    };

    return {
        checkTemperature,
        checkHumidity,
        createAlert
    };
};