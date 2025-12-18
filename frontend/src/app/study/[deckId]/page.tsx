'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import type { Flashcard } from '@/lib/types';

export default function StudySessionPage() {
    const params = useParams();
    const router = useRouter();
    const { token, isLoading: authLoading } = useAuth();
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionComplete, setSessionComplete] = useState(false);

    const deckId = params.deckId ? Number(params.deckId) : undefined;

    useEffect(() => {
        if (token) {
            startSession();
        }
    }, [token]);

    const startSession = async () => {
        if (!token) return;
        try {
            const res = await api.startStudySession(token, deckId);
            const cards = (res as { flashcards: Flashcard[] }).flashcards;
            if (cards.length === 0) {
                setSessionComplete(true);
            } else {
                setFlashcards(cards);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswer = async (quality: number) => {
        if (!token || !flashcards[currentIndex]) return;
        try {
            await api.submitAnswer(token, {
                flashcard_id: flashcards[currentIndex].id,
                quality
            });

            if (currentIndex + 1 >= flashcards.length) {
                setSessionComplete(true);
            } else {
                setCurrentIndex(currentIndex + 1);
                setShowAnswer(false);
            }
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

    if (sessionComplete) {
        return (
            <div className="flex h-screen overflow-hidden bg-[#101922]">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-green-400">check_circle</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-3">Session Complete!</h1>
                        <p className="text-[#92adc9] mb-8">
                            You reviewed {flashcards.length} card{flashcards.length !== 1 ? 's' : ''}. Great job!
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => router.push('/study')} className="btn-secondary">
                                Back to Study
                            </button>
                            <button onClick={() => window.location.reload()} className="btn-primary">
                                Study Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb="Study Session" />

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm text-[#92adc9] mb-2">
                                <span>Card {currentIndex + 1} of {flashcards.length}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-bar-fill bg-[#FACC15]" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {/* Flashcard */}
                        <div className="card-hover card min-h-[400px] flex flex-col justify-center items-center p-12 mb-8">
                            {!showAnswer ? (
                                <div className="text-center">
                                    <p className="text-sm font-bold text-[#FACC15] mb-4 uppercase tracking-wider">Question</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
                                        {currentCard?.question}
                                    </h2>
                                    <button
                                        onClick={() => setShowAnswer(true)}
                                        className="btn-primary text-lg px-8 py-4"
                                    >
                                        Show Answer
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="mb-8">
                                        <p className="text-sm font-bold text-[#92adc9] mb-2 uppercase tracking-wider">Question</p>
                                        <h2 className="text-xl font-bold text-white mb-6">{currentCard?.question}</h2>
                                    </div>
                                    <div className="border-t border-dashed border-[#324d67] my-6"></div>
                                    <div>
                                        <p className="text-sm font-bold text-[#FACC15] mb-2 uppercase tracking-wider">Answer</p>
                                        <p className="text-lg text-white leading-relaxed">{currentCard?.answer}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rating Buttons */}
                        {showAnswer && (
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => handleAnswer(1)}
                                    className="card hover:border-red-400 transition-all text-center py-6"
                                >
                                    <span className="material-symbols-outlined text-4xl text-red-400 mb-2">sentiment_dissatisfied</span>
                                    <p className="font-bold text-white">Hard</p>
                                    <p className="text-xs text-[#92adc9] mt-1">Review soon</p>
                                </button>
                                <button
                                    onClick={() => handleAnswer(3)}
                                    className="card hover:border-yellow-400 transition-all text-center py-6"
                                >
                                    <span className="material-symbols-outlined text-4xl text-yellow-400 mb-2">sentiment_neutral</span>
                                    <p className="font-bold text-white">Medium</p>
                                    <p className="text-xs text-[#92adc9] mt-1">Review later</p>
                                </button>
                                <button
                                    onClick={() => handleAnswer(5)}
                                    className="card hover:border-green-400 transition-all text-center py-6"
                                >
                                    <span className="material-symbols-outlined text-4xl text-green-400 mb-2">sentiment_satisfied</span>
                                    <p className="font-bold text-white">Easy</p>
                                    <p className="text-xs text-[#92adc9] mt-1">Review much later</p>
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
