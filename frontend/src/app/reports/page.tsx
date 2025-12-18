'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function ReportsPage() {
    const { token, user, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        total_cards: 0,
        total_decks: 0,
        due_cards: 0,
        mastery_rate: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.getStudyStats(token)
                .then((res) => {
                    const s = res as { total_cards: number; due_cards: number; mastery_rate: number };
                    setStats({ ...stats, ...s });
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [token]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#101922]">
                <div className="w-12 h-12 border-4 border-[#233648] border-t-[#FACC15] rounded-full spinner"></div>
            </div>
        );
    }

    const weeklyData = [
        { day: 'Mon', cards: 15, time: 25 },
        { day: 'Tue', cards: 23, time: 35 },
        { day: 'Wed', cards: 18, time: 28 },
        { day: 'Thu', cards: 31, time: 42 },
        { day: 'Fri', cards: 27, time: 38 },
        { day: 'Sat', cards: 12, time: 18 },
        { day: 'Sun', cards: 8, time: 12 },
    ];

    const maxCards = Math.max(...weeklyData.map((d) => d.cards));

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb="Reports" />

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Study Reports</h1>
                            <p className="text-[#92adc9] mb-8">Track your progress and performance over time.</p>
                        </div>

                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="stat-card">
                                <div className="icon-box mb-3 bg-blue-500/10">
                                    <span className="material-symbols-outlined text-blue-400">library_books</span>
                                </div>
                                <p className="text-[#92adc9] text-sm">Total Cards</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.total_cards}</p>
                            </div>
                            <div className="stat-card">
                                <div className="icon-box mb-3 bg-purple-500/10">
                                    <span className="material-symbols-outlined text-purple-400">folder</span>
                                </div>
                                <p className="text-[#92adc9] text-sm">Total Decks</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.total_decks}</p>
                            </div>
                            <div className="stat-card">
                                <div className="icon-box mb-3 bg-orange-500/10">
                                    <span className="material-symbols-outlined text-orange-400">schedule</span>
                                </div>
                                <p className="text-[#92adc9] text-sm">Due Today</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.due_cards}</p>
                            </div>
                            <div className="stat-card">
                                <div className="icon-box mb-3 bg-green-500/10">
                                    <span className="material-symbols-outlined text-green-400">trending_up</span>
                                </div>
                                <p className="text-[#92adc9] text-sm">Mastery Rate</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.mastery_rate}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Weekly Activity */}
                            <div className="card">
                                <h2 className="text-xl font-bold text-white mb-6">Weekly Activity</h2>
                                <div className="flex gap-2 justify-between items-end h-48 mb-4">
                                    {weeklyData.map((data) => (
                                        <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                                            <div
                                                className="w-full bg-[#FACC15] rounded-t hover:bg-[#EAB308] transition-colors cursor-pointer relative group"
                                                style={{ height: `${(data.cards / maxCards) * 100}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1c2834] border border-[#233648] rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                                                    {data.cards} cards
                                                </div>
                                            </div>
                                            <span className="text-xs text-[#92adc9] font-medium">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center text-sm text-[#92adc9]">
                                    Total this week: {weeklyData.reduce((a, b) => a + b.cards, 0)} cards
                                </div>
                            </div>

                            {/* Study Time */}
                            <div className="card">
                                <h2 className="text-xl font-bold text-white mb-6">Study Time (minutes)</h2>
                                <div className="flex gap-2 justify-between items-end h-48 mb-4">
                                    {weeklyData.map((data) => (
                                        <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                                            <div
                                                className="w-full bg-purple-500 rounded-t hover:bg-purple-400 transition-colors cursor-pointer relative group"
                                                style={{ height: `${(data.time / 50) * 100}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1c2834] border border-[#233648] rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                                                    {data.time} min
                                                </div>
                                            </div>
                                            <span className="text-xs text-[#92adc9] font-medium">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center text-sm text-[#92adc9]">
                                    Total this week: {weeklyData.reduce((a, b) => a + b.time, 0)} minutes
                                </div>
                            </div>
                        </div>

                        {/* Performance Insights */}
                        <div className="card mt-8">
                            <h2 className="text-xl font-bold text-white mb-6">Performance Insights</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <span className="material-symbols-outlined text-green-400 text-2xl">thumb_up</span>
                                    <div>
                                        <p className="text-white font-bold mb-1">Great consistency!</p>
                                        <p className="text-sm text-[#92adc9]">You've studied 7 days in a row. Keep up the streak!</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                    <span className="material-symbols-outlined text-yellow-400 text-2xl">schedule</span>
                                    <div>
                                        <p className="text-white font-bold mb-1">Peak performance time</p>
                                        <p className="text-sm text-[#92adc9]">You tend to perform 25% better in morning sessions (8-11 AM).</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <span className="material-symbols-outlined text-blue-400 text-2xl">trending_up</span>
                                    <div>
                                        <p className="text-white font-bold mb-1">Improving mastery</p>
                                        <p className="text-sm text-[#92adc9]">Your mastery rate increased by 12% this month!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
