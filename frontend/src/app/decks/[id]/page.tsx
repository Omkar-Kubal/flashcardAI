'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Link from 'next/link';
import type { Deck, Flashcard } from '@/lib/types';

export default function DeckDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token, isLoading: authLoading } = useAuth();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const deckId = Number(params.id);

    useEffect(() => {
        if (token && deckId) {
            loadDeck();
        }
    }, [token, deckId]);

    const loadDeck = async () => {
        if (!token) return;
        try {
            const [deckRes, cardsRes] = await Promise.all([
                api.getDeck(token, deckId),
                api.getFlashcards(token, { deck_id: deckId })
            ]);
            setDeck((deckRes as { deck: Deck }).deck);
            setFlashcards((cardsRes as { flashcards: Flashcard[] }).flashcards);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#101922]">
                <div className="w-12 h-12 border-4 border-[#233648] border-t-[#FACC15] rounded-full spinner"></div>
            </div>
        );
    }

    if (!deck) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#101922]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Deck Not Found</h2>
                    <Link href="/decks" className="btn-primary">Back to Decks</Link>
                </div>
            </div>
        );
    }

    const progress = deck.card_count > 0 ? Math.min(100, (deck.card_count / 100) * 100) : 0;

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb={deck.name} />

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Deck Header */}
                        <div className="card mb-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">{deck.name}</h1>
                                    {deck.description && <p className="text-[#92adc9]">{deck.description}</p>}
                                </div>
                                <Link href="/decks" className="text-[#92adc9] hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </Link>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div>
                                    <p className="text-[#92adc9] text-sm mb-1">Cards</p>
                                    <p className="text-2xl font-bold text-white">{deck.card_count}</p>
                                </div>
                                <div>
                                    <p className="text-[#92adc9] text-sm mb-1">Progress</p>
                                    <p className="text-2xl font-bold text-white">{Math.round(progress)}%</p>
                                </div>
                                <div>
                                    <p className="text-[#92adc9] text-sm mb-1">Status</p>
                                    <span className="inline-block bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                        Active
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Link href={`/study/${deck.id}`} className="btn-primary">
                                    <span className="material-symbols-outlined">school</span>
                                    Start Study
                                </Link>
                                <Link href="/flashcards" className="btn-secondary">
                                    <span className="material-symbols-outlined">add</span>
                                    Add Cards
                                </Link>
                            </div>
                        </div>

                        {/* Flashcards List */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Flashcards ({flashcards.length})</h2>
                            {flashcards.length === 0 ? (
                                <div className="card text-center py-12">
                                    <p className="text-[#92adc9] mb-6">No flashcards in this deck yet.</p>
                                    <Link href="/flashcards" className="btn-primary">Add Flashcards</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {flashcards.map((card) => (
                                        <div key={card.id} className="card hover:border-[#FACC15]/30 transition-all">
                                            <h3 className="text-white font-bold mb-2">{card.question}</h3>
                                            <p className="text-[#92adc9] text-sm">{card.answer}</p>
                                            <div className="mt-3 flex items-center gap-4 text-xs text-[#92adc9]">
                                                <span>Reviewed: {card.times_reviewed}x</span>
                                                <span>Correct: {card.times_correct}/{card.times_reviewed}</span>
                                            </div>
                                        </div>
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
