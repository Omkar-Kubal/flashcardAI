'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account'>('profile');

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb="Settings" />

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-8 border-b border-[#233648]">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'profile'
                                        ? 'text-[#FACC15] border-b-2 border-[#FACC15]'
                                        : 'text-[#92adc9] hover:text-white'
                                    }`}
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'preferences'
                                        ? 'text-[#FACC15] border-b-2 border-[#FACC15]'
                                        : 'text-[#92adc9] hover:text-white'
                                    }`}
                            >
                                Preferences
                            </button>
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'account'
                                        ? 'text-[#FACC15] border-b-2 border-[#FACC15]'
                                        : 'text-[#92adc9] hover:text-white'
                                    }`}
                            >
                                Account
                            </button>
                        </div>

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="card">
                                    <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">Username</label>
                                            <input
                                                type="text"
                                                value={user?.username || ''}
                                                disabled
                                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 focus:ring-2 focus:ring-[#FACC15]"
                                            />
                                        </div>
                                        <button className="btn-primary">Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <div className="card">
                                    <h2 className="text-xl font-bold text-white mb-6">Study Preferences</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-3">Daily Goal (cards per day)</label>
                                            <input
                                                type="number"
                                                defaultValue={20}
                                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 focus:ring-2 focus:ring-[#FACC15]"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-5 h-5 bg-[#16202a] border-[#233648] rounded text-[#FACC15] focus:ring-2 focus:ring-[#FACC15]"
                                                />
                                                <span className="text-white">Auto-play audio (if available)</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-5 h-5 bg-[#16202a] border-[#233648] rounded text-[#FACC15] focus:ring-2 focus:ring-[#FACC15]"
                                                />
                                                <span className="text-white">Show answer automatically after 5 seconds</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 bg-[#16202a] border-[#233648] rounded text-[#FACC15] focus:ring-2 focus:ring-[#FACC15]"
                                                />
                                                <span className="text-white">Shuffle cards in study sessions</span>
                                            </label>
                                        </div>
                                        <button className="btn-primary">Save Preferences</button>
                                    </div>
                                </div>

                                <div className="card">
                                    <h2 className="text-xl font-bold text-white mb-6">Notifications</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-5 h-5 bg-[#16202a] border-[#233648] rounded text-[#FACC15] focus:ring-2 focus:ring-[#FACC15]"
                                                />
                                                <span className="text-white">Email reminders for due cards</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-5 h-5 bg-[#16202a] border-[#233648] rounded text-[#FACC15] focus:ring-2 focus:ring-[#FACC15]"
                                                />
                                                <span className="text-white">Weekly progress reports</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <div className="card">
                                    <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 focus:ring-2 focus:ring-[#FACC15]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">New Password</label>
                                            <input
                                                type="password"
                                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 focus:ring-2 focus:ring-[#FACC15]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 focus:ring-2 focus:ring-[#FACC15]"
                                            />
                                        </div>
                                        <button className="btn-primary">Update Password</button>
                                    </div>
                                </div>

                                <div className="card border-red-500/20">
                                    <h2 className="text-xl font-bold text-white mb-4">Danger Zone</h2>
                                    <p className="text-[#92adc9] mb-6">Once you sign out, you'll need to log in again to access your account.</p>
                                    <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
