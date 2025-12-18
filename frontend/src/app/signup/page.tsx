'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register(username, email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#101922] p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#FACC15] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FACC15]/30">
                        <span className="material-symbols-outlined text-3xl text-[#101922]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            flash_on
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-[#92adc9]">Start your learning journey today</p>
                </div>

                {/* Signup Form */}
                <div className="bg-[#1c2834] rounded-2xl border border-[#233648] p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 text-base focus:ring-2 focus:ring-[#FACC15] focus:border-transparent placeholder:text-[#92adc9] transition-all"
                                placeholder="Choose a username"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 text-base focus:ring-2 focus:ring-[#FACC15] focus:border-transparent placeholder:text-[#92adc9] transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 text-base focus:ring-2 focus:ring-[#FACC15] focus:border-transparent placeholder:text-[#92adc9] transition-all"
                                placeholder="Create a password"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 text-base focus:ring-2 focus:ring-[#FACC15] focus:border-transparent placeholder:text-[#92adc9] transition-all"
                                placeholder="Confirm your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 rounded-lg font-bold text-base shadow-lg shadow-[#FACC15]/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#101922]/30 border-t-[#101922] rounded-full spinner"></div>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">person_add</span>
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#233648] text-center">
                        <p className="text-[#92adc9] text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#FACC15] hover:underline font-medium">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
