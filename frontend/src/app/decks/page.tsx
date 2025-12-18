'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Link from 'next/link';
import type { Deck } from '@/lib/types';

export default function DecksPage() {
    const { token, isLoading: authLoading } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckDescription, setNewDeckDescription] = useState('');

    const loadDecks = async () => {
        if (!token) return;
        try {
            const res = await api.getDecks(token) as { decks: Deck[] };
            setDecks(res.decks);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadDecks();
    }, [token]);

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !newDeckName.trim()) return;

        try {
            await api.createDeck(token, { name: newDeckName.trim(), description: newDeckDescription.trim() });
            setNewDeckName('');
            setNewDeckDescription('');
            setShowModal(false);
            loadDecks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteDeck = async (id: number) => {
        if (!token || !confirm('Delete this deck?')) return;
        try {
            await api.deleteDeck(token, id);
            loadDecks();
        } catch (err) {
            console.error(err);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#101922]">
                <div className="w-12 h-12 border-4 border-[#233648] border-t-[#FACC15] rounded-full spinner"></div>
            </div>
        );
    }

    const deckIcons = ['school', 'travel_explore', 'restaurant', 'history_edu', 'science', 'code', 'palette', 'music_note'];
    const iconColors = ['text-orange-500 bg-orange-500/10', 'text-blue-500 bg-blue-500/10', 'text-green-500 bg-green-500/10', 'text-purple-500 bg-purple-500/10', 'text-cyan-500 bg-cyan-500/10', 'text-pink-500 bg-pink-500/10'];

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb="My Decks" />

                <main className="flex-1 overflow-y-auto bg-[#111a22]">
                    <div className="max-w-[1400px] mx-auto p-8 flex flex-col min-h-full">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Decks</h1>
                                <p className="text-[#92adc9]">Manage your decks, sub-decks, and flashcards.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/ai/generate"
                                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#1c2834] border border-[#FACC15]/30 text-[#FACC15] hover:bg-[#FACC15]/10 transition-colors text-sm font-bold"
                                >
                                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                    <span>AI Generate</span>
                                </Link>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#101922] transition-colors text-sm font-bold shadow-lg shadow-[#FACC15]/20"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    <span>New Deck</span>
                                </button>
                            </div>
                        </div>

                        {/* Deck Grid */}
                        {decks.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-[#1c2834] flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-5xl text-[#92adc9]">folder_open</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-3">No Decks Yet</h2>
                                    <p className="text-[#92adc9] mb-8 max-w-md">Create your first deck to start organizing flashcards.</p>
                                    <button onClick={() => setShowModal(true)} className="btn-primary">
                                        <span className="material-symbols-outlined">add</span>
                                        Create Your First Deck
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                {decks.map((deck, index) => {
                                    const progress = deck.card_count > 0 ? Math.min(100, (deck.card_count / 100) * 100) : 0;
                                    const colorClass = iconColors[index % iconColors.length];

                                    return (
                                        <Link
                                            key={deck.id}
                                            href={`/decks/${deck.id}`}
                                            className="group relative flex flex-col bg-[#1c2834] rounded-xl border border-[#2d3b48] hover:border-[#FACC15]/50 transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
                                        >
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                            {deckIcons[index % deckIcons.length]}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); handleDeleteDeck(deck.id); }}
                                                        className="text-[#92adc9] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                                <h3 className="text-white font-bold text-lg mb-1 leading-snug group-hover:text-[#FACC15] transition-colors">
                                                    {deck.name}
                                                </h3>
                                                {deck.description && (
                                                    <p className="text-[#92adc9] text-sm mb-4 line-clamp-2">{deck.description}</p>
                                                )}
                                                <div className="mt-auto">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <p className="text-[#92adc9] text-xs font-medium uppercase tracking-wider mb-1">Cards</p>
                                                            <span className="text-2xl font-bold text-white">{deck.card_count}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs text-[#92adc9]">{Math.round(progress)}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-[#101922] rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-[#FACC15] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}

                                {/* Add New Deck Card */}
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="group flex flex-col items-center justify-center bg-[#1c2834]/30 rounded-xl border-2 border-dashed border-[#2d3b48] hover:border-[#FACC15]/50 hover:bg-[#1c2834]/50 transition-all min-h-[220px]"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#101922] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-3xl text-[#FACC15]">add</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-1">Create New Deck</h3>
                                    <p className="text-[#92adc9] text-sm text-center px-8">Add a new topic or category</p>
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1c2834] rounded-2xl border border-[#233648] p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Create New Deck</h2>
                        <form onSubmit={handleCreateDeck} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Deck Name</label>
                                <input
                                    type="text"
                                    value={newDeckName}
                                    onChange={(e) => setNewDeckName(e.target.value)}
                                    className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                                    placeholder="e.g., Spanish Vocabulary"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Description (optional)</label>
                                <textarea
                                    value={newDeckDescription}
                                    onChange={(e) => setNewDeckDescription(e.target.value)}
                                    className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent min-h-[80px]"
                                    placeholder="Optional description..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Deck
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
