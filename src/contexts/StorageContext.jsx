import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { INITIAL_EQUIPMENT } from '../seedData';

const StorageContext = createContext();

export function useStorage() {
    return useContext(StorageContext);
}

export function StorageProvider({ children }) {
    const [equipment, setEquipment] = useState([]);
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Real-time Subscription to Equipment ---
    useEffect(() => {
        const q = query(collection(db, 'equipment'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const equipData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setEquipment(equipData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching equipment:", err);
            // Fallback to local storage if firebase fails (e.g. invalid keys)
            const saved = localStorage.getItem('gc_equipment');
            if (saved) setEquipment(JSON.parse(saved));
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // --- Real-time Subscription to Repairs ---
    useEffect(() => {
        // Order repairs by dateReported descending
        const q = query(collection(db, 'repairs'), orderBy('dateReported', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const repairData = snapshot.docs.map(doc => {
                const data = doc.data();
                // Convert Firestore timestamps to dates/strings if needed for UI
                return {
                    ...data,
                    id: doc.id,
                    dateReported: data.dateReported?.toDate ? data.dateReported.toDate().toISOString() : data.dateReported,
                    dateCompleted: data.dateCompleted?.toDate ? data.dateCompleted.toDate().toISOString() : data.dateCompleted
                };
            });
            setRepairs(repairData);
        }, (err) => {
            console.error("Error fetching repairs:", err);
            const saved = localStorage.getItem('gc_repairs');
            if (saved) setRepairs(JSON.parse(saved));
        });
        return unsubscribe;
    }, []);


    const addRepair = async (repair) => {
        try {
            await addDoc(collection(db, 'repairs'), {
                ...repair,
                dateReported: Timestamp.now(),
                status: 'Pending'
            });
        } catch (e) {
            console.error("Error adding repair: ", e);
            // Fallback for demo without valid keys
            alert("Firebase not connected. Check console.");
        }
    };

    const updateRepairStatus = async (id, status, user) => {
        try {
            const repairRef = doc(db, 'repairs', id);
            const updateData = { status };

            // Handle Completion Sign-off
            if (status === 'Completed') {
                updateData.dateCompleted = Timestamp.now();
                updateData.completedBy = user ? user.name : 'Unknown';

                // Also update Equipment status to Operational
                const repair = repairs.find(r => r.id === id);
                if (repair && repair.equipmentId) {
                    // We need to find the specific equipment doc to update it
                    // Ideally equipmentId in repair matches equipment doc id
                    const equipRef = doc(db, 'equipment', repair.equipmentId);
                    await updateDoc(equipRef, { status: 'Operational' });
                }
            }
            else if (status === 'In Progress') {
                const repair = repairs.find(r => r.id === id);
                if (repair && repair.equipmentId) {
                    const equipRef = doc(db, 'equipment', repair.equipmentId);
                    // Only set to In Repair if it's currently Operational? Or just force it.
                    await updateDoc(equipRef, { status: 'In Repair' });
                }
            }

            await updateDoc(repairRef, updateData);
        } catch (e) {
            console.error("Error updating repair: ", e);
        }
    };

    const updateRepairPriority = async (id, priority) => {
        try {
            const repairRef = doc(db, 'repairs', id);
            await updateDoc(repairRef, { priority });
        } catch (e) {
            console.error("Error updating priority: ", e);
        }
    };

    const updateRepairDetails = async (id, data) => {
        try {
            const repairRef = doc(db, 'repairs', id);
            await updateDoc(repairRef, data);
        } catch (e) {
            console.error("Error updating repair details: ", e);
        }
    };

    const addEquipment = async (newItem) => {
        try {
            await addDoc(collection(db, 'equipment'), newItem);
        } catch (e) {
            console.error("Error adding equipment: ", e);
        }
    };

    // Seed function for user convenience
    const seedDatabase = async () => {
        for (const item of INITIAL_EQUIPMENT) {
            await addDoc(collection(db, 'equipment'), item);
        }
        alert("Database seeded!");
    };

    const updateEquipment = async (id, data) => {
        try {
            const eqRef = doc(db, 'equipment', id);
            await updateDoc(eqRef, data);
        } catch (e) {
            console.error("Error updating equipment: ", e);
        }
    };

    const deleteEquipment = async (id) => {
        try {
            // Optional: Check for active repairs before deleting?
            // For now, allow delete.
            const { deleteDoc } = await import('firebase/firestore'); // Import dynamically or add to top imports
            const eqRef = doc(db, 'equipment', id);
            await deleteDoc(eqRef);
        } catch (e) {
            console.error("Error deleting equipment: ", e);
        }
    };

    return (
        <StorageContext.Provider value={{ equipment, repairs, addRepair, updateRepairStatus, updateRepairPriority, updateRepairDetails, addEquipment, updateEquipment, deleteEquipment, seedDatabase, loading }}>
            {children}
        </StorageContext.Provider>
    );
}
