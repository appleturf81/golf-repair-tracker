import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function Dashboard({ onViewChange }) {
    const { equipment, repairs } = useStorage();
    const { user } = useAuth();

    const operationalCount = equipment.filter(e => e.status === 'Operational').length;
    const downCount = equipment.filter(e => e.status === 'Down' || e.status === 'In Repair').length;
    const pendingRepairs = repairs.filter(r => r.status === 'Pending').length;

    // Calculate average wait time or other stats if needed

    const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('700', '100').replace('600', '100').replace('500', '100')}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
        </div>
    );

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Welcome, {user.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Operational"
                    value={operationalCount}
                    icon={CheckCircle2}
                    color="text-green-600"
                    onClick={() => onViewChange('equipment')}
                />
                <StatCard
                    title="Down / In Repair"
                    value={downCount}
                    icon={AlertCircle}
                    color="text-red-500"
                    onClick={() => onViewChange('equipment')}
                />
                <StatCard
                    title="Pending Requests"
                    value={pendingRepairs}
                    icon={Clock}
                    color="text-amber-500"
                    onClick={() => onViewChange('repairs')}
                />
                <StatCard
                    title="Total Equipment"
                    value={equipment.length}
                    icon={Wrench}
                    color="text-blue-600"
                    onClick={() => onViewChange('equipment')}
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {repairs.slice(0, 5).map(repair => (
                        <div key={repair.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-gray-800">{repair.equipmentName}</p>
                                    <p className="text-sm text-gray-500">{repair.issue}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${repair.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        repair.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'}`}>
                                    {repair.status}
                                </span>
                            </div>
                            <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                                <span>Reported by {repair.reportedBy}</span>
                                <span>{new Date(repair.dateReported).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {repairs.length === 0 && (
                        <div className="p-8 text-center text-gray-400">No repair history found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
