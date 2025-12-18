'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
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
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-[#92adc9]">Sign in to continue your learning</p>
                </div>

                {/* Login Form */}
                <div className="bg-[#1c2834] rounded-2xl border border-[#233648] p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Username or Email</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full rounded-lg bg-[#16202a] border border-[#233648] text-white py-3 px-4 text-base focus:ring-2 focus:ring-[#FACC15] focus:border-transparent placeholder:text-[#92adc9] transition-all"
                                placeholder="Enter your username or email"
                                autoFocus
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
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-[#92adc9] hover:text-white">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 bg-[#16202a] border-[#233648] rounded text-[#FACC15] focus:ring-2 focus:ring-[#FACC15]"
                                />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="text-[#FACC15] hover:underline font-medium">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 rounded-lg font-bold text-base shadow-lg shadow-[#FACC15]/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#101922]/30 border-t-[#101922] rounded-full spinner"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">login</span>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#233648] text-center">
                        <p className="text-[#92adc9] text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-[#FACC15] hover:underline font-medium">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
