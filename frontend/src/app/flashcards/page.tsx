'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Link from 'next/link';
import type { Flashcard, Deck } from '@/lib/types';

export default function FlashcardsPage() {
    const { token, isLoading: authLoading } = useAuth();
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<number | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newCard, setNewCard] = useState({ question: '', answer: '', deck_id: 0 });

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token, selectedDeck]);

    const loadData = async () => {
        if (!token) return;
        try {
            const [flashcardsRes, decksRes] = await Promise.all([
                api.getFlashcards(token, selectedDeck === 'all' ? {} : { deck_id: selectedDeck }),
                api.getDecks(token)
            ]);
            setFlashcards((flashcardsRes as { flashcards: Flashcard[] }).flashcards);
            setDecks((decksRes as { decks: Deck[] }).decks);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !newCard.question || !newCard.answer) return;
        try {
            await api.createFlashcard(token, {
                question: newCard.question,
                answer: newCard.answer,
                deck_id: newCard.deck_id || undefined
            });
            setNewCard({ question: '', answer: '', deck_id: 0 });
            setShowModal(false);
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!token || !confirm('Delete this flashcard?')) return;
        try {
            await api.deleteFlashcard(token, id);
            loadData();
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

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb="All Cards" />

                <main className="flex-1 overflow-y-auto bg-[#111a22]">
                    <div className="max-w-[1400px] mx-auto p-8 flex flex-col min-h-full">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">All Flashcards</h1>
                                <p className="text-[#92adc9]">Browse and manage all your flashcards.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="btn-primary"
                            >
                                <span className="material-symbols-outlined">add</span>
                                New Flashcard
                            </button>
                        </div>

                        {/* Filter */}
                        <div className="mb-6">
                            <select
                                value={selectedDeck}
                                onChange={(e) => setSelectedDeck(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="rounded-lg bg-[#1c2834] border border-[#233648] text-white py-2.5 px-4 focus:ring-2 focus:ring-[#FACC15]"
                            >
                                <option value="all">All Decks</option>
                                {decks.map((deck) => (
                                    <option key={deck.id} value={deck.id}>{deck.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Cards Grid */}
                        {flashcards.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-[#1c2834] flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-5xl text-[#92adc9]">style</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-3">No Flashcards Yet</h2>
                                    <p className="text-[#92adc9] mb-8">Create your first flashcard or generate with AI.</p>
                                    <div className="flex gap-4 justify-center">
                                        <button onClick={() => setShowModal(true)} className="btn-secondary">
                                            Create Manually
                                        </button>
                                        <Link href="/ai/generate" className="btn-primary">
                                            <span className="material-symbols-outlined">auto_awesome</span>
                                            Generate with AI
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                {flashcards.map((card) => (
                                    <div key={card.id} className="card group">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-[#FACC15] bg-[#FACC15]/10 px-2 py-1 rounded">
                                                {card.deck_name || 'No Deck'}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(card.id)}
                                                className="text-[#92adc9] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-3 leading-snug">{card.question}</h3>
                                        <div className="border-t border-dashed border-[#324d67] my-3"></div>
                                        <p className="text-[#92adc9] text-sm line-clamp-3">{card.answer}</p>
                                        <div className="mt-4 flex items-center justify-between text-xs text-[#92adc9]">
                                            <span>Reviewed: {card.times_reviewed}x</span>
                                            <span>Correct: {card.times_correct}/{card.times_reviewed}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1c2834] rounded-2xl border border-[#233648] p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Create New Flashcard</h2>
                        <form onSubmit={handleCreateCard} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Deck (optional)</label>
                                <select
                                    value={newCard.deck_id}
                                    onChange={(e) => setNewCard({ ...newCard, deck_id: Number(e.target.value) })}
                                    className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4"
                                >
                                    <option value={0}>No Deck</option>
                                    {decks.map((deck) => (
                                        <option key={deck.id} value={deck.id}>{deck.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Question</label>
                                <textarea
                                    value={newCard.question}
                                    onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                                    className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 min-h-[100px]"
                                    placeholder="Enter the question..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Answer</label>
                                <textarea
                                    value={newCard.answer}
                                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                                    className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 min-h-[120px]"
                                    placeholder="Enter the answer..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Flashcard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
