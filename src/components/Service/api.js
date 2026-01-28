import { db } from '../../firebase';
import { collection, addDoc, getDocs } from "firebase/firestore";

// Lưu dữ liệu trực tiếp lên đám mây
const addDevice = async (deviceName) => {
    await addDoc(collection(db, "devices"), {
        name: deviceName,
        status: "off",
        createdAt: new Date()
    });
};