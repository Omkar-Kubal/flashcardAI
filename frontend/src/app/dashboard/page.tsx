'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Link from 'next/link';
import type { Deck, DashboardData } from '@/lib/types';

export default function DashboardPage() {
    const { token, user, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState({ total_cards: 0, total_decks: 0, due_cards: 0, mastery_rate: 0 });
    const [decks, setDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.getDashboard(token)
                .then((res) => {
                    const data = res as DashboardData;
                    setStats(data.stats);
                    setDecks(data.recent_decks || []);
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

    const deckEmojis = ['🇫🇷', '🧬', '🏛️', '💻', '📚', '🔬', '🎨', '🌍'];
    const progressColors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-cyan-500', 'bg-purple-500', 'bg-orange-500'];

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb="Dashboard" />

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto flex flex-col gap-8">

                        {/* Welcome Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                                    Welcome back{user ? `, ${user.username}` : ''}
                                </h2>
                                <p className="text-[#92adc9] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#FACC15] text-sm">local_fire_department</span>
                                    You&apos;re on a 12-day streak! Keep it up.
                                </p>
                            </div>
                            <Link href="/decks" className="btn-primary">
                                <span className="material-symbols-outlined">add</span>
                                Create New Deck
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="stat-card">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="icon-box">
                                        <span className="material-symbols-outlined text-[#FACC15]">school</span>
                                    </div>
                                    <span className="badge badge-success">+5%</span>
                                </div>
                                <p className="text-[#92adc9] text-sm font-medium">Cards Mastered</p>
                                <p className="text-white text-3xl font-bold mt-1">{stats.total_cards.toLocaleString()}</p>
                            </div>

                            <div className="stat-card">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="icon-box">
                                        <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
                                    </div>
                                    <span className="badge badge-success">+1 day</span>
                                </div>
                                <p className="text-[#92adc9] text-sm font-medium">Current Streak</p>
                                <p className="text-white text-3xl font-bold mt-1">12 Days</p>
                            </div>

                            <div className="stat-card">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="icon-box">
                                        <span className="material-symbols-outlined text-purple-400">target</span>
                                    </div>
                                    <span className="badge badge-success">+15%</span>
                                </div>
                                <p className="text-[#92adc9] text-sm font-medium">Daily Goal</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <p className="text-white text-3xl font-bold">{stats.mastery_rate}%</p>
                                    <span className="text-[#92adc9] text-sm">of {stats.due_cards} cards</span>
                                </div>
                                <div className="progress-bar mt-3">
                                    <div className="progress-bar-fill bg-purple-500" style={{ width: `${stats.mastery_rate}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* AI Recommendation Card */}
                        <div className="gradient-card shadow-lg">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-1/3 min-h-[200px] md:min-h-full bg-gradient-to-br from-[#FACC15]/10 to-transparent relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-8xl opacity-20">🧠</span>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative z-10">
                                    <div className="flex items-center gap-2 text-[#FACC15] text-sm font-bold uppercase tracking-wider mb-2">
                                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                        AI Recommendation
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Quick Study Session</h3>
                                    <p className="text-[#92adc9] mb-6 max-w-xl">
                                        Our AI noticed you have {stats.due_cards} cards due for review. Start a focused 10-minute session to master them.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <Link href="/study" className="btn-primary shadow-lg shadow-[#FACC15]/25">
                                            <span className="material-symbols-outlined">play_arrow</span>
                                            Start Session
                                        </Link>
                                        <button className="btn-secondary">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Decks & Sidebar */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Decks */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Recent Decks</h3>
                                    <Link href="/decks" className="text-[#FACC15] text-sm font-medium hover:underline flex items-center gap-1">
                                        View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </Link>
                                </div>

                                {decks.length === 0 ? (
                                    <div className="card text-center py-12">
                                        <div className="w-20 h-20 rounded-full bg-[#233648] flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-4xl text-[#92adc9]">folder_open</span>
                                        </div>
                                        <h4 className="text-white font-bold text-xl mb-3">No decks yet</h4>
                                        <p className="text-[#92adc9] mb-8 max-w-md mx-auto">
                                            Create your first deck to start organizing your flashcards.
                                        </p>
                                        <div className="flex justify-center gap-4">
                                            <Link href="/decks" className="btn-secondary">Create Manually</Link>
                                            <Link href="/ai/generate" className="btn-primary">
                                                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                                Generate with AI
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {decks.slice(0, 4).map((deck, index) => {
                                            const progress = Math.min(100, (deck.card_count / 150) * 100);
                                            return (
                                                <Link key={deck.id} href={`/decks/${deck.id}`} className="deck-card group">
                                                    <div className="deck-emoji">{deckEmojis[index % deckEmojis.length]}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="deck-title text-white font-bold truncate group-hover:text-[#FACC15] transition-colors">
                                                            {deck.name}
                                                        </h4>
                                                        <div className="flex items-center justify-between text-xs text-[#92adc9] mt-1 mb-2">
                                                            <span>{deck.card_count}/150 cards</span>
                                                            <span>{Math.round(progress)}%</span>
                                                        </div>
                                                        <div className="progress-bar">
                                                            <div className={`progress-bar-fill ${progressColors[index % progressColors.length]}`} style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <button className="play-btn group-hover:bg-[#FACC15] group-hover:text-[#101922] transition-colors">
                                                        <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                                    </button>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Right Sidebar */}
                            <div className="flex flex-col gap-6">
                                {/* Learning Tip */}
                                <div className="card bg-gradient-to-br from-[#1c2834] to-[#1d2430]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="bg-yellow-500/10 p-1.5 rounded-lg">
                                            <span className="material-symbols-outlined text-yellow-500 text-sm">lightbulb</span>
                                        </div>
                                        <h3 className="text-white font-bold text-sm">Learning Tip</h3>
                                    </div>
                                    <p className="text-sm text-[#92adc9] leading-relaxed">
                                        You tend to perform 20% better in the mornings. Try scheduling difficult cards before 10 AM.
                                    </p>
                                </div>

                                {/* Study Activity */}
                                <div className="card">
                                    <h3 className="text-white font-bold mb-4 text-sm">Study Activity</h3>
                                    <div className="flex gap-1 justify-between items-end h-24">
                                        {[30, 50, 20, 60, 80, 70, 90].map((height, i) => (
                                            <div
                                                key={i}
                                                className={`w-full rounded-t-sm transition-colors ${height > 70 ? 'bg-[#FACC15]' : 'bg-[#233648] hover:bg-[#FACC15]/50'
                                                    }`}
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-[#92adc9] mt-2 font-medium uppercase tracking-wider">
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                        <span>Fri</span>
                                        <span>Sat</span>
                                        <span>Sun</span>
                                    </div>
                                </div>

                                {/* Top Learners */}
                                <div className="card">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-white font-bold text-sm">Top Learners</h3>
                                        <span className="text-xs text-[#FACC15] cursor-pointer hover:underline">View All</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Sarah M.', xp: '2,400 XP', rank: '#1', color: 'text-yellow-500' },
                                            { name: user?.username || 'You', xp: '1,850 XP', rank: '#2', color: 'text-gray-400' },
                                            { name: 'John D.', xp: '1,200 XP', rank: '#3', color: 'text-orange-700' },
                                        ].map((learner, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#233648]"></div>
                                                <div className="flex-1">
                                                    <p className="text-white text-xs font-bold">{learner.name}</p>
                                                    <p className="text-[10px] text-[#92adc9]">{learner.xp}</p>
                                                </div>
                                                <span className={`font-bold text-sm ${learner.color}`}>{learner.rank}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="h-8"></div>
                </main>
            </div>
        </div>
    );
}
