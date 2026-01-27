import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { INITIAL_USERS } from '../seedData';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('gc_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('gc_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('gc_user');
        }
    }, [user]);

    // Seed users if empty (helper)
    const seedUsers = async () => {
        const q = query(collection(db, 'users'));
        const snap = await getDocs(q);
        if (snap.empty) {
            for (const u of INITIAL_USERS) {
                await addDoc(collection(db, 'users'), u);
            }
            console.log("Users seeded");
        }
    };

    // Run seed once on mount (dev convenience)
    useEffect(() => {
        seedUsers();
    }, []);

    const login = async (code) => {
        try {
            const q = query(collection(db, 'users'), where('code', '==', code));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                setUser({ ...userData, id: querySnapshot.docs[0].id });
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Login error:", error);
            // Fallback for offline/demo if DB fails
            if (code === 'SUPER123') { setUser({ name: 'Superintendent', role: 'Superintendent', code }); return true; }
            return false;
        }
    };

    const logout = () => setUser(null);

    const canEditPriority = () => {
        return ['Superintendent', 'Assistant', 'Mechanic'].includes(user?.role);
    };

    const canManageUsers = () => {
        return user?.role === 'Superintendent';
    };

    const canUpdateRepair = () => {
        return ['Superintendent', 'Assistant', 'Mechanic'].includes(user?.role);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, canEditPriority, canManageUsers, canUpdateRepair }}>
            {children}
        </AuthContext.Provider>
    );
}
