import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, ChevronRight } from 'lucide-react';

export default function LoginScreen() {
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (await login(code)) {
            setError(false);
        } else {
            setError(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <KeyRound className="w-8 h-8 text-green-700" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Golf Course Repair Tracker</h1>
                <p className="text-center text-gray-500 mb-8">Enter your access code to continue</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Access Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-mono text-center tracking-widest text-lg uppercase"
                            placeholder="ENTER CODE"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                            Invalid access code. Please try again.
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                    >
                        Access System
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
                    <p className="font-semibold mb-2">Demo Codes:</p>
                    <div className="flex justify-center gap-4">
                        <span>Admin: SUPER123</span>
                        <span>Asst: ASST456</span>
                        <span>Staff: (Any)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
