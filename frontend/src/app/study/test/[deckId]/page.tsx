'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

interface Question {
    flashcard_id: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
}

export default function TestModePage() {
    const params = useParams();
    const router = useRouter();
    const { token, isLoading: authLoading } = useAuth();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [results, setResults] = useState<{ score: number; total: number; questions: Question[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const deckId = params.deckId ? Number(params.deckId) : undefined;

    useEffect(() => {
        if (token && deckId) {
            startTest();
        }
    }, [token, deckId]);

    const startTest = async () => {
        if (!token) return;
        try {
            const res = await api.startStudySession(token, deckId);
            const cards = (res as { flashcards: any[] }).flashcards;
            setQuestions(cards.slice(0, 10)); // Take first 10 for test
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!token) return;

        const answersArray = questions.map((q) => ({
            flashcard_id: q.id,
            user_answer: userAnswers[q.id] || ''
        }));

        try {
            // For now, just calculate locally since we need test API endpoint
            const evaluated = questions.map((q) => ({
                flashcard_id: q.id,
                question: q.question,
                user_answer: userAnswers[q.id] || '',
                correct_answer: q.answer,
                is_correct: (userAnswers[q.id] || '').toLowerCase().trim() === q.answer.toLowerCase().trim()
            }));

            const score = evaluated.filter((q) => q.is_correct).length;
            setResults({ score, total: questions.length, questions: evaluated });
            setIsSubmitted(true);
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

    if (isSubmitted && results) {
        const percentage = Math.round((results.score / results.total) * 100);

        return (
            <div className="flex h-screen overflow-hidden bg-[#101922]">
                <Sidebar />
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <Header breadcrumb="Test Results" />
                    <main className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto">
                            {/* Results Card */}
                            <div className="card mb-8 text-center">
                                <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center ${percentage >= 70 ? 'bg-green-500/10' : percentage >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                                    }`}>
                                    <div className="text-center">
                                        <p className={`text-5xl font-bold ${percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>{percentage}%</p>
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2">Test Complete!</h1>
                                <p className="text-xl text-[#92adc9] mb-6">
                                    You scored {results.score} out of {results.total}
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => router.push('/study')} className="btn-secondary">
                                        Back to Study
                                    </button>
                                    <button onClick={() => window.location.reload()} className="btn-primary">
                                        Retake Test
                                    </button>
                                </div>
                            </div>

                            {/* Detailed Results */}
                            <h2 className="text-xl font-bold text-white mb-4">Review Answers</h2>
                            <div className="space-y-4">
                                {results.questions.map((q, index) => (
                                    <div key={q.flashcard_id} className={`card ${q.is_correct ? 'border-green-500/30' : 'border-red-500/30'
                                        }`}>
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${q.is_correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold mb-2">{q.question}</h3>
                                                <div className="space-y-2 text-sm">
                                                    <p className={q.is_correct ? 'text-green-400' : 'text-red-400'}>
                                                        <span className="font-medium">Your answer:</span> {q.user_answer || '(No answer)'}
                                                    </p>
                                                    {!q.is_correct && (
                                                        <p className="text-green-400">
                                                            <span className="font-medium">Correct answer:</span> {q.correct_answer}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                {q.is_correct ? 'check_circle' : 'cancel'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header breadcrumb="Test Mode" />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm text-[#92adc9] mb-2">
                                <span>Question {currentIndex + 1} of {questions.length}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-bar-fill bg-[#FACC15]" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="card mb-8 p-8">
                            <p className="text-sm font-bold text-[#FACC15] mb-4 uppercase tracking-wider">
                                Question {currentIndex + 1}
                            </p>
                            <h2 className="text-2xl font-bold text-white mb-6">{currentQ?.question}</h2>
                            <textarea
                                value={userAnswers[currentQ?.id] || ''}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [currentQ.id]: e.target.value })}
                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 min-h-[120px] focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                                placeholder="Type your answer here..."
                            />
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <button
                                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                                disabled={currentIndex === 0}
                                className="btn-secondary disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                                Previous
                            </button>

                            {currentIndex < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentIndex(currentIndex + 1)}
                                    className="btn-primary"
                                >
                                    Next
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            ) : (
                                <button onClick={handleSubmit} className="btn-primary">
                                    <span className="material-symbols-outlined">check</span>
                                    Submit Test
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
