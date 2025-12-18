'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import type { GeneratedFlashcard, Deck } from '@/lib/types';
import { useEffect } from 'react';

export default function AIGeneratePage() {
    const { token, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'search'>('paste');
    const [text, setText] = useState('');
    const [topic, setTopic] = useState('');
    const [quantity, setQuantity] = useState(10);
    const [difficulty, setDifficulty] = useState('intermediate');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [generated, setGenerated] = useState<GeneratedFlashcard[]>([]);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<number | 'new'>('new');
    const [newDeckName, setNewDeckName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            api.getDecks(token)
                .then((res) => setDecks((res as { decks: Deck[] }).decks))
                .catch(console.error);
        }
    }, [token]);

    const handleSearchTopic = async () => {
        if (!token || !topic.trim()) return;
        setIsSearching(true);
        setError('');
        try {
            const response = await api.searchTopic(token, topic.trim()) as { text: string };
            setText(response.text);
            setActiveTab('paste');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search topic');
        } finally {
            setIsSearching(false);
        }
    };

    const handleGenerate = async () => {
        if (!token || !text.trim()) return;
        setIsGenerating(true);
        setError('');
        try {
            const response = await api.generateFlashcards(token, { text: text.trim(), quantity, difficulty }) as { flashcards: GeneratedFlashcard[] };
            setGenerated(response.flashcards);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!token || generated.length === 0) return;
        setIsSaving(true);
        setError('');
        try {
            await api.saveGeneratedFlashcards(token, {
                deck_id: selectedDeck === 'new' ? undefined : selectedDeck,
                deck_name: selectedDeck === 'new' ? newDeckName : undefined,
                flashcards: generated.map((f) => ({ question: f.question, answer: f.answer })),
            });
            setGenerated([]);
            setText('');
            setNewDeckName('');
            alert('Flashcards saved successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const removeCard = (index: number) => setGenerated((g) => g.filter((_, i) => i !== index));

    if (authLoading) {
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
                <Header breadcrumb="AI Generate" />

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left Panel - Input */}
                    <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col border-r border-[#233648] bg-[#111a22] overflow-y-auto">
                        <div className="px-6 pt-8 pb-4">
                            <h1 className="text-3xl font-black leading-tight tracking-tight mb-2 text-white">
                                Create Flashcards
                            </h1>
                            <p className="text-[#92adc9] text-sm">
                                Turn your notes into knowledge instantly.
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 border-b border-[#324d67]">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('paste')}
                                    className={`flex items-center gap-2 pb-3 border-b-2 ${activeTab === 'paste' ? 'border-[#FACC15] text-[#FACC15]' : 'border-transparent text-[#58738e] hover:text-[#92adc9]'} transition-colors`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                    <span className="text-sm font-bold">Paste Text</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('search')}
                                    className={`flex items-center gap-2 pb-3 border-b-2 ${activeTab === 'search' ? 'border-[#FACC15] text-[#FACC15]' : 'border-transparent text-[#58738e] hover:text-[#92adc9]'} transition-colors`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                    <span className="text-sm font-bold">Topic Search</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-6 flex-1">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            {activeTab === 'search' && (
                                <div className="flex flex-col gap-4">
                                    <label className="text-sm font-medium text-white">Search Topic</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="flex-1 rounded-lg bg-[#192633] border border-[#324d67] text-white py-3 px-4 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                                            placeholder="e.g., Photosynthesis"
                                        />
                                        <button
                                            onClick={handleSearchTopic}
                                            disabled={isSearching || !topic.trim()}
                                            className="btn-secondary disabled:opacity-50"
                                        >
                                            {isSearching ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-baseline">
                                    <label className="text-sm font-medium text-white">Source Material</label>
                                    <span className="text-xs text-[#58738e]">{text.length}/5000</span>
                                </div>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="w-full resize-none rounded-lg border border-[#324d67] bg-[#192633] text-white focus:ring-2 focus:ring-[#FACC15] focus:border-transparent min-h-[200px] p-4 text-sm leading-relaxed placeholder:text-[#58738e]"
                                    placeholder="Paste your lecture notes, article text, or summary here..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[#92adc9]">Difficulty</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full rounded-lg bg-[#192633] border border-[#324d67] text-white py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#FACC15]"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[#92adc9]">Quantity</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full rounded-lg bg-[#192633] border border-[#324d67] text-white py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#FACC15]"
                                    >
                                        <option value={5}>5 Cards</option>
                                        <option value={10}>10 Cards</option>
                                        <option value={15}>15 Cards</option>
                                        <option value={20}>20 Cards</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[#233648]">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !text.trim()}
                                    className="w-full btn-primary h-12 text-base disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-[#101922]/30 border-t-[#101922] rounded-full spinner"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">auto_awesome</span>
                                            Generate Flashcards
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="flex-1 flex flex-col bg-[#101922] overflow-hidden">
                        <div className="px-8 py-5 border-b border-[#233648] flex justify-between items-center bg-[#111a22]/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white">Preview Deck</h2>
                                {generated.length > 0 && (
                                    <span className="bg-[#FACC15]/10 text-[#FACC15] px-2.5 py-0.5 rounded text-xs font-bold border border-[#FACC15]/20">
                                        {generated.length} Cards Generated
                                    </span>
                                )}
                            </div>
                            {generated.length > 0 && (
                                <button onClick={handleSave} disabled={isSaving} className="btn-primary disabled:opacity-50">
                                    {isSaving ? 'Saving...' : 'Save Deck'}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {generated.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                                    <div className="text-center">
                                        <div className="w-24 h-24 rounded-full bg-[#1c2834] flex items-center justify-center mx-auto mb-6">
                                            <span className="material-symbols-outlined text-5xl text-[#FACC15]">auto_awesome</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Ready to Generate</h3>
                                        <p className="text-[#92adc9] max-w-md">
                                            Paste your study material and click Generate to create flashcards with AI.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                                    {/* Save Options */}
                                    <div className="bg-[#1c2834] rounded-xl border border-[#233648] p-4">
                                        <label className="text-sm font-medium text-white block mb-2">Save to Deck</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                value={selectedDeck}
                                                onChange={(e) => setSelectedDeck(e.target.value === 'new' ? 'new' : Number(e.target.value))}
                                                className="rounded-lg bg-[#192633] border border-[#324d67] text-white py-2.5 px-3 text-sm"
                                            >
                                                <option value="new">+ Create New Deck</option>
                                                {decks.map((d) => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                            {selectedDeck === 'new' && (
                                                <input
                                                    type="text"
                                                    value={newDeckName}
                                                    onChange={(e) => setNewDeckName(e.target.value)}
                                                    className="rounded-lg bg-[#192633] border border-[#324d67] text-white py-2.5 px-3 text-sm"
                                                    placeholder="New deck name..."
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Cards */}
                                    {generated.map((card, index) => (
                                        <div
                                            key={index}
                                            className={`group relative bg-[#1c2834] rounded-xl border ${index === 0 ? 'border-[#FACC15]/50 shadow-xl shadow-[#FACC15]/10' : 'border-[#324d67]'} p-6 hover:border-[#FACC15]/30 transition-all hover:-translate-y-1`}
                                        >
                                            {index === 0 && <div className="absolute -left-[1px] top-6 w-1 h-12 bg-[#FACC15] rounded-r"></div>}
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${index === 0 ? 'text-[#FACC15] bg-[#FACC15]/10' : 'text-[#58738e] bg-[#233648]'}`}>
                                                    Question {index + 1}
                                                </span>
                                                <button
                                                    onClick={() => removeCard(index)}
                                                    className="p-1.5 hover:bg-[#233648] rounded text-[#92adc9] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-[#92adc9] text-xs font-bold uppercase mb-2">Front</h3>
                                                    <p className="text-lg font-medium text-white leading-relaxed">{card.question}</p>
                                                </div>
                                                <div className="border-t border-dashed border-[#324d67]"></div>
                                                <div>
                                                    <h3 className="text-[#92adc9] text-xs font-bold uppercase mb-2">Back</h3>
                                                    <p className="text-base text-slate-300 leading-relaxed">{card.answer}</p>
                                                </div>
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
