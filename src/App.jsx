import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StorageProvider } from './contexts/StorageContext';
import LoginScreen from './components/LoginScreen';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RepairQueue from './components/RepairQueue';
import EquipmentList from './components/EquipmentList';
import RequestRepair from './components/RequestRepair';
import UserManagement from './components/UserManagement';

function AppContent() {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');

    if (!user) {
        return <LoginScreen />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard onViewChange={setCurrentView} />;
            case 'repairs': return <RepairQueue />;
            case 'equipment': return <EquipmentList />;
            case 'request': return <RequestRepair onViewChange={setCurrentView} />;
            case 'users': return <UserManagement />;
            default: return <Dashboard onViewChange={setCurrentView} />;
        }
    };

    return (
        <Layout currentView={currentView} onViewChange={setCurrentView}>
            {renderView()}
        </Layout>
    );
}

function App() {
    return (
        <StorageProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </StorageProvider>
    );
}

export default App;
