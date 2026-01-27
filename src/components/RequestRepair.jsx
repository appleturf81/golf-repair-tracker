import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useAuth } from '../contexts/AuthContext';
import { Send, Camera, AlertOctagon } from 'lucide-react';

export default function RequestRepair({ onViewChange }) {
    const { equipment, addRepair } = useStorage();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        equipmentId: '',
        issue: '',
        priority: 'Low', // Employees can suggest priority, admins confirm
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.equipmentId || !formData.issue) return;

        const selectedEquipment = equipment.find(e => e.id === formData.equipmentId);

        addRepair({
            equipmentId: formData.equipmentId,
            equipmentName: selectedEquipment ? selectedEquipment.name : 'Unknown Equipment',
            issue: formData.issue,
            priority: formData.priority,
            reportedBy: user.name
        });

        // Redirect to queue
        if (onViewChange) onViewChange('repairs');
        else alert("Report Submitted!");
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-green-600 p-6 text-white text-center">
                    <h1 className="text-2xl font-bold mb-2">Report Equipment Issue</h1>
                    <p className="text-green-100">Found something broken? Let us know instantly.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Select Equipment
                        </label>
                        <select
                            value={formData.equipmentId}
                            onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                            required
                        >
                            <option value="">-- Choose Equipment --</option>
                            {equipment.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.name} ({e.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Describe the Problem
                        </label>
                        <textarea
                            value={formData.issue}
                            onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[120px]"
                            placeholder="e.g., Flat tire on right rear, engine making strange noise..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Urgency Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Low', 'Medium', 'High'].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: level })}
                                    className={`py-3 rounded-lg border font-medium transition-all ${formData.priority === level
                                            ? level === 'High' ? 'bg-red-50 border-red-500 text-red-700'
                                                : level === 'Medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                                                    : 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mock Photo Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white transition-colors">
                            <Camera className="w-6 h-6 text-gray-400 group-hover:text-green-500" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Add Photo (Optional)</p>
                        <p className="text-xs text-gray-400 mt-1">Click to upload from camera</p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Send className="w-5 h-5" />
                        Submit Report
                    </button>
                </form>
            </div>

            {/* Warning Tip */}
            <div className="mt-6 flex gap-3 p-4 bg-amber-50 rounded-xl text-amber-800 text-sm">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <p>
                    If this is a safety hazard, please tag-out the machine immediately and notify the Superintendent directly.
                </p>
            </div>
        </div>
    );
}
