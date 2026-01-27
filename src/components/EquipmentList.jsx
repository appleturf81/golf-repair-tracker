import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, MoreVertical } from 'lucide-react';

export default function EquipmentList() {
    const { equipment, repairs, addEquipment, updateEquipment, deleteEquipment } = useStorage();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // If set, we are editing

    // History Modal State
    const [historyItem, setHistoryItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({ name: '', type: 'Mower', department: '', serial: '', status: 'Operational' });

    const openAdd = () => {
        setEditingId(null);
        setFormData({ name: '', type: 'Mower', department: '', serial: '', status: 'Operational' });
        setIsModalOpen(true);
    };

    const openEdit = (item) => {
        setEditingId(item.id);
        setFormData({ ...item });
        setIsModalOpen(true);
    };

    const openHistory = (item) => {
        setHistoryItem(item);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
            await deleteEquipment(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await updateEquipment(editingId, formData);
        } else {
            await addEquipment(formData);
        }
        setIsModalOpen(false);
    };

    const filteredEquipment = equipment.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter repairs for history modal
    const itemHistory = historyItem
        ? repairs
            .filter(r => r.equipmentId === historyItem.id)
            .sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported))
        : [];

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Equipment Inventory</h1>
                    <p className="text-gray-500 text-sm">{equipment.length} assets tracked</p>
                </div>

                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Equipment
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name, type, or department..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipment.map(item => (
                    <div key={item.id} onClick={() => openHistory(item)} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group cursor-pointer">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                        </div>

                        <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-md">
                                {item.type}
                            </span>
                            <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md tracking-wide
                        ${item.status === 'Operational' ? 'bg-green-100 text-green-700' :
                                    item.status === 'Down' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {item.status}
                            </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-1 pr-12">{item.name}</h3>
                        <p className="text-gray-500 text-sm mb-4">{item.department}</p>

                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-mono">
                            <span>SN: {item.serial || 'N/A'}</span>
                            <span className="flex items-center gap-1 text-blue-500 hover:underline">
                                <Search className="w-3 h-3" /> View Log
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Equipment' : 'Add New Equipment'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name / Model</label>
                                <input required className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select className="w-full border p-2 rounded-lg" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Mower</option>
                                        <option>Vehicle</option>
                                        <option>Tractor</option>
                                        <option>Handheld</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Department</label>
                                    <input className="w-full border p-2 rounded-lg" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Serial Number</label>
                                <input className="w-full border p-2 rounded-lg" value={formData.serial} onChange={e => setFormData({ ...formData, serial: e.target.value })} />
                            </div>
                            {editingId && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select className="w-full border p-2 rounded-lg" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option>Operational</option>
                                        <option>In Repair</option>
                                        <option>Down</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">{editingId ? 'Save Changes' : 'Add Asset'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{historyItem.name}</h2>
                                <p className="text-gray-500">Repair History Log</p>
                            </div>
                            <button onClick={() => setHistoryItem(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto space-y-4 pr-2">
                            {itemHistory.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed text-gray-500">
                                    No repair history record found for this asset.
                                </div>
                            ) : (
                                itemHistory.map(log => (
                                    <div key={log.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${log.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    log.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {log.status}
                                            </span>
                                            <span className="text-xs text-gray-500">{new Date(log.dateReported).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">{log.issue}</p>
                                        <div className="mt-3 flex gap-4 text-xs text-gray-500">
                                            <span>Reported by: {log.reportedBy}</span>
                                            {log.completedBy && <span>Fixed by: {log.completedBy}</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 text-right">
                            <button onClick={() => setHistoryItem(null)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
