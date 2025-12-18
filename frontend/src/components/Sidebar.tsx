'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/decks', icon: 'style', label: 'My Decks' },
    { href: '/flashcards', icon: 'library_books', label: 'All Cards' },
    { href: '/study', icon: 'school', label: 'Study' },
    { href: '/reports', icon: 'bar_chart', label: 'Reports' },
];

const aiItems = [
    { href: '/ai/generate', icon: 'auto_awesome', label: 'Generate Cards' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 h-screen bg-[#111a22] border-r border-[#233648] flex flex-col shrink-0 hidden md:flex">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center text-[#101922]">
                    <span className="material-symbols-outlined text-[20px]">flash_on</span>
                </div>
                <div>
                    <h1 className="text-white text-lg font-bold leading-none tracking-tight">BrainDeck</h1>
                    <p className="text-[#92adc9] text-xs font-normal mt-1">AI Learning</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 flex flex-col gap-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                    ? 'bg-[#FACC15]/10 text-[#FACC15]'
                                    : 'text-[#92adc9] hover:bg-[#233648] hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium leading-normal">{item.label}</span>
                        </Link>
                    );
                })}

                {/* AI Tools Section */}
                <div className="mt-6 mb-2">
                    <p className="text-[#92adc9] text-xs font-bold uppercase tracking-wider px-3">AI Tools</p>
                </div>
                {aiItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                    ? 'bg-[#FACC15]/10 text-[#FACC15]'
                                    : 'text-[#92adc9] hover:bg-[#233648] hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[#FACC15]">{item.icon}</span>
                            <span className="text-sm font-medium leading-normal">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Spacer */}
                <div className="mt-auto"></div>

                {/* Settings */}
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group mb-4"
                >
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-sm font-medium leading-normal">Settings</span>
                </Link>
            </nav>

            {/* User section */}
            {user && (
                <div className="p-4 border-t border-[#233648]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FACC15] to-[#F59E0B] flex items-center justify-center text-[#101922] font-bold">
                            {user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-bold truncate">{user.username}</p>
                            <p className="text-[#92adc9] text-xs truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="text-[#92adc9] hover:text-red-400 transition-colors"
                            title="Sign out"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
