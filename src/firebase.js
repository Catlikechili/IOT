import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyCgfO2Hwo6HsGLo8XEn84VlYCyZevlOd7c",
    authDomain: "iotungdung-faac8.firebaseapp.com",
    projectId: "iotungdung-faac8",
    storageBucket: "iotungdung-faac8.firebasestorage.app",
    messagingSenderId: "942523868806",
    appId: "1:942523868806:web:a5855ca913ea1bd3491307",
    measurementId: "G-98KKPRYS7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // Dòng này cực kỳ quan trọng
export const db = getFirestore(app);
export default app;