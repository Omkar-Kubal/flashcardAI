'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Link from 'next/link';
import type { Deck } from '@/lib/types';

export default function StudyPage() {
    const { token, isLoading: authLoading } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [stats, setStats] = useState({ total_cards: 0, due_cards: 0, mastery_rate: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        Promise.all([
            api.getDecks(token).then((res) => setDecks((res as { decks: Deck[] }).decks)),
            api.getStudyStats(token).then((res) => {
                const s = res as { total_cards: number; due_cards: number; mastery_rate: number };
                setStats(s);
            }),
        ])
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [token]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#101922]">
                <div className="w-12 h-12 border-4 border-[#233648] border-t-[#FACC15] rounded-full spinner"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb="Study" />

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto flex flex-col gap-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Study Session</h1>
                            <p className="text-[#92adc9]">Choose a deck to start learning or review due cards.</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="stat-card">
                                <div className="icon-box mb-3">
                                    <span className="material-symbols-outlined text-[#FACC15]">library_books</span>
                                </div>
                                <p className="text-[#92adc9] text-sm font-medium">Total Cards</p>
                                <p className="text-white text-3xl font-bold mt-1">{stats.total_cards}</p>
                            </div>
                            <div className="stat-card">
                                <div className="icon-box mb-3">
                                    <span className="material-symbols-outlined text-orange-400">schedule</span>
                                </div>
                                <p className="text-[#92adc9] text-sm font-medium">Due for Review</p>
                                <p className="text-white text-3xl font-bold mt-1">{stats.due_cards}</p>
                            </div>
                            <div className="stat-card">
                                <div className="icon-box mb-3">
                                    <span className="material-symbols-outlined text-green-400">trending_up</span>
                                </div>
                                <p className="text-[#92adc9] text-sm font-medium">Mastery Rate</p>
                                <p className="text-white text-3xl font-bold mt-1">{stats.mastery_rate}%</p>
                            </div>
                        </div>

                        {/* Quick Start */}
                        {stats.due_cards > 0 && (
                            <div className="gradient-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-[#FACC15] text-sm font-bold uppercase tracking-wider mb-2">
                                            <span className="material-symbols-outlined text-lg">bolt</span>
                                            Quick Start
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-2">You have {stats.due_cards} cards due!</h2>
                                        <p className="text-[#92adc9]">Start a review session for all due cards across your decks.</p>
                                    </div>
                                    <Link href="/study/all" className="btn-primary">
                                        <span className="material-symbols-outlined">play_arrow</span>
                                        Start Review
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Decks List */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Select a Deck</h2>
                            {decks.length === 0 ? (
                                <div className="card text-center py-12">
                                    <div className="w-20 h-20 rounded-full bg-[#233648] flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-4xl text-[#92adc9]">folder_open</span>
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-3">No Decks Available</h3>
                                    <p className="text-[#92adc9] mb-6">Create a deck first to start studying.</p>
                                    <Link href="/decks" className="btn-primary">Create Deck</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {decks.map((deck) => (
                                        <Link
                                            key={deck.id}
                                            href={`/study/${deck.id}`}
                                            className="deck-card group"
                                        >
                                            <div className="deck-emoji">📚</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="deck-title text-white font-bold truncate group-hover:text-[#FACC15] transition-colors">
                                                    {deck.name}
                                                </h4>
                                                <p className="text-[#92adc9] text-sm">{deck.card_count} cards</p>
                                            </div>
                                            <button className="play-btn group-hover:bg-[#FACC15] group-hover:text-[#101922] transition-colors">
                                                <span className="material-symbols-outlined text-lg">play_arrow</span>
                                            </button>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
