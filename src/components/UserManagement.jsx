import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Trash2, UserPlus, Shield, User } from 'lucide-react';

export default function UserManagement() {
    const { user, canManageUsers } = useAuth();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', code: '', role: 'Employee' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, 'users'), orderBy('name'));
            const snap = await getDocs(q);
            setUsers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            // Simple validation
            if (!newUser.code || !newUser.name) return;

            await addDoc(collection(db, 'users'), newUser);
            setIsModalOpen(false);
            setNewUser({ name: '', code: '', role: 'Employee' });
            fetchUsers();
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const handleDeleteUser = async (id) => {
        if (confirm('Are you sure you want to remove this user?')) {
            try {
                await deleteDoc(doc(db, 'users', id));
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    if (!canManageUsers()) {
        return (
            <div className="p-8 text-center text-gray-500">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-bold">Access Denied</h2>
                <p>Only Superintendents can manage the team.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
                    <p className="text-gray-500 text-sm">Manage access and roles</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    <UserPlus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Access Code</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full"><User className="w-4 h-4 text-gray-500" /></div>
                                    {u.name}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs bg-gray-50 rounded w-fit">{u.code}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${u.role === 'Superintendent' ? 'bg-purple-100 text-purple-700' :
                                        u.role === 'Assistant' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="text-gray-400 hover:text-red-600 transition p-2"
                                        title="Remove User"
                                        disabled={u.code === user.code} // Prevent deleting self
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">No users found.</div>
                )}
            </div>

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Full Name</label>
                                <input
                                    className="w-full border p-2 rounded-lg"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Access Code</label>
                                <input
                                    className="w-full border p-2 rounded-lg font-mono"
                                    value={newUser.code}
                                    onChange={e => setNewUser({ ...newUser, code: e.target.value })}
                                    placeholder="e.g. 1234"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Role</label>
                                <select
                                    className="w-full border p-2 rounded-lg"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="Employee">Employee (Standard)</option>
                                    <option value="Mechanic">Mechanic</option>
                                    <option value="Assistant">Assistant (Can prioritize)</option>
                                    <option value="Superintendent">Superintendent (Admin)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
