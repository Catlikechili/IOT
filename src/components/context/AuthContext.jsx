import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hàm Đăng nhập
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Hàm Đăng xuất
    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
    };

    useEffect(() => {
        // Observer của Firebase: Giữ phiên đăng nhập khi load lại trang
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role);
                    } else {
                        setRole('user');
                    }
                    setUser(currentUser);
                } catch (error) {
                    console.error("Lỗi lấy role:", error);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = { user, role, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth phải được dùng trong AuthProvider");
    return context;
};