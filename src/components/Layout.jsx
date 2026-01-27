import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Wrench, ClipboardList, PenTool, LogOut, Menu, X, Users } from 'lucide-react';

export default function Layout({ children, currentView, onViewChange }) {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const NavItem = ({ view, icon: Icon, label }) => (
        <button
            onClick={() => {
                onViewChange(view);
                setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${currentView === view
                ? 'bg-green-100 text-green-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
            {/* Global Background Watermark */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'url(/background.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'contrast(1.2) brightness(1.1)'
                }}
            />
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col p-4 relative">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex justify-center w-full">
                            <img src="/french_lick_logo.png" alt="French Lick Resort Agronomy" className="h-[250px] w-auto object-contain" />
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-gray-100 absolute right-2 top-2">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <nav className="space-y-1 flex-1">
                        <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <NavItem view="repairs" icon={ClipboardList} label="Repair Queue" />
                        <NavItem view="equipment" icon={Wrench} label="Equipment" />
                        <NavItem view="request" icon={PenTool} label="Report Issue" />
                        {user.role === 'Superintendent' && <NavItem view="users" icon={Users} label="Team" />}
                    </nav>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="px-4 py-3 mb-2">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-green-600 font-medium">{user.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Appleturf Logo - Fixed Bottom Right */}
            <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-90">
                <img src="/appleturf_logo.jpg" alt="Appleturf Designs" className="h-32 w-auto rounded-lg shadow-xl border-2 border-white" />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-200 p-4 lg:hidden flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                    <img src="/french_lick_logo.png" alt="French Lick" className="h-40 w-auto object-contain" />
                    <div className="w-6" />
                </header>

                <div className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
