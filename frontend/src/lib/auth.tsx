'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import type { User } from './types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'braindeck_access_token';
const REFRESH_KEY = 'braindeck_refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
            setToken(storedToken);
            api.getMe(storedToken)
                .then((data) => {
                    const response = data as { user: User };
                    setUser(response.user);
                })
                .catch(() => {
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(REFRESH_KEY);
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (username: string, password: string) => {
        const response = await api.login({ username, password }) as {
            access_token: string;
            refresh_token: string;
            user: User;
        };
        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(REFRESH_KEY, response.refresh_token);
        setToken(response.access_token);
        setUser(response.user);
        router.push('/dashboard');
    };

    const register = async (username: string, email: string, password: string, fullName?: string) => {
        const response = await api.register({ username, email, password, full_name: fullName }) as {
            access_token: string;
            refresh_token: string;
            user: User;
        };
        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(REFRESH_KEY, response.refresh_token);
        setToken(response.access_token);
        setUser(response.user);
        router.push('/dashboard');
    };

    const logout = async () => {
        if (token) {
            try { await api.logout(token); } catch { /* ignore */ }
        }
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    const router = useRouter();

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    // Redirect to login if not authenticated (client-side only)
    useEffect(() => {
        if (!context.isLoading && !context.token && typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            // Don't redirect if already on public pages
            if (!['/login', '/signup', '/'].includes(pathname)) {
                router.push('/login');
            }
        }
    }, [context.isLoading, context.token]);

    return context;
}
