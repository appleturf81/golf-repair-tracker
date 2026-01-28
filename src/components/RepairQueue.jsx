
import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Clock, CheckCircle, Camera, Paperclip, X } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function RepairQueue() {
    const { repairs, updateRepairStatus, updateRepairPriority, updateRepairDetails } = useStorage();
    const { canEditPriority, user, canUpdateRepair } = useAuth();
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [draggedItemId, setDraggedItemId] = useState(null);

    // Local state for editing notes/costs
    const [editData, setEditData] = useState({});

    // Toggle collapse
    const toggleExpand = (id) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const handleEditChange = (id, field, value) => {
        setEditData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const saveDetails = async (id) => {
        const data = editData[id];
        if (!data) return;
        await updateRepairDetails(id, data);
        alert('Details saved!');
    };

    // Sort repairs: Manual Order > Priority > Date
    const filteredRepairs = repairs.filter(r => {
        if (activeTab === 'active') return r.status !== 'Completed';
        if (activeTab === 'history') return r.status === 'Completed';
        return true;
    }).sort((a, b) => {
        if (activeTab === 'active') {
            // If both have order, use it
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            // If one has order, it comes first
            if (a.order !== undefined) return -1;
            if (b.order !== undefined) return 1;

            // Fallback to Priority (desc) then Date
            const pDiff = Number(b.priority) - Number(a.priority);
            if (pDiff !== 0) return pDiff;
        }
        return new Date(b.dateReported) - new Date(a.dateReported);
    });

    // Drag Handlers
    const handleDragStart = (e, id) => {
        if (!canEditPriority()) return; // Only admins drag
        setDraggedItemId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = async (e, targetId) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;

        // We only reorder the VISIBLE list
        const currentIndex = filteredRepairs.findIndex(r => r.id === draggedItemId);
        const targetIndex = filteredRepairs.findIndex(r => r.id === targetId);

        if (currentIndex === -1 || targetIndex === -1) return;

        // Create a copy of the list
        const newList = [...filteredRepairs];
        // Remove dragged item
        const [movedItem] = newList.splice(currentIndex, 1);
        // Insert at new position
        newList.splice(targetIndex, 0, movedItem);

        // Update "order" field for ALL items in this list to match their new index
        // This persists the sort
        const updates = newList.map((item, index) => {
            return updateRepairDetails(item.id, { order: index });
        });

        await Promise.all(updates);
        setDraggedItemId(null);
    };

    const getDaysInQueue = (dateString) => {
        const start = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const getQueueColor = (days) => {
        if (days > 7) return 'text-red-600 bg-red-50 border-red-200';
        if (days > 3) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    {activeTab === 'active' ? 'Repair Queue' : 'Repair History'}
                </h1>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Active Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Repaired Log
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredRepairs.map(repair => {
                    const days = getDaysInQueue(repair.dateReported);
                    // Initialize edit data from repair if not yet set
                    const currentNotes = editData[repair.id]?.notes !== undefined ? editData[repair.id].notes : (repair.notes || '');
                    const currentCost = editData[repair.id]?.cost !== undefined ? editData[repair.id].cost : (repair.cost || '');
                    const isExpanded = expandedIds.has(repair.id); // Default to collapsed

                    return (
                        <div
                            key={repair.id}
                            draggable={canEditPriority() && activeTab === 'active'}
                            onDragStart={(e) => handleDragStart(e, repair.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, repair.id)}
                            className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all ${draggedItemId === repair.id ? 'opacity-50 ring-2 ring-green-500' : ''}`}
                        >
                            {/* Header Row (Always Visible) */}
                            <div
                                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-t-xl"
                                onClick={() => toggleExpand(repair.id)}
                            >
                                {/* Drag Handle (if admin) or Status Icon */}
                                <div className="shrink-0">
                                    {repair.status === 'Completed' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                                        repair.status === 'In Progress' ? <Clock className="w-6 h-6 text-blue-600" /> :
                                            <AlertTriangle className="w-6 h-6 text-amber-600" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center bg-transparent">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{repair.equipmentName}</h3>
                                        {/* Priority Badge in Header */}
                                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider shrink-0
                                            ${Number(repair.priority) >= 8 ? 'bg-red-100 text-red-700' :
                                                Number(repair.priority) >= 4 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-700'
                                            } `}>
                                            Pri: {repair.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{repair.issue}</p>
                                </div>

                                <div className="shrink-0 text-gray-400">
                                    {/* Chevron Rotates */}
                                    <svg className={`w-6 h-6 transform transition ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="p-4 sm:p-5 border-t border-gray-100">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Content */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                                                <div>
                                                    <strong className="font-medium text-gray-700">Reported:</strong> {new Date(repair.dateReported).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <strong className="font-medium text-gray-700">By:</strong> {repair.reportedBy}
                                                </div>
                                                <div>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${getQueueColor(days)} `}>
                                                        <Clock className="w-3 h-3" />
                                                        {days} Days in Queue
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Notes & Cost & Photos Section */}
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3 grid md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Attachments</label>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {repair.images && repair.images.map((img, idx) => (
                                                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative group block w-16 h-16 rounded border overflow-hidden">
                                                                <img src={img} alt="attachment" className="w-full h-full object-cover" />
                                                            </a>
                                                        ))}
                                                        <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-green-500 hover:text-green-600 transition-colors">
                                                            <Camera className="w-5 h-5" />
                                                            <span className="text-[10px] mt-1">Add</span>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files[0];
                                                                    if (!file) return;
                                                                    try {
                                                                        // In a real app, use: const storageRef = ref(storage, `repairs/${repair.id}/${Date.now()}_${file.name}`);
                                                                        // await uploadBytes(storageRef, file);
                                                                        // const url = await getDownloadURL(storageRef);

                                                                        // For Demo/No-Backend-Keys Mode, use Base64:
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = async () => {
                                                                            const currentImages = repair.images || [];
                                                                            await updateRepairDetails(repair.id, { images: [...currentImages, reader.result] });
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    } catch (err) {
                                                                        console.error("Upload failed", err);
                                                                        alert("Upload failed (Check console)");
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mechanic Notes</label>
                                                    <textarea
                                                        className="w-full text-sm p-2 border rounded shadow-sm focus:ring-green-500 focus:border-green-500"
                                                        rows="2"
                                                        placeholder="Add details..."
                                                        value={currentNotes}
                                                        onChange={(e) => handleEditChange(repair.id, 'notes', e.target.value)}
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Repair Cost ($)</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="w-full text-sm p-2 border rounded shadow-sm focus:ring-green-500 focus:border-green-500"
                                                            placeholder="0.00"
                                                            value={currentCost}
                                                            onChange={(e) => handleEditChange(repair.id, 'cost', e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => saveDetails(repair.id)}
                                                            className="bg-green-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-green-700 transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                            {canUpdateRepair() ? (
                                                <select
                                                    value={repair.status}
                                                    onChange={(e) => updateRepairStatus(repair.id, e.target.value, user)}
                                                    className="block w-full py-1.5 px-3 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 shadow-sm"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            ) : (
                                                <span className="px-3 py-1.5 text-sm font-bold rounded-md bg-white border border-gray-200 text-gray-600">
                                                    {repair.status}
                                                </span>
                                            )}
                                        </div>

                                        {canEditPriority() && (
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Priority</label>
                                                <select
                                                    value={repair.priority}
                                                    onChange={(e) => updateRepairPriority(repair.id, e.target.value)}
                                                    className="block w-full py-1.5 px-3 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 shadow-sm"
                                                >
                                                    {[...Array(10)].map((_, i) => (
                                                        <option key={i + 1} value={10 - i}>{10 - i}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Sign-off Display */}
                                        {repair.status === 'Completed' && repair.completedBy && (
                                            <div className="ml-auto text-xs text-gray-500 italic flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                                Fixed by {repair.completedBy} on {new Date(repair.dateCompleted).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                            {filteredRepairs.length === 0 && (
                                <div className="text-center py-16 px-4 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                    <p>{activeTab === 'active' ? "Great job! No active repairs." : "No repair history found."}</p>
                                </div>
                            )}
                        </div>
        </div>
            );
}


